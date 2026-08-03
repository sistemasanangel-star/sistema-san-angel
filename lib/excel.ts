import ExcelJS from "exceljs";

const BRAND_BLUE = "FF2E6DA4";
const LIGHT_GRAY = "FFF4F6F8";

export async function buildStyledWorkbook({
  sheetName,
  title,
  generatedBy,
  columns,
  rows,
}: {
  sheetName: string;
  title: string;
  generatedBy: string;
  columns: { header: string; key: string; width?: number }[];
  rows: Record<string, string | number>[];
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hospital San Ángel";
  const sheet = workbook.addWorksheet(sheetName);

  sheet.mergeCells(1, 1, 1, columns.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 13, color: { argb: BRAND_BLUE } };
  titleCell.alignment = { vertical: "middle" };

  sheet.mergeCells(2, 1, 2, columns.length);
  const subCell = sheet.getCell(2, 1);
  subCell.value = `Generado por: ${generatedBy} — ${new Date().toLocaleString("es-GT")}`;
  subCell.font = { italic: true, size: 9, color: { argb: "FF666666" } };

  sheet.addRow([]);

  const headerRow = sheet.addRow(columns.map((c) => c.header));
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_BLUE },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  columns.forEach((c, i) => {
    sheet.getColumn(i + 1).width = c.width ?? 20;
  });

  rows.forEach((row, idx) => {
    const dataRow = sheet.addRow(columns.map((c) => row[c.key] ?? ""));
    const isAlt = idx % 2 === 1;
    dataRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
      if (isAlt) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
      }
    });
  });

  const summaryRow = sheet.addRow([`Total de registros: ${rows.length}`]);
  sheet.mergeCells(summaryRow.number, 1, summaryRow.number, columns.length);
  summaryRow.getCell(1).font = { bold: true };

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4, column: columns.length },
  };

  return workbook;
}
