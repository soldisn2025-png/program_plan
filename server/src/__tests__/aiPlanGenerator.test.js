'use strict';

jest.mock('openai');

const OpenAI = require('openai');

const mockCreate = jest.fn();
OpenAI.mockImplementation(() => ({
  chat: { completions: { create: mockCreate } },
}));

const { generatePlan } = require('../lib/aiPlanGenerator');

const SAMPLE_INPUT = {
  childProfile: {
    firstName: 'Alex',
    lastName: 'Smith',
    diagnosisLevel: 2,
    strengths: 'Good eye contact, enjoys music',
    areasOfConcern: 'Limited vocal output, echolalia',
  },
  selectedMilestones: [
    { name: 'Mand 1-M', domain: 'Mand', level: 1, description: 'Requests preferred items using 1-word mands' },
  ],
  masteredMilestones: ['Echoics 1-E', 'Motor Imitation 1-M'],
};

const SAMPLE_PLAN_TEXT = `
Program Name: Mand — Requests Preferred Items

Goal

When the motivating operation is present...

Data Collection

Collect data for each trial...
`;

beforeEach(() => {
  mockCreate.mockReset();
});

describe('generatePlan', () => {
  it('calls OpenAI with gpt-4o model', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    await generatePlan(SAMPLE_INPUT);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o' })
    );
  });

  it('includes child first name in the user prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    await generatePlan(SAMPLE_INPUT);

    const call = mockCreate.mock.calls[0][0];
    const userMessage = call.messages.find(m => m.role === 'user');
    expect(userMessage.content).toContain('Alex');
  });

  it('includes selected milestone name in the user prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    await generatePlan(SAMPLE_INPUT);

    const call = mockCreate.mock.calls[0][0];
    const userMessage = call.messages.find(m => m.role === 'user');
    expect(userMessage.content).toContain('Mand 1-M');
  });

  it('includes mastered milestones in the user prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    await generatePlan(SAMPLE_INPUT);

    const call = mockCreate.mock.calls[0][0];
    const userMessage = call.messages.find(m => m.role === 'user');
    expect(userMessage.content).toContain('Echoics 1-E');
  });

  it('includes gold standard examples in the system prompt', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    await generatePlan(SAMPLE_INPUT);

    const call = mockCreate.mock.calls[0][0];
    const systemMessage = call.messages.find(m => m.role === 'system');
    expect(systemMessage.content).toContain('EXAMPLE 1');
  });

  it('returns the plan text string from OpenAI', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: SAMPLE_PLAN_TEXT } }],
    });

    const result = await generatePlan(SAMPLE_INPUT);

    expect(typeof result).toBe('string');
    expect(result).toBe(SAMPLE_PLAN_TEXT);
  });

  it('throws a descriptive error when OpenAI call fails', async () => {
    mockCreate.mockRejectedValue(new Error('API quota exceeded'));

    await expect(generatePlan(SAMPLE_INPUT)).rejects.toThrow('Plan generation failed');
  });
});
