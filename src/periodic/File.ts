import { type App, type MarkdownPostProcessorContext, MarkdownRenderer, TFile, TFolder } from 'obsidian';
import type { IndexType, PluginSettings } from '../type';

import dayjs from 'dayjs';
import { Markdown } from '../component/Markdown';
import { ERROR_MESSAGE } from '../constant';
import { getI18n } from '../i18n';
import type LifeOS from '../main';
import { isInPeriodicNote, isInTemplateNote, logMessage, renderError } from '../util';
import { Date as PeriodicDate } from './Date';

export class File {
  app: App;
  date: Date;
  settings: PluginSettings;
  plugin: LifeOS;
  locale: string;
  constructor(app: App, settings: PluginSettings, plugin: LifeOS, locale: string) {
    this.app = app;
    this.settings = settings;
    this.plugin = plugin;
    this.locale = locale;
  }

  private hasCommonPrefix(tags1: string[], tags2: string[]) {
    for (const tag1 of tags1) {
      for (const tag2 of tags2) {
        if (tag1.startsWith(tag2)) {
          return true;
        }
      }
    }
    return false;
  }

  list(fileFolder: string, condition: { tags: string[] } = { tags: [] }) {
    const folder = this.app.vault.getAbstractFileByPath(fileFolder);

    if (folder instanceof TFolder) {
      const subFolderList = folder.children.filter((file) => file instanceof TFolder);
      const IndexList = subFolderList
        .map((subFolder) => {
          // 优先搜索同名文件，否则搜索 XXX.README
          if (subFolder instanceof TFolder) {
            const { name } = subFolder;
            const files = subFolder.children;
            const indexFile = files.find((file) => {
              const indexType: IndexType = this.settings.usePARAAdvanced ? this.settings.paraIndexFilename : 'readme';

              if (indexType === 'readme') {
                if (file.path.match(/(.*\.)?README\.md/)) {
                  return true;
                }
              }

              if (indexType === 'folderName') {
                if ((file as any).basename === name) {
                  return true;
                }
              }

              return false;
            });

            if (condition.tags.length) {
              const tags = this.tags(indexFile?.path || '');
              // tags: #work/project-1 #work/project-2
              // condition.tags: #work
              if (!tags) {
                return '';
              }

              if (!condition.tags) {
                return '';
              }

              if (!this.hasCommonPrefix(tags, condition.tags)) {
                return '';
              }
            }

            if (!indexFile) {
              logMessage(`${getI18n(this.locale)[`${ERROR_MESSAGE}NO_INDEX_FILE_EXIST`]} @ ${subFolder.path}`);
            }

            if (indexFile instanceof TFile) {
              const link = this.app.metadataCache.fileToLinktext(indexFile, indexFile?.path);
              return `[[${link}|${subFolder.name}]]`;
            }
          }
        })
        .filter((link) => !!link)
        .sort((a, b) => {
          const getCategory = (item: string) => item.split('|')[1].replace(']]', '');

          const categoryA = getCategory(a as string);
          const categoryB = getCategory(b as string);

          if (categoryA < categoryB) return -1;
          if (categoryA > categoryB) return 1;

          return 0;
        })
        .map((link, index: number) => `${index + 1}. ${link}`);

      return IndexList.join('\n');
    }

    return `No files in ${fileFolder}`;
  }

  get(link: string, sourcePath = '', fileFolder?: string) {
    const file = this.app.metadataCache.getFirstLinkpathDest(link, sourcePath);

    if (!fileFolder) {
      return file;
    }

    if (file?.path.includes(fileFolder)) {
      return file;
    }
  }

