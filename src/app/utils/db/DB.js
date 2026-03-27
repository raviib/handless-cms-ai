// If you want to add new field link {link buttonName use DB_FIELDS}

// If you want to add new data Type Like date etc se FIELD_TYPE

// DB FIELD IS FIEDL of common_field_schema if added any filed then also add in "commonsection.modal.js" this
export const DB_FIELDS = [
  "displayName",
  "name",
  "heading",
  "sub_heading",
  "title",
  "description",
  "keywords",
  "isActive",
  "image",
  "responsive_image",
  "logo",
  "video",
  "alt",
  "sort",
  "buttonName",
  "link",
  "url",
  "link_target",
  "Page_refrance",
];

export const HTML_INPUTS = ["color", "date", "datetime-local", "email", "month", "number", "tel", "text", "time", "url", "week"];

export const FIELD_TYPE = [
  ...HTML_INPUTS,
  "rich-text-markdown",
  "textarea",
  "relation",
  "media",
  "number",
  "date",
  "boolean",
  "enumeration",
  "uid",
  "json",
  "component",
  "link_target",
];


export const FIELD_TYPE_FOR_OBJECT = [
  ...HTML_INPUTS,
  "rich-text-markdown",
  "textarea",
  "media",
  "number",
  "date",
  "boolean",
  "relation",
  "enumeration",
  "link_target",
];

export const FIELD_TYPE_FOR_TAB = [
  ...HTML_INPUTS,
  "rich-text-markdown",
  "textarea",
  "media",
  "number",
  "date",
  "relation",
  "boolean",
  "enumeration",
  "link_target",
];

export const DEFULT_FIELDForSeCTION = {
  field: "", // DB fiend Name print in screen %DropDown%
  FieldPurpose: "",
  Printvalue: "", // print in screen  %String%
  type: "", // type=DropDown
  fileLimit: 3, // image type is file then need to update file limit %Number%
  accept_type: "jpeg|jpg|png|gif|webp|svg", // mp4|avi|mov|mkv|wmv
  placeholder: "", // type=String
  api_end_point: "", // type=String
  colSpace: "col-6", // type=DropDown
  required: true, // type=checkbox
  disable_in_edit: false, // type=checkbox
  showInTable: false, // type=checkbox
  min_value: "Infinity", // type=checkbox
  max_value: "Infinity", // type=checkbox
  sort: -1 // type=number
}

export const DEFULT_FIELD_For_Page = {
  field: "", // DB fiend Name print in screen %DropDown%
  FieldPurpose: "", // FieldPurpose OF FLEDN
  Printvalue: "", // print in screen  %String%
  type: "", // type=DropDown
  fileLimit: 3, // image type is file then need to update file limit %Number%
  accept_type: "jpeg|jpg|png|gif|webp|svg", // mp4|avi|mov|mkv|wmv
  placeholder: "", // type=String
  api_end_point: "", // type=String
  colSpace: "col-6", // type=DropDown
  required: true, // type=checkbox
  disable_in_edit: false, // type=checkbox
  showInTable: false, // type=checkbox
  isMulti: false, // type=checkbox
  sort: -1, // type=number
  getOptionLabel: "displayName", // type=number
  getOptionValue: "_id", // type=number
  CreateUrl: "", // type=number
  connectwith: "", // type=connectwith
  option_value: "", // type=number
  obj_name: "", // type=string
  object_type: "", // type=string,
  min_value: "Infinity", // type=checkbox
  max_value: "Infinity", // type=checkbox
  tab_name: "", // type=string for tab grouping
  tab_type: "", // type=string for tab field type
  unique: false,
  index: false,
  sparse: false,
  trim: false,
  lowercase: false,
  uppercase: false,
  default_value: "",
  match_regex: "",
}
export const ALL_FIELD_FOR_SECTION = [
  'field',
  'Printvalue',
  'FieldPurpose',
  'type',
  'fileLimit',
  'placeholder',
  'accept_type',
  'api_end_point',
  'colSpace',
  'required',
  'disable_in_edit',
  'showInTable',
  "sort",
]

export const ALL_FIELD_FOR_Page_Conf = [
  'field',
  'Printvalue',
  'FieldPurpose',
  'type',
  'fileLimit',
  'placeholder',
  'accept_type',
  'api_end_point',
  'colSpace',
  'required',
  'disable_in_edit',
  'min_value',
  'max_value',
  'showInTable',
  "sort",
  "getOptionLabel", // type=number
  "getOptionValue", // type=number
  "CreateUrl", // type=number
  "connectwith", // type=strng
  "isMulti", // type=BOOL
  "obj_name", // type=string
  "object_type", // type=string
  "tab_name", // type=string for tab grouping
  "tab_type", // type=string for tab field type
  "unique",
  "index",
  "sparse",
  "trim",
  "lowercase",
  "uppercase",
  "default_value",
  "match_regex"
]

export const notRequiredField = [
  "api_end_point",
  "showInTable",
  "fileLimit",
  "placeholder",
  "link_target",
  "required",
  "disable_in_edit",
  "min_value",
  "max_value",
  "sort"
]

export const notRequiredField_FOR_PAGE = [
  "showInTable",
  "required",
  "disable_in_edit",
  "isMulti",
  "sort",
  "unique",
  "index",
  "sparse",
  "trim",
  "lowercase",
  "uppercase",
  "default_value",
  "match_regex"
]


// commonrequiredField 

export const RequiredFields = [
  'field',
  'Printvalue',
  'type',
  'placeholder',
  "sort",
  'colSpace',
  'required',
  'disable_in_edit',
  'showInTable',
  'FieldPurpose',
  'unique',
  'index',
  'sparse',
  'trim',
  'lowercase',
  'uppercase',
  'default_value',
  'match_regex',
]

export const objectRequiredField = [
  ...RequiredFields,
  "obj_name",
  "object_type",
  'fileLimit',
  'accept_type',
  'isMulti',
  'tab_name'
]
export const fileRequiredField = [
  ...RequiredFields,
  'fileLimit',
  'accept_type',
  'isMulti'
]
export const NumberRequiredField = [
  ...RequiredFields,
  "min_value",
  "max_value",

]
export const selectedBoxRequiredField = [
  ...RequiredFields,
  "getOptionLabel",
  "getOptionValue",
  "CreateUrl",
  "api_end_point",
  'connectwith'
]
export const option_valueRequiredFields = [
  ...RequiredFields,
  "option_value"
]

export const tabRequiredFields = [
  'field',
  'Printvalue',
  'type',
  'placeholder',
  "sort",
  'colSpace',
  'required',
  'disable_in_edit',
  'FieldPurpose',
  'tab_name',
  'tab_type',
  'fileLimit',
  'accept_type',
  'min_value',
  'max_value',
  'getOptionLabel',
  'getOptionValue',
  'CreateUrl',
  'connectwith',
  'api_end_point',
  'option_value',
  'isMulti'
]