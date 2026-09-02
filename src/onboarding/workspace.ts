import { type App, TFile, TFolder, normalizePath } from 'obsidian';
import type { PluginSettings } from '../type';
import { type WorkspaceMode, getBasicTemplatePlans } from './templates';

export type WorkspaceSetupResult = {
  created: string[];
  skipped: string[];
};

async function ensureFolder(app: App, folderPath: string, result: WorkspaceSetupResult): Promise<void> {
  const normalized = normalizePath(folderPath);
  if (!normalized || normalized === '/') return;

  const segments = normalized.split('/').filter(Boolean);
  let currentPath = '';

  for (const segment of segments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    const existing = app.vault.getAbstractFileByPath(currentPath);

    if (existing instanceof TFolder) continue;
    if (existing) throw new Error(`A file already exists where a folder is required: ${currentPath}`);

    await app.vault.createFolder(currentPath);
    result.created.push(currentPath);
  }
}

export async function initializeWorkspace(
  app: App,
  settings: PluginSettings,
  mode: WorkspaceMode,
  locale?: string,
): Promise<WorkspaceSetupResult> {
  const result: WorkspaceSetupResult = { created: [], skipped: [] };
  const plans = getBasicTemplatePlans(settings, mode, locale);

  for (const plan of plans) {
    const normalizedPath = normalizePath(plan.path);
    const parentPath = normalizedPath.split('/').slice(0, -1).join('/');
    await ensureFolder(app, parentPath, result);

    const existing = app.vault.getAbstractFileByPath(normalizedPath);
    if (existing instanceof TFile) {
      result.skipped.push(normalizedPath);
      continue;
    }
    if (existing) throw new Error(`A folder already exists where a template is required: ${normalizedPath}`);

    await app.vault.create(normalizedPath, plan.content);
    result.created.push(normalizedPath);
  }

  return result;
}
