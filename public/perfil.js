// Profile page functionality - Server-side storage only (except theme)
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile.js loaded - DOM ready');
    
    // Get DOM elements
    const fullNameInput = document.getElementById('full-name');
    const profileNameSpan = document.getElementById('profile-name');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const routineFocusInput = document.getElementById('routine-focus');
    const themeToggle = document.getElementById('theme-toggle');
    const saveButton = document.querySelector('.form-actions .btn-primary');
    const cancelButton = document.querySelector('.form-actions .btn-ghost');
    
    console.log('Elements found:', {
        fullNameInput: !!fullNameInput,
        profileNameSpan: !!profileNameSpan,
        emailInput: !!emailInput,
        themeToggle: !!themeToggle
    });
    
    // ==========================================
    // NAME SYNC - Works immediately!
    // ==========================================
    function updateProfileName() {
        if (!fullNameInput || !profileNameSpan) return;
        
        const fullName = fullNameInput.value.trim();
        console.log('Updating name to:', fullName);
        
        if (fullName) {
            const firstName = fullName.split(' ')[0];
            profileNameSpan.textContent = firstName;
        } else {
            profileNameSpan.textContent = 'Usuário';
        }
    }
    
    // Initialize immediately
    updateProfileName();
    
    // Add listeners for real-time update
    if (fullNameInput) {
        fullNameInput.addEventListener('input', updateProfileName);
        fullNameInput.addEventListener('keyup', updateProfileName);
    }
    
    // ==========================================
    // LOAD PROFILE FROM SERVER (not localStorage)
    // ==========================================
    function loadProfileFromServer() {
        if (!window.Auth || !window.Auth.api) {
            console.log('Auth not available, skipping server load');
            return;
        }
        
        console.log('Loading profile from server...');
        window.Auth.api('/api/profile', { method: 'GET' })
            .then(function(res) {
                if (res.ok && res.body && res.body.profile) {
                    const profile = res.body.profile;
                    console.log('Profile loaded from server:', profile);
                    
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
                        // Also save theme preference locally
                        localStorage.setItem('theme', 'dark');
                    } else if (themeToggle && profile.theme === 'light') {
                        themeToggle.checked = false;
                        document.documentElement.removeAttribute('data-theme');
                        localStorage.setItem('theme', 'light');
                    }
                    
                    // Update name display
                    updateProfileName();
                } else {
                    console.log('No profile found on server or error:', res.body);
                }
            })
            .catch(function(err) {
                console.error('Error loading profile from server:', err);
            });
    }
    
    // ==========================================
    // SAVE FUNCTIONALITY - Saves to SERVER ONLY
    // ==========================================
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save clicked - saving to server');
            
            // Get all values
            const profileData = {
                fullName: fullNameInput ? fullNameInput.value.trim() : '',
                username: usernameInput ? usernameInput.value.trim() : '',
                routineFocus: routineFocusInput ? routineFocusInput.value : '',
                theme: themeToggle && themeToggle.checked ? 'dark' : 'light'
            };
            
            console.log('Saving profile to server:', profileData);
            
            // Save to server
            if (window.Auth && window.Auth.api) {
                window.Auth.api('/api/profile', {
                    method: 'POST',
                    body: JSON.stringify(profileData)
                }).then(function(res) {
                    console.log('Server response:', res);
                    console.log('Response status:', res.status);
                    console.log('Response body:', res.body);
                    if (res.ok) {
                        showNotification('Alterações salvas com sucesso!', 'success');
                        // Save theme preference locally (UI preference only)
                        if (themeToggle) {
                            localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
                        }
                    } else {
                        console.error('Server error:', res.body);
                        console.error('Response not ok, status:', res.status);
                        showNotification('Erro ao salvar. Tente novamente.', 'error');
                    }
                    updateProfileName();
                }).catch(function(err) {
                    console.error('Server save failed:', err);
                    console.error('Error details:', err.message || err);
                    showNotification('Erro de conexão. Tente novamente.', 'error');
                });
            } else {
                showNotification('Erro: sistema de autenticação não disponível', 'error');
            }
        });
    }
    
    // Cancel button
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
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
        // Load theme from localStorage (UI preference only)
        const savedTheme = localStorage.getItem('theme');
        console.log('Saved theme from localStorage:', savedTheme);
        if (savedTheme === 'dark') {
            themeToggle.checked = true;
            document.documentElement.setAttribute('data-theme', 'dark');
            console.log('Applied dark theme');
        }
        
        function updateTheme() {
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
        }
        
        // Listen for change event on checkbox
        themeToggle.addEventListener('change', updateTheme);
        
        // Also listen for clicks on the wrapper as backup
        if (toggleSwitch) {
            toggleSwitch.addEventListener('click', function(e) {
                console.log('Toggle switch clicked');
                // Toggle the checkbox manually if click didn't hit it directly
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
    // Load user session email and then load profile from server
    setTimeout(function() {
        if (window.Auth && window.Auth.fetchSession) {
            window.Auth.fetchSession().then(function() {
                const session = window.Auth.getSession();
                if (session && session.email && emailInput) {
                    emailInput.value = session.email;
                    // Load profile from server after we have the session
                    loadProfileFromServer();
                }
            }).catch(function(err) {
                console.error('Session error:', err);
            });
        }
    }, 300);
});

// Notification function
function showNotification(message, type) {
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
    
    requestAnimationFrame(function() {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(function() {
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, 3000);
}
