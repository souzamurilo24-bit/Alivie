import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Profile page functionality - Firestore storage only (except theme)
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const fullNameInput = document.getElementById('full-name');
  const profileNameSpan = document.getElementById('profile-name');
  const emailInput = document.getElementById('email');
  const usernameInput = document.getElementById('username');
  const routineFocusInput = document.getElementById('routine-focus');
  const themeToggle = document.getElementById('theme-toggle');
  const saveButton = document.querySelector('.form-actions .btn-primary');
  const cancelButton = document.querySelector('.form-actions .btn-ghost');
  
  // ==========================================
  // NAME SYNC - Works immediately!
  // ==========================================
  const updateProfileName = () => {
    if (!fullNameInput || !profileNameSpan) return;
    
    const fullName = fullNameInput.value.trim();
    
    if (fullName) {
      const firstName = fullName.split(' ')[0];
      profileNameSpan.textContent = firstName;
    } else {
      profileNameSpan.textContent = 'Usuário';
    }
  };
  
  // Initialize immediately
  updateProfileName();
  
  // Add listeners for real-time update
  if (fullNameInput) {
    fullNameInput.addEventListener('input', updateProfileName);
    fullNameInput.addEventListener('keyup', updateProfileName);
  }
  
  // ==========================================
  // LOAD PROFILE FROM FIRESTORE
  // ==========================================
  const loadProfileFromFirestore = async () => {
    const session = window.Auth.getSession();
    if (!session?.uid) {
      return;
    }
    
    try {
      const docRef = doc(db, "profiles", session.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        
        // Fill form fields
        if (fullNameInput && profile.fullName) {
          fullNameInput.value = profile.fullName;
        }
        if (usernameInput && profile.username) {
          usernameInput.value = profile.username;
        }
        if (routineFocusInput && profile.routineFocus) {
          routineFocusInput.value = profile.routineFocus;
        }
        if (themeToggle && profile.theme === 'dark') {
          themeToggle.checked = true;
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else if (themeToggle && profile.theme === 'light') {
          themeToggle.checked = false;
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        }
        
        updateProfileName();
      }
    } catch (err) {
      console.error('Error loading profile from Firestore:', err);
    }
  };
  
  // ==========================================
  // SAVE FUNCTIONALITY - Saves to FIRESTORE
  // ==========================================
  if (saveButton) {
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const session = window.Auth.getSession();
      if (!session?.uid) {
        showNotification('Erro: usuário não autenticado', 'error');
        return;
      }
      
      const profileData = {
        fullName: fullNameInput?.value.trim() || '',
        username: usernameInput?.value.trim() || '',
        routineFocus: routineFocusInput?.value || '',
        theme: themeToggle?.checked ? 'dark' : 'light',
        email: session.email,
        updatedAt: new Date().toISOString()
      };
      
      try {
        const docRef = doc(db, "profiles", session.uid);
        await setDoc(docRef, profileData, { merge: true });
        showNotification('Alterações salvas com sucesso!', 'success');
        if (themeToggle) {
          localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
        }
        updateProfileName();
      } catch (err) {
        console.error('Error saving profile:', err);
        showNotification('Erro ao salvar. Tente novamente.', 'error');
      }
    });
  }
  
  // Cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.reload();
        });
    }
    
  // ==========================================
  // THEME TOGGLE - Only thing saved locally
  // ==========================================
  console.log('Theme toggle element:', themeToggle);
  const toggleSwitch = document.querySelector('.toggle-switch');
  console.log('Toggle switch wrapper:', toggleSwitch);
  
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    console.log('Saved theme from localStorage:', savedTheme);
    if (savedTheme === 'dark') {
      themeToggle.checked = true;
      document.documentElement.setAttribute('data-theme', 'dark');
      console.log('Applied dark theme');
    }
    
    const updateTheme = () => {
      console.log('Update theme called. Checked:', themeToggle.checked);
      if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        console.log('Set theme to dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        console.log('Set theme to light');
      }
    };
    
    themeToggle.addEventListener('change', updateTheme);
    
    if (toggleSwitch) {
      toggleSwitch.addEventListener('click', (e) => {
        console.log('Toggle switch clicked');
        if (e.target !== themeToggle) {
          themeToggle.checked = !themeToggle.checked;
          updateTheme();
        }
      });
    }
    
    console.log('Theme toggle event listeners attached');
  } else {
    console.error('Theme toggle element not found!');
  }
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  setTimeout(async () => {
    if (window.Auth?.fetchSession) {
      try {
        await window.Auth.fetchSession();
        const session = window.Auth.getSession();
        if (session?.email && emailInput) {
          emailInput.value = session.email;
          await loadProfileFromFirestore();
        }
      } catch (err) {
        console.error('Session error:', err);
      }
    }
  }, 300);
});

// Notification function - uses Toast system if available
const showNotification = (message, type = 'info') => {
  if (window.Toast) {
    window.Toast.show({ message, type });
  } else {
    // Fallback for when Toast is not loaded
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.textContent = message;
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '600',
      zIndex: '9999',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    notification.style.background = type === 'success' ? '#48bb78' : 
                                    type === 'error' ? '#e53e3e' : '#2c5282';
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.parentNode?.removeChild(notification);
      }, 300);
    }, 3000);
  }
};
