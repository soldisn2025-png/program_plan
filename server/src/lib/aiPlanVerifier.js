'use strict';

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are a clinical ABA supervisor reviewing a generated program plan for accuracy before a BCBA approves it.

Review the plan and return ONLY a JSON array of flags. Flag issues in these three categories:
1. Examples (SD, correct response, incorrect responses) that are too complex or too simple for the client's VB-MAPP level.
2. Prompting hierarchy direction that is clinically inappropriate for the goal type (e.g., Most-to-Least used when Least-to-Most is indicated for a natural manding context).
3. Prerequisites listed that are NOT present in the client's Mastered Milestones list.

Each flag must be a JSON object with these exact fields:
{
  "goalName": "string — name of the goal program",
  "section": "string — section name (e.g., Prerequisite Skills, SD, Prompting Hierarchy)",
  "issue": "string — what is clinically wrong",
  "suggestion": "string — specific corrected text or guidance",
  "severity": "warning" or "error"
}

Return [] if no issues are found. Return ONLY valid JSON. No prose, no markdown, no explanation outside the JSON array.`;

let _client;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

async function verifyPlan({ planContent, childProfile, masteredMilestones }) {
  const { firstName, diagnosisLevel, strengths, areasOfConcern } = childProfile;
  const masteredList = masteredMilestones.join(', ') || 'None documented';

  const userMessage = `CLIENT CONTEXT:
Name: ${firstName}
VB-MAPP Level: ${diagnosisLevel}
Strengths: ${strengths || 'Not specified'}
Areas of Concern: ${areasOfConcern || 'Not specified'}
Mastered Milestones: ${masteredList}

PROGRAM PLAN TO REVIEW:
${planContent}`;

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].text.trim();
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } catch (err) {
    throw new Error(`Plan verification failed: ${err.message}`);
  }
}

module.exports = { verifyPlan };
