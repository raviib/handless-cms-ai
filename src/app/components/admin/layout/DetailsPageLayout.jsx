"use client";
import "@/app/styles/common.scss";
import { formatDate } from '@/app/utils/usefullFunction/usedFunction';
import EditAttributes from '@mui/icons-material/EditAttributes';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from "@mui/material";
import SeoSummary from "./SeoSummary";

const DetailsPageLayout = ({ children, redirectUrl = '', ModalID = null, Page_Fields = [], createdAt, updatedAt, useFullLinks = [], localeBar = null, detailPage, seoData = null }) => {

    const todatDate = new Date()
    return (
        <div className='detail-page'>
            <div className='form-page'>
                <div
  style={{
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  }}
>
  {redirectUrl && detailPage && (
    <Link href={redirectUrl} style={{ color: "black" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        sx={{ textTransform: 'none', fontWeight: 600 }}
        color="inherit"
      >
        Back
      </Button>
    </Link>
  )}

  {localeBar && (
    <div style={{ marginLeft: 'auto' }}>
      {localeBar}
    </div>
  )}
</div>
                {children}
            </div>
            <div className='page-info panel'>
                {(createdAt || updatedAt) && (
                    <div className="sidebar-block">
                        <h3>Created On</h3>
                        <p className="sidebar-value">{formatDate(createdAt ?? todatDate)}</p>
                        <h3>Updated On</h3>
                        <p className="sidebar-value">{formatDate(updatedAt ?? todatDate)}</p>
                    </div>
                )}

                {Page_Fields && Page_Fields.length > 0 && (
                    <div className="sidebar-block">
                        <h3>Sections</h3>
                        <ul>
                            {Page_Fields.map((ele) => (
                                <li key={ele.Heading}>
                                    <Link href={`#${ele.Heading}`}>{ele.Heading}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {useFullLinks && useFullLinks.length > 0 && (
                    <div className="sidebar-block">
                        <h3>Module</h3>
                        <ul>
                            {useFullLinks.map((ele) => (
                                <li key={ele.link}>
                                    <Link href={`${ele.link}`} target='_blank'>{ele.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {seoData !== null && (
                    <div className="sidebar-block">
                        <SeoSummary seoData={seoData} />
                    </div>
                )}

                {ModalID && (
                    <div className="sidebar-block">
                        <div className="module-setting-card">
                            <h3>Module Setting</h3>
                            <p>Manage configuration and navigation options for this module.</p>
                            <Link href={`/admin/setting/pages-conf/edit/${ModalID}?tab=Quick%20Navigation`}>
                                <button className="module-btn">
                                    <EditAttributes />
                                    Edit Module Settings
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default DetailsPageLayout