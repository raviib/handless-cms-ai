'use client';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  OutlinedInput,
  Checkbox,
  ListItemText
} from "@mui/material";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import ALL_LOCALES from "@/app/utils/db/internationalization.db.json";

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import HttpIcon from '@mui/icons-material/Http';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewListIcon from '@mui/icons-material/ViewList';

import { TostError, TostSuccess } from "@/app/utils/tost/Tost";
import { UNDER } from "./conf-db";

// Helper to sanitize slugs
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces th -
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const PageConfigration = (props) => {
  const {
    setName, name,
    pageName, setPageName,
    category, setCategory,
    showInHeader, setShowInHeader,
    under, setUnder,
    detailPage, setDetailPage,
    isDateFilters, setisDateFilters,
    showSEO, setShowSEO,
    sort, setSort,
    put_url, setPut_url,
    post_url, setPost_url,
    setDelete_image, delete_image_url,
    get_url, setGet_url,
    searchInputPlaceholder, setSearchInputPlaceholder,
    ShowExcel, setShowExcel,
    entryTitle, setEntryTitle,
    locales = ["en"], setLocales,
    sections = [],
    showOnly = "all" // "all", "basic", "settings"
  } = props;

  // Only active locales available for selection
  const activeLocales = useMemo(
    () => ALL_LOCALES.filter((l) => l.isActive),
    []
  );

  // Auto-generate slug when Name changes (only if slug is empty or previous match)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    // Optional: simple heuristic to auto-fill slug if user hasn't typed a custom one yet
    if (!pageName || pageName === generateSlug(name)) {
      setPageName(generateSlug(val));
    }
  };

  // Memoize MenuItem arrays to prevent recreation on every render
  const underMenuItems = useMemo(() => (
    UNDER.map((item) => (
      <MenuItem key={item} value={item}>
        {item.toUpperCase()}
      </MenuItem>
    ))
  ), []);

  // Get all text fields from all sections for entry_title selection
  const allTextFields = useMemo(() => {
    const textFields = [];
    const textFieldTypes = ['text', 'email', 'password'];

    sections.forEach((section) => {
      if (section.fields && Array.isArray(section.fields)) {
        section.fields.forEach((field) => {
          if (textFieldTypes.includes(field.type)) {
            textFields.push({
              value: field.field?.value,
              label: field.Printvalue || field.field?.label,
              section: section.Heading
            });
          }
        });
      }
    });

    return textFields;
  }, [sections]);

  // Auto-set entry_title to first text field if not set (only for create mode)
  // Also validate that the current entryTitle exists in available fields
  useEffect(() => {
    if (allTextFields.length > 0 && setEntryTitle) {
      // If no entry title is set, default to first text field
      if (!entryTitle) {
        setEntryTitle(allTextFields[0].value);
      }
      // If entry title is set but doesn't exist in current fields, reset to first field
      else if (!allTextFields.some(f => f.value === entryTitle)) {
        console.warn(`Entry title "${entryTitle}" not found in available fields. Resetting to first field.`);
        setEntryTitle(allTextFields[0].value);
      }
    }
  }, [allTextFields]);


  return (
    <Grid container spacing={3}>
      {/* --- Basic Information Card --- */}
      {(showOnly === "all" || showOnly === "basic") && (
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <SettingsIcon color="primary" />
                <Typography variant="h6">Basic Information</Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Blog Posts"
                    helperText="This will be displayed in the admin sidebar"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Page Slug (URL)"
                    required
                    value={pageName}
                    onChange={(e) => setPageName(generateSlug(e.target.value))}
                    placeholder="e.g. blog-posts"
                    helperText="Unique identifier for the URL (auto-formatted)"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">/</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Under Section</InputLabel>
                    <Select
                      value={under}
                      label="Under Section"
                      onChange={(e) => setUnder(e.target.value)}
                    >
                      <MenuItem value="" disabled>Select Parent</MenuItem>
                      {underMenuItems}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Category (Optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value.toLowerCase())}
                    placeholder="e.g. media"
                    helperText="Use 'none' to skip category folder grouping"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search Placeholder"
                    value={searchInputPlaceholder}
                    onChange={(e) => setSearchInputPlaceholder(e.target.value)}
                    placeholder="e.g. Search by title..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sort Order"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    helperText="Lower numbers appear higher in the menu. Default: -1"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* --- Combined Settings Card --- */}
      {(showOnly === "all" || showOnly === "settings") && (
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>

              {/* Header */}
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <ViewListIcon color="secondary" />
                <Typography variant="h6">Module Settings</Typography>
              </Stack>

              <Grid container spacing={4}>

                {/* ---------------------
              FEATURE OPTIONS
          ---------------------- */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <ViewListIcon color="secondary" />
                    <Typography variant="subtitle1">Feature Options</Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={showInHeader} onChange={(e) => setShowInHeader(e.target.checked)} />}
                        label="Show in Menu"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={detailPage}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setDetailPage(checked);

                              if (!checked) {
                                setisDateFilters(false);
                                setShowExcel(false);
                              }
                            }}
                          />
                        }
                        label="Enable Detail Page"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={showSEO} onChange={(e) => setShowSEO(e.target.checked)} color="success" />}
                        label="SEO Meta Fields"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={isDateFilters} onChange={(e) => setisDateFilters(e.target.checked)} />}
                        label="Date Filters"
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={ShowExcel} onChange={(e) => setShowExcel(e.target.checked)} />}
                        label="Allow Excel Export"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* ---------------------
                LOCALES / INTERNATIONALIZATION
          ---------------------- */}
                {setLocales && (
                  <Grid item xs={12} md={6}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                      <ViewListIcon color="primary" />
                      <Typography variant="subtitle1">Locales</Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" paragraph>
                      Select the languages this module supports. <strong>en</strong> is the default and always included.
                    </Typography>

                    <FormControl fullWidth size="small">
                      <InputLabel>Locales</InputLabel>
                      <Select
                        multiple
                        value={locales}
                        onChange={(e) => {
                          // Always keep "en" in the list
                          const val = e.target.value;
                          if (!val.includes("en")) return;
                          setLocales(val);
                        }}
                        input={<OutlinedInput label="Locales" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selected.map((code) => {
                              const locale = ALL_LOCALES.find((l) => l.code === code);
                              return (
                                <Chip
                                  key={code}
                                  size="small"
                                  label={`${locale?.flag ?? ""} ${code}`}
                                  color={code === "en" ? "primary" : "default"}
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {activeLocales.map((locale) => (
                          <MenuItem key={locale.code} value={locale.code} disabled={locale.code === "en"}>
                            <Checkbox checked={locales.includes(locale.code)} />
                            <ListItemText
                              primary={`${locale.flag} ${locale.name}`}
                              secondary={locale.nativeName}
                            />
                            {locale.code === "en" && (
                              <Chip size="small" label="Default" color="primary" sx={{ ml: 1 }} />
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* ---------------------
                API OVERRIDES
          ---------------------- */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <HttpIcon color="action" />
                    <Typography variant="subtitle1">API Overrides</Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" paragraph>
                    Leave fields empty to use auto-generated CRUD endpoints.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="GET URL"
                        value={get_url}
                        onChange={(e) => setGet_url(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="CREATE (POST)"
                        value={post_url}
                        onChange={(e) => setPost_url(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="EDIT (PUT)"
                        value={put_url}
                        onChange={(e) => setPut_url(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="DELETE IMG"
                        value={delete_image_url}
                        onChange={(e) => setDelete_image(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* ---------------------
                ENTRY TITLE SELECTION
          ---------------------- */}
                {allTextFields.length > 0 && (
                  <Grid item xs={12}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                      <ViewListIcon color="info" />
                      <Typography variant="subtitle1">Entry Title</Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" paragraph>
                      Select which text field will be used as the entry title (defaults to first text field).
                    </Typography>

                    <FormControl fullWidth size="small">
                      <InputLabel>Entry Title Field</InputLabel>
                      <Select
                        value={entryTitle && allTextFields.some(f => f.value === entryTitle) ? entryTitle : ''}
                        label="Entry Title Field"
                        onChange={(e) => setEntryTitle && setEntryTitle(e.target.value)}
                      >
                        {allTextFields.map((field) => (
                          <MenuItem key={field.value} value={field.value}>
                            {field.label} <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>({field.section})</Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

    </Grid>
  );
};

export const AddSections = ({ sections, setSections, onSectionAdd }) => {
  const [name, setName] = useState("");

  const addHandler = () => {
    if (!name.trim()) {
      TostError("Section name required");
      return;
    }

    const exists = sections.find(
      (ele) => ele.Heading.toLowerCase() === name.toLowerCase().trim()
    );

    if (exists) {
      TostError(`Section "${name}" already exists`);
      return;
    }

    const newSection = { Heading: name.trim(), fields: [] };
    setSections((prev) => [...prev, newSection]);
    setName("");
    TostSuccess("Section added successfully");

    // Auto-open the new section for editing
    if (onSectionAdd) {
      onSectionAdd(sections.length);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Add New Section"
          placeholder="e.g. General Information"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHandler()}
          size="small"
          InputProps={{
            sx: { borderRadius: 2, background: "#f7f9fc" },
          }}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addHandler}
          sx={{
            height: "40px",
            borderRadius: 2,
            textTransform: "none",
            fontSize: "15px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            minWidth: { sm: "160px" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Add Section
        </Button>

      </Stack>
    </Box>
  );
};

export const SectionsList = memo(({ sections_data_list = [], onSectionClick }) => {
  if (!sections_data_list.length) return null;

  // Memoize the chips array to prevent recreation on every render
  const sectionChips = useMemo(() => (
    sections_data_list.map((ele, index) => {
      const sectionParam = ele.Heading?.replace(/\s+/g, '%20');
      return (
        <Link
          key={ele.Heading}
          href={`?tab=Quick%20Navigation&section=${encodeURIComponent(ele.Heading)}`}
          style={{ textDecoration: 'none' }}
        >
          <Chip
            label={ele.Heading}
            icon={<SettingsIcon fontSize="small" />}
            clickable
            color="primary"
            variant="outlined"
            onClick={() => onSectionClick && onSectionClick(index)}
            sx={{ px: 1, py: 2, borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
          />
        </Link>
      );
    })
  ), [sections_data_list, onSectionClick]);

  return (
    <Box>
      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
        Quick Navigation (Click a section to edit fields)
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {sectionChips}
      </Stack>
    </Box>
  );
});
SectionsList.displayName = 'SectionsList';

export const PageConfigTabs = ({
  children,
  activeTab,
  setActiveTab,
  activeSectionIndex,
  setActiveSectionIndex,
  sections
}) => {
  const router = useRouter();

  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [mounted, setMounted] = useState(false);

  const handleChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, [setActiveTab]);

  const handleBackClick = useCallback(() => {
    setActiveSectionIndex(null);
    router.push('?tab=Quick%20Navigation');
  }, [setActiveSectionIndex, router]);

  const handlePreviousTab = useCallback(() => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  }, [activeTab, setActiveTab]);

  const handleNextTab = useCallback(() => {
    if (activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
  }, [activeTab, setActiveTab]);

  // Memoize filtered children to prevent recalculation
  const validChildren = useMemo(() => children.filter(child => !!child), [children]);

  // Memoize tab content to prevent re-renders when switching tabs
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 0:
        return <Box>{validChildren[0]}</Box>;
      case 1:
        return <Box>{validChildren[1]}</Box>;
      case 2:
        return (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                {validChildren[2]}
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                {validChildren[3]}
              </CardContent>
            </Card>
          </>
        );
      default:
        return null;
    }
  }, [activeTab, validChildren]);

  // This useEffect MUST come after all other hooks
  useEffect(() => {
    setMounted(true);
  }, []);

  // NOW we can do conditional rendering - after ALL hooks have been called
  if (!mounted) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, background: '#fff', borderRadius: '8px 8px 0 0', width: '100%' }}>
          <Box sx={{ p: 2, minHeight: '48px', display: 'flex', alignItems: 'center' }}>
            Loading tabs...
          </Box>
        </Box>
        {tabContent}
      </Box>
    );
  }


  // If a section is selected for editing, show the editor
  if (activeSectionIndex !== null && validChildren.length > 0) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%', mt: 2, mb: 10 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
          color="inherit"
        >
          Back to Quick Navigation
        </Button>
        <Card variant="outlined" sx={{ border: 'none', boxShadow: 'none', bgcolor: 'transparent', width: '100%' }}>
          <CardContent sx={{ p: { xs: 0, sm: 1 }, "&:last-child": { pb: 1 } }}>
            {/* Show the CreateSections editor - last child */}
            {validChildren[validChildren.length - 1]}
          </CardContent>
        </Card>
      </Box>
    );
  }

  const tabLabels = [
    { label: 'Basic Information', param: 'Basic%20Information' },
    { label: 'Module Settings', param: 'Module%20Settings' },
    { label: 'Quick Navigation', param: 'Quick%20Navigation' }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, background: '#fff', borderRadius: '8px 8px 0 0', width: '100%' }}>
        <Tabs
          value={activeTab || 0}
          onChange={handleChange}
          aria-label="page config tabs"
          scrollButtons="auto"
        >
          {tabLabels.map((tab, index) => (
            <Tab
              key={tab.label}
              label={tab.label}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>

      </Box>

      {tabContent}

      {/* Navigation Buttons */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 3,
        pt: 2,
        borderTop: '1px solid #e0e0e0'
      }}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={handlePreviousTab}
          disabled={activeTab === 0}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Previous
        </Button>

        <Typography variant="body2" color="text.secondary">
          Step {(activeTab || 0) + 1} of 3
        </Typography>

        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleNextTab}
          disabled={activeTab === 2}
          variant="contained"
          sx={{ textTransform: 'none' }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};
