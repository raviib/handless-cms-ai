"use client";
import AdminFilters from '@/app/components/admin/AdminFilters';
import React, { useState, useEffect } from 'react'
import { useGetApi } from '@/app/lib/apicallHooks';
import TableSkeleton from '@/app/components/admin/TableSkeleton';
import { Table_Pagination } from '@/app/components/admin/extra/Common';
import Link from 'next/link';
import { Button } from '@mui/material';
import AdminTable from '@/app/components/admin/AdminTable';
import { Table_Create_Buttton } from "@/app/components/admin/extra/buttton.js"
const Admin_Deatail_Page_Table = ({ Access_Permissions, All_Table_Extra_Field, api_get, params, pageName }) => {
    // Initialize with empty strings to avoid hydration issues, set actual dates in useEffect
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [inputData, setInput] = useState("");
    const [show_sort_box, setShow_sort_box] = useState(false);

    // Set dates after component mounts to avoid hydration issues
    useEffect(() => {
        const today = new Date();
        const firstDay = `${today.toISOString().substr(0, 7)}-01`;
        const lastDay = today.toISOString().substr(0, 10);
        setStartDate(firstDay);
        setEndDate(lastDay);
    }, []);
    const {
        data: sectionDeatilsData,
        doFetch,
        isLoading,
    } = useGetApi(`${api_get}?&page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`
    );
    const { data: sectionDeatils, totalDocs } = sectionDeatilsData ?? {};
    const handleChangePage = (event, newPage) => {
        setPagination(newPage);
        doFetch(`${api_get}?page=${newPage + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`);
    };
    const handleChangeRowsPerPage = (event) => {
        let rowsPerPage = parseInt(event.target.value);
        setRowsPerPage(rowsPerPage);
        setPagination(0);
        doFetch(`${api_get}?page=${1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`);
    };
    const HandleSearch = () => {
        doFetch(`${api_get}?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`);
    };
    const reset = () => {
        doFetch(`${api_get}?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${firstDay}&end_date=${lastDay}`);
        setEndDate(lastDay);
        setStartDate(firstDay);
        setInput("");
    };


    // Table configration for AdminTable
    const ISACTIVE_PUT_URL = `${api_get}/set/isactive`
    const SORT_PUT_URL = `${api_get}/set/sort`
    const EDIT_LINK = `/admin/${params.folder}/detail/${params.page}`
    const VIEW_LINK = ""
    const Query_for_Next_Page = ""
    const DELETE_DOC_URL = `${api_get}`

    return (
        <>

            <AdminFilters
                reset={reset}
                HandleSearch={HandleSearch}
                setInput={setInput}
                inputData={inputData}
                setStartDate={setStartDate}
                StartDate={StartDate}
                EndDate={EndDate}
                setEndDate={setEndDate}
                searchPlaceholder="Search By Name"
                addLink={`/detail/${params.page}/create`}
            />
            <div className='table-container panel'>
                <div className='d-flex'>
                    <h3 className='table-heading'>{pageName}</h3>
                    {Access_Permissions.create && <Link
                        href={`/admin/${params.folder}/detail/${params.page}/create`}
                        aria-label="Add New"
                    >
                        <Table_Create_Buttton />
                    </Link>}
                </div>
                {isLoading ?
                    <>
                        <TableSkeleton />
                    </> :
                    <>

                        <AdminTable
                            All_Table_Extra_Field={All_Table_Extra_Field}
                            formDetails={sectionDeatils}
                            setShow_sort_box={setShow_sort_box}
                            HandleSearch={HandleSearch}
                            ISACTIVE_PUT_URL={ISACTIVE_PUT_URL}
                            SORT_PUT_URL={SORT_PUT_URL}
                            EDIT_LINK={EDIT_LINK}
                            VIEW_LINK={VIEW_LINK}
                            DELETE_DOC_URL={DELETE_DOC_URL}
                            Query_for_Next_Page={Query_for_Next_Page}
                            Access_Permissions={Access_Permissions}
                        />
                        {show_sort_box && (
                            <div className="update_by_sort_btn">
                                <Button
                                    variant="contained"
                                    // onClick={() => updateManyForSort()}
                                    color="inherit"
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                        <Table_Pagination
                            totalDocs={totalDocs}
                            pagination={pagination}
                            handleChangePage={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            handleChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    </>}
            </div>
        </>
    )
}

export default Admin_Deatail_Page_Table