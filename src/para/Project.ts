import type { DateType } from '../type';

import { TFile, moment } from 'obsidian';
import { type MarkdownPostProcessorContext, MarkdownRenderer } from 'obsidian';
import { Markdown } from '../component/Markdown';
import { ERROR_MESSAGE } from '../constant';
import { getI18n } from '../i18n';
import { Date as PeriodicDate } from '../periodic/Date';
import { generateHeaderRegExp, renderError } from '../util';
import { Item } from './Item';

const timeReg = /(\d+)hr?(\d+)?/;
const totalTimeReg = /^\d+hr?(\d+)?$/;

export class Project extends Item {
  timeAdd(timeString1: string, timeString2: string) {
    if (!timeString1) {
      return timeString2;
    }

    if (!timeString2) {
      return timeString1;
    }

    const [, hr1 = 0, min1 = 0] = timeString1.match(timeReg) || [];
    const [, hr2 = 0, min2 = 0] = timeString2.match(timeReg) || [];
    let carry = 0;
    const hr = Number(hr1) + Number(hr2);
    let min = Number(min1) + Number(min2);

    if (min >= 60) {
      carry = Math.floor(min / 60);
      min = min % 60;
    }

    return `${hr + carry}hr${min}`;
  }

  timePercent(timeString1: string, timeString2: string) {
    if (!timeString1) {
      return '';
    }

    if (!timeString2) {
      return '';
    }

    const [, hr1 = 0, min1 = 0] = timeString1.match(timeReg) || [];
    const [, hr2 = 0, min2 = 0] = timeString2.match(timeReg) || [];
    const time1 = Number(hr1) * 60 + Number(min1);
    const time2 = Number(hr2) * 60 + Number(min2);

    return `${((time1 / time2) * 100).toFixed(2)}%`;
  }

  async filter(
    parsed: DateType = {
      year: null,
      month: null,
      quarter: null,
      week: null,
      day: null,
    },
    header: string,
  ) {
    const date = new PeriodicDate(this.app, this.settings, this.file, this.locale);
    const { from, to } = date.days(parsed);
    const periodicNotes = date.files(parsed).days;
    const projectList: string[] = [];
    const projectTimeConsume: Record<string, string> = {};
    let totalTime = '';
    const tasks = [];
    const missingFiles: string[] = [];
    let hasHeaderMatch = false;

    if (from && to) {
      const currentDate = moment(from).clone();
      const endDate = moment(to);
      const dailyFormat = this.settings.dailyNoteFormat || 'YYYY-MM-DD';
      while (currentDate.isSameOrBefore(endDate)) {
        const dayLink = `${currentDate.year()}/Daily/${String(currentDate.month() + 1).padStart(
          2,
          '0',
        )}/${currentDate.format(dailyFormat)}.md`;
        const file = this.file.get(dayLink, '', this.settings.periodicNotesPath);
        if (!file) {
          missingFiles.push(`${this.settings.periodicNotesPath}/${dayLink}`);
        }
        currentDate.add(1, 'day');
      }
    }

    for (const periodicNote of periodicNotes) {
      const file = this.app.vault.getFileByPath(periodicNote);

      if (file instanceof TFile) {
        const reg = generateHeaderRegExp(header);
        let todayTotalTime = '0hr0';

        tasks.push(async () => {
          const fileContent = await this.app.vault.cachedRead(file);
          const regMatch = fileContent.match(reg);
          if (regMatch) {
            hasHeaderMatch = true;
          }
          const projectContent = regMatch?.length ? regMatch[2]?.split('\n') : [];

          projectContent.forEach((project) => {
            if (!project) {
              return;
            }

            if (project?.trim().match(totalTimeReg)) {
              // 特殊处理总耗时
              todayTotalTime = project?.trim();
            }
            // 1. [[WOT.README|分享-2023 WOT 分享会]] 4hr20
            // 1. [[1. Projects/分享-2023 WOT 分享会/README|分享-2023 WOT 分享会]]  4hr20
            const realProject = (project.match(/\d+\. \[\[(.*)\|?(.*)\]\]/) || [])[1]?.replace(/\|.*/, '');

            if (!realProject) {
              return;
            }

            const projectFile = this.file.get(realProject)?.path || '';

            if (!projectFile) {
              return;
            }

            const [projectTime = ''] = project.match(timeReg) || [];

            projectTimeConsume[projectFile] = this.timeAdd(projectTimeConsume[projectFile], projectTime);

            if (!projectList.includes(projectFile)) {
              projectList.push(projectFile);
            }
          });

          totalTime = this.timeAdd(totalTime, todayTotalTime);
        });
      }
    }

    await Promise.all(tasks.map((task) => task()));

    Object.keys(projectTimeConsume).forEach((project) => {
      projectTimeConsume[project] = projectTimeConsume[project]
        ? `${projectTimeConsume[project]}/${totalTime}=${this.timePercent(projectTimeConsume[project], totalTime)}`
        : '';
    });

    return {
      projectList,
      projectTimeConsume,
      totalTime,
      missingFiles,
      hasHeaderMatch,
    };
  }

  listByTime = async (_source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filename = ctx.sourcePath;
    const date = new PeriodicDate(this.app, this.settings, this.file, this.locale);
    const parsed = date.parse(filename);

    const div = el.createEl('div');

    if (!parsed.year && !parsed.month && !parsed.quarter && !parsed.week && !parsed.day) {
      const errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}FAILED_TO_PARSE_DATE`]}`;
      renderError(this.app, errorMsg, div, filename);
      ctx.addChild(new Markdown(div));
      return;
    }

    const header = this.settings.projectListHeader;
    const { projectList, projectTimeConsume, missingFiles, hasHeaderMatch } = await this.filter(parsed, header);

    if (projectList.length === 0) {
      let errorMsg = '';
      const { from, to } = date.days(parsed);
      if (!from || !to) {
        errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}FAILED_TO_PARSE_DATE`]}`;
      } else if (missingFiles.length > 0 && projectList.length === 0 && !hasHeaderMatch) {
        const displayFiles = missingFiles.slice(0, 15);
        const suffix = missingFiles.length > 15 ? `\n> - ... and ${missingFiles.length - 15} more files.` : '';
        errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}NO_PERIODIC_FILES_FOUND`]}\n${displayFiles.map((path) => `> - ${path}`).join('\n')}${suffix}`;
      } else if (!hasHeaderMatch) {
        errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}HEADER_NOT_FOUND`]} \`${header}\``;
      } else {
        errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}LIST_EMPTY`]}`;
      }
      renderError(this.app, errorMsg, div, filename);
      ctx.addChild(new Markdown(div));
      return;
    }

    const list: string[] = [];

    projectList.forEach((project: string, index: number) => {
      // WOT.README
      // 1. Projects/分享-2023 WOT 分享会/README
      const regMatch = project.match(/\/(.*)\//);

      list.push(`${index + 1}. [[${project}|${regMatch?.length ? regMatch[1] : ''}]] ${projectTimeConsume[project]}`);
    });

    const component = new Markdown(div);

    MarkdownRenderer.render(this.app, list.join('\n'), div, ctx.sourcePath, component);

    ctx.addChild(component);
  };
}
