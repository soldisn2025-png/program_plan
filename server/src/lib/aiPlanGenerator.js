'use strict';

const OpenAI = require('openai');
const { GOLD_STANDARD_EXAMPLES } = require('./goldStandardExamples');

const SYSTEM_PROMPT = `You are a Board Certified Behavior Analyst (BCBA) with 15 years of experience writing individualized ABA program plans. Your writing is detailed, clinically accurate, and immediately usable by RBTs with average ABA knowledge — no major revision required.

Generate a complete program plan for EACH goal listed in the user message. Follow EXACTLY the format, level of detail, clinical language, and section structure shown in the examples below.

${GOLD_STANDARD_EXAMPLES}

RULES:
- Only list Prerequisite Skills the client has actually demonstrated (cross-reference the Mastered Milestones list provided).
- Match the complexity of examples (SD, correct response, incorrect response examples) to the client's VB-MAPP level (Level 1 = simple, 1-word; Level 2 = 2-word phrases; Level 3 = sentences and complex skills).
- Choose prompting direction: use Least-to-Most for acquisition goals where errors should be minimized; use Most-to-Least for goals where errorless teaching is clinically indicated (check the domain).
- Include at least 4–6 concrete, varied examples in SD, Correct Response, and Incorrect Response sections.
- Write for an RBT who may have limited ABA experience. Be explicit and instructional.
- Separate each goal's program plan with a line of dashes: ---

Output each goal as a complete, standalone program plan.`;

let _client;
function getClient() {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

async function generatePlan({ childProfile, selectedMilestones, masteredMilestones }) {
  const { firstName, lastName, diagnosisLevel, strengths, areasOfConcern } = childProfile;
  const masteredList = masteredMilestones.join(', ') || 'None documented';

  const milestonesText = selectedMilestones
    .map(m => `- ${m.name} (Domain: ${m.domain}, Level: ${m.level}): ${m.description}`)
    .join('\n');

  const userPrompt = `Generate complete program plans for the following client and goals.

CLIENT:
Name: ${firstName} ${lastName}
VB-MAPP Level: ${diagnosisLevel}
Strengths: ${strengths || 'Not specified'}
Areas of Concern: ${areasOfConcern || 'Not specified'}
Mastered Milestones: ${masteredList}

GOALS TO GENERATE PLANS FOR:
${milestonesText}`;

  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 8000,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  } catch (err) {
    throw new Error(`Plan generation failed: ${err.message}`);
  }
}

module.exports = { generatePlan };
