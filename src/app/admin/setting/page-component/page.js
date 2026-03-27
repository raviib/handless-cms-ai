"use client"
import React, { useState, useEffect } from 'react'
import Breadcrumb from "@/app/components/admin/breadcrumb";
import AdminFilters from '@/app/components/admin/AdminFilters';
import TableSkeleton from '@/app/components/admin/TableSkeleton';
import { Table_Pagination } from '@/app/components/admin/extra/Common';
import { useDeleteApi, useGetApi } from '@/app/lib/apicallHooks';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Table_Create_Buttton } from "@/app/components/admin/extra/buttton.js"
import Link from 'next/link.js';
import "@/app/styles/admin/admin_table.scss"
import { withSwal } from 'react-sweetalert2'

const page = ({ swal }) => {
  const list = [
    { Name: "setting", link: "" },
    { Name: "page component", link: "" },
  ]
  const ALL_FIELD_FOR_SECTION = ["name", "componentKey", "category", "sort", "isActive"]
  
  const [StartDate, setStartDate] = useState('');
  const [EndDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [inputData, setInput] = useState("");

  useEffect(() => {
    const today = new Date();
    const firstDay = `${today.toISOString().substr(0, 7)}-01`;
    const lastDay = today.toISOString().substr(0, 10);
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const {
    data: componentData,
    doFetch,
    isLoading,
  } = useGetApi(`/setting/page-component?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`);
  
  const { doDelete } = useDeleteApi()
  const { data: components, totalDocs } = componentData ?? {};

  const handleChangePage = (event, newPage) => {
    setPagination(newPage);
    doFetch(`/setting/page-component?page=${newPage + 1}&limit=${rowsPerPage}`);
  };

  const handleChangeRowsPerPage = (event) => {
    let rowsPerPage = parseInt(event.target.value);
    setRowsPerPage(rowsPerPage);
    setPagination(0);
    doFetch(`/setting/page-component?page=${1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`);
  };

  const HandleSearch = () => {
    doFetch(
      `/setting/page-component?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`
    );
  };

  const reset = () => {
    const today = new Date();
    const firstDay = `${today.toISOString().substr(0, 7)}-01`;
    const lastDay = today.toISOString().substr(0, 10);
    doFetch(`/setting/page-component?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${firstDay}&end_date=${lastDay}`);
    setEndDate(lastDay);
    setStartDate(firstDay);
    setInput("");
  };

  return (
    <>
      <Breadcrumb styleClass="dark-bg" links={list} />
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
        addLink="/admin/setting/page-component/create"
      />
      <div className='table-container panel'>
        <div className='d-flex'>
          <h3 className='table-heading'>All Components</h3>
          <Link
            href={`/admin/setting/page-component/create`}
            aria-label="Add New"
          >
            <Table_Create_Buttton />
          </Link>
        </div>
        {isLoading ?
          <>
            <TableSkeleton />
          </> :
          <>
            <div className="admin-table-section table-height-normal">
              <table className="admin-table" cellPadding={0} cellSpacing={0}>
                <thead>
                  <tr id="table-Heading">
                    <th>ID</th>
                    {
                      ALL_FIELD_FOR_SECTION.map((ele) => (
                        <th key={ele}>{ele.toUpperCase()}</th>
                      ))
                    }
                    <th className="action-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {components &&
                    components.length > 0 &&
                    components.map((ele, index) => {
                      return (
                        <tr key={index}>
                          <td>{`${index + 1}`}</td>
                          {
                            ALL_FIELD_FOR_SECTION.map((key) => {
                              return (<td key={key}>{ele[key]?.toString() ?? "N/A"}</td>)
                            })
                          }
                          <td>
                            <div className='icon-div'>
                              <Link href={`/admin/setting/page-component/edit/${ele._id}`}>
                                <EditNoteIcon className='table-edit-icon iconButton' />
                              </Link>
                              <DeleteSweepIcon className='table-delete-icon iconButton' onClick={() => {
                                swal.fire({
                                  title: 'Delete Component?',
                                  text: `Are you sure you want to delete "${ele.name}"?`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonText: 'Yes, delete it!',
                                  cancelButtonText: 'Cancel'
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    doDelete(`/setting/page-component/${ele._id}`, {}, doFetch)
                                  }
                                });
                              }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <Table_Pagination
              totalDocs={totalDocs}
              pagination={pagination}
              handleChangePage={handleChangePage}
              rowsPerPage={rowsPerPage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
            />
          </>
        }
      </div>
    </>
  )
}

export default withSwal(page)

export const dynamic = 'force-dynamic'
