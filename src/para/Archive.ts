import { type MarkdownPostProcessorContext, MarkdownRenderer, TFile, TFolder } from 'obsidian';
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
   * List archived files by tag.
   *
   * Usage in a code block:
   *   ```ArchiveListByTag
   *   path/to/folder     ← optional, defaults to the current file's parent folder
   *   ```
   *
   * Filters:
   *   1. File must have frontmatter `isArchived: true`
   *   2. If the current note has tags, the file's tags must share a common
   *      prefix with the current note's tags (same logic as other ListByTag views).
   */
  listByTag = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const filepath = ctx.sourcePath;
    const tags = this.file.tags(filepath) || [];

    // Parse source for an optional directory path (first non-empty line)
    const lines = source
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let searchDir: string;

    if (lines.length > 0) {
      // User specified a directory
      searchDir = lines[0];
    } else {
      // Default: current file's parent folder
      const parts = filepath.split('/');
      parts.pop();
      searchDir = parts.join('/') || '/';
    }

    const folder = this.app.vault.getAbstractFileByPath(searchDir);
    const div = el.createEl('div');
    const component = new Markdown(div);

    if (!(folder instanceof TFolder)) {
      MarkdownRenderer.render(this.app, `- Directory not found: ${searchDir}`, div, filepath, component);
      ctx.addChild(component);
      return;
    }

    // Collect all markdown files recursively
    const allFiles = this.collectFiles(folder);

    // Filter: isArchived: true + tag prefix match
    const matchedFiles = allFiles.filter((file) => {
      // Exclude the current note itself
      if (file.path === filepath) {
        return false;
      }

      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;

      // Must have isArchived: true
      if (!frontmatter?.isArchived) {
        return false;
      }

      // If the current note has tags, require a tag prefix match
      if (tags.length > 0) {
        let fileTags = frontmatter?.tags;
        if (!fileTags) return false;
        if (typeof fileTags === 'string') fileTags = [fileTags];
        fileTags = (fileTags as string[]).map((t: string) => t.replace(/^#/, ''));

        let hasMatch = false;
        for (const fileTag of fileTags) {
          for (const tag of tags) {
            if (fileTag.startsWith(tag)) {
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
