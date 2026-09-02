import dayjs from 'dayjs';
import { Modal, Notice, Setting } from 'obsidian';
import { DAILY } from '../constant';
import { getFeatureI18n } from '../feature-i18n';
import type LifeOS from '../main';
import { createPeriodicFile } from '../util';
import { type WorkspaceMode, getBasicTemplatePlans } from './templates';
import { initializeWorkspace } from './workspace';

import './index.less';

export class OnboardingModal extends Modal {
  private mode: WorkspaceMode;
  private isWorking = false;
  private previewEl?: HTMLElement;

  constructor(private readonly plugin: LifeOS) {
    super(plugin.app);
    this.mode = plugin.settings.usePARANotes ? 'para' : 'periodic';
  }

  onOpen(): void {
    const locale = this.plugin.getCurrentLocaleKey();
    const t = getFeatureI18n(locale);
    this.modalEl.addClass('lifeos-onboarding-modal');
    this.setTitle(t.setupTitle);

    this.contentEl.createEl('p', {
      cls: 'lifeos-onboarding-description',
      text: t.setupDescription,
    });

    const modeSetting = new Setting(this.contentEl);
    modeSetting
      .setName(t.setupMode)
      .setDesc(this.mode === 'para' ? t.setupParaDescription : t.setupPeriodicOnlyDescription)
      .addDropdown((dropdown) => {
        dropdown
          .addOption('para', t.setupPara)
          .addOption('periodic', t.setupPeriodicOnly)
          .setValue(this.mode)
          .onChange((value) => {
            this.mode = value as WorkspaceMode;
            modeSetting.setDesc(this.mode === 'para' ? t.setupParaDescription : t.setupPeriodicOnlyDescription);
            this.renderPreview();
          });
      });

    this.contentEl.createDiv({
      cls: 'lifeos-onboarding-safety',
      text: t.setupSafety,
    });

    this.contentEl.createEl('h3', { text: t.setupPreview });
    this.previewEl = this.contentEl.createEl('ul', { cls: 'lifeos-onboarding-preview' });
    this.renderPreview();

    new Setting(this.contentEl)
      .addButton((button) => {
        button.setButtonText(t.setupLater).onClick(async () => {
          await this.plugin.saveSettings({
            ...this.plugin.settings,
            onboardingVersion: 1,
          });
          this.close();
        });
      })
      .addButton((button) => {
        button
          .setCta()
          .setButtonText(t.setupSubmit)
          .onClick(async () => {
            if (this.isWorking) return;

            this.isWorking = true;
            button.setDisabled(true).setButtonText(t.setupWorking);

            try {
              const settings = {
                ...this.plugin.settings,
                onboardingVersion: 1,
                usePeriodicNotes: true,
                usePARANotes: this.mode === 'para',
              };
              const result = await initializeWorkspace(this.app, settings, this.mode, locale);
              await this.plugin.saveSettings(settings);
              await createPeriodicFile(dayjs(), DAILY, settings, this.app, false, locale);
              new Notice(t.setupSuccess(result.created.length, result.skipped.length));
              this.close();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              new Notice(`${t.setupFailed}: ${message}`);
              button.setDisabled(false).setButtonText(t.setupSubmit);
              this.isWorking = false;
            }
          });
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private renderPreview(): void {
    if (!this.previewEl) return;

    this.previewEl.empty();
    getBasicTemplatePlans(this.plugin.settings, this.mode, this.plugin.getCurrentLocaleKey()).forEach((plan) => {
      this.previewEl?.createEl('li', { text: plan.path });
    });
  }
}
