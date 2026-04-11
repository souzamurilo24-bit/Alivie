/**
 * Dashboard UI Component
 * Exibe estatísticas, streak, conquistas e gráficos de progresso
 */

import { Stats } from "./stats.js";

class DashboardComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.stats = null;
    this.uid = null;
  }

  async init(uid) {
    if (!uid) return;
    this.uid = uid;

    if (!this.container) {
      console.warn(`Dashboard container #${this.containerId} not found`);
      return;
    }

    // Show loading state
    this.renderLoading();

    // Load stats
    this.stats = await Stats.getStats(uid);

    // Render dashboard
    this.render();
  }

  renderLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="dashboard-loading">
        <div class="skeleton skeleton--title"></div>
        <div class="dashboard-grid">
          <div class="dashboard-card skeleton">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-lg"></div>
          </div>
          <div class="dashboard-card skeleton">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-lg"></div>
          </div>
          <div class="dashboard-card skeleton">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-lg"></div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    if (!this.container || !this.stats) return;

    const weeklyData = Stats.getWeeklyProgressData(this.stats);
    const achievements = this.stats.achievements || [];
    const unlockedCount = achievements.length;
    const totalAchievements = 6;

    this.container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard-header">
          <h2 class="dashboard-title">
            <i class="fas fa-chart-line"></i>
            Seu Progresso
          </h2>
          <span class="dashboard-subtitle">Acompanhe sua jornada de bem-estar</span>
        </div>

        <div class="dashboard-grid">
          <!-- Streak Card -->
          <div class="dashboard-card dashboard-card--streak ${this.stats.streakDays > 0 ? 'has-streak' : ''}">
            <div class="dashboard-card__icon">
              ${this.getStreakIcon()}
            </div>
            <div class="dashboard-card__content">
              <span class="dashboard-card__value">${this.stats.streakDays || 0}</span>
              <span class="dashboard-card__label">dias seguidos</span>
            </div>
            ${this.stats.streakDays > 0 ? `<div class="dashboard-card__badge">🔥 Streak ativa!</div>` : ''}
          </div>

          <!-- Total Activities Card -->
          <div class="dashboard-card dashboard-card--activities">
            <div class="dashboard-card__icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="dashboard-card__content">
              <span class="dashboard-card__value">${this.stats.totalActivitiesCompleted || 0}</span>
              <span class="dashboard-card__label">atividades completadas</span>
            </div>
          </div>

          <!-- Achievements Card -->
          <div class="dashboard-card dashboard-card--achievements">
            <div class="dashboard-card__icon">
              <i class="fas fa-trophy"></i>
            </div>
            <div class="dashboard-card__content">
              <span class="dashboard-card__value">${unlockedCount}/${totalAchievements}</span>
              <span class="dashboard-card__label">conquistas desbloqueadas</span>
            </div>
            ${unlockedCount > 0 ? `<div class="dashboard-card__progress" style="--progress: ${(unlockedCount / totalAchievements) * 100}%"></div>` : ''}
          </div>
        </div>

        <!-- Weekly Progress Chart -->
        <div class="dashboard-section">
          <h3 class="dashboard-section__title">
            <i class="fas fa-calendar-week"></i>
            Progresso Semanal
          </h3>
          <div class="weekly-chart">
            ${weeklyData.map(day => `
              <div class="weekly-chart__day ${day.value > 0 ? 'has-activity' : ''}">
                <div class="weekly-chart__bar" style="--height: ${Math.min(day.value * 20, 100)}%">
                  <span class="weekly-chart__value">${day.value > 0 ? day.value : ''}</span>
                </div>
                <span class="weekly-chart__label">${day.day}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Achievements -->
        ${achievements.length > 0 ? `
          <div class="dashboard-section">
            <h3 class="dashboard-section__title">
              <i class="fas fa-medal"></i>
              Suas Conquistas
            </h3>
            <div class="achievements-grid">
              ${achievements.slice(-3).map(a => `
                <div class="achievement-badge" title="${a.description}">
                  <span class="achievement-badge__icon">${a.icon}</span>
                  <span class="achievement-badge__name">${a.name}</span>
                </div>
              `).join('')}
            </div>
            ${achievements.length > 3 ? `<a href="#all-achievements" class="dashboard-link">Ver todas ${achievements.length} conquistas</a>` : ''}
          </div>
        ` : ''}

        <!-- Mood Tracker Mini -->
        <div class="dashboard-section">
          <h3 class="dashboard-section__title">
            <i class="fas fa-smile"></i>
            Como você está hoje?
          </h3>
          <div class="mood-selector">
            ${[
              { value: 'great', icon: '😄', label: 'Ótimo' },
              { value: 'good', icon: '🙂', label: 'Bem' },
              { value: 'okay', icon: '😐', label: 'Mais ou menos' },
              { value: 'bad', icon: '😕', label: 'Mal' },
              { value: 'terrible', icon: '😢', label: 'Muito mal' }
            ].map(mood => `
              <button class="mood-option" data-mood="${mood.value}" title="${mood.label}">
                <span class="mood-option__icon">${mood.icon}</span>
                <span class="mood-option__label">${mood.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    this.attachEventListeners();
  }

  getStreakIcon() {
    const streak = this.stats?.streakDays || 0;
    if (streak >= 30) return '👑';
    if (streak >= 7) return '🏆';
    if (streak >= 3) return '🔥';
    return '⚡';
  }

  attachEventListeners() {
    // Mood selector
    const moodButtons = this.container.querySelectorAll('.mood-option');
    moodButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const mood = e.currentTarget.dataset.mood;
        
        // Visual feedback
        moodButtons.forEach(b => b.classList.remove('selected'));
        e.currentTarget.classList.add('selected');

        // Save mood
        if (this.uid) {
          await Stats.recordMood(this.uid, mood);
          if (window.Toast) {
            window.Toast.success('Humor registrado! 👍');
          }
        }
      });
    });

    // Check if mood already recorded today
    this.checkTodayMood();
  }

  async checkTodayMood() {
    if (!this.uid) return;
    
    const today = new Date().toISOString().split('T')[0];
    const moodHistory = this.stats?.moodHistory || [];
    const todayMood = moodHistory.find(m => m.date === today);

    if (todayMood) {
      const moodBtn = this.container.querySelector(`[data-mood="${todayMood.mood}"]`);
      if (moodBtn) {
        moodBtn.classList.add('selected');
      }
    }
  }

  async refresh() {
    if (this.uid) {
      Stats.clearCache();
      await this.init(this.uid);
    }
  }
}

// Create global function to initialize dashboard
window.initDashboard = function(containerId, uid) {
  const dashboard = new DashboardComponent(containerId);
  dashboard.init(uid);
  return dashboard;
};

// Export
export { DashboardComponent };
window.DashboardComponent = DashboardComponent;
