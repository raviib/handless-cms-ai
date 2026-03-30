"use client"
/* eslint-disable react-hooks/rules-of-hooks */
import { AddSections, PageConfigration, PageConfigTabs, SectionsList } from "@/app/admin/setting/pages-conf/common.js"
import { CreateSections } from "@/app/admin/setting/pages-conf/components/FieldComponents.jsx"
import Breadcrumb from '@/app/components/admin/breadcrumb'
import { AdminCommonHeading } from '@/app/components/admin/common'
import { usePutApi } from '@/app/lib/apicallHooks'
import "@/app/styles/admin/admin_table.scss"
import { validatePageSlug } from '@/app/utils/db/validations'
import { TostError } from '@/app/utils/tost/Tost'
import { transformPageConfInput } from '@/app/utils/usefullFunction/usedFunction'
import { Button } from '@mui/material'
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

const PagesConfEditSection = ({ swal, params, searchParams: initialSearchParams, ConfPageData, sectionData = [] }) => {

    const { doPutRedirect, isLoading: isUpdating } = usePutApi(`/setting/pages-conf/${params.slug}`);
    const searchParams = useSearchParams()
    const list = [
        { Name: "setting", link: "/admin/setting/pages-conf" },
        { Name: "pages conf", link: "/admin/setting/pages-conf" },
        { Name: "Edit", link: "" },
    ]
    const [name, setName] = useState(ConfPageData.name)
    const [pageName, setPageName] = useState(ConfPageData.pageName)
    const [category, setCategory] = useState(ConfPageData.category)
    const [sort, setSort] = useState(ConfPageData.sort)
    const [showSEO, setShowSEO] = useState(ConfPageData.showSEO)
    const [showInHeader, setShowInHeader] = useState(ConfPageData.showInHeader)
    const [sections, setSections] = useState(sectionData)

    const [under, setUnder] = useState(ConfPageData.under)
    const [detailPage, setDetailPage] = useState(ConfPageData.detailPage)
    const [put_url, setPut_url] = useState(ConfPageData.put_url)
    const [post_url, setPost_url] = useState(ConfPageData.post_url)
    const [delete_image_url, setDelete_image] = useState(ConfPageData.delete_image_url)
    const [get_url, setGet_url] = useState(ConfPageData.get_url)
    const [isDateFilters, setisDateFilters] = useState(ConfPageData.isDateFilters)
    const [searchInputPlaceholder, setSearchInputPlaceholder] = useState(ConfPageData.searchInputPlaceholder)
    const [ShowExcel, setShowExcel] = useState(ConfPageData.ShowExcel)
    const [entryTitle, setEntryTitle] = useState(ConfPageData.entry_title || '')
    const [locales, setLocales] = useState(ConfPageData.locales?.length ? ConfPageData.locales : ["en"])
    const [aiContentEnabled, setAiContentEnabled] = useState(ConfPageData.aiContentEnabled ?? false)
    const [aiPrompt, setAiPrompt] = useState(ConfPageData.aiPrompt || "")

    const [activeTab, setActiveTab] = useState(0)
    const [activeSectionIndex, setActiveSectionIndex] = useState(null)

    // Initialize tab and section from URL params
    useEffect(() => {
        const tabParam = searchParams.get('tab') || initialSearchParams?.tab;
        const sectionParam = searchParams.get('section') || initialSearchParams?.section;

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
    }, [searchParams, sections, initialSearchParams])

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
                title: 'No Sections Found',
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

        // Show SweetAlert with 3 options
        swal.fire({
            title: 'Choose Save Option',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p style="margin-bottom: 15px; font-weight: 600; color: #333;">How would you like to save your changes?</p>
                    <div style="margin-bottom: 12px;">
                        <strong>🔄 Update Files & Database:</strong><br>
                        <span style="color: #666; font-size: 14px;">Regenerates model and API files with new field structure</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <strong>💾 Update Only Database:</strong><br>
                        <span style="color: #666; font-size: 14px;">Updates page configuration without touching files</span>
                    </div>
                    <div>
                        <strong>❌ Cancel:</strong><br>
                        <span style="color: #666; font-size: 14px;">Don't save any changes</span>
                    </div>
                </div>
            `,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: '🔄 Update Files & DB',
            denyButtonText: '💾 Update Only DB',
            cancelButtonText: '❌ Cancel',
            confirmButtonColor: '#3085d6',
            denyButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            reverseButtons: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: '500px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // User chose "Update Files & DB"
                swal.fire({
                    title: '⚠️ Confirm File Regeneration',
                    html: `
                        <div style="text-align: left; margin: 20px 0;">
                            <p style="margin-bottom: 15px; color: #d33; font-weight: 600;">This will regenerate your database model and API files!</p>
                            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                                <p style="margin: 0; font-weight: 600; color: #856404;">What will happen:</p>
                                <ul style="margin: 10px 0 0 20px; color: #856404;">
                                    <li>Delete existing model and API files</li>
                                    <li>Generate new files with updated field structure</li>
                                    <li>Update allModels.js registry</li>
                                    <li>Update page configuration</li>
                                </ul>
                            </div>
                            <div style="margin-top: 15px; background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #3085d6;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 600; color: #1a5276;">
                                    <input type="checkbox" id="regenerateV1Checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
                                    Also regenerate /v1 API file
                                </label>
                                <p style="margin: 6px 0 0 28px; font-size: 13px; color: #555;">Only overwrites the auto-generated v1 route — your custom files are never touched.</p>
                            </div>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: '✅ Yes, Regenerate Files',
                    cancelButtonText: '🔙 Go Back',
                    confirmButtonColor: '#dc3545',
                    cancelButtonColor: '#6c757d',
                    reverseButtons: true,
                    allowOutsideClick: false,
                    width: '500px'
                }).then(async (confirmResult) => {
                    if (confirmResult.isConfirmed) {
                        const regenerateV1 = document.getElementById('regenerateV1Checkbox')?.checked || false;
                        // Proceed with file regeneration
                        await saveWithOption('files-and-db', regenerateV1);
                    }
                    // If cancelled, do nothing (user can try again)
                });
            } else if (result.isDenied) {
                // User chose "Update Only DB"
                await saveWithOption('config-only', false);
            }
            // If cancelled (result.isDismissed), do nothing
        });

        const saveWithOption = async (updateType, regenerateV1 = false) => {
            const sections_data = await transformPageConfInput({ Data: sections })
            const formData = new FormData()
            formData.append("name", name);
            formData.append("pageName", pageName.toLowerCase());
            formData.append("showInHeader", showInHeader);
            formData.append("category", category);
            formData.append("under", under);
            formData.append("get_url", get_url);
            formData.append("put_url", put_url);
            formData.append("post_url", post_url);
            formData.append("delete_image_url", delete_image_url);
            formData.append("detailPage", detailPage);
            formData.append("showSEO", showSEO);
            formData.append("sort", sort);
            formData.append("isDateFilters", isDateFilters);
            formData.append("searchInputPlaceholder", searchInputPlaceholder);
            formData.append("ShowExcel", ShowExcel);
            if (entryTitle) {
                formData.append("entry_title", entryTitle);
            }
            formData.append("locales", JSON.stringify(locales));
            formData.append("aiContentEnabled", aiContentEnabled);
            formData.append("aiPrompt", aiPrompt);
            formData.append("sections", JSON.stringify(sections_data));
            formData.append("regenerateModule", updateType === 'files-and-db');
            formData.append("regenerateV1", regenerateV1);

            try {
                doPutRedirect(formData, "/admin/setting/pages-conf")
            } catch (error) {
                console.error('Save error:', error);
            }
        };
    }

    return (
        <>
            <Breadcrumb styleClass="dark-bg" links={list} />
            <div className=''>
                <AdminCommonHeading Heading={"page configuration"} />

                <PageConfigTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    activeSectionIndex={activeSectionIndex}
                    setActiveSectionIndex={setActiveSectionIndex}
                    sections={sections}
                >
                    {/* Child 0: Basic Information */}
                    <div className=''>
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
                    <div className=''>
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
                            setDelete_image={setDelete_image}
                            delete_image_url={delete_image_url}
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
                            aiContentEnabled={aiContentEnabled}
                            setAiContentEnabled={setAiContentEnabled}
                            aiPrompt={aiPrompt}
                            setAiPrompt={setAiPrompt}
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
                    {activeSectionIndex !== null && (
                        <CreateSections
                            key={activeSectionIndex}
                            position={activeSectionIndex}
                            section_data={sections[activeSectionIndex]}
                            setSections={setSections}
                            sections={sections}
                            showUpArrow={true}
                            onSectionDelete={(deletedPosition) => {
                                // Reset to Quick Navigation tab (index 3) after section deletion
                                setActiveSectionIndex(null);
                                setActiveTab(3);
                            }}
                        />
                    )}
                </PageConfigTabs>
            </div>

            {/* Only show save button if there are sections in Quick Navigation */}
            {sections && sections.length > 0 && (
                <div className='save-field-button' >
                    <Button
                        variant="contained"
                        onClick={() => createSection()}
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Updating..." : "Save Page"}
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

export default withSwal(PagesConfEditSection);