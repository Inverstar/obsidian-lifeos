import dayjs from 'dayjs';
import { type App, TFile } from 'obsidian';
import { DAILY } from '../constant';
import type { PluginSettings } from '../type';
import { createPeriodicFile } from '../util';
import { type QuickCaptureKind, appendUnderHeading, formatCaptureEntry } from './content';

export async function captureToToday(
  app: App,
  settings: PluginSettings,
  locale: string,
  kind: QuickCaptureKind,
  text: string,
): Promise<TFile> {
  const dailyFile = await createPeriodicFile(dayjs(), DAILY, settings, app, false, locale);

  if (!(dailyFile instanceof TFile)) {
    throw new Error('The daily note or its template is unavailable. Run “Set up workspace” first.');
  }

  const currentContent = await app.vault.cachedRead(dailyFile);
  const entry = formatCaptureEntry(kind, text, dayjs().format('HH:mm'));
  const nextContent = appendUnderHeading(currentContent, settings.dailyRecordHeader, entry);

  if (nextContent !== currentContent) {
    await app.vault.modify(dailyFile, nextContent);
  }

  await app.workspace.getLeaf(false).openFile(dailyFile);
  return dailyFile;
}
