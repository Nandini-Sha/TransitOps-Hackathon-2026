import PDFDocument from "pdfkit";
import { Response } from "express";

export function streamPdfTable(res: Response, filename: string, title: string, rows: Record<string, unknown>[]) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);

  const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
  doc.pipe(res);

  doc.fontSize(16).text(title, { align: "left" });
  doc.moveDown();

  if (rows.length === 0) {
    doc.fontSize(11).text("No data available.");
    doc.end();
    return;
  }

  const headers = Object.keys(rows[0]);
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / headers.length;
  const rowHeight = 20;
  let y = doc.y;

  doc.fontSize(9).font("Helvetica-Bold");
  headers.forEach((h, i) => {
    doc.text(h, doc.page.margins.left + i * colWidth, y, { width: colWidth, ellipsis: true });
  });
  y += rowHeight;
  doc.moveTo(doc.page.margins.left, y - 4).lineTo(doc.page.width - doc.page.margins.right, y - 4).stroke();

  doc.font("Helvetica");
  for (const row of rows) {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    headers.forEach((h, i) => {
      doc.text(String(row[h] ?? ""), doc.page.margins.left + i * colWidth, y, { width: colWidth, ellipsis: true });
    });
    y += rowHeight;
  }

  doc.end();
}
