"use client"
import HandleCreatableSelect from "@/app/components/admin/extra/HandleCreatableSelect.jsx";
import {
    FIELD_TYPE,
    FIELD_TYPE_FOR_OBJECT,
    FIELD_TYPE_FOR_TAB
} from "@/app/utils/db/DB.js";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Added ExpandMoreIcon import
import {
    Accordion, // Added AccordionSummary import
    AccordionDetails // Added AccordionDetails import
    , // Added Accordion import
    AccordionSummary,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { useMemo } from 'react';


/**
 * FieldFormInputs Component
 * Form inputs for configuring a field
 * Note: Not memoized because onChnageHandler changes frequently
 */
export const FieldFormInputs = ({ filedDetails, onChnageHandler, colSpace, activeTabName, activeObjectKey }) => {
    // Memoize MenuItem arrays to prevent recreation on every render
    const fieldTypeMenuItems = useMemo(() => (
        FIELD_TYPE.map((ele, index) => (
            <MenuItem value={ele} key={index}>{ele}</MenuItem>
        ))
    ), []);

    const fieldTypeForObjectMenuItems = useMemo(() => (
        FIELD_TYPE_FOR_OBJECT.map((ele, index) => (
            <MenuItem value={ele} key={index}>{ele}</MenuItem>
        ))
    ), []);

    const fieldTypeForTabMenuItems = useMemo(() => (
        FIELD_TYPE_FOR_TAB.map((ele, index) => (
            <MenuItem value={ele} key={index}>{ele}</MenuItem>
        ))
    ), []);

    const colSpaceMenuItems = useMemo(() => (
        colSpace.map((ele, index) => (
            <MenuItem value={ele} key={index}>{ele.replace('col-', 'Width: ')}</MenuItem>
        ))
    ), [colSpace]);

    return (
        <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: 2, width: '100%' }}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5, ml: 0.5 }}>Db Field</Typography>
                <HandleCreatableSelect
                    value={filedDetails.field}
                    onChange={onChnageHandler}
                    url="/setting/form-field/getfield"
                    postUrl="/setting/form-field"
                    name="field"
                    getOptionLabel={"label"}
                    getOptionValue={"value"}
                    message="Eg: variable_one ,VariableTwo,variableThree"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Print Value"
                    placeholder="Label"
                    name="Printvalue"
                    value={filedDetails.Printvalue}
                    onChange={onChnageHandler}
                    sx={{ mt: 2.2 }}
                />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small" sx={{ mt: 2.2 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                        name="type"
                        value={filedDetails.type}
                        onChange={onChnageHandler}
                        label="Type"
                    >
                        <MenuItem value="">Select type</MenuItem>
                        {fieldTypeMenuItems}
                        <MenuItem value={"object"}>object</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {/* Static Select Box Options */}
            {(filedDetails.type === "static-select-box" || filedDetails.tab_type === "static-select-box") && (
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Options (Comma separated)"
                        name="option_value"
                        value={filedDetails.option_value}
                        onChange={onChnageHandler}
                        sx={{ mt: 2.5 }}
                    />
                </Grid>
            )}

            {/* File Type Fields */}
            {(filedDetails.type === "file" || filedDetails.tab_type === "file") && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                            <InputLabel>Is Multi</InputLabel>
                            <Select
                                name="isMulti"
                                value={filedDetails.isMulti}
                                onChange={onChnageHandler}
                                label="Is Multi"
                            >
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="File Limit (MB)"
                            name="fileLimit"
                            value={filedDetails.fileLimit}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Accept Type (Regex)"
                            name="accept_type"
                            value={filedDetails.accept_type}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                </>
            )}

            {/* Object Type Fields */}
            {filedDetails.type === "object" && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                            <InputLabel>Object Inner Type</InputLabel>
                            <Select
                                name="object_type"
                                value={filedDetails.object_type}
                                onChange={onChnageHandler}
                                label="Object Inner Type"
                            >
                                <MenuItem value="">Select type</MenuItem>
                                {fieldTypeForObjectMenuItems}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Object Key"
                            name="obj_name"
                            value={filedDetails.obj_name || activeObjectKey}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    {/* Tab Name for Object Type Tab */}
                    {filedDetails.object_type === "tab" && (
                        <Grid item xs={12} sm={4} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Tab Name (for Object)"
                                name="tab_name"
                                value={filedDetails.tab_name || activeTabName}
                                onChange={onChnageHandler}
                                sx={{ mt: 2.5 }}
                            />
                        </Grid>
                    )}
                </>
            )}

            {/* Object File Type Fields */}
            {filedDetails.object_type === "file" && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                            <InputLabel>Is Multi</InputLabel>
                            <Select
                                name="isMulti"
                                value={filedDetails.isMulti}
                                onChange={onChnageHandler}
                                label="Is Multi"
                            >
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="File Limit (MB)"
                            name="fileLimit"
                            value={filedDetails.fileLimit}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Accept Type (Regex)"
                            name="accept_type"
                            value={filedDetails.accept_type}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                </>
            )}

            {/* Number Type Fields */}
            {(filedDetails.object_type === "number" || filedDetails.type === "number" || filedDetails.tab_type === "number") && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Min Value"
                            name="min_value"
                            value={filedDetails.min_value}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Max Value"
                            name="max_value"
                            value={filedDetails.max_value}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                </>
            )}

            {/* Select Box Fields */}
            {(["multi-select-box", "select-box"].includes(filedDetails.type) || ["multi-select-box", "select-box"].includes(filedDetails.tab_type)) && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5, ml: 0.5 }}>Connect With</Typography>
                        <HandleCreatableSelect
                            value={filedDetails.connectwith}
                            onChange={onChnageHandler}
                            url="/setting/pages-conf/connect-modules"
                            postUrl=""
                            name="connectwith"
                            getOptionLabel={"name"}
                            getOptionValue={"pageName"}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="API End Point"
                            name="api_end_point"
                            value={filedDetails.api_end_point}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Create URL"
                            name="CreateUrl"
                            value={filedDetails.CreateUrl}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Option Label"
                            name="getOptionLabel"
                            value={filedDetails.getOptionLabel}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Option Value"
                            name="getOptionValue"
                            value={filedDetails.getOptionValue}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>
                </>
            )}

            {/* Tab Type Fields */}
            {filedDetails.type === "tab" && (
                <>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Tab Name"
                            name="tab_name"
                            value={filedDetails.tab_name || activeTabName}
                            onChange={onChnageHandler}
                            sx={{ mt: 2.5 }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                            <InputLabel>Tab Type</InputLabel>
                            <Select
                                name="tab_type"
                                value={filedDetails.tab_type}
                                onChange={onChnageHandler}
                                label="Tab Type"
                            >
                                <MenuItem value="">Select content type</MenuItem>
                                {fieldTypeForTabMenuItems}
                            </Select>
                        </FormControl>
                    </Grid>
                </>
            )}

            {/* Common Fields */}
            <Grid item xs={12} sm={4} md={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Placeholder"
                    name="placeholder"
                    value={filedDetails.placeholder}
                    onChange={onChnageHandler}
                    sx={{ mt: 2.5 }}
                />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                    <InputLabel>Col Space</InputLabel>
                    <Select
                        name="colSpace"
                        value={filedDetails.colSpace}
                        onChange={onChnageHandler}
                        label="Col Space"
                    >
                        {colSpaceMenuItems}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                    <InputLabel>Required</InputLabel>
                    <Select
                        name="required"
                        value={filedDetails.required}
                        onChange={onChnageHandler}
                        label="Required"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                    <InputLabel>Disable in Edit</InputLabel>
                    <Select
                        name="disable_in_edit"
                        value={filedDetails?.disable_in_edit ?? false}
                        onChange={onChnageHandler}
                        label="Disable in Edit"
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {!(filedDetails.type === "object") && (
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
                        <InputLabel>Show In Table</InputLabel>
                        <Select
                            name="showInTable"
                            value={filedDetails.showInTable}
                            onChange={onChnageHandler}
                            label="Show In Table"
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            )}

            <Grid item xs={12} sm={4} md={3}>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Sort Order"
                    name="sort"
                    value={filedDetails.sort}
                    onChange={onChnageHandler}
                    sx={{ mt: 2.5 }}
                />
            </Grid>

            <Grid item xs={12} sm={4} md={3}>
                <TextField
                    fullWidth
                    size="small"
                    label="Field Purpose"
                    name="FieldPurpose"
                    value={filedDetails.FieldPurpose}
                    onChange={onChnageHandler}
                    sx={{ mt: 2.5 }}
                />
            </Grid>

            {/* Premium Advanced Config Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
                <Accordion
                    elevation={0}
                    sx={{
                        border: '1px solid #edf2f7',
                        borderRadius: '12px !important',
                        '&:before': { display: 'none' },
                        bgcolor: '#fafafa'
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                            Advanced Validation & Indexing
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Unique</InputLabel>
                                    <Select
                                        name="unique"
                                        value={filedDetails.unique}
                                        onChange={onChnageHandler}
                                        label="Unique"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Search Index</InputLabel>
                                    <Select
                                        name="index"
                                        value={filedDetails.index}
                                        onChange={onChnageHandler}
                                        label="Search Index"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Sparse Index</InputLabel>
                                    <Select
                                        name="sparse"
                                        value={filedDetails.sparse}
                                        onChange={onChnageHandler}
                                        label="Sparse Index"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Default Value"
                                    name="default_value"
                                    value={filedDetails.default_value}
                                    onChange={onChnageHandler}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Match Regex"
                                    name="match_regex"
                                    value={filedDetails.match_regex}
                                    onChange={onChnageHandler}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Trim</InputLabel>
                                    <Select
                                        name="trim"
                                        value={filedDetails.trim}
                                        onChange={onChnageHandler}
                                        label="Trim"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Lowercase</InputLabel>
                                    <Select
                                        name="lowercase"
                                        value={filedDetails.lowercase}
                                        onChange={onChnageHandler}
                                        label="Lowercase"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Uppercase</InputLabel>
                                    <Select
                                        name="uppercase"
                                        value={filedDetails.uppercase}
                                        onChange={onChnageHandler}
                                        label="Uppercase"
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </Grid>
    )
};