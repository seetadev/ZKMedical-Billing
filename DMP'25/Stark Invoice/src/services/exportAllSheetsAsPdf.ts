import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportAllSheetsOptions {
  filename?: string;
  format?: "a4" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  margin?: number;
  quality?: number;
  onProgress?: (message: string) => void;
  returnBlob?: boolean;
}

export interface SheetData {
  id: string;
  name: string;
  htmlContent: string;
}

export const exportAllSheetsAsPDF = async (
  sheetsData: SheetData[],
  options: ExportAllSheetsOptions = {}
): Promise<void | Blob> => {
  const {
    filename = "all_invoices",
    format = "a4",
    orientation = "portrait",
    margin = 10,
    quality = 2,
    onProgress,
    returnBlob = false,
  } = options;

  try {
    if (!sheetsData || sheetsData.length === 0) {
      throw new Error("No sheets data provided");
    }

    onProgress?.(`Starting export of ${sheetsData.length} sheets...`);

    // Create PDF document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

    // Remove the first empty page
    pdf.deletePage(1);

    for (let i = 0; i < sheetsData.length; i++) {
      const sheet = sheetsData[i];

      onProgress?.(
        `Processing sheet ${i + 1}/${sheetsData.length}: ${sheet.name}...`
      );

      // Create temporary container for each sheet
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = sheet.htmlContent;
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "210mm"; // A4 width
      tempContainer.style.padding = "20px";
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.color = "#000";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      tempContainer.style.fontSize = "12px";
      tempContainer.style.lineHeight = "1.4";

      // Add sheet title
      const titleElement = document.createElement("h2");
      titleElement.textContent = `Invoice - ${sheet.name}`;
      titleElement.style.marginBottom = "20px";
      titleElement.style.color = "#333";
      titleElement.style.borderBottom = "2px solid #333";
      titleElement.style.paddingBottom = "10px";
      tempContainer.insertBefore(titleElement, tempContainer.firstChild);

      document.body.appendChild(tempContainer);

      try {
        onProgress?.(`Rendering sheet ${i + 1} to canvas...`);

        // Convert HTML to canvas with higher quality
        const canvas = await html2canvas(tempContainer, {
          useCORS: true,
          allowTaint: true,
          background: "#ffffff",
          width: tempContainer.scrollWidth,
          height: tempContainer.scrollHeight,
          scale: quality,
          logging: false,
          removeContainer: false,
        } as any);

        // Calculate dimensions for PDF
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page for each sheet (except for the first one)
        pdf.addPage();

        onProgress?.(`Adding sheet ${i + 1} to PDF...`);

        // If content fits on one page
        if (imgHeight <= pageHeight) {
          pdf.addImage(
            canvas.toDataURL("image/png", 0.95),
            "PNG",
            margin,
            margin,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );
        } else {
          // Content spans multiple pages
          let heightLeft = imgHeight;
          let position = margin;

          // Add first part
          pdf.addImage(
            canvas.toDataURL("image/png", 0.95),
            "PNG",
            margin,
            position,
            imgWidth,
            imgHeight,
            undefined,
            "FAST"
          );

          heightLeft -= pageHeight;

          // Add continuation pages for this sheet if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight + margin;
            pdf.addPage();
            pdf.addImage(
              canvas.toDataURL("image/png", 0.95),
              "PNG",
              margin,
              position,
              imgWidth,
              imgHeight,
              undefined,
              "FAST"
            );
            heightLeft -= pageHeight;
          }
        }
      } finally {
        // Always remove the temporary container
        document.body.removeChild(tempContainer);
      }
    }

    onProgress?.("Finalizing PDF...");

    if (returnBlob) {
      onProgress?.("PDF generated successfully!");
      return pdf.output("blob");
    } else {
      pdf.save(`${filename}.pdf`);
      onProgress?.("PDF saved successfully!");
    }
  } catch (error) {
    console.error("Error generating combined PDF:", error);
    throw new Error("Failed to generate combined PDF. Please try again.");
  }
};

export const exportSingleSheetAsPDF = async (
  htmlContent: string,
  options: ExportAllSheetsOptions = {}
): Promise<void | Blob> => {
  const sheetData: SheetData[] = [
    {
      id: "sheet1",
      name: "Invoice",
      htmlContent: htmlContent,
    },
  ];

  return exportAllSheetsAsPDF(sheetData, options);
};
