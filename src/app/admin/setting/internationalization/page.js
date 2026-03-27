"use client"
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import Breadcrumb from "@/app/components/admin/breadcrumb"
import AdminFilters from '@/app/components/admin/AdminFilters'
import TableSkeleton from '@/app/components/admin/TableSkeleton'
import { useGetApi, usePutApi } from '@/app/lib/apicallHooks'
import "@/app/styles/admin/admin_table.scss"

export const dynamic = 'force-dynamic'

const page = () => {
    const breadcrumbs = [
        { Name: "setting", link: "/admin/setting" },
        { Name: "internationalization", link: "" },
    ]

    const [inputData, setInput] = useState("")
    const [filterActive, setFilterActive] = useState("")

    const { data: res, doFetch, isLoading } = useGetApi(`/setting/internationalization`)
    const { doPut, isLoading: isUpdating } = usePutApi(`/setting/internationalization`)

    const locales = res?.data ?? []

    const handleSearch = () => {
        doFetch(`/setting/internationalization?input_data=${inputData}&isActive=${filterActive}`)
    }

    const handleReset = () => {
        setInput("")
        setFilterActive("")
        doFetch(`/setting/internationalization`)
    }

    const toggleActive = async (locale) => {
        if (locale.isDefault) return // can't deactivate default
        await doPut({ code: locale.code, isActive: !locale.isActive })
        doFetch(`/setting/internationalization?input_data=${inputData}&isActive=${filterActive}`)
    }

    const setAsDefault = async (locale) => {
        if (locale.isDefault) return
        await doPut({ code: locale.code, isDefault: true })
        doFetch(`/setting/internationalization?input_data=${inputData}&isActive=${filterActive}`)
    }

    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={breadcrumbs} />

            <AdminFilters
                reset={handleReset}
                HandleSearch={handleSearch}
                setInput={setInput}
                inputData={inputData}
                searchPlaceholder="Search by language or code..."
            >
                {/* Active filter */}
                <select
                    className="form-control"
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    style={{ maxWidth: 160 }}
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </AdminFilters>

            <div className='table-container panel'>
                <div className='d-flex'>
                    <h3 className='table-heading'>Internationalization</h3>
                    <span style={{ marginLeft: 12, fontSize: 13, color: '#888', alignSelf: 'center' }}>
                        {locales.filter(l => l.isActive).length} active / {locales.length} total
                    </span>
                </div>

                {isLoading ? <TableSkeleton /> : (
                    <div className="admin-table-section table-height-normal">
                        <table className="admin-table" cellPadding={0} cellSpacing={0}>
                            <thead>
                                <tr id="table-Heading">
                                    <th>#</th>
                                    <th>FLAG</th>
                                    <th>CODE</th>
                                    <th>NAME</th>
                                    <th>NATIVE NAME</th>
                                    <th>DEFAULT</th>
                                    <th>STATUS</th>
                                    <th className="action-th">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locales.map((locale, index) => (
                                    <tr key={locale.code}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontSize: 22 }}>{locale.flag}</td>
                                        <td>
                                            <code style={{
                                                background: '#f0f0f0',
                                                padding: '2px 8px',
                                                borderRadius: 4,
                                                fontSize: 13,
                                                fontWeight: 600
                                            }}>
                                                {locale.code}
                                            </code>
                                        </td>
                                        <td>{locale.name}</td>
                                        <td style={{ color: '#666' }}>{locale.nativeName}</td>
                                        <td>
                                            {locale.isDefault ? (
                                                <span style={{
                                                    background: '#1976d2',
                                                    color: '#fff',
                                                    padding: '2px 10px',
                                                    borderRadius: 12,
                                                    fontSize: 12,
                                                    fontWeight: 600
                                                }}>Default</span>
                                            ) : (
                                                <button
                                                    onClick={() => setAsDefault(locale)}
                                                    disabled={isUpdating}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #ccc',
                                                        borderRadius: 12,
                                                        padding: '2px 10px',
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                        color: '#888'
                                                    }}
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: locale.isActive ? '#e8f5e9' : '#fce4ec',
                                                color: locale.isActive ? '#2e7d32' : '#c62828',
                                                padding: '3px 12px',
                                                borderRadius: 12,
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}>
                                                {locale.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className='icon-div'>
                                                <button
                                                    onClick={() => toggleActive(locale)}
                                                    disabled={isUpdating || locale.isDefault}
                                                    title={locale.isDefault ? "Cannot deactivate default language" : (locale.isActive ? "Deactivate" : "Activate")}
                                                    style={{
                                                        background: locale.isActive ? '#ef5350' : '#43a047',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        padding: '5px 14px',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: locale.isDefault ? 'not-allowed' : 'pointer',
                                                        opacity: locale.isDefault ? 0.5 : 1,
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    {locale.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {locales.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#999' }}>
                                            No languages found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}

export default page
