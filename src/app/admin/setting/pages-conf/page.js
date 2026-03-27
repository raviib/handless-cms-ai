/* eslint-disable react-hooks/rules-of-hooks */
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
const page = ({ swal, searchParams }) => {
  const list = [
    { Name: "setting", link: "" },
    { Name: "pages conf", link: "" },
  ]
  const ALL_FIELD_FOR_SECTION = ["name", "pageName", "category", "showInHeader", "under"]
  
  // Initialize with empty strings to avoid hydration issues, set actual dates in useEffect
  const [StartDate, setStartDate] = useState('');
  const [EndDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [inputData, setInput] = useState("");

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
  } = useGetApi(`/setting/pages-conf?&page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`);
  const { doDelete } = useDeleteApi()
  const { data: sectionDeatils, totalDocs } = sectionDeatilsData ?? {};
  const handleChangePage = (event, newPage) => {
    setPagination(newPage);
    doFetch(`/setting/pages-conf?page=${newPage + 1}&limit=${rowsPerPage}`);
  };

  const handleChangeRowsPerPage = (event) => {
    let rowsPerPage = parseInt(event.target.value);
    setRowsPerPage(rowsPerPage);
    setPagination(0);
    doFetch(`/setting/pages-conf?page=${1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}`);
  };


  const HandleSearch = () => {
    doFetch(
      `/setting/pages-conf?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${StartDate}&end_date=${EndDate}&input_data=${inputData}`
    );
  };

  const reset = () => {
    doFetch(`/setting/pages-conf?page=${pagination + 1}&limit=${rowsPerPage}&start_date=${firstDay}&end_date=${lastDay}`);
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
        addLink="/setting/pages-conf/create"
      />
      <div className='table-container panel'>
        <div className='d-flex'>
          <h3 className='table-heading'>All Pages</h3>
          <Link
            href={`/admin/setting/pages-conf/create`}
            aria-label="Add New"
          >
            <Table_Create_Buttton />
          </Link>
        </div>
        <div>

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
                  {sectionDeatils &&
                    sectionDeatils.length > 0 &&
                    sectionDeatils.map((ele, index) => {
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
                              <Link href={`/admin/setting/pages-conf/edit/${ele._id}`}>
                                <EditNoteIcon className='table-edit-icon iconButton' />
                              </Link>
                              <DeleteSweepIcon className='table-delete-icon iconButton' onClick={() => {
                                swal.fire({
                                  title: '',
                                  html: `
                                    <div style="text-align: center; padding: 10px;">
                                      <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);">
                                        <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                          <polyline points="3 6 5 6 21 6"></polyline>
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                          <line x1="10" y1="11" x2="10" y2="17"></line>
                                          <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                      </div>
                                      
                                      <h2 style="font-size: 26px; font-weight: 700; color: #1a202c; margin: 0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                        Delete "${ele.name}"?
                                      </h2>
                                      
                                      <p style="font-size: 15px; color: #718096; margin: 0 0 30px 0; line-height: 1.6;">
                                        Choose how you want to delete this page configuration
                                      </p>
                                      
                                      <div style="display: grid; gap: 15px; margin-bottom: 25px;">
                                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; text-align: left; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.2);" 
                                             onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(245, 87, 108, 0.3)'" 
                                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(245, 87, 108, 0.2)'">
                                          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                              🗑️
                                            </div>
                                            <div style="flex: 1;">
                                              <div style="font-size: 17px; font-weight: 700; color: white; margin-bottom: 3px;">
                                                Complete Deletion
                                              </div>
                                              <div style="font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.4;">
                                                Remove database + all files & code
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 20px; border-radius: 12px; text-align: left; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(250, 112, 154, 0.2);" 
                                             onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(250, 112, 154, 0.3)'" 
                                             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(250, 112, 154, 0.2)'">
                                          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                            <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                              🗄️
                                            </div>
                                            <div style="flex: 1;">
                                              <div style="font-size: 17px; font-weight: 700; color: white; margin-bottom: 3px;">
                                                Database Only
                                              </div>
                                              <div style="font-size: 13px; color: rgba(255,255,255,0.9); line-height: 1.4;">
                                                Remove database record, keep files intact
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 8px; margin-bottom: 25px;">
                                        <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600; text-align: left;">
                                          ⚠️ Warning: This action cannot be undone
                                        </p>
                                      </div>
                                      
                                      <style>
                                        .swal2-popup {
                                          border-radius: 20px !important;
                                          padding: 35px 30px 30px 30px !important;
                                          box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
                                        }
                                        .swal2-html-container {
                                          margin: 0 !important;
                                          padding: 0 !important;
                                          overflow: visible !important;
                                        }
                                        .swal2-actions {
                                          display: flex !important;
                                          gap: 12px !important;
                                          width: 100% !important;
                                          margin: 0 !important;
                                          padding: 0 !important;
                                        }
                                        .swal2-styled {
                                          margin: 0 !important;
                                          padding: 13px 28px !important;
                                          font-size: 15px !important;
                                          font-weight: 600 !important;
                                          border-radius: 10px !important;
                                          border: none !important;
                                          flex: 1 !important;
                                          transition: all 0.2s ease !important;
                                          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                                        }
                                        .swal2-styled:hover {
                                          transform: translateY(-2px) !important;
                                          box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
                                        }
                                        .swal2-styled:active {
                                          transform: translateY(0) !important;
                                        }
                                        .swal2-confirm {
                                          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
                                        }
                                        .swal2-deny {
                                          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
                                        }
                                        .swal2-cancel {
                                          background: #e2e8f0 !important;
                                          color: #475569 !important;
                                          box-shadow: none !important;
                                        }
                                        .swal2-cancel:hover {
                                          background: #cbd5e1 !important;
                                        }
                                      </style>
                                    </div>
                                  `,
                                  showCancelButton: true,
                                  showDenyButton: true,
                                  confirmButtonText: 'Delete Everything',
                                  denyButtonText: 'Delete DB Only',
                                  cancelButtonText: 'Cancel',
                                  buttonsStyling: true,
                                  reverseButtons: false,
                                  allowOutsideClick: false,
                                  width: '520px',
                                  padding: '0',
                                  showClass: {
                                    popup: 'swal2-show',
                                    backdrop: 'swal2-backdrop-show'
                                  },
                                  hideClass: {
                                    popup: 'swal2-hide',
                                    backdrop: 'swal2-backdrop-hide'
                                  }
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    // Delete everything
                                    doDelete(`/setting/pages-conf/${ele._id}`,{}, doFetch)
                                  } else if (result.isDenied) {
                                    // Delete only DB
                                    doDelete(`/setting/pages-conf/${ele._id}?deleteType=db-only`,{}, doFetch)
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