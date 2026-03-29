const syncVbmappMilestones = require('./syncVbmappMilestones');

async function syncVbmappLevel3() {
  return syncVbmappMilestones();
}

if (require.main === module) {
  syncVbmappLevel3()
    .then(result => {
      console.log(result);
      process.exit(0);
    })
    .catch(err => {
      console.error('VB-MAPP Level 3 sync alias failed:', err.message);
      process.exit(1);
    });
}

module.exports = syncVbmappLevel3;
