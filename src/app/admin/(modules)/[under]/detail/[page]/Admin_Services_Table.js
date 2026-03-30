"use client";
import { useEffect, useState } from 'react';
import { useGetApi, usePutApi, useDeleteApi } from '@/app/lib/apicallHooks';
import { withSwal } from "react-sweetalert2";
import Link from 'next/link';
import { Button } from '@mui/material';
import AiAgentModal from '@/app/components/admin/AiAgentModal';

// Components
import AdminFilters from '@/app/components/admin/AdminFilters';
import AdvancedFilters from '@/app/components/admin/AdvancedFilters';
import AdminTable from '@/app/components/admin/AdminTable';
import TableSkeleton from '@/app/components/admin/TableSkeleton';
import CreateFirstDoc from '@/app/components/admin/CreateFirstDoc';
import { Table_Pagination } from '@/app/components/admin/extra/Common';
import { Table_Create_Buttton } from "@/app/components/admin/extra/buttton.js";

// Sub-components
import FilterDropdowns from './components/FilterDropdowns';
import BulkActionsBar from './components/BulkActionsBar';

// Store
import useTableFiltersStore from '@/app/stores/tableFiltersStore';

// Constants
const DEFAULT_ROWS_PER_PAGE = 25;
const INITIAL_PAGE = 0;

