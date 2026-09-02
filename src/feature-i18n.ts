import { normalizeLocale } from './i18n';

export type FeatureI18n = {
  setupTitle: string;
  setupDescription: string;
  setupMode: string;
  setupPeriodicOnly: string;
  setupPeriodicOnlyDescription: string;
  setupPara: string;
  setupParaDescription: string;
  setupSafety: string;
  setupPreview: string;
  setupLater: string;
  setupSubmit: string;
  setupWorking: string;
  setupSuccess: (createdCount: number, skippedCount: number) => string;
  setupFailed: string;
  setupCommand: string;
  quickRecordCommand: string;
  quickTaskCommand: string;
  quickRecordTitle: string;
  quickTaskTitle: string;
  quickRecordPlaceholder: string;
  quickTaskPlaceholder: string;
  quickCaptureDescription: string;
  quickCaptureSubmit: string;
  quickCaptureWorking: string;
  quickCaptureEmpty: string;
  quickCaptureSuccess: string;
  quickCaptureFailed: string;
  templateDailyTitle: string;
  templateWeeklyTitle: string;
  templateMonthlyTitle: string;
  templateQuarterlyTitle: string;
  templateYearlyTitle: string;
  templateTasksRecorded: string;
  templateTasksCompleted: string;
  templateDailyRecords: string;
  templateProjects: string;
  templateAreas: string;
  templateOverview: string;
  templateTasks: string;
  templateRecords: string;
  templateFiles: string;
};

const EN: FeatureI18n = {
  setupTitle: 'Set up LifeOS',
  setupDescription: 'Install a safe starter workspace so you can create your first note immediately.',
  setupMode: 'Workspace mode',
  setupPeriodicOnly: 'Periodic notes only',
  setupPeriodicOnlyDescription: 'Daily capture and periodic reviews without PARA folders.',
  setupPara: 'Periodic notes + PARA',
  setupParaDescription: 'Add Projects, Areas, Resources, and Archives to the periodic workflow.',
  setupSafety: 'Only missing folders and templates will be created. Existing files are never overwritten.',
  setupPreview: 'Files prepared by this setup',
  setupLater: 'Later',
  setupSubmit: "Set up and create today's note",
  setupWorking: 'Setting up…',
  setupSuccess: (createdCount, skippedCount) =>
    `LifeOS is ready. Created ${createdCount} item(s); kept ${skippedCount} existing item(s).`,
  setupFailed: 'LifeOS setup failed',
  setupCommand: 'Set up workspace',
  quickRecordCommand: 'Quick record',
  quickTaskCommand: 'Quick task',
  quickRecordTitle: 'Quick record',
  quickTaskTitle: 'Quick task',
  quickRecordPlaceholder: 'Capture an idea, note, or update…',
  quickTaskPlaceholder: 'What needs to be done?',
  quickCaptureDescription: "Saved under the daily record section in today's note. Press Ctrl/Cmd + Enter to save.",
  quickCaptureSubmit: 'Save',
  quickCaptureWorking: 'Saving…',
  quickCaptureEmpty: 'Enter some content first.',
  quickCaptureSuccess: "Saved to today's note.",
  quickCaptureFailed: "Could not save to today's note",
  templateDailyTitle: 'Daily note',
  templateWeeklyTitle: 'Weekly review',
  templateMonthlyTitle: 'Monthly review',
  templateQuarterlyTitle: 'Quarterly review',
  templateYearlyTitle: 'Yearly review',
  templateTasksRecorded: 'Tasks recorded',
  templateTasksCompleted: 'Tasks completed',
  templateDailyRecords: 'Daily records',
  templateProjects: 'Projects',
  templateAreas: 'Areas',
  templateOverview: 'Overview',
  templateTasks: 'Tasks',
  templateRecords: 'Records',
  templateFiles: 'Files',
};

