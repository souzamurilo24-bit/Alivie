/**
 * User Stats & Analytics System
 * Rastreamento de progresso, streaks e conquistas
 */

import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

class StatsManager {
  constructor() {
    this.cache = null;
    this.cacheExpiry = null;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get user stats from Firestore
   */
  async getStats(uid) {
    if (!uid) return null;

    // Check cache
    if (this.cache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
      return this.cache;
    }

    try {
      const docRef = doc(db, "userStats", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.cache = data;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        return data;
      } else {
        // Return default stats for new users
        const defaultStats = this.getDefaultStats();
        this.cache = defaultStats;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        return defaultStats;
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Default stats for new users
   */
  getDefaultStats() {
    return {
      totalActivitiesCompleted: 0,
      streakDays: 0,
      lastActivityDate: null,
      longestStreak: 0,
      weeklyProgress: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, // Sunday = 0
      moodHistory: [],
      achievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Record activity completion
   */
  async recordActivity(uid, activityId, mood = null) {
    if (!uid) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();

    try {
      const docRef = doc(db, "userStats", uid);
      const currentStats = await this.getStats(uid);

      // Check if this is first activity today
      const lastDate = currentStats?.lastActivityDate;
      const isNewDay = lastDate !== todayStr;

      // Calculate streak
      let newStreak = currentStats?.streakDays || 0;
      let longestStreak = currentStats?.longestStreak || 0;

      if (isNewDay) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          // Continued streak
          newStreak++;
        } else if (lastDate !== todayStr) {
          // Streak broken or first activity
          newStreak = 1;
        }

        // Update longest streak
        if (newStreak > longestStreak) {
          longestStreak = newStreak;
        }
      }

      // Prepare updates
      const updates = {
        totalActivitiesCompleted: increment(1),
        streakDays: newStreak,
        longestStreak: longestStreak,
        lastActivityDate: todayStr,
        [`weeklyProgress.${dayOfWeek}`]: increment(1),
        updatedAt: new Date().toISOString()
      };

      // Add mood if provided
      if (mood) {
        updates.moodHistory = [...(currentStats?.moodHistory || []), {
          date: todayStr,
          mood: mood,
          activityId: activityId
        }].slice(-30); // Keep last 30 entries
      }

      // Check for new achievements
      const newAchievements = this.checkAchievements({
        ...currentStats,
        totalActivitiesCompleted: (currentStats?.totalActivitiesCompleted || 0) + 1,
        streakDays: newStreak
      });

      if (newAchievements.length > 0) {
        const existingAchievements = currentStats?.achievements || [];
        updates.achievements = [...existingAchievements, ...newAchievements];

        // Show toast for new achievements
        newAchievements.forEach(achievement => {
          if (window.Toast) {
            setTimeout(() => {
              window.Toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`);
            }, 500);
          }
        });
      }

      // Save to Firestore
      await setDoc(docRef, updates, { merge: true });

      // Clear cache
      this.cache = null;
      this.cacheExpiry = null;

      return {
        streak: newStreak,
        longestStreak: longestStreak,
        newAchievements: newAchievements,
        isNewDay: isNewDay
      };

    } catch (error) {
      console.error("Error recording activity:", error);
      return null;
    }
  }

  /**
   * Record daily mood
   */
  async recordMood(uid, mood, note = "") {
    if (!uid) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    try {
      const docRef = doc(db, "userStats", uid);
      const currentStats = await this.getStats(uid);

      const moodEntry = {
        date: todayStr,
        mood: mood,
        note: note,
        timestamp: new Date().toISOString()
      };

      // Remove any existing mood for today
      const moodHistory = (currentStats?.moodHistory || []).filter(
        entry => entry.date !== todayStr
      );
      moodHistory.push(moodEntry);

      await setDoc(docRef, {
        moodHistory: moodHistory.slice(-30),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      this.cache = null;

      return true;
    } catch (error) {
      console.error("Error recording mood:", error);
      return false;
    }
  }

  /**
   * Get weekly progress data for charts
   */
  getWeeklyProgressData(stats) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const progress = stats?.weeklyProgress || {};

    return days.map((day, index) => ({
      day: day,
      value: progress[index] || 0
    }));
  }

  /**
   * Get mood trend (last 7 days)
   */
  getMoodTrend(stats) {
    const moodHistory = stats?.moodHistory || [];
    const last7Days = moodHistory.slice(-7);

    const moodValues = {
      'great': 5,
      'good': 4,
      'okay': 3,
      'bad': 2,
      'terrible': 1
    };

    return last7Days.map(entry => ({
      date: entry.date,
      mood: entry.mood,
      value: moodValues[entry.mood] || 3
    }));
  }

  /**
   * Check and award achievements
   */
  checkAchievements(stats) {
    const newAchievements = [];
    const existingIds = (stats?.achievements || []).map(a => a.id);

    const achievements = [
      {
        id: 'first-activity',
        name: 'Primeiro Passo',
        description: 'Complete sua primeira atividade',
        icon: '🎯',
        condition: () => stats.totalActivitiesCompleted >= 1
      },
      {
        id: 'five-activities',
        name: 'Começando Bem',
        description: 'Complete 5 atividades',
        icon: '🌟',
        condition: () => stats.totalActivitiesCompleted >= 5
      },
      {
        id: 'twenty-activities',
        name: 'Rotina Firmada',
        description: 'Complete 20 atividades',
        icon: '💪',
        condition: () => stats.totalActivitiesCompleted >= 20
      },
      {
        id: 'three-day-streak',
        name: 'Constância',
        description: 'Mantenha uma streak de 3 dias',
        icon: '🔥',
        condition: () => stats.streakDays >= 3
      },
      {
        id: 'seven-day-streak',
        name: 'Semana Perfeita',
        description: 'Mantenha uma streak de 7 dias',
        icon: '🏆',
        condition: () => stats.streakDays >= 7
      },
      {
        id: 'thirty-day-streak',
        name: 'Mês Incrível',
        description: 'Mantenha uma streak de 30 dias',
        icon: '👑',
        condition: () => stats.streakDays >= 30
      }
    ];

    achievements.forEach(achievement => {
      if (!existingIds.includes(achievement.id) && achievement.condition()) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    });

    return newAchievements;
  }

  /**
   * Get all available achievements with status
   */
  async getAllAchievements(uid) {
    const stats = await this.getStats(uid);
    const unlockedIds = (stats?.achievements || []).map(a => a.id);

    return [
      { id: 'first-activity', name: 'Primeiro Passo', description: 'Complete sua primeira atividade', icon: '🎯', unlocked: unlockedIds.includes('first-activity') },
      { id: 'five-activities', name: 'Começando Bem', description: 'Complete 5 atividades', icon: '🌟', unlocked: unlockedIds.includes('five-activities') },
      { id: 'twenty-activities', name: 'Rotina Firmada', description: 'Complete 20 atividades', icon: '💪', unlocked: unlockedIds.includes('twenty-activities') },
      { id: 'three-day-streak', name: 'Constância', description: 'Mantenha uma streak de 3 dias', icon: '🔥', unlocked: unlockedIds.includes('three-day-streak') },
      { id: 'seven-day-streak', name: 'Semana Perfeita', description: 'Mantenha uma streak de 7 dias', icon: '🏆', unlocked: unlockedIds.includes('seven-day-streak') },
      { id: 'thirty-day-streak', name: 'Mês Incrível', description: 'Mantenha uma streak de 30 dias', icon: '👑', unlocked: unlockedIds.includes('thirty-day-streak') }
    ];
  }

  /**
   * Reset weekly progress (call on Sunday night or Monday morning)
   */
  async resetWeeklyProgress(uid) {
    if (!uid) return;

    try {
      const docRef = doc(db, "userStats", uid);
      await setDoc(docRef, {
        weeklyProgress: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      this.cache = null;
      return true;
    } catch (error) {
      console.error("Error resetting weekly progress:", error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = null;
    this.cacheExpiry = null;
  }
}

// Create global instance
const Stats = new StatsManager();

// Export for module use
export { Stats, StatsManager };

// Make available globally
window.Stats = Stats;
