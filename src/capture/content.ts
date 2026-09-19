export type QuickCaptureKind = 'record' | 'task';

export function formatCaptureEntry(kind: QuickCaptureKind, text: string, time: string): string {
  const [firstLine = '', ...remainingLines] = text.replace(/\r\n/g, '\n').trim().split('\n');
  const prefix = kind === 'task' ? '- [ ] ' : `- ${time} `;
  const continuation = remainingLines.map((line) => `  ${line}`).join('\n');

  return continuation ? `${prefix}${firstLine}\n${continuation}` : `${prefix}${firstLine}`;
}

function normalizeHeadingTitle(header: string): string {
  return header
    .trim()
    .replace(/^#{1,6}\s*/, '')
    .replace(/\s+#+$/, '')
    .trim();
}

export function appendUnderHeading(content: string, header: string, entry: string): string {
  const headingTitle = normalizeHeadingTitle(header);
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const headingIndex = lines.findIndex((line) => {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    return match?.[2]?.trim() === headingTitle;
  });

  if (headingIndex === -1) {
    const base = content.trimEnd();
    const section = `## ${headingTitle}\n\n${entry}`;
    return `${base ? `${base}\n\n` : ''}${section}\n`;
  }

  const headingLevel = lines[headingIndex].match(/^#{1,6}/)?.[0].length ?? 2;
  let sectionEnd = lines.length;

  for (let index = headingIndex + 1; index < lines.length; index++) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= headingLevel) {
      sectionEnd = index;
      break;
    }
  }

  const before = lines.slice(0, sectionEnd);
  while (before.length > headingIndex + 1 && before[before.length - 1].trim() === '') {
    before.pop();
  }

  if (before.length === headingIndex + 1) before.push('');
  before.push(...entry.split('\n'));

  const after = lines.slice(sectionEnd);
  if (after.length) before.push('');

  return `${[...before, ...after].join('\n').trimEnd()}\n`;
}
