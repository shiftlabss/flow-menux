/**
 * Exporta dados para CSV com suporte a headers customizados
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  customHeaders?: Record<string, string>
) {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const headers = customHeaders
    ? keys.map((key) => customHeaders[key] || key)
    : keys;

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = String(row[key] ?? "");
          // Escape commas and quotes
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Exporta dados para PDF (básico via print)
 * TODO: Implementar com jsPDF para PDFs reais
 */
export function exportToPDF(
  data: Record<string, unknown>[],
  filename: string,
  title?: string
) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title || filename}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #7A55FD; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e4e4e7; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f4f4f5; font-weight: 600; }
          tr:nth-child(even) { background-color: #fafafa; }
        </style>
      </head>
      <body>
        ${title ? `<h1>${title}</h1>` : ""}
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");

  if (printWindow) {
    printWindow.addEventListener("load", () => {
      printWindow.print();
      URL.revokeObjectURL(url);
    });
  }
}

/**
 * Exporta dados para Excel (usa CSV com extensão .xlsx)
 * TODO: Implementar com biblioteca xlsx para Excel real
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  customHeaders?: Record<string, string>
) {
  if (data.length === 0) return;

  const keys = Object.keys(data[0]);
  const headers = customHeaders
    ? keys.map((key) => customHeaders[key] || key)
    : keys;

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = String(row[key] ?? "");
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "application/vnd.ms-excel",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Formata data para exportação
 */
export function formatDateForExport(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata moeda para exportação
 */
export function formatCurrencyForExport(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
