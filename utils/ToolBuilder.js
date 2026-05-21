/**
 * Refactored ToolBuilder (Reusable Module Example)
 *
 * DESIGN DECISIONS:
 * 1. Encapsulation & Fluent API: Replaces the monolithic `setupToolUI` function with a builder pattern.
 *    This makes tool definitions much more readable and prevents the "huge configuration object" anti-pattern.
 * 2. Separation of Concerns: Keeps DOM manipulation inside the builder so the tool logic (the `onApply` handler)
 *    remains strictly focused on PDF data transformations.
 * 3. Scalability: Makes it easier to inject global state (like a unified theming system or dependency injection)
 *    without modifying every individual tool file.
 */

export class ToolBuilder {
  /**
   * @param {string} id Unique identifier for the tool
   */
  constructor(id) {
    this.config = {
      id,
      title: 'Untitled Tool',
      description: '',
      icon: '📄',
      actionText: 'Process PDF',
      isMultiFile: false,
      settingsHtml: '',
      onInit: null,
      onApply: null,
    };
  }

  /**
   * Sets the basic metadata for the tool UI.
   * @param {string} title Tool title
   * @param {string} desc Description text
   * @param {string} icon HTML SVG string or emoji
   * @returns {ToolBuilder} this instance for chaining
   */
  setMeta(title, desc, icon) {
    this.config.title = title;
    this.config.description = desc;
    this.config.icon = icon;
    return this;
  }

  /**
   * Configures the upload zone behavior.
   * @param {boolean} multi Select true if the tool supports multiple files (e.g. Merge/Image to PDF)
   * @returns {ToolBuilder}
   */
  enableMultiFile(multi = true) {
    this.config.isMultiFile = multi;
    return this;
  }

  /**
   * Injects custom settings HTML into the workspace area.
   * @param {string} html String representation of settings form
   * @returns {ToolBuilder}
   */
  setSettingsPanel(html) {
    this.config.settingsHtml = html;
    return this;
  }

  /**
   * Sets the main execution callback.
   * @param {Function} actionText The label for the submit button
   * @param {Function} callback Async callback receiving the context (files, bytes)
   * @returns {ToolBuilder}
   */
  setAction(actionText, callback) {
    this.config.actionText = actionText;
    this.config.onApply = callback;
    return this;
  }

  /**
   * Renders the tool and mounts it into the specified container.
   * (Placeholder for the actual DOM logic mapped from setupToolUI)
   * @param {HTMLElement} container The root mount point
   */
  async mount(container = document.getElementById('app')) {
    try {
      const { setupToolUI } = await import('./pdfToolsSetup.js');
      setupToolUI({
        toolId: this.config.id,
        title: this.config.title,
        description: this.config.description,
        icon: this.config.icon,
        actionText: this.config.actionText,
        isMultiFile: this.config.isMultiFile,
        settingsHtml: this.config.settingsHtml,
        onInit: this.config.onInit,
        onApply: this.config.onApply
      });
    } catch (err) {
      console.error('Failed to mount tool:', err);
    }
  }
}
