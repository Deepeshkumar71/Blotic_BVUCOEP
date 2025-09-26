// Login Form Validation and Handling
class LoginSystem {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.loginBtn = document.getElementById('loginBtn');
        this.rememberMe = document.getElementById('rememberMe');
        
        this.initializeEventListeners();
        this.loadSavedCredentials();
    }

    initializeEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        // Password toggle
        this.passwordToggle.addEventListener('click', () => this.togglePassword());
        
        // Social login buttons
        document.querySelector('.google-btn').addEventListener('click', () => this.handleSocialLogin('google'));
        document.querySelector('.github-btn').addEventListener('click', () => this.handleSocialLogin('github'));
        
        // Remember credentials from localStorage
        this.rememberMe.addEventListener('change', () => this.handleRememberMe());
    }

    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'Email address is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Please enter a valid email address');
            return false;
        }
        
        this.clearError('email');
        return true;
    }

    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('password', 'Password must be at least 6 characters long');
            return false;
        }
        
        this.clearError('password');
        return true;
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field}Error`);
        const formGroup = errorElement.closest('.form-group');
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('error');
    }

    clearError(field) {
        const errorElement = document.getElementById(`${field}Error`);
        const formGroup = errorElement.closest('.form-group');
        
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        formGroup.classList.remove('error');
    }

    togglePassword() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.passwordToggle.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        
        try {
            const formData = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                rememberMe: this.rememberMe.checked
            };

            const response = await this.submitLogin(formData);
            
            if (response.success) {
                this.handleLoginSuccess(response);
            } else {
                this.handleLoginError(response.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.handleLoginError('Network error. Please check your connection and try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitLogin(formData) {
        try {
            // Updated to use actual backend API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Check if response is ok
            if (!response.ok) {
                // Try to parse error response
                try {
                    const errorResult = await response.json();
                    return {
                        success: false,
                        message: errorResult.message || `Login failed with status ${response.status}`
                    };
                } catch (jsonError) {
                    // If JSON parsing fails, return a generic error
                    if (jsonError instanceof SyntaxError) {
                        return {
                            success: false,
                            message: `Login failed with status ${response.status}: ${response.statusText}`
                        };
                    } else {
                        // Re-throw if it's not a JSON parsing error
                        throw jsonError;
                    }
                }
            }

            // Try to parse success response
            try {
                const data = await response.json();
                return {
                    success: true,
                    user: data.data.user,
                    token: data.data.token
                };
            } catch (jsonError) {
                return {
                    success: false,
                    message: 'Invalid response from server'
                };
            }

        } catch (error) {
            // Handle network or other errors
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }
    }

    verifyPassword(inputPassword, storedPassword) {
        // In a real application, this would verify hashed passwords
        // For demo purposes, we're using plain text comparison
        return inputPassword === storedPassword;
    }

    generateSessionToken() {
        return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    handleLoginSuccess(response) {
        // Store session data with proper token
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Handle remember me
        if (this.rememberMe.checked) {
            localStorage.setItem('rememberedEmail', this.emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Show success message
        this.showSuccessMessage('Login successful! Redirecting...');
        
        // Redirect to dashboard or home page
        setTimeout(() => {
            window.location.href = '../index.html'; // Change to dashboard when available
        }, 1000);
    }

    handleLoginError(message) {
        this.showError('password', message);
        
        // Clear password for security
        this.passwordInput.value = '';
    }

    showSuccessMessage(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add success notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #10b981, #059669);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.disabled = false;
        }
    }

    loadSavedCredentials() {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            this.emailInput.value = rememberedEmail;
            this.rememberMe.checked = true;
        }
    }

    handleRememberMe() {
        if (!this.rememberMe.checked) {
            localStorage.removeItem('rememberedEmail');
        }
    }

    async handleSocialLogin(provider) {
        console.log(`Social login with ${provider} - Feature coming soon!`);
        
        // Show coming soon message
        const notification = document.createElement('div');
        notification.className = 'info-notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }
}

// Session Management
class SessionManager {
    static isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true' && 
               localStorage.getItem('authToken') && 
               localStorage.getItem('currentUser');
    }
    
    static getCurrentUser() {
        if (this.isLoggedIn()) {
            return JSON.parse(localStorage.getItem('currentUser'));
        }
        return null;
    }
    
    static getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    static logout() {
        // Call logout API if needed
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        }).catch(err => console.log('Logout API call failed:', err));
        
        // Clear local storage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Add animation keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (SessionManager.isLoggedIn()) {
        window.location.href = '../index.html'; // Redirect to home if already logged in
        return;
    }
    
    // Initialize login form
    new LoginSystem();
});

// Export for use in other files
window.SessionManager = SessionManager;