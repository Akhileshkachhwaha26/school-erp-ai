import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a PDF report with a title and a data table.
 * @param {string} title - Report heading, e.g. "Attendance Report — Rahul Verma"
 * @param {string[]} columns - Table column headers
 * @param {Array<Array<string|number>>} rows - Table row data
 * @param {string} filename - Downloaded file name (without .pdf)
 */
export function exportTableToPdf(title, columns, rows, filename = "report") {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 14, 25);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 32,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59] }, // slate-800
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  doc.save(`${filename}.pdf`);
}
