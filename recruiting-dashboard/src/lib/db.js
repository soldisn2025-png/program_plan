import { openDB } from 'idb'

const DB_NAME = 'staqss-recruiting'
const DB_VERSION = 1

let dbPromise = null

export function initDB() {
  if (dbPromise) return dbPromise

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // imports store
      if (!db.objectStoreNames.contains('imports')) {
        const importStore = db.createObjectStore('imports', { keyPath: 'id', autoIncrement: true })
        importStore.createIndex('week', 'week', { unique: false })
      }

      // jobs store
      if (!db.objectStoreNames.contains('jobs')) {
        const jobStore = db.createObjectStore('jobs', { keyPath: 'id', autoIncrement: true })
        jobStore.createIndex('importId', 'importId', { unique: false })
        jobStore.createIndex('week', 'week', { unique: false })
        jobStore.createIndex('jobId', 'jobId', { unique: false })
      }

      // candidates store
      if (!db.objectStoreNames.contains('candidates')) {
        const candidateStore = db.createObjectStore('candidates', { keyPath: 'id', autoIncrement: true })
        candidateStore.createIndex('importId', 'importId', { unique: false })
        candidateStore.createIndex('week', 'week', { unique: false })
        candidateStore.createIndex('candidateId', 'candidateId', { unique: false })
        candidateStore.createIndex('jobId', 'jobId', { unique: false })
      }

      // stageEvents store
      if (!db.objectStoreNames.contains('stageEvents')) {
        const eventStore = db.createObjectStore('stageEvents', { keyPath: 'id', autoIncrement: true })
        eventStore.createIndex('candidateId', 'candidateId', { unique: false })
        eventStore.createIndex('jobId', 'jobId', { unique: false })
        eventStore.createIndex('week', 'week', { unique: false })
        eventStore.createIndex('importId', 'importId', { unique: false })
      }

      // comments store - composite key [jobId, week]
      if (!db.objectStoreNames.contains('comments')) {
        const commentStore = db.createObjectStore('comments', { keyPath: ['jobId', 'week'] })
        commentStore.createIndex('week', 'week', { unique: false })
        commentStore.createIndex('jobId', 'jobId', { unique: false })
      }

      // stageMappings store
      if (!db.objectStoreNames.contains('stageMappings')) {
        const mappingStore = db.createObjectStore('stageMappings', { keyPath: 'id', autoIncrement: true })
        mappingStore.createIndex('rawStage', 'rawStage', { unique: true })
      }

      // savedFilters store
      if (!db.objectStoreNames.contains('savedFilters')) {
        db.createObjectStore('savedFilters', { keyPath: 'id', autoIncrement: true })
      }
    },
  })

  return dbPromise
}

async function getDB() {
  if (!dbPromise) {
    initDB()
  }
  return dbPromise
}

// ---- Imports ----

export async function saveImport(importData) {
  try {
    const db = await getDB()
    const id = await db.add('imports', {
      week: importData.week,
      importedAt: importData.importedAt || new Date().toISOString(),
      candidateCount: importData.candidateCount || 0,
      jobCount: importData.jobCount || 0,
      candidateFileName: importData.candidateFileName || '',
      jobFileName: importData.jobFileName || '',
    })
    return id
  } catch (err) {
    console.error('saveImport error:', err)
    throw err
  }
}

export async function getImports() {
  try {
    const db = await getDB()
    const all = await db.getAll('imports')
    return all.sort((a, b) => (b.week > a.week ? 1 : -1))
  } catch (err) {
    console.error('getImports error:', err)
    return []
  }
}

export async function deleteImport(importId) {
  try {
    const db = await getDB()
    const tx = db.transaction(['imports', 'jobs', 'candidates', 'stageEvents'], 'readwrite')

    await tx.objectStore('imports').delete(importId)

    const jobIdx = tx.objectStore('jobs').index('importId')
    let jobCursor = await jobIdx.openCursor(IDBKeyRange.only(importId))
    while (jobCursor) {
      await jobCursor.delete()
      jobCursor = await jobCursor.continue()
    }

    const candIdx = tx.objectStore('candidates').index('importId')
    let candCursor = await candIdx.openCursor(IDBKeyRange.only(importId))
    while (candCursor) {
      await candCursor.delete()
      candCursor = await candCursor.continue()
    }

    const eventIdx = tx.objectStore('stageEvents').index('importId')
    let eventCursor = await eventIdx.openCursor(IDBKeyRange.only(importId))
    while (eventCursor) {
      await eventCursor.delete()
      eventCursor = await eventCursor.continue()
    }

    await tx.done
  } catch (err) {
    console.error('deleteImport error:', err)
    throw err
  }
}

