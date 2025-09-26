import { dietmsc } from "./diet";
import { exercisemsc } from "./exercise";
import { weightmsc } from "./weight";

export let APP_NAME = "Health Tracker";

// Template Interface for better type safety
export interface ItemsConfig {
  Name: string;
  Heading: string;
  Subheading: string;
  Rows: {
    start: number;
    end: number;
  };
  Columns: {
    [columnName: string]: string; // Column name to cell column mapping
  };
}

export interface NestedField {
  [key: string]: string | NestedField;
}

export interface CellMapping {
  [fieldName: string]: string | ItemsConfig | NestedField;
}

export interface GraphMapping {
  [fieldName: string]: string;
}

export interface TemplateData {
  template: string;
  templateId: number;
  category: string;
  msc: {
    numsheets: number;
    currentid: string;
    currentname: string;
    sheetArr: {
      [sheetName: string]: {
        sheetstr: {
          savestr: string;
        };
        name: string;
        hidden: string;
      };
    };
    EditableCells: {
      allow: boolean;
      cells: {
        [cellName: string]: boolean;
      };
      constraints: {
        [cellName: string]: [string, string, string, string];
      };
    };
  };
  footers: {
    name: string;
    index: number;
    isActive: boolean;
  }[];
  logoCell?: string | { [sheetName: string]: string };
  signatureCell?: string | { [sheetName: string]: string };
  cellMappings: {
    [sheetName: string]: CellMapping;
  };
  showGraph?: { [sheetName: string]: boolean };
  graphMappings?: {
    [sheetName: string]: {
      type: "detailed" | "summary";
      fields: GraphMapping;
      rows?: {
        start: number;
        end: number;
      };
      summaryValues?: {
        [key: string]: string; // cell reference for summary values
      };
    };
  };
}

export let DATA: { [key: number]: TemplateData } = {
  1001: {
    template: "Diet-Plan",
    templateId: 1001,
    category: "Mobile",
    footers: [
      { name: "Intro", index: 1, isActive: true },
      { name: "Items", index: 2, isActive: false },
      { name: "Week 1", index: 3, isActive: false },
      { name: "Week 2", index: 4, isActive: false },
      { name: "Week 3", index: 5, isActive: false },
      { name: "Week 4", index: 6, isActive: false },
    ],
    cellMappings: {
      sheet1: {
        // Introduction sheet - no editable cells, no mappings
      },
      sheet2: {
        Heading: "B3",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 7,
            end: 36,
          },
          Columns: {
            Name: "C",
            Cal: "D",
            Carbs: "E",
            Sugar: "F",
            Fiber: "G",
          },
        },
      },
      sheet3: {
        Heading: "B2",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 11,
            end: 30,
          },
          Columns: {
            Date: "C",
            Time: "D",
            ItemTag: "E",
            Qty: "G",
          },
        },
      },
      sheet4: {
        Heading: "B2",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 11,
            end: 30,
          },
          Columns: {
            Date: "C",
            Time: "D",
            ItemTag: "E",
            Qty: "G",
          },
        },
      },
      sheet5: {
        Heading: "B2",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 11,
            end: 30,
          },
          Columns: {
            Date: "C",
            Time: "D",
            ItemTag: "E",
            Qty: "G",
          },
        },
      },
      sheet6: {
        Heading: "B2",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 11,
            end: 30,
          },
          Columns: {
            Date: "C",
            Time: "D",
            ItemTag: "E",
            Qty: "G",
          },
        },
      },
    },
    showGraph: {
      sheet1: false,
      sheet2: true,
      sheet3: true,
      sheet4: true,
      sheet5: true,
      sheet6: true,
    },
    graphMappings: {
      sheet2: {
        type: "detailed",
        fields: {
          Name: "C",
          Cal: "D",
          Carbs: "E",
          Sugar: "F",
          Fiber: "G",
        },
        rows: {
          start: 7,
          end: 36,
        },
      },
      sheet3: {
        type: "summary",
        fields: {
          Cal: "Cal",
          Carbs: "Carbs",
          Sugar: "Sugar",
          Fiber: "Fiber",
        },
        summaryValues: {
          Cal: "E4",
          Carbs: "E5",
          Sugar: "E6",
          Fiber: "E7",
        },
      },
      sheet4: {
        type: "summary",
        fields: {
          Cal: "Cal",
          Carbs: "Carbs",
          Sugar: "Sugar",
          Fiber: "Fiber",
        },
        summaryValues: {
          Cal: "E4",
          Carbs: "E5",
          Sugar: "E6",
          Fiber: "E7",
        },
      },
      sheet5: {
        type: "summary",
        fields: {
          Cal: "Cal",
          Carbs: "Carbs",
          Sugar: "Sugar",
          Fiber: "Fiber",
        },
        summaryValues: {
          Cal: "E4",
          Carbs: "E5",
          Sugar: "E6",
          Fiber: "E7",
        },
      },
      sheet6: {
        type: "summary",
        fields: {
          Cal: "Cal",
          Carbs: "Carbs",
          Sugar: "Sugar",
          Fiber: "Fiber",
        },
        summaryValues: {
          Cal: "E4",
          Carbs: "E5",
          Sugar: "E6",
          Fiber: "E7",
        },
      },
    },

    msc: dietmsc,
  },

  1002: {
    template: "Exercise-Log",
    templateId: 1002,
    category: "Mobile",
    footers: [{ name: "Exercise", index: 1, isActive: true }],
    logoCell: {
      sheet1: "",
    },
    signatureCell: {
      sheet1: "",
    },
    cellMappings: {
      sheet1: {
        Heading: "B3",
        StartDate: "B7",
        Items: {
          Name: "Items",
          Heading: "Items",
          Subheading: "Item",
          Rows: {
            start: 7,
            end: 150,
          },
          Columns: {
            DurationInMin: "C",
            CaloriesBurned: "D",
            Notes: "E",
          },
        },
      },
    },

    msc: exercisemsc,
  },
  1003: {
    template: "Weight-Log",
    templateId: 1003,
    category: "Mobile",
    footers: [{ name: "Weight Log", index: 1, isActive: true }],
    logoCell: {
      sheet1: "",
    },
    signatureCell: {
      sheet1: "",
    },
    cellMappings: {
      sheet1: {
        Heading: "B3",
        Items: {
          Name: "Days",
          Heading: "Days",
          Subheading: "Day",
          Rows: {
            start: 6,
            end: 30,
          },
          Columns: {
            Date: "B",
            Weight: "C",
            Goal: "D",
            Notes: "F",
          },
        },
      },
    },

    msc: weightmsc,
  },
};
