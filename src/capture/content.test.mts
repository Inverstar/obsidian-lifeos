import assert from 'node:assert/strict';
import test from 'node:test';
import { appendUnderHeading, formatCaptureEntry } from './content.ts';

test('adds a missing daily record section', () => {
  const result = appendUnderHeading('# Daily\n', 'Daily Record', '- 09:30 First note');

  assert.equal(result, '# Daily\n\n## Daily Record\n\n- 09:30 First note\n');
});

test('appends inside the matching section before the next heading', () => {
  const content = '# Daily\n\n## Daily Record\n\n- 08:00 Existing\n\n## Habit\n\n- [ ] Walk\n';
  const result = appendUnderHeading(content, '## Daily Record', '- 09:30 New note');

  assert.equal(result, '# Daily\n\n## Daily Record\n\n- 08:00 Existing\n- 09:30 New note\n\n## Habit\n\n- [ ] Walk\n');
});

test('formats records and tasks as standard Markdown', () => {
  assert.equal(formatCaptureEntry('record', 'A thought\nwith context', '10:15'), '- 10:15 A thought\n  with context');
  assert.equal(formatCaptureEntry('task', 'Ship the release', '10:15'), '- [ ] Ship the release');
});
