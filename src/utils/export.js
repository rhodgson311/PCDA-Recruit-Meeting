import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function downloadCSV(rows) {
  const headers = Object.keys(rows[0] || { Field: '', Value: '' })
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'PCDA_Presentation_Summary.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export async function downloadPDF(elementId, filename = 'PCDA_Summary.pdf') {
  const node = document.getElementById(elementId)
  if (!node) return
  const canvas = await html2canvas(node, { scale: 2 })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'pt', 'a4')
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()
  // scale image to fit width
  const imgW = pdfW
  const imgH = canvas.height * (imgW / canvas.width)

  let y = 0
  // Add pages if content is taller than a single page
  while (y < imgH) {
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvas.width
    pageCanvas.height = Math.min(canvas.height, Math.floor(canvas.width * (pdfH / pdfW)))
    const ctx = pageCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, y * (canvas.width / imgW), canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height)
    const pageImg = pageCanvas.toDataURL('image/png')
    if (y > 0) pdf.addPage()
    pdf.addImage(pageImg, 'PNG', 0, 0, pdfW, pdfH)
    y += pageCanvas.height * (imgW / canvas.width)
  }

  pdf.save(filename)
}
