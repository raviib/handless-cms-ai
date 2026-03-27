const TYPE = [
    "select-box",
    "multi-select-box",
    "text",
    "textarea",
    "file",
    "object",
    "text-editor",
    "date",
    "checkbox",
    "switchbox",
    "link_target",
]

export const Page_Fields = [
    {
        Heading: "Services",
        fields: [
            {
                Printvalue: "Display Name",
                field: "displayName",
                placeholder: "Enter Display Name",
                require: true,
                type: TYPE[2],
                colSpace: "col-12",
                showInTable: true,
            },
            {
                Printvalue: "Name",
                field: "name",
                placeholder: "Enter Service Name",
                require: true,
                type: TYPE[2],
                colSpace: "col-6",
                showInTable: true,
            },
            {
                Printvalue: "page url",
                field: "url",
                placeholder: "Enter Page Url",
                require: true,
                type: TYPE[2],
                colSpace: "col-6",
                showInTable: true,
            },
            {
                Printvalue: "logo",
                field: "logo",
                require: true,
                type: TYPE[4],
                colSpace: "col-6",
                fileLimit: 3,
                accept_type: "jpeg|png|gif|webp|svg",
                showInTable: true,
            },
            {
                Printvalue: "alt",
                field: "alt",
                placeholder: "Enter image alt",
                require: true,
                type: TYPE[2],
                colSpace: "col-6",
                showInTable: false
            },
            {
                Printvalue: "button Name",
                field: "buttonName",
                placeholder: "Enter Button Name",
                require: true,
                type: TYPE[2],
                colSpace: "col-6",
                showInTable: true,
            },
            {
                Printvalue: "sort",
                field: "sort",
                placeholder: "Enter sort Number",
                require: false,
                type: TYPE[2],
                colSpace: "col-6",
                showInTable: false
            },
            {
                Printvalue: "Show In Home Page",
                field: "showInHomePage",
                require: false,
                type: TYPE[9],
                colSpace: "col-3",
                showInTable: false
            },
            {
                Printvalue: "Show In Header",
                field: "showInHeader",
                require: false,
                type: TYPE[9],
                colSpace: "col-3",
                showInTable: false
            },
            {
                Printvalue: "isActive",
                field: "isActive",
                require: false,
                type: TYPE[9],
                colSpace: "col-3",
                showInTable: true
            },

        ]
    },
    {
        Heading: "Banner",
        fields: [
            {
                Printvalue: "Banner",
                field: "banner",
                placeholder: "Select banner",
                require: true,
                type: TYPE[0],
                colSpace: "col-12",
                getOptionLabel: "displayName",
                getOptionValue: "_id",
                url: "/common/banner/selectbox",
                CreateUrl: "/admin/common/banner/create",
                showInTable: false,
            }
        ]
    },
    {
        Heading: "sub Banner",
        fields: [
            {
                Printvalue: "Sub Banner",
                field: "banner2",
                placeholder: "Select sub banner",
                require: true,
                type: TYPE[0],
                colSpace: "col-12",
                getOptionLabel: "displayName",
                getOptionValue: "_id",
                url: "/common/sub-banner/selectbox",
                CreateUrl: "/admin/common/sub-banner/create",
                showInTable: false

            }
        ]
    },
    {
        Heading: "Our Offerings",
        fields: [
            {
                type: TYPE[5],
                obj_name: "offerings_section",
                fields: [{
                    Printvalue: "Heading",
                    field: "name",
                    placeholder: "Enter Heading",
                    require: true,
                    type: TYPE[2],
                    colSpace: "col-12",
                    showInTable: false
                },
                {
                    Printvalue: "Description",
                    field: "description",
                    placeholder: "Enter description",
                    require: true,
                    type: TYPE[3],
                    colSpace: "col-12",
                    showInTable: false
                }
                ]
            },
            {
                Printvalue: "our-offerings",
                field: "offerings",
                placeholder: "Select Offerings",
                require: true,
                type: TYPE[1],
                colSpace: "col-12",
                getOptionLabel: "displayName",
                getOptionValue: "_id",
                url: "/common/our-offerings/selectbox",
                CreateUrl: "/admin/common/our-offerings/create",
                showInTable: false
            },
        ]
    },
    {
        Heading: "Our Certifications",
        fields: [
            {
                type: TYPE[5],
                obj_name: "certifications_section",
                fields: [{
                    Printvalue: "Heading",
                    field: "name",
                    placeholder: "Enter Heading",
                    require: true,
                    type: TYPE[2],
                    colSpace: "col-12",
                    showInTable: false
                },
                {
                    Printvalue: "Description",
                    field: "description",
                    placeholder: "Enter description",
                    require: true,
                    type: TYPE[3],
                    colSpace: "col-12",
                    showInTable: false
                },
                ]
            },
            {
                Printvalue: "Certifications",
                field: "certifications",
                placeholder: "Select Certifications",
                require: true,
                type: TYPE[1],
                colSpace: "col-12",
                getOptionLabel: "displayName",
                getOptionValue: "_id",
                url: "/common/our-certifications/selectbox",
                CreateUrl: "/admin/common/our-certifications/create",
                showInTable: false
            },
        ]
    },
    {
        Heading: "OUR  Clients",
        fields: [
            {
                type: TYPE[5],
                obj_name: "clients_section",
                fields: [{
                    Printvalue: "Heading",
                    field: "name",
                    placeholder: "Enter Heading",
                    require: true,
                    type: TYPE[2],
                    colSpace: "col-12",
                    showInTable: false
                },
                {
                    Printvalue: "Description",
                    field: "description",
                    placeholder: "Enter description",
                    require: true,
                    type: TYPE[3],
                    colSpace: "col-12",
                    showInTable: false
                }
                ]
            },
            {
                Printvalue: "clients",
                field: "clients",
                placeholder: "Select clients",
                require: true,
                type: TYPE[1],
                colSpace: "col-12",
                getOptionLabel: "displayName",
                getOptionValue: "_id",
                url: "/common/our-clients/selectbox",
                CreateUrl: "/admin/common/our-clients/create",
                showInTable: false

            },
        ]
    },
]