  tags(filePath: string) {
    const file = this.app.vault.getAbstractFileByPath(filePath);

    if (file instanceof TFile) {
      const { frontmatter } = this.app.metadataCache.getFileCache(file) || {
        frontmatter: {},
      };

      let tags = frontmatter?.tags;

      if (!tags) {
        return [];
      }

      if (typeof tags === 'string') {
        tags = [tags];
      }

      return tags.map((tag: string) => tag.replace(/^#(.*)$/, '$1'));
    }
  }

  listByTag = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filepath = ctx.sourcePath;
    const tags = this.tags(filepath);
    const div = el.createEl('div');
    const component = new Markdown(div);

    if (!tags.length) {
      return renderError(this.app, getI18n(this.locale)[`${ERROR_MESSAGE}NO_FRONT_MATTER_TAG`], div, filepath);
    }

    const from = tags
      .map((tag: string[], index: number) => {
        return `#${tag} ${index === tags.length - 1 ? '' : 'OR'}`;
      })
      .join(' ')
      .trim();

    const dataview = await this.plugin.getDataviewAPI();
    dataview.table(
      ['File', 'Date'],
      dataview
        .pages(from)
        .filter(
          (b: { file: TFile }) =>
            !isInPeriodicNote(b.file.path, this.settings) &&
            !isInTemplateNote(b.file.path, this.settings) &&
            b.file.path !== filepath,
        )
        .sort((b: { file: { ctime: { ts: number } } }) => b.file.ctime.ts, 'desc')
        .map((b: { file: { link: string; ctime: { ts: number } } }) => [
          b.file.link,
          `[[${dayjs(b.file.ctime.ts).format('YYYY-MM-DD')}]]`,
        ]),
      div,
      component,
      filepath,
    );

    ctx.addChild(component);
  };

  paraListByTime = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filepath = ctx.sourcePath;
    const dateHelper = new PeriodicDate(this.app, this.settings, this, this.locale);
    const parsed = dateHelper.parse(filepath);
    const files = dateHelper.files(parsed);

    // Collect all paths to search tags in
    const pathsToSearch = new Set<string>([filepath]);
    for (const day of files.days) pathsToSearch.add(day);
    for (const week of files.weeks) pathsToSearch.add(week);
    for (const month of files.months) pathsToSearch.add(month);
    for (const quarter of files.quarters) pathsToSearch.add(quarter);

    let rawTags: string[] = [];
    for (const path of pathsToSearch) {
      const file = this.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        const cache = this.app.metadataCache.getFileCache(file);
        if (cache?.tags) {
          rawTags.push(...cache.tags.map((t) => t.tag.replace(/^#/, '')));
        }
      }
    }

    const tags = Array.from(new Set(rawTags)).filter(
      (tag: string) => !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(tag.toLowerCase()),
    );
    const div = el.createEl('div');
    const component = new Markdown(div);
    const i18n = getI18n(this.locale);

    if (!tags.length) {
      const errorMsg = `> [!INFO]\n> ${i18n.PARA_NO_TAGS}`;
      MarkdownRenderer.render(this.app, errorMsg, div, filepath, component);
      ctx.addChild(component);
      return;
    }

    const dataview = await this.plugin.getDataviewAPI();

    const lines = source
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const params = lines.slice(1).map((p) => p.toLowerCase());

    const allParaFolders = [
      { key: 'project', path: this.settings.projectsPath, title: i18n.PARA_PROJECT_TITLE },
      { key: 'area', path: this.settings.areasPath, title: i18n.PARA_AREA_TITLE },
      { key: 'resource', path: this.settings.resourcesPath, title: i18n.PARA_RESOURCE_TITLE },
      { key: 'archive', path: this.settings.archivesPath, title: i18n.PARA_ARCHIVE_TITLE },
    ];

    const matchesParam = (key: string, param: string) => {
      if (key === 'project') {
        return ['项目', 'project', 'projects'].includes(param);
      }
      if (key === 'area') {
        return ['领域', 'area', 'areas'].includes(param);
      }
      if (key === 'resource') {
        return ['资源', 'resource', 'resources'].includes(param);
      }
      if (key === 'archive') {
        return ['存档', '归档', 'archive', 'archives'].includes(param);
      }
      return false;
    };

    const paraFolders =
      params.length > 0
        ? allParaFolders.filter((folder) => params.some((param) => matchesParam(folder.key, param)))
        : allParaFolders;

    let foundAnything = false;
    let markdown = '';

    console.log('ParaListByTime debug - Current Daily Note tags:', tags);

    for (const folderConfig of paraFolders) {
      if (!folderConfig.path) {
        continue;
      }

      // Query pages in this folder
      const pages = dataview.pages(`"${folderConfig.path}"`);
      console.log(`ParaListByTime debug - Folder: "${folderConfig.path}", total pages found: ${pages.length}`);

      const matches = pages.filter((p: any) => {
        let pageTags: any = p.file?.tags;
        if (!pageTags) {
          console.log(`Page ${p.file.path} has no p.file.tags`);
          return false;
        }
        if (typeof pageTags.array === 'function') {
          pageTags = pageTags.array();
        }
        if (!Array.isArray(pageTags)) {
          console.log(`Page ${p.file.path} pageTags is not an array:`, pageTags);
          return false;
        }

        const cleanPageTags = pageTags.map((tag: string) => tag.replace(/^#/, ''));
        const matched = cleanPageTags.some((tag: string) => tags.includes(tag));
        if (matched) {
          console.log(`Page ${p.file.path} MATCHED! cleanPageTags:`, cleanPageTags);
        }
        return matched;
      });

      if (matches.length > 0) {
        markdown += `#### ${folderConfig.title}\n`;
        const matchesArray = matches.array();
        const listStr = matchesArray
          .sort((a: any, b: any) => {
            const timeA = a.file.mtime?.ts || a.file.mtime?.toMillis?.() || 0;
            const timeB = b.file.mtime?.ts || b.file.mtime?.toMillis?.() || 0;
            return timeB - timeA;
          })
          .map((p: any, index: number) => `${index + 1}. [[${p.file.path}|${p.file.name}]]`)
          .join('\n');
        markdown += `${listStr}\n\n`;
        foundAnything = true;
      }
    }

    if (!foundAnything) {
      const formattedTags = tags.map((tag: string) => `#${tag}`).join(', ');
      markdown = `> [!INFO]\n> ${i18n.PARA_NO_MATCHES.replace('{tags}', formattedTags)}`;
    }

    MarkdownRenderer.render(this.app, markdown, div, filepath, component);
    ctx.addChild(component);
  };
}