export async function getWeeks() {
  try {
    const db = await getDB()
    const imports = await db.getAll('imports')
    const weeks = [...new Set(imports.map(i => i.week))].sort((a, b) => (b > a ? 1 : -1))
    return weeks
  } catch (err) {
    console.error('getWeeks error:', err)
    return []
  }
}

// ---- Jobs ----

export async function saveJobs(jobs) {
  try {
    const db = await getDB()
    const tx = db.transaction('jobs', 'readwrite')
    for (const job of jobs) {
      await tx.store.add(job)
    }
    await tx.done
  } catch (err) {
    console.error('saveJobs error:', err)
    throw err
  }
}

export async function getJobsForWeek(week) {
  try {
    const db = await getDB()
    const idx = db.transaction('jobs').store.index('week')
    return await idx.getAll(IDBKeyRange.only(week))
  } catch (err) {
    console.error('getJobsForWeek error:', err)
    return []
  }
}

// ---- Candidates ----

export async function saveCandidates(candidates) {
  try {
    const db = await getDB()
    const tx = db.transaction('candidates', 'readwrite')
    for (const candidate of candidates) {
      await tx.store.add(candidate)
    }
    await tx.done
  } catch (err) {
    console.error('saveCandidates error:', err)
    throw err
  }
}

export async function getCandidatesForWeek(week) {
  try {
    const db = await getDB()
    const idx = db.transaction('candidates').store.index('week')
    return await idx.getAll(IDBKeyRange.only(week))
  } catch (err) {
    console.error('getCandidatesForWeek error:', err)
    return []
  }
}

// ---- Stage Events ----

export async function saveStageEvents(events) {
  try {
    const db = await getDB()
    const tx = db.transaction('stageEvents', 'readwrite')
    for (const event of events) {
      await tx.store.add(event)
    }
    await tx.done
  } catch (err) {
    console.error('saveStageEvents error:', err)
    throw err
  }
}

export async function getStageEventsForWeek(week) {
  try {
    const db = await getDB()
    const idx = db.transaction('stageEvents').store.index('week')
    return await idx.getAll(IDBKeyRange.only(week))
  } catch (err) {
    console.error('getStageEventsForWeek error:', err)
    return []
  }
}

export async function getStageEventsUpToWeek(week) {
  try {
    const db = await getDB()
    const all = await db.getAll('stageEvents')
    return all.filter(e => e.week <= week)
  } catch (err) {
    console.error('getStageEventsUpToWeek error:', err)
    return []
  }
}

// ---- Comments ----

export async function getComment(jobId, week) {
  try {
    const db = await getDB()
    return await db.get('comments', [jobId, week])
  } catch (err) {
    console.error('getComment error:', err)
    return null
  }
}

export async function saveComment(jobId, week, comment) {
  try {
    const db = await getDB()
    await db.put('comments', { jobId, week, comment })
  } catch (err) {
    console.error('saveComment error:', err)
    throw err
  }
}

export async function getComments(week) {
  try {
    const db = await getDB()
    const idx = db.transaction('comments').store.index('week')
    return await idx.getAll(IDBKeyRange.only(week))
  } catch (err) {
    console.error('getComments error:', err)
    return []
  }
}

// ---- Stage Mappings ----

export async function getStageMappings() {
  try {
    const db = await getDB()
    return await db.getAll('stageMappings')
  } catch (err) {
    console.error('getStageMappings error:', err)
    return []
  }
}

export async function saveStageMappings(mappings) {
  try {
    const db = await getDB()
    const tx = db.transaction('stageMappings', 'readwrite')
    await tx.store.clear()
    for (const mapping of mappings) {
      const record = { rawStage: mapping.rawStage, normalizedStage: mapping.normalizedStage }
      if (mapping.id !== undefined) record.id = mapping.id
      await tx.store.add(record)
    }
    await tx.done
  } catch (err) {
    console.error('saveStageMappings error:', err)
    throw err
  }
}

// ---- Saved Filters ----

export async function getSavedFilters() {
  try {
    const db = await getDB()
    return await db.getAll('savedFilters')
  } catch (err) {
    console.error('getSavedFilters error:', err)
    return []
  }
}

export async function saveFilter(name, filters) {
  try {
    const db = await getDB()
    const id = await db.add('savedFilters', { name, filters })
    return id
  } catch (err) {
    console.error('saveFilter error:', err)
    throw err
  }
}

export async function deleteFilter(id) {
  try {
    const db = await getDB()
    await db.delete('savedFilters', id)
  } catch (err) {
    console.error('deleteFilter error:', err)
    throw err
  }
}
