"use client";

import React, { useState, useEffect } from "react";
import AdminFilters from "@/app/components/admin/AdminFilters";
import { useGetApi } from "@/app/lib/apicallHooks";
import TableSkeleton from "@/app/components/admin/TableSkeleton";
import { Table_Pagination } from "@/app/components/admin/extra/Common";
import Link from "next/link";
import { Button } from "@mui/material";
import AdminTable from "@/app/components/admin/AdminTable";
import { Table_Create_Buttton } from "@/app/components/admin/extra/buttton.js";

const Admin_Deatail_Page_Table = ({
  Access_Permissions,
  All_Table_Extra_Field,
  api_get,
  params,
  pageName,
  ShowExcel,
  isDateFilters,
  searchInputPlaceholder,
}) => {
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [pagination, setPagination] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [inputData, setInput] = useState("");
  const [show_sort_box, setShow_sort_box] = useState(false);
  const [sortedRows, setSortedRows] = useState([]);

  const { data, doFetch, isLoading } = useGetApi(
    `${api_get}?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`
  );

  const { data: sectionDeatils = [], totalDocs = 0 } = data ?? {};

  /** ✅ SHOW SORT BUTTON ONLY AFTER ROWS CHANGE */
  useEffect(() => {
    if (sortedRows.length) {
      setShow_sort_box(true);
    }
  }, [sortedRows]);

  const handleChangePage = (_, newPage) => {
    setPagination(newPage);
    doFetch(
      `${api_get}?page=${newPage + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`
    );
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
    setPagination(0);
    doFetch(
      `${api_get}?page=1&limit=${value}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`
    );
  };

  const HandleSearch = () => {
    doFetch(
      `${api_get}?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`
    );
  };

  const reset = () => {
    setStartDate("");
    setEndDate("");
    setInput("");
    doFetch(`${api_get}?page=1&limit=${rowsPerPage}`);
  };

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
        searchPlaceholder={searchInputPlaceholder}
        ShowExcel={ShowExcel}
        showDateFilter={isDateFilters}
        addLink={`/detail/${params.page}/create`}
      />

      <div className="table-container panel">
        <div className="d-flex">
          <h3 className="table-heading">{pageName}</h3>

          {Access_Permissions.create && (
            <Link href={`/admin/${params.folder}/detail/${params.page}/create`}>
              <Table_Create_Buttton />
            </Link>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <AdminTable
              All_Table_Extra_Field={All_Table_Extra_Field}
              formDetails={sectionDeatils}
              onRowsReorder={setSortedRows}
              HandleSearch={HandleSearch}
              ISACTIVE_PUT_URL={`${api_get}/set/isactive`}
              EDIT_LINK={`/admin/${params.folder}/detail/${params.page}`}
              DELETE_DOC_URL={api_get}
              Access_Permissions={Access_Permissions}
              rowsPerPage={rowsPerPage}
              currentPage={pagination}
            />

            {show_sort_box && (
              <div className="update_by_sort_btn">
                <Button
                  variant="contained"
                  onClick={() => {

                    setShow_sort_box(false);
                  }}
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
          </>
        )}
      </div>
    </>
  );
};

export default Admin_Deatail_Page_Table;
