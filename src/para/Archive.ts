import { getAllTags, TFile, TFolder, type MarkdownPostProcessorContext, MarkdownRenderer } from 'obsidian';
import { Markdown } from '../component/Markdown';
import { Item } from './Item';

export class Archive extends Item {
  /**
   * Recursively collect all markdown files in a folder.
   */
  private collectFiles(folder: TFolder): TFile[] {
    const files: TFile[] = [];
    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'md') {
        files.push(child);
      } else if (child instanceof TFolder) {
        files.push(...this.collectFiles(child));
      }
    }
    return files;
  }

  /**
   * Extract all tags for a given file (combines frontmatter tags and inline body tags).
   */
  private getNoteTags(file: TFile): string[] {
    const cache = this.app.metadataCache.getFileCache(file);
    const rawAllTags = cache ? getAllTags(cache) || [] : [];
    const frontmatterTags = this.file.tags(file.path) || [];

    const allTags = new Set<string>();
    for (const t of frontmatterTags) {
      allTags.add(t.replace(/^#/, ''));
    }
    for (const t of rawAllTags) {
      allTags.add(t.replace(/^#/, ''));
    }
    return Array.from(allTags);
  }

  /**
   * Check if candidate file tag matches current note tag.
   * Matches exact tag, parent tag, or child/nested tag (e.g. AI matches AI/agent and AI/mem/study).
   */
  private isTagMatch(fileTag: string, tag: string): boolean {
    const f = fileTag.toLowerCase();
    const t = tag.toLowerCase();
    return f === t || f.startsWith(`${t}/`) || t.startsWith(`${f}/`);
  }

  /**
   * List archived files by tag.
   *
   * Usage in a LifeOS code block:
   *   ```LifeOS
   *   ArchiveListByTag
   *   [optional custom directory]
   *   ```
   *
   * Lines in source:
   *   line 0: "ArchiveListByTag" (view name parsed by LifeOS processor)
   *   line 1: optional custom directory path (defaults to current file's parent folder)
   *
   * Filters:
   *   1. File must have frontmatter `isArchived: true`
   *   2. If the current note has tags, candidate files must match hierarchically (e.g. AI matches AI/agent, AI/mem/study).
   */
  listByTag = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filepath = ctx.sourcePath;
    const currentFile = this.app.vault.getAbstractFileByPath(filepath);
    const tags = currentFile instanceof TFile ? this.getNoteTags(currentFile) : [];

    // Parse source lines:
    // line 0 is the view name ("ArchiveListByTag")
    // line 1+ is optional custom directory
    const lines = source
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const customDir = lines[1];

    let folder: TFolder | null = null;
    if (customDir) {
      const target = this.app.vault.getAbstractFileByPath(customDir);
      if (target instanceof TFolder) {
        folder = target;
      }
    } else if (currentFile instanceof TFile && currentFile.parent) {
      folder = currentFile.parent;
    }

    const div = el.createEl('div');
    const component = new Markdown(div);

    if (!folder) {
      MarkdownRenderer.render(
        this.app,
        `- Directory not found: ${customDir || filepath}`,
        div,
        filepath,
        component,
      );
      ctx.addChild(component);
      return;
    }

    // Collect all markdown files recursively
    const allFiles = this.collectFiles(folder);

    // Filter: isArchived: true + tag hierarchy match
    const matchedFiles = allFiles.filter((file) => {
      // Exclude current note itself
      if (file.path === filepath) {
        return false;
      }

      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      // Check isArchived: true (supports boolean true or string 'true')
      const isArchived =
        frontmatter?.isArchived === true ||
        String(frontmatter?.isArchived).toLowerCase() === 'true';

      if (!isArchived) {
        return false;
      }

      // If current note has tags, require tag match
      if (tags.length > 0) {
        const fileTags = this.getNoteTags(file);
        if (!fileTags.length) return false;

        let hasMatch = false;
        for (const fileTag of fileTags) {
          for (const tag of tags) {
            if (this.isTagMatch(fileTag, tag)) {
              hasMatch = true;
              break;
            }
          }
          if (hasMatch) break;
        }
        if (!hasMatch) return false;
      }

      return true;
    });

    // Sort alphabetically by basename
    matchedFiles.sort((a, b) => a.basename.localeCompare(b.basename));

    // Generate markdown list
    const markdown =
      matchedFiles.length > 0
        ? matchedFiles
            .map((file, index) => {
              const link = this.app.metadataCache.fileToLinktext(file, filepath);
              return `${index + 1}. [[${link}|${file.basename}]]`;
            })
            .join('\n')
        : '- Nothing';

    MarkdownRenderer.render(this.app, markdown, div, filepath, component);
    ctx.addChild(component);
  };
}
