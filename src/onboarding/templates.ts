import { ARCHIVE, AREA, DAILY, MONTHLY, PROJECT, QUARTERLY, RESOURCE, WEEKLY, YEARLY } from '../constant';
import { getFeatureI18n } from '../feature-i18n';
import type { PeriodicNotesTemplateFilePath, PluginSettings } from '../type';

export type WorkspaceMode = 'periodic' | 'para';

export type TemplatePlan = {
  path: string;
  content: string;
};

const codeBlock = (view: string) => `\`\`\`LifeOS\n${view}\n\`\`\``;

function getPeriodicTemplatePath(settings: PluginSettings, periodType: string): string {
  const settingKey = `periodicNotesTemplateFilePath${periodType}` as PeriodicNotesTemplateFilePath;

  if (settings.usePeriodicAdvanced && settings[settingKey]) {
    return settings[settingKey];
  }

  return `${settings.periodicNotesPath}/Templates/${periodType}.md`;
}

function buildDailyTemplate(settings: PluginSettings, mode: WorkspaceMode, locale?: string): string {
  const t = getFeatureI18n(locale);
  const sections = [`# ${t.templateDailyTitle}`, `## ${settings.dailyRecordHeader}`, ''];

  if (mode === 'para') {
    sections.push(`## ${settings.projectListHeader}`, '', '0hr0', '');
  }

  sections.push(`## ${settings.habitHeader}`, '', '- [ ] ', '');

  return `${sections.join('\n').trimEnd()}\n`;
}

function buildReviewTemplate(
  title: string,
  settings: PluginSettings,
  mode: WorkspaceMode,
  locale?: string,
  includeAreaInput = false,
): string {
  const t = getFeatureI18n(locale);
  const sections = [
    `# ${title}`,
    '',
    `## ${t.templateTasksRecorded}`,
    '',
    codeBlock('TaskRecordListByTime'),
    '',
    `## ${t.templateTasksCompleted}`,
    '',
    codeBlock('TaskDoneListByTime'),
    '',
    `## ${t.templateDailyRecords}`,
    '',
    codeBlock('BulletRecordListByTime'),
  ];

  if (mode === 'para') {
    sections.push('', `## ${t.templateProjects}`, '', codeBlock('ProjectListByTime'));
  }

  if (mode === 'para' && includeAreaInput) {
    sections.push('', `## ${settings.areaListHeader}`, '');
  }

  return `${sections.join('\n').trimEnd()}\n`;
}

function buildYearlyTemplate(settings: PluginSettings, mode: WorkspaceMode, locale?: string): string {
  const t = getFeatureI18n(locale);
  const base = buildReviewTemplate(t.templateYearlyTitle, settings, mode, locale).trimEnd();

  if (mode !== 'para') return `${base}\n`;

  return `${base}\n\n## ${t.templateAreas}\n\n${codeBlock('AreaListByTime')}\n`;
}

function buildParaTemplate(locale?: string): string {
  const t = getFeatureI18n(locale);

  return [
    `# ${t.templateOverview}`,
    '',
    `## ${t.templateTasks}`,
    '',
    codeBlock('TaskListByTag'),
    '',
    `## ${t.templateRecords}`,
    '',
    codeBlock('BulletListByTag'),
    '',
    `## ${t.templateFiles}`,
    '',
    codeBlock('FileListByTag'),
    '',
  ].join('\n');
}

function getParaTemplatePath(settings: PluginSettings, type: string): string {
  const pathKey = `${type.toLocaleLowerCase()}sPath` as keyof PluginSettings;
  const templateKey = `${type.toLocaleLowerCase()}sTemplateFilePath` as keyof PluginSettings;
  const customTemplate = settings[templateKey];

  if (settings.usePARAAdvanced && typeof customTemplate === 'string' && customTemplate) {
    return customTemplate;
  }

  return `${settings[pathKey]}/Template.md`;
}

export function getBasicTemplatePlans(settings: PluginSettings, mode: WorkspaceMode, locale?: string): TemplatePlan[] {
  const t = getFeatureI18n(locale);
  const plans: TemplatePlan[] = [
    {
      path: getPeriodicTemplatePath(settings, DAILY),
      content: buildDailyTemplate(settings, mode, locale),
    },
    {
      path: getPeriodicTemplatePath(settings, WEEKLY),
      content: buildReviewTemplate(t.templateWeeklyTitle, settings, mode, locale),
    },
    {
      path: getPeriodicTemplatePath(settings, MONTHLY),
      content: buildReviewTemplate(t.templateMonthlyTitle, settings, mode, locale),
    },
    {
      path: getPeriodicTemplatePath(settings, QUARTERLY),
      content: buildReviewTemplate(t.templateQuarterlyTitle, settings, mode, locale, true),
    },
    {
      path: getPeriodicTemplatePath(settings, YEARLY),
      content: buildYearlyTemplate(settings, mode, locale),
    },
  ];

  if (mode === 'para') {
    [PROJECT, AREA, RESOURCE, ARCHIVE].forEach((type) => {
      plans.push({
        path: getParaTemplatePath(settings, type),
        content: buildParaTemplate(locale),
      });
    });
  }

  return plans;
}
