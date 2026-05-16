'use strict';

jest.mock('../db');
jest.mock('../lib/aiPlanGenerator');
jest.mock('../lib/aiPlanVerifier');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret';

const db = require('../db');
const { generatePlan } = require('../lib/aiPlanGenerator');
const { verifyPlan } = require('../lib/aiPlanVerifier');
const generateRoutes = require('../routes/generate');

function makeToken(role = 'bcba') {
  return jwt.sign({ id: 1, role }, 'test-secret');
}

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/generate', generateRoutes);
  return app;
}

const SAMPLE_PLAN_TEXT = 'Program Name: Mand 1-M\n\nGoal\n\nWhen the MO is present...';
const SAMPLE_FLAGS = [{ goalName: 'Mand 1-M', section: 'Goal', issue: 'Too vague', suggestion: 'Be more specific', severity: 'warning' }];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/generate/plan/:planId', () => {
  it('returns 401 when no auth token is provided', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/generate/plan/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when plan does not exist', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }); // plan not found

    const app = makeApp();
    const res = await request(app)
      .post('/api/generate/plan/999')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  it('returns 200 with content and flags on success', async () => {
    // plan exists
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 1, name: 'Test Plan', child_id: 10,
        first_name: 'Alex', last_name: 'Smith',
        diagnosis_level: 1, strengths: 'Good eye contact', areas_of_concern: 'Limited speech',
      }],
    });
    // selected milestones
    db.query.mockResolvedValueOnce({
      rows: [{ name: 'Mand 1-M', domain: 'Mand', level: 1, description: 'Request using 1-word mands' }],
    });
    // mastered milestones
    db.query.mockResolvedValueOnce({
      rows: [{ name: 'Echoics 1-E' }],
    });
    // save generated plan
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, plan_id: 1, content: SAMPLE_PLAN_TEXT, flags: SAMPLE_FLAGS, status: 'draft' }],
    });

    generatePlan.mockResolvedValue(SAMPLE_PLAN_TEXT);
    verifyPlan.mockResolvedValue(SAMPLE_FLAGS);

    const app = makeApp();
    const res = await request(app)
      .post('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      content: SAMPLE_PLAN_TEXT,
      flags: SAMPLE_FLAGS,
    });
  });

  it('calls generatePlan and verifyPlan with child context', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{
        id: 1, name: 'Test Plan', child_id: 10,
        first_name: 'Alex', last_name: 'Smith',
        diagnosis_level: 1, strengths: 'Good eye contact', areas_of_concern: 'Limited speech',
      }],
    });
    db.query.mockResolvedValueOnce({
      rows: [{ name: 'Mand 1-M', domain: 'Mand', level: 1, description: 'Request 1-word mands' }],
    });
    db.query.mockResolvedValueOnce({ rows: [{ name: 'Echoics 1-E' }] });
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, plan_id: 1, content: SAMPLE_PLAN_TEXT, flags: SAMPLE_FLAGS, status: 'draft' }],
    });

    generatePlan.mockResolvedValue(SAMPLE_PLAN_TEXT);
    verifyPlan.mockResolvedValue(SAMPLE_FLAGS);

    const app = makeApp();
    await request(app)
      .post('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(generatePlan).toHaveBeenCalledWith(
      expect.objectContaining({
        childProfile: expect.objectContaining({ firstName: 'Alex' }),
        selectedMilestones: expect.arrayContaining([expect.objectContaining({ name: 'Mand 1-M' })]),
        masteredMilestones: expect.arrayContaining(['Echoics 1-E']),
      })
    );
    expect(verifyPlan).toHaveBeenCalledWith(
      expect.objectContaining({ planContent: SAMPLE_PLAN_TEXT })
    );
  });
});

describe('PATCH /api/generate/plan/:planId', () => {
  it('returns 401 when no auth token is provided', async () => {
    const app = makeApp();
    const res = await request(app).patch('/api/generate/plan/1').send({ content: 'edited' });
    expect(res.status).toBe(401);
  });

  it('saves edited content and returns updated record', async () => {
    const edited = 'Edited plan content here.';
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, plan_id: 1, content: edited, flags: [], status: 'draft' }],
    });

    const app = makeApp();
    const res = await request(app)
      .patch('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ content: edited });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe(edited);
  });

  it('returns 400 when content is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .patch('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/generate/plan/:planId/approve', () => {
  it('sets status to approved and returns the record', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, plan_id: 1, content: SAMPLE_PLAN_TEXT, flags: [], status: 'approved' }],
    });

    const app = makeApp();
    const res = await request(app)
      .post('/api/generate/plan/1/approve')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});

describe('GET /api/generate/plan/:planId', () => {
  it('returns existing draft when one exists', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 42, plan_id: 1, content: SAMPLE_PLAN_TEXT, flags: SAMPLE_FLAGS, status: 'draft' }],
    });

    const app = makeApp();
    const res = await request(app)
      .get('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toBe(SAMPLE_PLAN_TEXT);
  });

  it('returns 404 when no draft exists yet', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const app = makeApp();
    const res = await request(app)
      .get('/api/generate/plan/1')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });
});
