import { type App, type MarkdownPostProcessorContext, MarkdownRenderer } from 'obsidian';
import { Markdown } from '../component/Markdown';
import { Date as PeriodicDate } from '../periodic/Date';
import type { File } from '../periodic/File';
import type { PluginSettings } from '../type';

export class Item {
  dir: string;
  app: App;
  settings: PluginSettings;
  file: File;
  date: PeriodicDate;
  locale: string;

  constructor(dir: string, app: App, settings: PluginSettings, file: File, locale: string) {
    this.dir = dir;
    this.app = app;
    this.settings = settings;
    this.file = file;
    this.locale = locale;
    this.date = new PeriodicDate(this.app, this.settings, this.file, locale);
  }

  snapshot(dir = this.dir) {
    return this.file.list(dir);
  }

  listByFolder = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const div = el.createEl('div');
    const markdown = this.file.list(this.dir);
    const component = new Markdown(div);

    MarkdownRenderer.render(this.app, markdown || '- Nothing', div, ctx.sourcePath, component);

    ctx.addChild(component);
  };

  listByTag = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filepath = ctx.sourcePath;
    const tags = this.file.tags(filepath);
    const div = el.createEl('div');
    const markdown = this.file.list(this.dir, { tags });
    const component = new Markdown(div);

    MarkdownRenderer.render(this.app, markdown || '- Nothing', div, ctx.sourcePath, component);

    ctx.addChild(component);
  };
}
