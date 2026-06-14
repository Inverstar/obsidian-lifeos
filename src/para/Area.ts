import type { MarkdownPostProcessorContext } from 'obsidian';
import type { DateType } from '../type';

import { MarkdownRenderer, TFile } from 'obsidian';
import { Markdown } from '../component/Markdown';
import { ERROR_MESSAGE } from '../constant';
import { getI18n } from '../i18n';
import { generateHeaderRegExp, renderError } from '../util';
import { Item } from './Item';

export class Area extends Item {
  async filter(
    condition: DateType = {
      year: null,
      month: null,
      quarter: null,
      week: null,
      day: null,
    },
    header: string,
  ) {
    const { year } = condition;
    const quarterList = ['Q1', 'Q2', 'Q3', 'Q4'];
    const areaList: string[] = [];
    const tasks = [];
    const missingFiles: string[] = [];
    let hasHeaderMatch = false;

    for (let index = 0; index < quarterList.length; index++) {
      const quarter = quarterList[index];
      const link = `${year}/Quarterly/${year}-${quarter}.md`;
      const file = this.file.get(link, '', this.settings.periodicNotesPath);

      if (file instanceof TFile) {
        const reg = generateHeaderRegExp(header);

        if (file) {
          tasks.push(async () => {
            const fileContent = await this.app.vault.cachedRead(file);
            const regMatch = fileContent.match(reg);
            if (regMatch) {
              hasHeaderMatch = true;
            }
            const areaContent = regMatch?.length ? regMatch[2]?.split('\n') : [];
            areaContent.map((area) => {
              if (!area) {
                return;
              }

              const realArea = (area.match(/\d+\. \[\[(.*)\|?(.*)\]\]/) || [])[1]?.replace(/\|.*/, '');
              if (realArea && !areaList.includes(realArea)) {
                areaList.push(realArea);
              }
            });
          });
        }
      } else {
        missingFiles.push(`${this.settings.periodicNotesPath}/${link}`);
      }
    }

    await Promise.all(tasks.map((task) => task()));

    return {
      areaList,
      missingFiles,
      hasHeaderMatch,
    };
  }

  listByTime = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filename = ctx.sourcePath;
    const parsed = this.date.parse(filename);

    const div = el.createEl('div');

    if (!parsed.year) {
      const errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}FAILED_TO_PARSE_DATE`]}`;
      renderError(this.app, errorMsg, div, filename);
      ctx.addChild(new Markdown(div));
      return;
    }

    const header = this.settings.areaListHeader;
    const { areaList, missingFiles, hasHeaderMatch } = await this.filter(parsed, header);

    if (areaList.length === 0) {
      let errorMsg = '';
      if (missingFiles.length === 4) {
        errorMsg = `> [!WARNING] Error\n> ${getI18n(this.locale)[`${ERROR_MESSAGE}NO_PERIODIC_FILES_FOUND`]}\n${missingFiles.map((path) => `> - ${path}`).join('\n')}`;
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

    areaList.map((area: string, index: number) => {
      const file = this.file.get(area);

      const regMatch = file?.path.match(/\/(.*)\//);

      list.push(`${index + 1}. [[${area}|${regMatch?.length ? regMatch[1] : ''}]]`);
    });

    const component = new Markdown(div);

    MarkdownRenderer.render(this.app, list.join('\n'), div, ctx.sourcePath, component);

    ctx.addChild(component);
  };
}
