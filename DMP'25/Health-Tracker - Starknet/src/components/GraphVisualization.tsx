import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from "@ionic/react";
import { close, barChart, pieChart } from "ionicons/icons";
import { TemplateData } from "../templates";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface GraphVisualizationProps {
  isOpen: boolean;
  onClose: () => void;
  templateData: TemplateData;
  currentSheet: string;
  sheetData: any; // SocialCalc sheet data
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  isOpen,
  onClose,
  templateData,
  currentSheet,
  sheetData,
}) => {
  const [chartType, setChartType] = useState<"bar" | "doughnut">("bar");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
  ];

  const borderColors = [
    "rgba(255, 99, 132, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 205, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
  ];

  useEffect(() => {
    if (
      !isOpen ||
      !templateData.graphMappings ||
      !templateData.graphMappings[currentSheet]
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const graphMapping = templateData.graphMappings[currentSheet];

      if (graphMapping.type === "detailed") {
        generateDetailedChart(graphMapping);
      } else if (graphMapping.type === "summary") {
        generateSummaryChart(graphMapping);
      }
    } catch (err) {
      console.error("Error generating chart:", err);
      setError("Failed to generate chart data");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, templateData, currentSheet, sheetData]);

  const getCellValue = (cellRef: string): number => {
    try {
      // Parse cell reference like "E4" to get column and row
      const colMatch = cellRef.match(/[A-Z]+/);
      const rowMatch = cellRef.match(/\d+/);

      if (!colMatch || !rowMatch) return 0;

      const col = colMatch[0];
      const row = parseInt(rowMatch[0]);

      // Get value from SocialCalc sheet data
      const cellName = `${col}${row}`;
      const cell = sheetData?.cells?.[cellName];

      if (!cell) return 0;

      // Try to get numeric value from different properties
      let value = 0;
      if (cell.datavalue !== undefined) {
        value = parseFloat(cell.datavalue);
      } else if (cell.displaystring !== undefined) {
        // Remove any non-numeric characters except decimal point and minus sign
        const cleanValue = cell.displaystring.replace(/[^\d.-]/g, "");
        value = parseFloat(cleanValue);
      } else if (cell.valuestring !== undefined) {
        value = parseFloat(cell.valuestring);
      }

      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Error getting cell value:", error);
      return 0;
    }
  };

  const getCellText = (cellRef: string): string => {
    try {
      const colMatch = cellRef.match(/[A-Z]+/);
      const rowMatch = cellRef.match(/\d+/);

      if (!colMatch || !rowMatch) return "";

      const col = colMatch[0];
      const row = parseInt(rowMatch[0]);

      const cellName = `${col}${row}`;
      const cell = sheetData?.cells?.[cellName];

      if (!cell) return "";

      // Try to get text value from different properties
      return cell.displaystring || cell.datavalue || cell.valuestring || "";
    } catch (error) {
      console.error("Error getting cell text:", error);
      return "";
    }
  };

  const generateDetailedChart = (graphMapping: any) => {
    if (!graphMapping.rows) return;

    const labels: string[] = [];
    const datasets: any[] = [];

    // Get field names
    const fields = Object.keys(graphMapping.fields).filter(
      (field) => field !== "Name"
    );

    // Initialize datasets for each field
    fields.forEach((field, index) => {
      datasets.push({
        label: field,
        data: [],
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 1,
      });
    });

    // Collect data for each row
    for (
      let row = graphMapping.rows.start;
      row <= graphMapping.rows.end;
      row++
    ) {
      const nameCol = graphMapping.fields.Name;
      const name = getCellText(`${nameCol}${row}`);

      if (name && name.trim()) {
        labels.push(name);

        fields.forEach((field, fieldIndex) => {
          const col = graphMapping.fields[field];
          const value = getCellValue(`${col}${row}`);
          datasets[fieldIndex].data.push(value);
        });
      }
    }

    setChartData({
      labels,
      datasets,
    });
  };

  const generateSummaryChart = (graphMapping: any) => {
    if (!graphMapping.summaryValues) return;

    const labels: string[] = [];
    const data: number[] = [];

    Object.entries(graphMapping.summaryValues).forEach(([field, cellRef]) => {
      const value = getCellValue(cellRef as string);
      if (value > 0) {
        labels.push(field);
        data.push(value);
      }
    });

    setChartData({
      labels,
      datasets: [
        {
          label: "Nutrition Values",
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: borderColors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${currentSheet} - Nutrition Data`,
      },
    },
    scales:
      chartType === "bar"
        ? {
            y: {
              beginAtZero: true,
            },
          }
        : undefined,
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nutrition Visualization</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment
          value={chartType}
          onIonChange={(e) => setChartType(e.detail.value as any)}
        >
          <IonSegmentButton value="bar">
            <IonIcon icon={barChart} />
            <IonLabel>Bar Chart</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="doughnut">
            <IonIcon icon={pieChart} />
            <IonLabel>Pie Chart</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div style={{ marginTop: "20px", height: "400px" }}>
          {isLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: "16px",
              }}
            >
              Loading chart data...
            </div>
          )}

          {error && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: "16px",
                color: "red",
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && !error && chartData && (
            <>
              {chartType === "bar" && (
                <Bar data={chartData} options={chartOptions} />
              )}
              {chartType === "doughnut" && (
                <Doughnut data={chartData} options={chartOptions} />
              )}
            </>
          )}

          {!isLoading && !error && !chartData && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                fontSize: "16px",
              }}
            >
              No data available for visualization
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
