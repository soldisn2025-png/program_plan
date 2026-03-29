const fs = require('fs');
const path = require('path');
const level1Seed = require('./vbmapp_level1_milestones.json');
const level2Seed = require('./vbmapp_level2_milestones.json');
const level3Seed = require('./vbmapp_level3_milestones.json');
const { buildGeneratedMilestoneTemplate } = require('../lib/vbmappMilestoneTemplateFactory');

function loadMilestones() {
  return [level1Seed, level2Seed, level3Seed].flatMap(seed => seed.milestones);
}

function loadManualOverrideCodes() {
  const sql = fs.readFileSync(path.join(__dirname, 'vbmapp_milestone_templates.sql'), 'utf8');
  return new Set(
    [...sql.matchAll(/\('([A-Z0-9-]+)'\s*,/g)]
      .map(match => match[1])
      .filter(code => code.includes('-'))
  );
}

function loadDomainTemplateNames() {
  const sql = fs.readFileSync(path.join(__dirname, 'vbmapp_program_templates.sql'), 'utf8');
  return new Set(
    [...sql.matchAll(/\('([^']+)'\s*,/g)]
      .map(match => match[1])
      .filter(name => !name.includes('-'))
  );
}

function auditCoverage() {
  const milestones = loadMilestones();
  const manualCodes = loadManualOverrideCodes();
  const domainTemplates = loadDomainTemplateNames();

  const rows = milestones.map(milestone => {
    const generated = buildGeneratedMilestoneTemplate(milestone);
    const hasGenerated = Boolean(generated.milestone_code);
    const hasManual = manualCodes.has(milestone.milestone_code);
    const hasDomainTemplate = domainTemplates.has(milestone.db_domain || milestone.official_domain);

    return {
      milestone_code: milestone.milestone_code,
      level: milestone.level,
      domain: milestone.db_domain || milestone.official_domain,
      milestone_name: milestone.milestone_name,
      has_manual_override: hasManual,
      has_generated_template: hasGenerated,
      has_domain_template: hasDomainTemplate,
      effective_template_source: hasManual
        ? 'manual_override'
        : hasGenerated
          ? 'generated_from_milestone'
          : hasDomainTemplate
            ? 'domain_only'
            : 'missing',
    };
  });

  const summary = rows.reduce((acc, row) => {
    acc.total += 1;
    acc[row.effective_template_source] = (acc[row.effective_template_source] || 0) + 1;
    return acc;
  }, { total: 0, manual_override: 0, generated_from_milestone: 0, domain_only: 0, missing: 0 });

  return { summary, rows };
}

if (require.main === module) {
  const report = auditCoverage();
  console.log(JSON.stringify(report, null, 2));
}

module.exports = auditCoverage;
