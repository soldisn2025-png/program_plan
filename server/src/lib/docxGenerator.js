'use strict';

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const SECTION_HEADERS = [
  'Goal', 'Data Collection', 'Data Collection Instructions',
  'Prerequisite Skills', 'Materials / Set-Up Required', 'SD',
  'Correct Response', 'Incorrect Responses', 'Incorrect Response',
  'Prompting Hierarchy: Least to Most', 'Prompting Hierarchy: Most to Least',
  'Prompting Hierarchy', 'Error Correction', 'Transfer Procedure',
  'Reinforcement Schedule', 'Generalization and Maintenance Plan',
  'Generalization Plan', 'Maintenance Plan', 'Technician Notes',
  'Suggested Mastery Criteria',
];

function isGoalHeader(line) {
  return line.trim().startsWith('Program Name:');
}

function isSectionHeader(line) {
  const trimmed = line.trim();
  return SECTION_HEADERS.some(h => trimmed === h || trimmed.startsWith(`${h}:`));
}

function buildParagraphs(content) {
  const paragraphs = [];
  const lines = content.split('\n');

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (isGoalHeader(line)) {
      paragraphs.push(new Paragraph({
        text: line.replace('Program Name:', '').trim(),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
      }));
      continue;
    }

    if (isSectionHeader(line)) {
      paragraphs.push(new Paragraph({
        text: line,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
      }));
      continue;
    }

    if (line.trim() === '---') {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: '―'.repeat(60), color: 'CCCCCC' })],
        spacing: { before: 200, after: 200 },
      }));
      continue;
    }

    if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(line.trim())],
        bullet: { level: 0 },
        spacing: { after: 40 },
      }));
      continue;
    }

    if (/^\d+\./.test(line.trim())) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(line.trim())],
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { after: 40 },
      }));
      continue;
    }

    paragraphs.push(new Paragraph({
      children: [new TextRun(line)],
      spacing: { after: 80 },
    }));
  }

  return paragraphs;
}

async function generateDocx(planContent, childName) {
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.LEFT,
        }],
      }],
    },
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: 'ABA Program Plan', bold: true, size: 36 }),
          ],
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Client: ${childName}`, size: 24 })],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 20, color: '888888' })],
          spacing: { after: 400 },
        }),
        ...buildParagraphs(planContent),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateDocx };
