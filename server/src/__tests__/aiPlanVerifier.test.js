'use strict';

jest.mock('@anthropic-ai/sdk');

const Anthropic = require('@anthropic-ai/sdk');

const mockMessagesCreate = jest.fn();
Anthropic.mockImplementation(() => ({
  messages: { create: mockMessagesCreate },
}));

const { verifyPlan } = require('../lib/aiPlanVerifier');

const SAMPLE_PLAN = `
Program Name: Mand — Requests Preferred Items

Goal

When the motivating operation is present, the learner will request preferred items using 1-word mands.

Prerequisite Skills
- Attends to preferred items briefly
- Can say full sentences independently
`;

const SAMPLE_CONTEXT = {
  childProfile: {
    firstName: 'Alex',
    diagnosisLevel: 1,
    strengths: 'Good eye contact',
    areasOfConcern: 'Limited vocal output',
  },
  masteredMilestones: ['Echoics 1-E'],
};

beforeEach(() => {
  mockMessagesCreate.mockReset();
});

describe('verifyPlan', () => {
  it('calls Claude API with claude-sonnet-4-6 model', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: '[]' }],
    });

    await verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT });

    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'claude-sonnet-4-6' })
    );
  });

  it('includes the plan text in the user message', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: '[]' }],
    });

    await verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT });

    const call = mockMessagesCreate.mock.calls[0][0];
    const userMessage = call.messages.find(m => m.role === 'user');
    expect(userMessage.content).toContain('Mand — Requests Preferred Items');
  });

  it('returns an array of flags from Claude response', async () => {
    const flags = [
      {
        goalName: 'Mand — Requests Preferred Items',
        section: 'Prerequisite Skills',
        issue: 'Prerequisites list skills too advanced for Level 1',
        suggestion: 'Replace with: attends briefly, makes vocal sounds or approximations',
        severity: 'error',
      },
    ];
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: JSON.stringify(flags) }],
    });

    const result = await verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      goalName: expect.any(String),
      section: expect.any(String),
      issue: expect.any(String),
      suggestion: expect.any(String),
      severity: expect.stringMatching(/^(warning|error)$/),
    });
  });

  it('returns empty array when Claude finds no issues', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: '[]' }],
    });

    const result = await verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT });

    expect(result).toEqual([]);
  });

  it('returns empty array when Claude response is not valid JSON', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [{ text: 'No issues found in this plan.' }],
    });

    const result = await verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT });

    expect(result).toEqual([]);
  });

  it('throws a descriptive error when Claude API call fails', async () => {
    mockMessagesCreate.mockRejectedValue(new Error('API error'));

    await expect(
      verifyPlan({ planContent: SAMPLE_PLAN, ...SAMPLE_CONTEXT })
    ).rejects.toThrow('Plan verification failed');
  });
});
