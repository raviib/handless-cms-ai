"use client"
/* eslint-disable react-hooks/rules-of-hooks */
import { AddSections, PageConfigration, SectionsList, PageConfigTabs } from "@/app/admin/setting/pages-conf/common.js"
import { CreateSections } from "@/app/admin/setting/pages-conf/components/FieldComponents.jsx"
import Breadcrumb from '@/app/components/admin/breadcrumb'
import { AdminCommonHeading } from '@/app/components/admin/common'
import { usePostApi } from '@/app/lib/apicallHooks'
import "@/app/styles/admin/admin_table.scss"
import { validatePageSlug } from '@/app/utils/db/validations'
import { TostError } from '@/app/utils/tost/Tost'
import { transformPageConfInput } from '@/app/utils/usefullFunction/usedFunction'
import { Button, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { withSwal } from 'react-sweetalert2'

// Helper to map tab name to tab index
const getTabIndex = (tabName) => {
  const tabMap = {
    "basic information": 0,
    "module settings": 1,
    "quick navigation": 2,
  };
  return tabMap[tabName?.toLowerCase()] ?? 0;
};

const page = ({ swal }) => {
  const { doPostWithFormdata, isLoading: isCreating } = usePostApi("/setting/pages-conf")
  const searchParams = useSearchParams()
  const list = [
    { Name: "setting", link: "/admin/setting/pages-conf" },
    { Name: "pages conf", link: "/admin/setting/pages-conf" },
    { Name: "create", link: "" },
  ]
  const [name, setName] = useState("")
  const [pageName, setPageName] = useState("")
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState(-1)
  const [showSEO, setShowSEO] = useState(false)
  const [showInHeader, setShowInHeader] = useState(true)
  const [sections, setSections] = useState([])
  const [under, setUnder] = useState("page")
  const [detailPage, setDetailPage] = useState(false)
  const [put_url, setPut_url] = useState("")
  const [post_url, setPost_url] = useState("")
  const [get_url, setGet_url] = useState("")
  const [isDateFilters, setisDateFilters] = useState(false)
  const [searchInputPlaceholder, setSearchInputPlaceholder] = useState('')
  const [ShowExcel, setShowExcel] = useState(false)
  const [entryTitle, setEntryTitle] = useState('')
  const [locales, setLocales] = useState(["en"])

  const [activeTab, setActiveTab] = useState(0)
  const [activeSectionIndex, setActiveSectionIndex] = useState(null)

  // Initialize tab and section from URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const sectionParam = searchParams.get('section');
    
    if (tabParam) {
      setActiveTab(getTabIndex(tabParam));
    }
    
    if (sectionParam && sections.length > 0) {
      const sectionIndex = sections.findIndex(
        sec => sec.Heading?.toLowerCase() === sectionParam.toLowerCase()
      );
      if (sectionIndex !== -1) {
        setActiveSectionIndex(sectionIndex);
      }
    }
  }, [searchParams, sections])

  const createSection = async () => {
    if (!name) {
      TostError("Name is required")
      return
    }
    if (!pageName) {
      TostError("Page Name is required")
      return
    }
    if (!under) {
      TostError("under is required")
      return
    }

    if (!validatePageSlug(pageName)) {
      TostError("Page Slug is Invalid")
      return
    }

    // Check if sections exist
    if (!sections || sections.length === 0) {
      swal.fire({
        title: 'No Sections Added',
        html: `
          <div style="text-align: center; margin: 20px 0;">
            <p style="margin-bottom: 15px; color: #856404; font-size: 16px;">📝 Please add at least one section before saving.</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-weight: 600;">How to add sections:</p>
              <ol style="margin: 10px 0 0 0; color: #856404; text-align: left;">
                <li>Go to the "Quick Navigation" tab</li>
                <li>Click "Add Section" button</li>
                <li>Configure your fields</li>
                <li>Come back to save</li>
              </ol>
            </div>
          </div>
        `,
        confirmButtonText: '📋 Go to Quick Navigation',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        width: '450px'
      }).then(() => {
        setActiveTab(2); // Switch to Quick Navigation tab
      });
      return;
    }
    
    const sections_data = await transformPageConfInput({ Data: sections })

    const formData = new FormData()
    formData.append("name", name);
    formData.append("pageName", pageName.toLowerCase());
    formData.append("showInHeader", showInHeader);
    formData.append("category", category);
    formData.append("under", under);
    formData.append("showSEO", showSEO);
    formData.append("sort", sort);
    formData.append("isDateFilters", isDateFilters);
    formData.append("searchInputPlaceholder", searchInputPlaceholder);
    formData.append("ShowExcel", ShowExcel);
    if (entryTitle) {
      formData.append("entry_title", entryTitle);
    }
    formData.append("locales", JSON.stringify(locales));
    if (get_url) {
      formData.append("get_url", get_url);
    }
    if (put_url) {
      formData.append("put_url", put_url);
    }
    if (post_url) {
      formData.append("post_url", post_url);
    }
    formData.append("detailPage", detailPage);
    formData.append("sections", JSON.stringify(sections_data));

    try {
      doPostWithFormdata(formData, "/admin/setting/pages-conf")
    } catch (error) {

    }
  }

  return (
    <>
      <Breadcrumb styleClass="dark-bg" links={list} />
      <div >
        <AdminCommonHeading Heading={"page configuration"} />

        <PageConfigTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSectionIndex={activeSectionIndex}
          setActiveSectionIndex={setActiveSectionIndex}
          sections={sections}
        >
          {/* Child 0: Basic Information */}
          <div >
            <PageConfigration
              showOnly="basic"
              setName={setName}
              name={name}
              pageName={pageName}
              setPageName={setPageName}
              category={category}
              setCategory={setCategory}
              under={under}
              setUnder={setUnder}
              sort={sort}
              setSort={setSort}
              searchInputPlaceholder={searchInputPlaceholder}
              setSearchInputPlaceholder={setSearchInputPlaceholder}
            />
          </div>

          {/* Child 1: Module Settings */}
          <div >
            <PageConfigration
              showOnly="settings"
              showInHeader={showInHeader}
              setShowInHeader={setShowInHeader}
              showSEO={showSEO}
              setShowSEO={setShowSEO}
              detailPage={detailPage}
              setDetailPage={setDetailPage}
              put_url={put_url}
              setPut_url={setPut_url}
              post_url={post_url}
              setPost_url={setPost_url}
              get_url={get_url}
              setGet_url={setGet_url}
              setisDateFilters={setisDateFilters}
              isDateFilters={isDateFilters}
              ShowExcel={ShowExcel}
              setShowExcel={setShowExcel}
              entryTitle={entryTitle}
              setEntryTitle={setEntryTitle}
              locales={locales}
              setLocales={setLocales}
              sections={sections}
            />
          </div>

          {/* Child 2: Add Section */}
          <AddSections
            setSections={setSections}
            sections={sections}
            onSectionAdd={(index) => {
              setActiveSectionIndex(index);
            }}
          />

          {/* Child 3: Sections List */}
          <SectionsList
            sections_data_list={sections}
            onSectionClick={(index) => setActiveSectionIndex(index)}
          />

          {/* Child 4+: Active Section Editor */}
          {activeSectionIndex !== null ? (
            <CreateSections
              key={activeSectionIndex}
              position={activeSectionIndex}
              section_data={sections[activeSectionIndex]}
              setSections={setSections}
              sections={sections}
            />
          ) : null}
        </PageConfigTabs>
      </div>
      {/* Only show save button if there are sections in Quick Navigation */}
      {sections && sections.length > 0 && (
        <div className='save-field-button' >
          <Button 
            variant="contained" 
            onClick={() => createSection()}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Save Page"}
          </Button>
        </div>
      )}
      {/* Show message if no sections */}
      {(!sections || sections.length === 0) && (
        <div className='save-field-button' >
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#666', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              📝 Please add at least one section in <strong>Quick Navigation</strong> before saving the page.
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#888' }}>
              Go to the "Quick Navigation" tab and click "Add Section" to get started.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default withSwal(page);

export const dynamic = 'force-dynamic'