const ZH: FeatureI18n = {
  setupTitle: '初始化 LifeOS',
  setupDescription: '安装安全的基础工作区，完成后即可创建并使用今日日记。',
  setupMode: '工作区模式',
  setupPeriodicOnly: '仅使用周期笔记',
  setupPeriodicOnlyDescription: '用于日常记录和周期复盘，不创建 PARA 目录。',
  setupPara: '周期笔记 + PARA',
  setupParaDescription: '在周期工作流中加入项目、领域、资源和存档。',
  setupSafety: '只创建缺失的目录和模板，绝不会覆盖已有文件。',
  setupPreview: '本次将准备的文件',
  setupLater: '稍后',
  setupSubmit: '初始化并创建今日日记',
  setupWorking: '正在初始化…',
  setupSuccess: (createdCount, skippedCount) =>
    `LifeOS 已就绪：新建 ${createdCount} 项，保留 ${skippedCount} 项已有内容。`,
  setupFailed: 'LifeOS 初始化失败',
  setupCommand: '初始化工作区',
  quickRecordCommand: '快速记录',
  quickTaskCommand: '快速任务',
  quickRecordTitle: '快速记录',
  quickTaskTitle: '快速任务',
  quickRecordPlaceholder: '记录一个想法、进展或闪念…',
  quickTaskPlaceholder: '接下来要做什么？',
  quickCaptureDescription: '内容会写入今日日记的日常记录标题下。按 Ctrl/Cmd + Enter 保存。',
  quickCaptureSubmit: '保存',
  quickCaptureWorking: '正在保存…',
  quickCaptureEmpty: '请先输入内容。',
  quickCaptureSuccess: '已保存到今日日记。',
  quickCaptureFailed: '无法保存到今日日记',
  templateDailyTitle: '日记',
  templateWeeklyTitle: '周复盘',
  templateMonthlyTitle: '月复盘',
  templateQuarterlyTitle: '季度复盘',
  templateYearlyTitle: '年度复盘',
  templateTasksRecorded: '记录的任务',
  templateTasksCompleted: '完成的任务',
  templateDailyRecords: '日常记录',
  templateProjects: '项目',
  templateAreas: '领域',
  templateOverview: '概览',
  templateTasks: '任务',
  templateRecords: '记录',
  templateFiles: '文件',
};

const ZH_TW: FeatureI18n = {
  ...ZH,
  setupTitle: '初始化 LifeOS',
  setupDescription: '安裝安全的基礎工作區，完成後即可建立並使用今日日記。',
  setupMode: '工作區模式',
  setupPeriodicOnly: '僅使用週期筆記',
  setupPeriodicOnlyDescription: '用於日常記錄和週期回顧，不建立 PARA 目錄。',
  setupPara: '週期筆記 + PARA',
  setupParaDescription: '在週期工作流程中加入專案、領域、資源和封存。',
  setupSafety: '只建立缺少的目錄和範本，絕不覆蓋已有檔案。',
  setupPreview: '本次將準備的檔案',
  setupLater: '稍後',
  setupSubmit: '初始化並建立今日日記',
  setupWorking: '正在初始化…',
  setupSuccess: (createdCount, skippedCount) =>
    `LifeOS 已就緒：新建 ${createdCount} 項，保留 ${skippedCount} 項既有內容。`,
  quickRecordCommand: '快速記錄',
  quickTaskCommand: '快速任務',
  quickRecordTitle: '快速記錄',
  quickTaskTitle: '快速任務',
  quickRecordPlaceholder: '記錄一個想法、進展或閃念…',
  quickTaskPlaceholder: '接下來要做什麼？',
  quickCaptureDescription: '內容會寫入今日日記的日常記錄標題下。按 Ctrl/Cmd + Enter 儲存。',
  quickCaptureSubmit: '儲存',
  quickCaptureWorking: '正在儲存…',
  quickCaptureEmpty: '請先輸入內容。',
  quickCaptureSuccess: '已儲存到今日日記。',
  quickCaptureFailed: '無法儲存到今日日記',
  templateDailyTitle: '日記',
  templateWeeklyTitle: '週回顧',
  templateMonthlyTitle: '月回顧',
  templateQuarterlyTitle: '季度回顧',
  templateYearlyTitle: '年度回顧',
  templateTasksRecorded: '記錄的任務',
  templateTasksCompleted: '完成的任務',
  templateDailyRecords: '日常記錄',
  templateProjects: '專案',
  templateAreas: '領域',
  templateOverview: '概覽',
  templateTasks: '任務',
  templateRecords: '記錄',
  templateFiles: '檔案',
};

export function getFeatureI18n(locale?: string): FeatureI18n {
  const normalized = normalizeLocale(locale);

  if (normalized === 'zh-tw') return ZH_TW;
  if (normalized.startsWith('zh')) return ZH;

  return EN;
}
