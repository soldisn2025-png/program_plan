export const DEFAULT_STAGE_MAPPINGS = [
  { rawStage: 'Screen', normalizedStage: 'Screening' },
  { rawStage: 'Phone Screen', normalizedStage: 'Screening' },
  { rawStage: 'Screening', normalizedStage: 'Screening' },
  { rawStage: 'Submitted', normalizedStage: 'Submitted/In Review' },
  { rawStage: 'In Review', normalizedStage: 'Submitted/In Review' },
  { rawStage: 'Submitted/In Review', normalizedStage: 'Submitted/In Review' },
  { rawStage: 'Interview', normalizedStage: 'Interview' },
  { rawStage: '1st Interview', normalizedStage: 'Interview' },
  { rawStage: '2nd Interview', normalizedStage: 'Interview' },
  { rawStage: 'Offer', normalizedStage: 'Offer' },
  { rawStage: 'Offer in Process', normalizedStage: 'Offer' },
  { rawStage: 'Offer Accepted', normalizedStage: 'Offer Accepted' },
  { rawStage: 'Hired', normalizedStage: 'Hired' },
  { rawStage: 'Onboarding', normalizedStage: 'Hired' },
]

export const BUSINESS_STAGES = [
  'Screening',
  'Submitted/In Review',
  'Interview',
  'Offer',
  'Offer Accepted',
  'Hired',
]

export function deriveStageEvents(candidates, previousCandidates) {
  const today = new Date().toISOString().split('T')[0]
  const prevMap = {}
  for (const c of (previousCandidates || [])) {
    prevMap[c.candidateId] = c
  }
  const seen = new Set()
  const events = []
  for (const candidate of candidates) {
    const prev = prevMap[candidate.candidateId]
    const isNew = !prev
    const stageChanged = prev && prev.normalizedStage !== candidate.normalizedStage
    if (isNew || stageChanged) {
      const key = `${candidate.candidateId}|${candidate.normalizedStage}|${candidate.jobId}`
      if (!seen.has(key)) {
        seen.add(key)
        events.push({
          candidateId: candidate.candidateId,
          jobId: candidate.jobId,
          normalizedStage: candidate.normalizedStage,
          rawStage: candidate.rawStage,
          eventDate: candidate.dateMovedToStage || today,
          importId: candidate.importId,
          week: candidate.week,
        })
      }
    }
  }
  return events
}

export function computeSummary(stageEventsAll, stageEventsWeek, candidatesLatest, jobs, stages) {
  const summaryByJob = {}
  for (const job of jobs) {
    summaryByJob[job.jobId] = {
      jobId: job.jobId,
      jobTitle: job.title,
      department: job.department,
      recruiter: job.recruiter,
      location: job.location,
      clearance: job.clearance,
      soc: job.soc,
      status: job.status,
      stageCounts: {},
      totalThisWeek: 0,
      totalToDate: 0,
    }
    for (const stage of stages) {
      summaryByJob[job.jobId].stageCounts[stage] = { thisWeek: 0, toDate: 0 }
    }
  }
  const thisWeekSeen = new Set()
  for (const event of stageEventsWeek) {
    if (!stages.includes(event.normalizedStage)) continue
    const key = `${event.candidateId}|${event.normalizedStage}|${event.jobId}`
    if (thisWeekSeen.has(key)) continue
    thisWeekSeen.add(key)
    if (summaryByJob[event.jobId]) {
      summaryByJob[event.jobId].stageCounts[event.normalizedStage].thisWeek += 1
      summaryByJob[event.jobId].totalThisWeek += 1
    }
  }
  const toDateSeen = new Set()
  for (const event of stageEventsAll) {
    if (!stages.includes(event.normalizedStage)) continue
    const key = `${event.candidateId}|${event.normalizedStage}|${event.jobId}`
    if (toDateSeen.has(key)) continue
    toDateSeen.add(key)
    if (summaryByJob[event.jobId]) {
      summaryByJob[event.jobId].stageCounts[event.normalizedStage].toDate += 1
      summaryByJob[event.jobId].totalToDate += 1
    }
  }
  return Object.values(summaryByJob)
}

export function getDetailBoard(candidatesLatest, jobs, stages) {
  const boardByJob = {}
  for (const job of jobs) {
    boardByJob[job.jobId] = {
      jobId: job.jobId,
      jobTitle: job.title,
      status: job.status,
      department: job.department,
      recruiter: job.recruiter,
      location: job.location,
      clearance: job.clearance,
      soc: job.soc,
      stageCandidates: {},
    }
    for (const stage of stages) {
      boardByJob[job.jobId].stageCandidates[stage] = []
    }
  }
  for (const candidate of candidatesLatest) {
    const jobEntry = boardByJob[candidate.jobId]
    if (!jobEntry) continue
    const stage = candidate.normalizedStage
    if (!jobEntry.stageCandidates[stage]) {
      jobEntry.stageCandidates[stage] = []
    }
    const alreadyAdded = jobEntry.stageCandidates[stage].some(
      c => c.candidateId === candidate.candidateId
    )
    if (!alreadyAdded) {
      jobEntry.stageCandidates[stage].push({
        candidateId: candidate.candidateId,
        name: `${candidate.firstName} ${candidate.lastName}`.trim() || candidate.candidateId,
        rawStage: candidate.rawStage,
        source: candidate.source,
        applyDate: candidate.applyDate,
      })
    }
  }
  return Object.values(boardByJob)
}

export function getUniqueValues(arr, field) {
  const vals = [...new Set(arr.map(item => item[field]).filter(v => v && v !== ''))]
  return vals.sort()
}
