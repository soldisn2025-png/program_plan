import { create } from 'zustand'

export const useDashboardStore = create((set, get) => ({
  candidates: [],
  lastLoadedAt: null,
  activePlugin: 'jazzhr-csv',

  setCandidates(candidates) {
    set({ candidates, lastLoadedAt: new Date().toISOString() })
  },

  // Derived: candidates grouped by job title
  getByJob() {
    const groups = {}
    for (const c of get().candidates) {
      const job = c.jobTitle || 'Unknown Position'
      if (!groups[job]) groups[job] = []
      groups[job].push(c)
    }
    return groups
  },

  // Derived: pipeline counts per job  { jobTitle → { Screened: n, Submitted: n, ... } }
  getPipelineByJob() {
    const byJob = get().getByJob()
    const result = {}
    for (const [job, cands] of Object.entries(byJob)) {
      result[job] = { Screened: 0, Submitted: 0, Interviewed: 0, Offered: 0, Hired: 0, Inactive: 0 }
      for (const c of cands) {
        result[job][c.stageGroup] = (result[job][c.stageGroup] || 0) + 1
      }
    }
    return result
  },

  // Derived: summary counts across all candidates
  getSummary() {
    const counts = { Screened: 0, Submitted: 0, Interviewed: 0, Offered: 0, Hired: 0, Inactive: 0 }
    for (const c of get().candidates) {
      counts[c.stageGroup] = (counts[c.stageGroup] || 0) + 1
    }
    return counts
  },
}))
