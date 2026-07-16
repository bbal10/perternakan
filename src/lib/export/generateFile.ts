import ExcelJS from 'exceljs'
import type { ExportFormat } from './types'
import type { ExportTable } from './buildRows'

function escapeCsvCell(value: string | number | null): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(table: ExportTable): Buffer {
  const lines = [
    table.headers.map(escapeCsvCell).join(','),
    ...table.rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  // UTF-8 BOM so Excel opens Indonesian text correctly
  const bom = '\uFEFF'
  return Buffer.from(bom + lines.join('\n'), 'utf8')
}

async function toXlsx(table: ExportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Peternakan Itik'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(table.sheetName.slice(0, 31) || 'Data')
  sheet.addRow(table.headers)
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F0E9' },
  }

  for (const row of table.rows) {
    sheet.addRow(row)
  }

  sheet.columns.forEach((col) => {
    let max = 10
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? '').length
      if (len > max) max = Math.min(len, 48)
    })
    col.width = max + 2
  })

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

export type GeneratedExportFile = {
  buffer: Buffer
  filename: string
  mimetype: string
}

export async function generateExportFile(
  table: ExportTable,
  format: ExportFormat,
  basename: string,
): Promise<GeneratedExportFile> {
  const safeBase = basename.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80)

  if (format === 'csv') {
    return {
      buffer: toCsv(table),
      filename: `${safeBase}.csv`,
      mimetype: 'text/csv',
    }
  }

  return {
    buffer: await toXlsx(table),
    filename: `${safeBase}.xlsx`,
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
}