const Admin_Detail_Page_Table = ({
    DropDownFilters = [],
    default_filters = {},
    TABS_LIST = [],
    TABS_Value = '',
    Access_Permissions,
    All_Table_Extra_Field,
    api_get,
    params,
    pageName,
    ShowExcel,
    isDateFilters,
    searchInputPlaceholder,
    aiContentEnabled = false,
    aiPrompt = "",
    sections = [],
    swal
}) => {
    // ==================== ZUSTAND STORE ====================
    const pageKey = `${params.folder}-${params.page}`;
    const { getPageState, setPageState } = useTableFiltersStore();

    // Get persisted state or use defaults
    const persistedState = getPageState(pageKey);

    // ==================== STATE MANAGEMENT ====================
    const [Tabs, setTab] = useState(persistedState?.Tabs ?? TABS_Value);
    const [filters, setFilters] = useState(persistedState?.filters ?? default_filters);
    const [advancedFilters, setAdvancedFilters] = useState(persistedState?.advancedFilters ?? {});
    const [StartDate, setStartDate] = useState(persistedState?.StartDate ?? "");
    const [EndDate, setEndDate] = useState(persistedState?.EndDate ?? "");
    const [pagination, setPagination] = useState(persistedState?.pagination ?? INITIAL_PAGE);
    const [rowsPerPage, setRowsPerPage] = useState(persistedState?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE);
    const [inputData, setInput] = useState(persistedState?.inputData ?? "");
    const [show_sort_box, setShow_sort_box] = useState(false);
    const [reorderedRows, setReorderedRows] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);

    // ==================== API HOOKS ====================
    const { data: sectionDeatilsData, doFetch, isLoading } = useGetApi();
    const { doPut: updateSort } = usePutApi(`${api_get}/set/sort`);
    const { doPut: bulkUpdateStatus } = usePutApi(`${api_get}/set/isactive`);
    const { doDelete: bulkDelete } = useDeleteApi("");

    const { data: sectionDeatils = [], totalDocs } = sectionDeatilsData ?? {};

    // ==================== URL BUILDERS ====================
    const buildFilterUrl = () => {
        let url = `${api_get}?tabs=${Tabs}&page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`;

        // Add dropdown filters
        const filterStr = DropDownFilters
            .map(buildSingleFilter)
            .filter(Boolean)
            .join("&");

        if (filterStr) url += `&${filterStr}`;

        // Add advanced filters
        const advancedFilterStr = Object.entries(advancedFilters)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");

        if (advancedFilterStr) url += `&${advancedFilterStr}`;

        return url;
    };

    const buildSingleFilter = (filter) => {
        const filterValue = filters[filter.field];
        if (!filterValue) return null;

        // Handle enumeration fields
        if (filter.type === 'enumeration') {
            return buildEnumerationFilter(filter, filterValue);
        }

        // Handle relation fields
        if (filter.type === 'relation') {
            return buildRelationFilter(filter, filterValue);
        }

        return null;
    };

    const buildEnumerationFilter = (filter, filterValue) => {
        if (filter.enumeration_type === 'multiple') {
            const values = Array.isArray(filterValue) ? filterValue.join(",") : filterValue;
            return values ? `filters[${filter.field}][$in]=${values}` : null;
        }
        return filterValue ? `filters[${filter.field}][$eq]=${filterValue}` : null;
    };

    const buildRelationFilter = (filter, filterValue) => {
        const isMultiple = filter.isMultiple === true || filter.isMultiple === 'true';

        if (isMultiple) {
            const values = filterValue
                .map((item) => item[filter.getOptionValue])
                .filter(Boolean)
                .join(",");
            return values ? `filters[${filter.field}][$in]=${values}` : null;
        }

        const value = filterValue[filter.getOptionValue];
        return value ? `filters[${filter.field}][$eq]=${value}` : null;
    };

    // ==================== DATA FETCHING ====================
    const HandleSearch = () => {
        const url = buildFilterUrl();
        doFetch(url);
    };

    const handleChangePage = (event, newPage) => {
        setPagination(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value));
        setPagination(INITIAL_PAGE);
    };

    const reset = () => {
        setEndDate("");
        setStartDate("");
        setInput("");
        setFilters(default_filters);
        setAdvancedFilters({});
        setPagination(INITIAL_PAGE);

        // Clear persisted state
        setPageState(pageKey, {
            Tabs: TABS_Value,
            filters: default_filters,
            advancedFilters: {},
            StartDate: "",
            EndDate: "",
            pagination: INITIAL_PAGE,
            rowsPerPage: DEFAULT_ROWS_PER_PAGE,
            inputData: ""
        });
    };

    // ==================== SELECTION HANDLERS ====================
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedItems(sectionDeatils.map(item => item._id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const clearSelection = () => {
        setSelectedItems([]);
        setShowBulkActions(false);
    };

    // ==================== BULK OPERATIONS ====================
    const handleBulkActivate = async () => {
        if (!Access_Permissions.edit) {
            swal.fire({ icon: "error", title: "Access denied!" });
            return;
        }

        try {
            await bulkUpdateStatus({ object_ids: selectedItems, isActive: true });
            clearSelection();
            HandleSearch();
            swal.fire({
                icon: "success",
                title: "Success!",
                text: `${selectedItems.length} items activated successfully`
            });
        } catch (error) {
            swal.fire({ icon: "error", title: "Error!", text: "Failed to activate items" });
        }
    };

    const handleBulkDeactivate = async () => {
        if (!Access_Permissions.edit) {
            swal.fire({ icon: "error", title: "Access denied!" });
            return;
        }

        try {
            await bulkUpdateStatus({ object_ids: selectedItems, isActive: false });
            clearSelection();
            HandleSearch();
            swal.fire({
                icon: "success",
                title: "Success!",
                text: `${selectedItems.length} items deactivated successfully`
            });
        } catch (error) {
            swal.fire({ icon: "error", title: "Error!", text: "Failed to deactivate items" });
        }
    };

    const handleBulkDelete = () => {
        if (!Access_Permissions.delete) {
            swal.fire({ icon: "error", title: "Access denied!" });
            return;
        }

        swal.fire({
            title: "Are you sure?",
            text: `You are about to delete ${selectedItems.length} items. This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete All!",
            confirmButtonColor: "#d55",
            cancelButtonColor: "#08569c",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const onSuccess = async () => {
                        clearSelection();
                        await HandleSearch();
                        swal.fire({
                            icon: "success",
                            title: "Deleted!",
                            text: `${selectedItems.length} items deleted successfully`
                        });
                    };

                    bulkDelete(`${api_get}/bulk-delete`, { ids: selectedItems }, onSuccess, false);
                } catch (error) {
                    swal.fire({ icon: "error", title: "Error!", text: "Failed to delete some items" });
                }
            }
        });
    };

    // ==================== SORTING ====================
    const handleRowsReorder = (updatedRows) => {
        setReorderedRows(updatedRows);
    };

    const updateManyForSort = async () => {
        const rowsToUpdate = reorderedRows.length > 0 ? reorderedRows : sectionDeatils;
        const sortData = rowsToUpdate.map((item, index) => ({
            _id: item._id,
            sort: pagination * rowsPerPage + index + 1
        }));

        try {
            await updateSort({ updates: sortData });
            setShow_sort_box(false);
            setReorderedRows([]);
            HandleSearch();
        } catch (error) {
            console.error("Error updating sort:", error);
        }
    };

    // ==================== EFFECTS ====================
    // Persist state changes to Zustand store
    useEffect(() => {
        setPageState(pageKey, {
            Tabs,
            filters,
            advancedFilters,
            StartDate,
            EndDate,
            pagination,
            rowsPerPage,
            inputData
        });
    }, [Tabs, filters, advancedFilters, StartDate, EndDate, pagination, rowsPerPage, inputData, pageKey, setPageState]);

    useEffect(() => {
        HandleSearch();
    }, [Tabs, pagination, rowsPerPage, advancedFilters]);

    useEffect(() => {
        setShowBulkActions(selectedItems.length > 0);
    }, [selectedItems]);

    useEffect(() => {
        clearSelection();
    }, [sectionDeatilsData]);

    // ==================== TABLE CONFIGURATION ====================
    const tableConfig = {
        ISACTIVE_PUT_URL: `${api_get}/set/isactive`,
        SORT_PUT_URL: `${api_get}/set/sort`,
        EDIT_LINK: `/admin/${params.folder}/detail/${params.page}`,
        VIEW_LINK: "",
        DELETE_DOC_URL: `${api_get}`
    };

    // ==================== RENDER ====================
    return (
        <>
            {/* Advanced Filters */}


            {/* Basic Filters */}
            <AdminFilters
                reset={reset}
                HandleSearch={HandleSearch}
                setInput={setInput}
                inputData={inputData}
                setStartDate={setStartDate}
                StartDate={StartDate}
                EndDate={EndDate}
                setEndDate={setEndDate}
                searchPlaceholder={searchInputPlaceholder}
                ShowExcel={ShowExcel}
                showDateFilter={isDateFilters}
                CREATE_LINK={`/detail/${params.page}/create`}
                excel_url={`${api_get}/excel?tabs=${Tabs}&page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`}
            >
                <AdvancedFilters
                    fields={All_Table_Extra_Field}
                    persistedFilters={advancedFilters}
                    onApplyFilters={(filterParams) => {
                        setAdvancedFilters(filterParams);
                        setPagination(INITIAL_PAGE);
                    }}
                    onClearFilters={() => {
                        setAdvancedFilters({});
                        setPagination(INITIAL_PAGE);
                    }}
                />
                <FilterDropdowns
                    filters={filters}
                    setFilters={setFilters}
                    DropDownFilters={DropDownFilters}
                />
            </AdminFilters>

            {/* Tabs */}
            <div className="tab">
                {TABS_LIST.map((tabs) => (
                    <Link
                        href={`/admin/${params.folder}/detail/${params.page}/create?tab=${tabs.value}`}
                        key={tabs.value}
                        className={`tab-list tablinks ${Tabs === tabs.value && "active"}`}
                        onClick={() => setTab(tabs.value)}
                    >
                        {tabs.name}
                    </Link>
                ))}
            </div>

            {/* Table Container */}
            <div className='table-container panel'>
                {/* Header */}
                <div className='d-flex'>
                    <h3 className='table-heading'>{pageName}</h3>
                    {Access_Permissions.create && (
                        aiContentEnabled ? (
                            <>
                                <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setShowAiModal(true)}
                                    role="button"
                                    aria-label="Add New"
                                >
                                    <Table_Create_Buttton />
                                </div>
                                <AiAgentModal
                                    open={showAiModal}
                                    onClose={() => setShowAiModal(false)}
                                    createLink={`/admin/${params.folder}/detail/${params.page}/create`}
                                    sections={sections}
                                    moduleAiPrompt={aiPrompt}
                                />
                            </>
                        ) : (
                            <Link
                                href={`/admin/${params.folder}/detail/${params.page}/create`}
                                aria-label="Add New"
                            >
                                <Table_Create_Buttton />
                            </Link>
                        )
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <TableSkeleton />
                ) : sectionDeatils.length === 0 ? (
                    <CreateFirstDoc
                        linkUrl={aiContentEnabled ? undefined : `/admin/${params.folder}/detail/${params.page}/create`}
                        pageName={pageName}
                        showButton={Access_Permissions.create}
                        onButtonClick={aiContentEnabled ? () => setShowAiModal(true) : undefined}
                    />
                ) : (
                    <>
                        {/* Bulk Actions Bar */}
                        {showBulkActions && (
                            <BulkActionsBar
                                selectedCount={selectedItems.length}
                                onActivate={handleBulkActivate}
                                onDeactivate={handleBulkDeactivate}
                                onDelete={handleBulkDelete}
                                onClear={clearSelection}
                                permissions={Access_Permissions}
                            />
                        )}

                        {/* Table */}
                        <AdminTable
                            All_Table_Extra_Field={All_Table_Extra_Field}
                            formDetails={sectionDeatils}
                            setShow_sort_box={setShow_sort_box}
                            HandleSearch={HandleSearch}
                            {...tableConfig}
                            Access_Permissions={Access_Permissions}
                            rowsPerPage={rowsPerPage}
                            currentPage={pagination}
                            onRowsReorder={handleRowsReorder}
                            selectedItems={selectedItems}
                            onSelectItem={handleSelectItem}
                            onSelectAll={handleSelectAll}
                            showMultiSelect={true}
                        />

                        {/* Sort Save Button */}
                        {show_sort_box && (
                            <div className="update_by_sort_btn">
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    onClick={updateManyForSort}
                                >
                                    Save
                                </Button>
                            </div>
                        )}

                        {/* Pagination */}
                        <Table_Pagination
                            totalDocs={totalDocs}
                            pagination={pagination}
                            handleChangePage={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default withSwal((props) => <Admin_Detail_Page_Table {...props} />);
