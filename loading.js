/**
 * Loading State Manager
 * Gerencia estados de loading e skeleton screens
 */

class LoadingManager {
  constructor() {
    this.skeletons = new Map();
  }

  /**
   * Show skeleton loading state for a container
   * @param {string} containerId - ID of the container element
   * @param {string} template - Type of skeleton template to use
   */
  show(containerId, template = 'default') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Store original content
    if (!this.skeletons.has(containerId)) {
      this.skeletons.set(containerId, {
        originalContent: container.innerHTML,
        originalDisplay: container.style.display
      });
    }

    // Apply skeleton template
    container.innerHTML = this.getSkeletonTemplate(template);
    container.classList.add('loading-state');
  }

  /**
   * Hide skeleton and restore content (or replace with new content)
   * @param {string} containerId - ID of the container element
   * @param {string} newContent - Optional new HTML content to show
   */
  hide(containerId, newContent = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stored = this.skeletons.get(containerId);
    
    if (newContent) {
      container.innerHTML = newContent;
    } else if (stored) {
      container.innerHTML = stored.originalContent;
    }

    container.classList.remove('loading-state');
    container.classList.add('content-loaded');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      container.classList.remove('content-loaded');
    }, 300);

    this.skeletons.delete(containerId);
  }

  /**
   * Toggle loading state with promise
   * @param {string} containerId - Container to show loading in
   * @param {Promise} promise - Promise to wait for
   * @param {string} template - Skeleton template
   * @returns {Promise} - Original promise result
   */
  async wrap(containerId, promise, template = 'default') {
    this.show(containerId, template);
    try {
      const result = await promise;
      return result;
    } finally {
      // Note: hide() should be called manually after processing result
    }
  }

  /**
   * Get skeleton HTML template
   */
  getSkeletonTemplate(type) {
    const templates = {
      default: `
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      `,
      
      profile: `
        <div class="skeleton-profile-card">
          <div class="skeleton skeleton-profile-card__avatar"></div>
          <div class="skeleton skeleton-profile-card__title"></div>
          <div class="skeleton-profile-card__fields">
            <div class="skeleton-profile-card__field">
              <div class="skeleton skeleton-profile-card__label"></div>
              <div class="skeleton skeleton-profile-card__input"></div>
            </div>
            <div class="skeleton-profile-card__field">
              <div class="skeleton skeleton-profile-card__label"></div>
              <div class="skeleton skeleton-profile-card__input"></div>
            </div>
            <div class="skeleton-profile-card__field">
              <div class="skeleton skeleton-profile-card__label"></div>
              <div class="skeleton skeleton-profile-card__input"></div>
            </div>
          </div>
        </div>
      `,
      
      rotina: `
        <div class="skeleton-rotina-grid">
          ${Array(6).fill(0).map(() => `
            <div class="skeleton-rotina-card">
              <div class="skeleton skeleton-rotina-card__icon"></div>
              <div class="skeleton skeleton-rotina-card__title"></div>
              <div class="skeleton skeleton-rotina-card__meta"></div>
              <div class="skeleton skeleton-rotina-card__description"></div>
            </div>
          `).join('')}
        </div>
      `,
      
      card: `
        <div class="skeleton skeleton--card"></div>
      `,
      
      form: `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--input"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--input"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--input"></div>
          <div class="skeleton skeleton--button" style="margin-top: 1rem;"></div>
        </div>
      `,
      
      list: `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${Array(5).fill(0).map(() => `
            <div class="skeleton" style="height: 60px; border-radius: 8px;"></div>
          `).join('')}
        </div>
      `
    };

    return templates[type] || templates.default;
  }

  /**
   * Show full page loading overlay
   */
  showPageLoading() {
    if (document.getElementById('page-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'page-loading-overlay';
    overlay.innerHTML = `
      <div class="page-loading__spinner">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>
    `;
    overlay.className = 'page-loading-overlay';
    document.body.appendChild(overlay);
  }

  /**
   * Hide full page loading overlay
   */
  hidePageLoading() {
    const overlay = document.getElementById('page-loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Create global instance
const Loading = new LoadingManager();

// Export for module use
export { Loading, LoadingManager };

// Make available globally
window.Loading = Loading;
