"use client";
import { AdminCommonHeading } from "@/app/components/admin/common.jsx";
import FieldPurpose from "@/app/components/admin/extra/FieldPurpose.jsx";
import ImproveContentButton from "@/app/components/admin/extra/ImproveContentButton.jsx";
import { NestedComponentRenderer } from "@/app/components/admin/extra/RepeatableTabs";
import { DynamicZoneRenderer } from "@/app/components/admin/extra/DynamicZoneRenderer";
import { returnFormFields } from "@/app/utils/db/create_fields_fun";
import { useState, useMemo } from "react";
import { evaluateFieldDependency } from "@/app/admin/setting/pages-conf/utils/fieldDependencyUtils";

const IMPROVABLE_TYPES = ["text", "rich-text-blocks", "rich-text-markdown"];

const Page_client_section = ({
    ele,
    deleteMultImage,
    deleteSingleImage,
    handleFileChange_multy,
    handleFileChange,
    formData,
    onChangeFormDataHandler,
    isEdit,
    index,
    fieldErrors = {},
    locale = "en",
    moduleSlug = "",
    recordId = "",
}) => {

    const [isopen, setIsOpen] = useState(index === 0);

    const seIsOpenHandler = () => {
        setIsOpen(!isopen);
    };

    // Evaluate dependencies and filter visible fields
    const visibleFields = useMemo(() => {
        if (!ele?.fields) return [];
        
        return ele.fields.map(field => {
            // Evaluate dependency for this field
            const dependencyState = field.dependency_field 
                ? evaluateFieldDependency(field, formData)
                : { visible: true, enabled: true };
            
            return {
                ...field,
                _dependencyState: dependencyState
            };
        }).filter(field => field._dependencyState.visible);
    }, [ele?.fields, formData]);

    return (
        <div
            className="admin-form-section panel"
            id={ele.Heading}
            key={`section-${ele.Heading}`}
        >
            <AdminCommonHeading
                Heading={ele.Heading}
                showOpenBut={true}
                isopen={isopen}
                setIsOpen={seIsOpenHandler}
            />

            {isopen &&
                visibleFields.map((field, fieldIndex) => {

                    // Handle dynamic-zone type fields
                    if (field.type === "dynamic-zone") {
                        return (
                            <div className="col-12" key={`dynamic-zone-${field.field}-${fieldIndex}`}>
                                <DynamicZoneRenderer
                                    field={field}
                                    formData={formData}
                                    onChange={onChangeFormDataHandler}
                                    handleFileChange={handleFileChange}
                                    handleFileChange_multy={handleFileChange_multy}
                                    deleteSingleImage={deleteSingleImage}
                                    deleteMultImage={deleteMultImage}
                                    isEdit={isEdit}
                                    fieldErrors={fieldErrors}
                                    locale={locale}
                                    moduleSlug={moduleSlug}
                                    recordId={recordId}
                                />
                            </div>
                        );
                    }

                    // Handle component type fields
                    if (field.type === "component") {
                        return (
                            <div className="col-12" key={`component-${field.field}-${fieldIndex}`}>
                                <NestedComponentRenderer
                                    field={field}
                                    formData={formData}
                                    onChange={onChangeFormDataHandler}
                                    handleFileChange={handleFileChange}
                                    handleFileChange_multy={handleFileChange_multy}
                                    deleteSingleImage={deleteSingleImage}
                                    deleteMultImage={deleteMultImage}
                                    isEdit={isEdit}
                                    fieldErrors={fieldErrors}
                                    locale={locale}
                                    moduleSlug={moduleSlug}
                                    recordId={recordId}
                                />
                            </div>
                        );
                    }

                    const {
                        Component_Type,
                        fileSizeMessage,
                        Lable_Component
                    } = returnFormFields({
                        formData,
                        onChangeFormDataHandler,
                        field_data: field,
                        handleFileChange,
                        handleFileChange_multy,
                        deleteSingleImage,
                        deleteMultImage,
                        isEdit
                    });

                    const isRequired =
                        field.required === true || field.required === "true";
                    
                    // Get field name and error
                    const fieldName = field.field?.value || field.field;
                    const fieldError = fieldErrors[fieldName];

                    return (
                        <div
                            key={`field-${field.Printvalue}-${fieldIndex}`}
                            className={field.colSpace}
                        >
                            <div className="flex with-tooltip">
                                <label
                                    className={`form-label ${isRequired ? "starlabel" : ""}`}
                                >
                                    {`${field.Printvalue} ${fileSizeMessage}`}
                                </label>

                                <FieldPurpose Purpose={field?.FieldPurpose} />
                                {Lable_Component}
                                {IMPROVABLE_TYPES.includes(field.type) && (field.aiEnabled || false) && (
                                    <ImproveContentButton
                                        value={formData[fieldName]}
                                        fieldType={field.type}
                                        locale={locale}
                                        fieldId={[recordId, locale !== "en" ? locale : "", moduleSlug, fieldName].filter(Boolean).join(".")}
                                        moduleAiPrompt={field.aiPrompt || ""}
                                        onApply={(newValue) => {
                                            if (field.type === "rich-text-markdown") {
                                                onChangeFormDataHandler(newValue, fieldName, "rich-text-markdown");
                                            } else {
                                                onChangeFormDataHandler({ target: { name: fieldName, value: newValue } });
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            {Component_Type}
                            
                            {/* Inline error message */}
                            {fieldError && (
                                <div style={{
                                    color: '#d32f2f',
                                    fontSize: '1rem',
                                    marginTop: '4px',
                                    marginLeft: '4px'
                                }}>
                                    {fieldError}
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default Page_client_section;
