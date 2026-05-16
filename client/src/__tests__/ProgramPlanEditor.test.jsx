import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgramPlanEditor from '../components/ProgramPlanEditor';

const PLAN_TEXT = `Program Name: Mand 1-M

Goal

When the MO is present, the learner will request preferred items using 1-word mands.

Prerequisite Skills

- Attends to preferred items briefly
- Can say full sentences independently

SD

"What do you want?" or hold up preferred item and pause.`;

const FLAGS = [
  {
    goalName: 'Mand 1-M',
    section: 'Prerequisite Skills',
    issue: 'Prerequisites are too advanced for Level 1',
    suggestion: 'Replace with: attends to preferred items briefly, makes vocal sounds or approximations',
    severity: 'error',
  },
  {
    goalName: 'Mand 1-M',
    section: 'SD',
    issue: 'SD example implies verbal question which can reduce MO control',
    suggestion: 'Use natural environmental arrangement SD: hold up preferred item and wait 3-5 seconds',
    severity: 'warning',
  },
];

describe('ProgramPlanEditor', () => {
  it('renders the plan content in an editable area', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={[]}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue(PLAN_TEXT);
  });

  it('renders a flag card for each flag', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={FLAGS}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    expect(screen.getByText('Prerequisite Skills')).toBeInTheDocument();
    expect(screen.getByText('Prerequisites are too advanced for Level 1')).toBeInTheDocument();
    expect(screen.getByText('SD')).toBeInTheDocument();
    expect(screen.getByText('SD example implies verbal question which can reduce MO control')).toBeInTheDocument();
  });

  it('shows suggestion text for each flag', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={FLAGS}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/Replace with: attends to preferred items/)).toBeInTheDocument();
  });

  it('renders error flags with a distinct visual indicator', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={FLAGS}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    const errorBadges = screen.getAllByText('error');
    expect(errorBadges.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onContentChange when the editor text is changed', () => {
    const onContentChange = vi.fn();
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={[]}
        onContentChange={onContentChange}
        onFlagDismiss={vi.fn()}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated plan content' } });

    expect(onContentChange).toHaveBeenCalledWith('Updated plan content');
  });

  it('calls onFlagDismiss with the flag index when Dismiss is clicked', () => {
    const onFlagDismiss = vi.fn();
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={FLAGS}
        onContentChange={vi.fn()}
        onFlagDismiss={onFlagDismiss}
      />
    );

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButtons[0]);

    expect(onFlagDismiss).toHaveBeenCalledWith(0);
  });

  it('shows a message when there are no flags', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={[]}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/no issues found/i)).toBeInTheDocument();
  });

  it('renders flag count in the review panel header', () => {
    render(
      <ProgramPlanEditor
        content={PLAN_TEXT}
        flags={FLAGS}
        onContentChange={vi.fn()}
        onFlagDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/2 items to review/i)).toBeInTheDocument();
  });
});
