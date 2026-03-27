"use client"
import { useState, useCallback } from 'react'
import Breadcrumb from '@/app/components/admin/breadcrumb'
import { AdminCommonHeading } from '@/app/components/admin/common'
import { usePostApi } from '@/app/lib/apicallHooks'
import "@/app/styles/admin/admin_table.scss"
import { TostError, TostSuccess } from '@/app/utils/tost/Tost'
import {
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper
} from '@mui/material'
import { withSwal } from 'react-sweetalert2'
import { FieldTypeSelectionModal } from '@/app/admin/setting/pages-conf/components/FieldTypeSelectionModal'
import { FieldConfigurationModal } from '@/app/admin/setting/pages-conf/components/FieldConfigurationModal'
import { BasicSettingsTab } from '@/app/admin/setting/pages-conf/components/BasicSettingsTab'
import { AdvancedSettingsTab } from '@/app/admin/setting/pages-conf/components/AdvancedSettingsTab'
import FieldListSidebar from '@/app/admin/setting/pages-conf/components/FieldListSidebar'
import HandleCreatableSelect from '@/app/components/admin/extra/HandleCreatableSelect'
import ActiveContextBanner from '@/app/admin/setting/page-component/components/ActiveContextBanner'

const page = ({ swal }) => {
  const { doPostWithFormdata, isLoading: isCreating } = usePostApi("/setting/page-component")

  const list = [
    { Name: "setting", link: "/admin/setting/page-component" },
    { Name: "page component", link: "/admin/setting/page-component" },
    { Name: "create", link: "" },
  ]

  const [name, setName] = useState("")
  const [category, setCategory] = useState(null)
  const [sort, setSort] = useState(-1)
  const [isActive, setIsActive] = useState(true)
  const [fields, setFields] = useState([])

  // Modal state
  const [fieldTypeModalOpen, setFieldTypeModalOpen] = useState(false)
  const [fieldConfigModalOpen, setFieldConfigModalOpen] = useState(false)
  const [currentFieldType, setCurrentFieldType] = useState(null)
  const [currentField, setCurrentField] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentComponentPath, setCurrentComponentPath] = useState([])

  const openFieldTypeModal = useCallback(() => {
    setFieldTypeModalOpen(true)
  }, [])

  const closeFieldTypeModal = useCallback(() => {
    setFieldTypeModalOpen(false)
  }, [])

  const openFieldConfigModal = useCallback((fieldType, field = null) => {
    setCurrentFieldType(fieldType)
    setCurrentField(field)
    setIsEditMode(!!field)
    setFieldConfigModalOpen(true)
    setFieldTypeModalOpen(false)
  }, [])

  const closeFieldConfigModal = useCallback(() => {
    setFieldConfigModalOpen(false)
    setCurrentFieldType(null)
    setCurrentField(null)
    setIsEditMode(false)
    // Don't clear currentComponentPath here - keep it for adding multiple fields to same component
  }, [])

  const handleCloseContext = useCallback(() => {
    setCurrentComponentPath([])
    TostSuccess("Exited component context")
  }, [])

  const handleFieldTypeSelect = useCallback((fieldType) => {
    openFieldConfigModal(fieldType)
  }, [openFieldConfigModal])

  const handleSaveFieldConfig = useCallback((fieldConfig, componentPath = []) => {
    console.log('=== SAVE FIELD CONFIG ===')
    console.log('Field Config:', fieldConfig)
    console.log('Component Path:', componentPath)
    console.log('Current Component Path:', currentComponentPath)

    const pathToUse = componentPath.length > 0 ? componentPath : currentComponentPath

    if (isEditMode && currentField) {
      // Update existing field
      if (pathToUse.length === 0) {
        // Update at root level
        setFields(prevFields =>
          prevFields.map(f =>
            f.field.value === currentField.field.value ? fieldConfig : f
          ).sort((a, b) => a.sort - b.sort)
        )
      } else {
        // Update in nested component
        setFields(prevFields => {
          const newFields = structuredClone(prevFields)
          let currentLevel = newFields

          for (let i = 0; i < pathToUse.length; i++) {
            const componentName = pathToUse[i]
            const componentField = currentLevel.find(f =>
              f.type === 'component' &&
              (f.field?.value === componentName || f.component_key === componentName)
            )

            if (!componentField) return prevFields

            if (i === pathToUse.length - 1) {
              componentField.fields = componentField.fields.map(f =>
                f.field.value === currentField.field.value ? fieldConfig : f
              ).sort((a, b) => a.sort - b.sort)
            } else {
              currentLevel = componentField.fields
            }
          }

          return newFields
        })
      }
      TostSuccess("Field updated successfully")
    } else {
      // Add new field
      if (pathToUse.length === 0) {
        // Add to root level
        setFields(prevFields => {
          const newFields = [...prevFields, fieldConfig]
          return newFields.sort((a, b) => a.sort - b.sort)
        })
      } else {
        // Add to nested component
        setFields(prevFields => {
          const newFields = structuredClone(prevFields)
          let currentLevel = newFields

          for (let i = 0; i < pathToUse.length; i++) {
            const componentName = pathToUse[i]
            const componentField = currentLevel.find(f =>
              f.type === 'component' &&
              (f.field?.value === componentName || f.component_key === componentName)
            )

            if (!componentField) {
              TostError(`Component '${componentName}' not found`)
              return prevFields
            }

            if (i === pathToUse.length - 1) {
              if (!componentField.fields) {
                componentField.fields = []
              }
              componentField.fields.push(fieldConfig)
              componentField.fields.sort((a, b) => a.sort - b.sort)
            } else {
              currentLevel = componentField.fields
            }
          }

          return newFields
        })
      }
      TostSuccess("Field added successfully")
    }
    closeFieldConfigModal()
  }, [isEditMode, currentField, currentComponentPath, closeFieldConfigModal])

  const handleAddAnotherField = useCallback(() => {
    closeFieldConfigModal()
    openFieldTypeModal()
  }, [closeFieldConfigModal, openFieldTypeModal])

  const handleEditField = useCallback((field, componentPath = []) => {
    console.log('=== EDIT FIELD ===')
    console.log('Field:', field)
    console.log('Component Path:', componentPath)
    
    setCurrentComponentPath(componentPath)
    
    const fieldTypeObj = {
      id: field.type,
      label: field.type.charAt(0).toUpperCase() + field.type.slice(1)
    }
    openFieldConfigModal(fieldTypeObj, field)
  }, [openFieldConfigModal])

  const handleDeleteField = useCallback((fieldId, componentPath = []) => {
    console.log('=== DELETE FIELD ===')
    console.log('Field ID:', fieldId)
    console.log('Component Path:', componentPath)

    // Find the field to get its name
    let fieldToDelete = null
    if (componentPath.length === 0) {
      fieldToDelete = fields.find(f => f.field.value === fieldId)
    } else {
      let currentLevel = fields
      for (const componentName of componentPath) {
        const component = currentLevel.find(f =>
          f.type === 'component' &&
          (f.field?.value === componentName || f.component_key === componentName)
        )
        if (component && component.fields) {
          currentLevel = component.fields
        }
      }
      fieldToDelete = currentLevel.find(f => f.field.value === fieldId)
    }

    if (window.confirm(`Are you sure you want to delete "${fieldToDelete?.Printvalue || fieldId}"?`)) {
      if (componentPath.length === 0) {
        // Delete from root level
        setFields(prevFields => prevFields.filter(f => f.field.value !== fieldId))
      } else {
        // Delete from nested component
        setFields(prevFields => {
          const newFields = structuredClone(prevFields)
          let currentLevel = newFields

          for (let i = 0; i < componentPath.length; i++) {
            const componentName = componentPath[i]
            const componentField = currentLevel.find(f =>
              f.type === 'component' &&
              (f.field?.value === componentName || f.component_key === componentName)
            )

            if (!componentField) return prevFields

            if (i === componentPath.length - 1) {
              componentField.fields = componentField.fields.filter(f => f.field.value !== fieldId)
            } else {
              currentLevel = componentField.fields
            }
          }

          return newFields
        })
      }
      TostSuccess("Field deleted successfully")
    }
  }, [fields])

  const handleReorderFields = useCallback((fromIndex, toIndex, componentPath = []) => {
    console.log('=== REORDER FIELDS ===')
    console.log('From:', fromIndex, 'To:', toIndex)
    console.log('Component Path:', componentPath)

    if (componentPath.length === 0) {
      // Reorder at root level
      setFields(prevFields => {
        const newFields = [...prevFields]
        const [movedField] = newFields.splice(fromIndex, 1)
        newFields.splice(toIndex, 0, movedField)
        newFields.forEach((field, idx) => {
          field.sort = idx
        })
        return newFields
      })
    } else {
      // Reorder in nested component
      setFields(prevFields => {
        const newFields = structuredClone(prevFields)
        let currentLevel = newFields

        for (let i = 0; i < componentPath.length; i++) {
          const componentName = componentPath[i]
          const componentField = currentLevel.find(f =>
            f.type === 'component' &&
            (f.field?.value === componentName || f.component_key === componentName)
          )

          if (!componentField || !componentField.fields) return prevFields

          if (i === componentPath.length - 1) {
            const [movedField] = componentField.fields.splice(fromIndex, 1)
            componentField.fields.splice(toIndex, 0, movedField)
            componentField.fields.forEach((field, idx) => {
              field.sort = idx
            })
          } else {
            currentLevel = componentField.fields
          }
        }

        return newFields
      })
    }
  }, [])

  const handleAddFieldToComponent = useCallback((componentField, fullComponentPath) => {
    console.log('=== ADD FIELD TO COMPONENT ===')
    console.log('Component Field:', componentField)
    console.log('Full Component Path:', fullComponentPath)

    if (fullComponentPath && fullComponentPath.length > 0) {
      setCurrentComponentPath(fullComponentPath)
      openFieldTypeModal()
    } else {
      TostError('Component path not found')
    }
  }, [openFieldTypeModal])

  const handleCategoryChange = (selectedOption) => {
    setCategory(selectedOption)
  }

  const createComponent = async () => {
    if (!name) {
      TostError("Component name is required")
      return
    }

    if (fields.length === 0) {
      TostError("Please add at least one field")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("sort", sort)
    formData.append("isActive", isActive)
    if (category?.value) {
      formData.append("category", category.value)
    }
    formData.append("fields", JSON.stringify(fields))

    try {
      doPostWithFormdata(formData, "/admin/setting/page-component")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <Breadcrumb styleClass="dark-bg" links={list} />
      <div>
        <AdminCommonHeading Heading={"Create Component"} />

        {/* Basic Info */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Component Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Hero Section, Contact Form"
                helperText="Name can be duplicated across different categories"
              />

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
                  Category
                </Typography>
                <HandleCreatableSelect
                  url="/setting/page-component/category"
                  postUrl="/setting/page-component/category"
                  value={category}
                  onChange={handleCategoryChange}
                  name="category"
                  getOptionLabel="label"
                  getOptionValue="value"
                  placeholder="Select or create category"
                  isClearable={true}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  Organize components by category (e.g., Layout, Content, Forms)
                </Typography>
              </Box>

              {/* Component Key Preview */}
              {(name || category) && (
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Component Key (Auto-generated)
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    {(() => {
                      const slugify = (text) => text.toString().toLowerCase().trim()
                        .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
                      const categorySlug = category?.value ? slugify(category.value) : 'general';
                      const nameSlug = name ? slugify(name) : 'component-name';
                      return `${categorySlug}.${nameSlug}`;
                    })()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    This unique identifier will be used to reference this component
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sort Order"
                  value={sort}
                  onChange={(e) => setSort(Number(e.target.value))}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                  }
                  label="Is Active"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Field Builder with Sidebar */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Fields</Typography>

            {/* Active Context Banner */}
            <ActiveContextBanner 
              componentPath={currentComponentPath}
              onClose={handleCloseContext}
            />

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              <FieldListSidebar
                fields={fields}
                onFieldEdit={handleEditField}
                onFieldDelete={handleDeleteField}
                onFieldReorder={handleReorderFields}
                onAddField={openFieldTypeModal}
                onAddFieldToComponent={handleAddFieldToComponent}
              />
            </Paper>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={createComponent}
            disabled={isCreating || fields.length === 0}
          >
            {isCreating ? "Creating..." : "Create Component"}
          </Button>
        </Box>
      </div>

      {/* Modals */}
      <FieldTypeSelectionModal
        open={fieldTypeModalOpen}
        onClose={closeFieldTypeModal}
        onSelectType={handleFieldTypeSelect}
        hideDynamicZone={true}
      />

      <FieldConfigurationModal
        open={fieldConfigModalOpen}
        onClose={closeFieldConfigModal}
        fieldType={currentFieldType}
        initialData={currentField}
        onSave={handleSaveFieldConfig}
        onAddAnother={handleAddAnotherField}
        existingFields={(() => {
          // Navigate to the correct level based on currentComponentPath
          if (currentComponentPath.length === 0) {
            return fields // Root level
          }
          
          // Navigate through the component tree
          let currentLevel = fields
          for (const componentName of currentComponentPath) {
            const component = currentLevel.find(f => 
              f.type === 'component' && 
              (f.field?.value === componentName || f.component_key === componentName)
            )
            if (component && component.fields) {
              currentLevel = component.fields
            } else {
              return [] // Component not found
            }
          }
          return currentLevel
        })()}
        isEdit={isEditMode}
        BasicSettingsTab={BasicSettingsTab}
        AdvancedSettingsTab={AdvancedSettingsTab}
        currentComponentPath={currentComponentPath}
      />
    </>
  )
}

export default withSwal(page)

export const dynamic = 'force-dynamic'
