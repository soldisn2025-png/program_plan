import * as XLSX from 'xlsx'

export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' })
        resolve(rows)
      } catch (err) {
        reject(new Error(`Failed to parse file: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

function normalizeColName(name) {
  return String(name).toLowerCase().replace(/[\s_\/\-]+/g, '')
}

function buildColumnMap(rows) {
  if (!rows || rows.length === 0) return {}
  const sampleRow = rows[0]
  const colMap = {}
  for (const key of Object.keys(sampleRow)) {
    colMap[normalizeColName(key)] = key
  }
  return colMap
}

function findColumn(colMap, aliases) {
  for (const alias of aliases) {
    const normalized = normalizeColName(alias)
    if (colMap[normalized]) {
      return colMap[normalized]
    }
  }
  return null
}

const CANDIDATE_COLUMN_ALIASES = {
  jobId: ['Job ID', 'JobID', 'Job_ID', 'job id', 'jobid'],
  jobTitle: ['Job Title', 'JobTitle', 'Job_Title', 'Position', 'Position Title'],
  candidateId: ['Candidate ID', 'CandidateID', 'Candidate_ID', 'candidate id'],
  firstName: ['Candidate First Name', 'First Name', 'FirstName', 'first name', 'candidatefirstname'],
  lastName: ['Candidate Last Name', 'Last Name', 'LastName', 'last name', 'candidatelastname'],
  stage: ['Workflow Stage', 'Stage', 'workflow stage', 'Current Stage', 'Application Stage'],
  source: ['Source', 'Candidate Source', 'Lead Source'],
  referrer: ['Referrer', 'Referred By', 'referredby'],
  recruiter: ['Recruiter', 'Assigned Recruiter', 'assignedrecruiter', 'Hiring Manager'],
  applyDate: ['Apply Date', 'Application Date', 'Date Applied', 'applydate', 'applicationdate'],
  dateMovedToStage: ['Date Moved into Current Stage', 'Stage Date', 'Date Moved', 'dateintocurrentstage', 'datemovedintocurrentstage', 'stagemovedate', 'stage date'],
}

const JOB_COLUMN_ALIASES = {
  jobId: ['Job ID', 'JobID', 'Job_ID', 'job id'],
  jobTitle: ['Job Title', 'JobTitle', 'Job_Title', 'Position', 'Title'],
  status: ['Job Status', 'Status', 'job status', 'jobstatus'],
  department: ['Department', 'Dept', 'department'],
  location: ['Location', 'Job Location', 'joblocation'],
  clearance: ['Clearance', 'Security Clearance', 'clearance level', 'clearancelevel'],
  soc: ['SOC', 'SOC Code', 'soccode'],
  recruiter: ['Recruiter', 'Hiring Manager', 'Assigned Recruiter'],
  dateOpened: ['Date Opened', 'Open Date', 'dateopened', 'opendate', 'Created Date'],
  dateClosed: ['Date Closed', 'Close Date', 'dateclosed', 'closedate'],
}

export function validateCandidateColumns(rows) {
  const errors = []
  const warnings = []
  if (!rows || rows.length === 0) {
    return { valid: false, errors: ['File is empty or has no data rows'], warnings: [] }
  }
  const colMap = buildColumnMap(rows)
  const requiredFields = ['jobId', 'jobTitle', 'candidateId', 'firstName', 'lastName', 'stage']
  for (const field of requiredFields) {
    const found = findColumn(colMap, CANDIDATE_COLUMN_ALIASES[field])
    if (!found) {
      errors.push(`Missing required column: ${CANDIDATE_COLUMN_ALIASES[field][0]} (tried: ${CANDIDATE_COLUMN_ALIASES[field].slice(0, 3).join(', ')})`)
    }
  }
  const optionalFields = ['dateMovedToStage', 'source', 'applyDate']
  for (const field of optionalFields) {
    const found = findColumn(colMap, CANDIDATE_COLUMN_ALIASES[field])
    if (!found) {
      warnings.push(`Optional column not found: ${CANDIDATE_COLUMN_ALIASES[field][0]}`)
    }
  }
  return { valid: errors.length === 0, errors, warnings, rowCount: rows.length }
}

export function validateJobColumns(rows) {
  const errors = []
  const warnings = []
  if (!rows || rows.length === 0) {
    return { valid: false, errors: ['File is empty or has no data rows'], warnings: [] }
  }
  const colMap = buildColumnMap(rows)
  const requiredFields = ['jobId', 'jobTitle', 'status']
  for (const field of requiredFields) {
    const found = findColumn(colMap, JOB_COLUMN_ALIASES[field])
    if (!found) {
      errors.push(`Missing required column: ${JOB_COLUMN_ALIASES[field][0]} (tried: ${JOB_COLUMN_ALIASES[field].slice(0, 3).join(', ')})`)
    }
  }
  const optionalFields = ['department', 'location', 'clearance', 'recruiter']
  for (const field of optionalFields) {
    const found = findColumn(colMap, JOB_COLUMN_ALIASES[field])
    if (!found) {
      warnings.push(`Optional column not found: ${JOB_COLUMN_ALIASES[field][0]}`)
    }
  }
  return { valid: errors.length === 0, errors, warnings, rowCount: rows.length }
}

export function normalizeCandidateRow(row, stageMappings, importId, week) {
  const colMap = {}
  for (const key of Object.keys(row)) {
    colMap[normalizeColName(key)] = key
  }
  const getVal = (aliases) => {
    const col = findColumn(colMap, aliases)
    return col ? String(row[col] || '').trim() : ''
  }
  const rawStage = getVal(CANDIDATE_COLUMN_ALIASES.stage)
  let normalizedStage = rawStage
  if (stageMappings && stageMappings.length > 0) {
    const mapping = stageMappings.find(
      m => normalizeColName(m.rawStage) === normalizeColName(rawStage)
    )
    if (mapping) normalizedStage = mapping.normalizedStage
  }
  return {
    importId, week,
    candidateId: getVal(CANDIDATE_COLUMN_ALIASES.candidateId),
    jobId: getVal(CANDIDATE_COLUMN_ALIASES.jobId),
    firstName: getVal(CANDIDATE_COLUMN_ALIASES.firstName),
    lastName: getVal(CANDIDATE_COLUMN_ALIASES.lastName),
    rawStage, normalizedStage,
    source: getVal(CANDIDATE_COLUMN_ALIASES.source),
    referrer: getVal(CANDIDATE_COLUMN_ALIASES.referrer),
    recruiter: getVal(CANDIDATE_COLUMN_ALIASES.recruiter),
    applyDate: getVal(CANDIDATE_COLUMN_ALIASES.applyDate),
    dateMovedToStage: getVal(CANDIDATE_COLUMN_ALIASES.dateMovedToStage),
    jobTitle: getVal(CANDIDATE_COLUMN_ALIASES.jobTitle),
  }
}

export function normalizeJobRow(row, importId, week) {
  const colMap = {}
  for (const key of Object.keys(row)) {
    colMap[normalizeColName(key)] = key
  }
  const getVal = (aliases) => {
    const col = findColumn(colMap, aliases)
    return col ? String(row[col] || '').trim() : ''
  }
  return {
    importId, week,
    jobId: getVal(JOB_COLUMN_ALIASES.jobId),
    title: getVal(JOB_COLUMN_ALIASES.jobTitle),
    status: getVal(JOB_COLUMN_ALIASES.status),
    department: getVal(JOB_COLUMN_ALIASES.department),
    location: getVal(JOB_COLUMN_ALIASES.location),
    clearance: getVal(JOB_COLUMN_ALIASES.clearance),
    soc: getVal(JOB_COLUMN_ALIASES.soc),
    recruiter: getVal(JOB_COLUMN_ALIASES.recruiter),
    dateOpened: getVal(JOB_COLUMN_ALIASES.dateOpened),
    dateClosed: getVal(JOB_COLUMN_ALIASES.dateClosed),
  }
}
