import * as XLSX from 'xlsx'

export function exportToXLSX(summaryData, detailData, comments, stages, weekLabel) {
  const wb = XLSX.utils.book_new()

  // ---- Sheet 1: Summary ----
  const summaryHeaders = ['Job Title', 'Status', 'Department', 'Recruiter']
  for (const stage of stages) {
    summaryHeaders.push(`${stage} - This Wk`)
    summaryHeaders.push(`${stage} - To Date`)
  }
  summaryHeaders.push('Total This Wk', 'Total To Date')

  const summaryRows = [summaryHeaders]
  for (const row of summaryData) {
    const dataRow = [row.jobTitle || '', row.status || '', row.department || '', row.recruiter || '']
    for (const stage of stages) {
      const counts = row.stageCounts[stage] || { thisWeek: 0, toDate: 0 }
      dataRow.push(counts.thisWeek)
      dataRow.push(counts.toDate)
    }
    dataRow.push(row.totalThisWeek || 0)
    dataRow.push(row.totalToDate || 0)
    summaryRows.push(dataRow)
  }
  if (summaryData.length > 0) {
    const totalsRow = ['TOTAL', '', '', '']
    for (const stage of stages) {
      const thisWkTotal = summaryData.reduce((sum, r) => sum + (r.stageCounts[stage]?.thisWeek || 0), 0)
      const toDateTotal = summaryData.reduce((sum, r) => sum + (r.stageCounts[stage]?.toDate || 0), 0)
      totalsRow.push(thisWkTotal, toDateTotal)
    }
    totalsRow.push(
      summaryData.reduce((sum, r) => sum + (r.totalThisWeek || 0), 0),
      summaryData.reduce((sum, r) => sum + (r.totalToDate || 0), 0),
    )
    summaryRows.push(totalsRow)
  }
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  const summaryCols = summaryHeaders.map((h, i) => ({ wch: i < 4 ? Math.max(h.length, 20) : Math.max(h.length, 12) }))
  summarySheet['!cols'] = summaryCols
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  // ---- Sheet 2: Detail ----
  const detailHeaders = ['Job Title', 'Status', 'Department']
  for (const stage of stages) {
    detailHeaders.push(stage)
  }
  detailHeaders.push('Comments')

  const detailRows = [detailHeaders]
  const commentMap = {}
  for (const c of (comments || [])) {
    commentMap[c.jobId] = c.comment || ''
  }
  for (const job of detailData) {
    const dataRow = [job.jobTitle || '', job.status || '', job.department || '']
    for (const stage of stages) {
      const candidates = job.stageCandidates[stage] || []
      dataRow.push(candidates.map(c => c.name).join(', '))
    }
    dataRow.push(commentMap[job.jobId] || '')
    detailRows.push(dataRow)
  }
  const detailSheet = XLSX.utils.aoa_to_sheet(detailRows)
  const detailCols = detailHeaders.map((h, i) => ({ wch: i < 3 ? Math.max(h.length, 20) : Math.max(h.length, 30) }))
  detailSheet['!cols'] = detailCols
  XLSX.utils.book_append_sheet(wb, detailSheet, 'Detail Board')

  const fileName = `recruiting-report-${weekLabel}.xlsx`
  XLSX.writeFile(wb, fileName)
}
