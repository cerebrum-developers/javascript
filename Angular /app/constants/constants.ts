export class Constants {
  static readonly APP_BUILDER_OPTIONS = [
    {
      type: "text",
      label: "Text",
      icon: "../../../../../assets/images/display_icons/text.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/text.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "lines",
          options: [
            {
              label: "Single line",
              checked: true,
            },
            {
              label: "Multi line",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Text",
    },
    {
      type: "category",
      label: "Category",
      icon: "../../../../../assets/images/display_icons/category.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/category.svg",
      options: [
        {
          label: "Required field",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden if empty",
          type: "checkbox",
          value: false,
        },
        {
          label: "Always hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          label: "Color in calendar",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "choice",
          options: [
            {
              label: "Single choice",
              checked: true,
            },
            {
              label: "Multiple choice",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "display",
          options: [
            {
              label: "Inline",
              checked: true,
            },
            {
              label: "List",
              checked: false,
            },
            {
              label: "Drop-down list",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Category",
      selectOptions: [],
    },
    {
      type: "date",
      label: "Date",
      icon: "../../../../../assets/images/display_icons/date.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/date.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          label: "Show in Calendars",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "display",
          options: [
            {
              label: "Show end date",
              checked: false,
            },
            {
              label: "Hide end date",
              checked: true,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Date",
    },
    {
      type: "relationship",
      label: "Relationship",
      icon: "../../../../../assets/images/display_icons/relationship.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/relationship.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          label: "Always Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          label: "Choose an app",
          type: "checkbox",
          value: false,
          flag: "relation",
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Relationship",
    },
    {
      type: "member",
      label: "Member",
      icon: "../../../../../assets/images/display_icons/member.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/member.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Member",
    },
    {
      type: "phone",
      label: "Phone",
      icon: "../../../../../assets/images/display_icons/phone.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/phone.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Phone",
    },
    {
      type: "email",
      label: "Email",
      icon: "../../../../../assets/images/display_icons/email.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/email.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Email",
    },
    {
      type: "number",
      label: "Number",
      icon: "../../../../../assets/images/display_icons/number.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/number.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "display",
          options: [
            {
              label: "Display whole number",
              example: "1,000",
              checked: true,
            },
            {
              label: "Display two decimals",
              example: "1,000.50",
              checked: false,
            },
            {
              label: "Display four decimals",
              example: "1,000.2500",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Number",
    },
    {
      type: "link",
      label: "Link",
      icon: "../../../../../assets/images/display_icons/link.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/link.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Link",
    },
    {
      type: "image",
      label: "Attachment",
      icon: "../../../../../assets/images/display_icons/attachment.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/attachment.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Attachment",
    },
    {
      type: "money",
      label: "Money",
      icon: "../../../../../assets/images/display_icons/money.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/money.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Money",
    },
    {
      type: "progress",
      label: "Progress",
      icon: "../../../../../assets/images/display_icons/progress.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/progress.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Progress",
    },
    {
      type: "calculator",
      label: "Calculation",
      icon: "../../../../../assets/images/display_icons/calculator.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/calculator.svg",
      options: [
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "display",
          options: [
            {
              label: "Display whole number",
              example: "1,000",
              checked: true,
            },
            {
              label: "Display two decimals",
              example: "1,000.50",
              checked: false,
            },
            {
              label: "Display four decimals",
              example: "1,000.2500",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Calculation",
    },
    {
      type: "location",
      label: "Location",
      icon: "../../../../../assets/images/display_icons/location.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/location.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "radio",
          name: "display",
          options: [
            {
              label: "Single line address",
              checked: true,
            },
            {
              label: "Multi-line address",
              checked: false,
            },
          ],
        },
        {
          break: true,
        },
        {
          label: "Show map",
          type: "checkbox",
          value: true,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Location",
    },
    {
      type: "duration",
      label: "Duration",
      icon: "../../../../../assets/images/display_icons/duration.svg",
      app_builder_icon:
        "../../../../../assets/images/app_builder_icons/duration.svg",
      options: [
        {
          label: "Required",
          type: "checkbox",
          value: false,
        },
        {
          label: "Hidden",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          label: "Display days",
          type: "checkbox",
          value: true,
        },
        {
          label: "Display hours",
          type: "checkbox",
          value: true,
        },
        {
          label: "Display minutes",
          type: "checkbox",
          value: true,
        },
        {
          label: "Display seconds",
          type: "checkbox",
          value: false,
        },
        {
          break: true,
        },
        {
          type: "helpText",
          label: "Add help text ...",
        },
      ],
      placeholder: "Duration",
    },
  ];
  // static readonly CATEGORY_COLORS = [
  //   "#CFDFFF",
  //   "#ABDFDF",
  //   "#BBDFAA",
  //   "#DFDAFA",
  //   "#CFCFCF",
  //   "#ABCABC",
  //   "#DEFDEF",
  //   "#99BBCC",
  // ];

  static readonly CATEGORY_COLORS = [
    "#4FCEDB",
    "#C651D0",
    "#F2A20C",
    "#F20505",
    "#6661F7",
    "#44BE1E",
    "#EF468E",
    "#AA68EB",
  ];

  static readonly GRID_VIEW_FIELD_TYPES = [
    "text",
    "date",
    "number",
    "email",
    "link",
    "phone",
    "money",
    "member",
    "location",
    "progress",
    "duration",
    "category",
    "calculator",
    "image",
    "relationship",
  ];

  static readonly PHONE_TYPES = [
    "Office",
    "Mobile",
    "WhatsApp",
    "Skype",
    "Signal",
    "Telegram",
    "Messenger",
  ];

  static readonly PLAN_TYPES = ["Enterprise", "Pro", "Plus"];

  static readonly PLAN_PERIOD = ["Lifetime", "Yearly", "Month"];

  static readonly PRICE_PER_SEAT = ["p/m", "Ea"];

  static readonly ROLES = ["Administrator", "Member", "light_member"];

  static readonly EMAIL_TYPES = ["Personal", "Work", "Other"];

  static readonly CURRENCY_TYPES = [
    "AUD",
    "CAD",
    "EUR",
    "GBP",
    "USD",
    "BRL",
    "CHF",
    "CNY",
    "CZK",
    "DKK",
    "HKD",
    "IDR",
    "ILS",
    "INR",
    "JPY",
    "KRW",
    "MXN",
    "MYR",
    "NOK",
    "NZD",
    "PHP",
    "PLN",
    "RUB",
    "SEK",
    "SGD",
    "THB",
    "TRY",
    "ZAR",
  ];

  static readonly APP_FIELD_TYPES = {
    TEXT: "text",
    IMAGE: "image",
    EMAIL: "email",
    NUMBER: "number",
    MONEY: "money",
    MEMBER: "member",
    LINK: "link",
    PHONE: "phone",
    CALCULATOR: "calculator",
    CATEGORY: "category",
    DATE: "date",
    DURATION: "duration",
    LOCATION: "location",
    PROGRESS: "progress",
    RELATIONSHIP: "relationship",
  };

  static readonly SIZE_OF_EMPLOYEES: any = [
    "0-1 employees",
    "2-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001-5000 employees",
    "5001-10000 employees",
    "10001+ employees",
  ];

  static readonly ORGANIZATION_BG_COLOR = {
    ROW1: [
      "#CFDFFF",
      "#D0F0FD",
      "#C2F5E9",
      "#FFDAF6",
      "#FFDCE5",
      "#FEE2D5",
      "#FFEAB6",
      "#D1F7C4",
      "#EDE2FE",
      "#EEEEEE",
    ],
    ROW2: [
      "#C6B8A5",
      "#3A4383",
      "#62ACB5",
      "#DAA35B",
      "#6C8202",
      "#C6C764",
      "#FB7132",
      "#E3B6B4",
      "#E3324B",
      "#F3B95F",
    ],
    ROW3: [
      "#E6E6E6",
      "#E1E1E1",
      "#DCDCDC",
      "#D7D7D7",
      "#D2D2D2",
      "#CDCDCD",
      "#C8C8C8",
      "#C3C3C3",
      "#BEBEBE",
      "#B9B9B9",
    ],
  };

  static readonly ADMIN_MENU = [
    { label: "Users", route: "users" },
    { label: "Industries", route: "industries" },
    { label: "Restricted Domains", route: "restricted-domains" },
    { label: "Predefined Groups", route: "predefined-workspaces" },
    // { label: "Monetization", route: "monetization" },
    { label: "Group Banners", route: "workspace-images" },
    { label: "Contributed Groups", route: "contributed-workspaces" },
    { label: "Coupons", route: "coupopns" },
  ];

  static readonly TASK_STATUS = [
    "New",
    "Updated",
    "In Production",
    "Completed",
  ];

  static readonly DRIVES = {
    oneDrive: "OneDrive",
    google: "Google Drive",
    dropbox: "Dropbox",
    calendar:"calendar"
  };

  static readonly PARENT_ROUTES = {
    services: "services",
    profile: "my-profile",
    business: "business-profile",
    workspace: "my-workspace",
    email: "email-notification",
  };

  public static readonly IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/bmp", "image/gif"];

  public static readonly FILTER_DATES = {
    custom: "custom",
    all: "all",
    yesterday: "yesterday",
    tomorrow: "tomorrow",
    today: "today",
    current: {
      week: "current-week",
      month: "current-month",
      year: "current-year",
    },
    past: {
      seven: "past-seven",
      thirty: "past-thirty",
      year: "past-year",
      week: "past-cal-week",
      month: "past-cal-month",
      calYear: "past-cal-year",
      all: "past-all",
    },
    future: {
      seven: "future-seven",
      thirty: "future-thirty",
      year: "future-year",
      week: "future-cal-week",
      month: "future-cal-month",
      calYear: "future-cal-year",
      all: "future-all",
    },
  };

  public static readonly FILTER_MENU = {
    createdBy: "Created By",
    createdOn: "Created On",
    lastEdited: "Last Edited",
  };

  public static readonly VIEW_DATE_OPTIONS = {
    weekday: "Weekday",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  public static readonly VIEW_LOCATION_OPTIONS = {
    country: "Country",
    state: "State",
    city: "City",
    postCode: "Post Code",
  };

  public static readonly FILE_TYPES = {
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    odt: "application/vnd.oasis.opendocument.text",
    ppt: "application/wps-office.ppt",
    pptx: "application/wps-office.pptx",
    doc: "application/wps-office.doc",
    docx: "application/wps-office.docx",
    xls: "application/wps-office.xls",
    xlsx: "application/wps-office.xlsx",
    mov: "video/quicktime",
    csv: "text/csv",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    mp4: "video/mp4",
    zip: "application/zip",
    text: "text/plain",
  };

  public static readonly DOC_FILE_TYPES = [
    "application/doc",
    "application/ms-doc",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  public static readonly EXCEL_FILE_TYPES = [
    "application/excel",
    "application/vnd.ms-excel",
    "application/x-excel",
    "application/x-msexcel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  public static readonly PPT_FILE_TYPE = [
    "application/mspowerpoint",
    "application/powerpoint",
    "application/vnd.ms-powerpoint",
    "application/x-mspowerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  // application/zip,
  // application/x-zip-compressed
  public static readonly ALLOWED_FILE_TYPES = `
    image/jpeg,
    image/jpg,
    image/gif,
    image/png,
    image/bmp,
    `;

    // application/mp4,
    // video/mp4,
    // application/mov,
    // video/quicktime,
    // application/wmv,
    // video/x-ms-wmv,
    // audio/mpeg3,
    // audio/x-mpeg-3,
    // audio/mp3,
    // audio/mpeg,
    // video/avi,
    // .doc,
    // .docx,
    // application/doc,
    // application/ms-doc,
    // application/msword,
    // application/excel,
    // application/vnd.ms-excel,
    // application/x-excel,
    // application/x-msexcel,
    // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
    // application/mspowerpoint,
    // application/powerpoint,
    // application/vnd.ms-powerpoint,
    // application/x-mspowerpoint,
    // application/vnd.openxmlformats-officedocument.presentationml.presentation,
    // application/pdf,
    // .txt,
    // text/csv,
    // .odt,
    // .ods,
    // application/vnd.oasis.opendocument.spreadsheet,
    // application/vnd.oasis.opendocument.text

  public static readonly ALLOWED_FILE_TYPES_POST = `
    image/jpeg,
    image/jpg,
    image/gif,
    image/png,
    image/bmp,
    `;

    // application/mp4,
    // video/mp4,
    // application/mov,
    // video/quicktime,
    // application/wmv,
    // video/x-ms-wmv,
    // audio/mpeg3,
    // audio/x-mpeg-3,
    // audio/mp3,
    // audio/mpeg,
    // video/avi,
    // .doc,
    // .docx,
    // application/doc,
    // application/ms-doc,
    // application/msword,
    // application/excel,
    // application/vnd.ms-excel,
    // application/x-excel,
    // application/x-msexcel,
    // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
    // application/mspowerpoint,
    // application/powerpoint,
    // application/vnd.ms-powerpoint,
    // application/x-mspowerpoint,
    // application/vnd.openxmlformats-officedocument.presentationml.presentation,
    // application/pdf,
    // .txt,
    // text/csv,
    // .odt,
    // .ods,
    // application/vnd.oasis.opendocument.spreadsheet,
    // application/vnd.oasis.opendocument.text

  public static readonly NOTIFICATION_TYPES = {
    read: "read",
    unread: "unread",
    star: "star",
    unstar: "unstar"
  }
  public static readonly POST_FILE_TYPE = [
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/png",
    "image/bmp",
    // "application/mp4",
    // "video/mp4",
    // "application/mov",
    // "video/quicktime",
    // "application/wmv",
    // "video/x-ms-wmv",
    // "audio/mpeg3",
    // "audio/x-mpeg-3",
    // "audio/mp3",
    // "audio/mpeg",
    // "video/avi",
    // ".doc",
    // ".docx",
    // "application/doc",
    // "application/ms-doc",
    // "application/msword",
    // "application/excel",
    // "application/vnd.ms-excel",
    // "application/x-excel",
    // "application/x-msexcel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // "application/mspowerpoint",
    // "application/powerpoint",
    // "application/vnd.ms-powerpoint",
    // "application/x-mspowerpoint",
    // "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // "application/pdf",
    // ".txt",
    // "text/csv",
    // ".odt",
    // ".ods",
    // "application/vnd.oasis.opendocument.spreadsheet",
    // "application/vnd.oasis.opendocument.text"
  ]
  public static readonly UPLOAD_TYPE = [
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/png",
    "image/bmp",
    // "application/mp4",
    // "video/mp4",
    // "application/mov",
    // "video/quicktime",
    // "application/wmv",
    // "video/x-ms-wmv",
    // "audio/mpeg3",
    // "audio/x-mpeg-3",
    // "audio/mp3",
    // "audio/mpeg",
    // "video/avi",
    // ".doc",
    // ".docx",
    // "application/doc",
    // "application/ms-doc",
    // "application/msword",
    // "application/excel",
    // "application/vnd.ms-excel",
    // "application/x-excel",
    // "application/x-msexcel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // "application/mspowerpoint",
    // "application/powerpoint",
    // "application/vnd.ms-powerpoint",
    // "application/x-mspowerpoint",
    // "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // "application/pdf",
    // ".txt",
    // "text/csv",
    // ".odt",
    // ".ods",
    // "application/vnd.oasis.opendocument.spreadsheet",
    // "application/vnd.oasis.opendocument.text"
  ]
  public static readonly AUDIO_TYPE = ['.aif', '.cda',
    '.midi',
    '.mid', '.mp3',
    '.mpa', '.ogg', '.wav', '.wma', '.wpl']
  public static readonly PREVIEW_TYPE = ['.ai', '.bmp',
    '.gif','.odt','.ods','.wmv',
    '.ico', '.jpeg','.mov',
    '.jpg', '.png', '.ps', '.psd', '.svg', '.tif', '.tiff']
    // public static readonly DOC_PREVIEW_TYPE = ['.ai', '.bmp',
    // '.gif',
    // '.ico', '.jpeg','.mov',
    // '.jpg', '.png', '.ps', '.psd', '.svg', '.tif', '.tiff']
}
