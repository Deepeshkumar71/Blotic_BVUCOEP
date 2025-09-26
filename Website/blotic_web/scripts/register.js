// Registration Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Form validation rules
    const validators = {
        fullName: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s]+$/,
            message: 'Full name must be at least 2 characters and contain only letters and spaces'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            required: true,
            pattern: /^[6-9]\d{9}$/,
            message: 'Please enter a valid 10-digit Indian mobile number'
        },
        password: {
            required: true,
            minLength: 8,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
        },
        confirmPassword: {
            required: true,
            message: 'Please confirm your password'
        },
        branch: {
            required: true,
            message: 'Please select your branch/department'
        },
        year: {
            required: true,
            message: 'Please select your year/batch'
        }
    };

    // Real-time validation
    Object.keys(validators).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldName));
            field.addEventListener('input', () => clearError(fieldName));
        }
    });
    
    // Add password confirmation validation
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (passwordField && confirmPasswordField) {
        const validatePasswordMatch = () => {
            if (confirmPasswordField.value && passwordField.value !== confirmPasswordField.value) {
                showError('confirmPassword', 'Passwords do not match');
            } else {
                clearError('confirmPassword');
            }
        };
        
        passwordField.addEventListener('input', validatePasswordMatch);
        confirmPasswordField.addEventListener('input', validatePasswordMatch);
    }

    // Form submission
    form.addEventListener('submit', handleSubmit);

    function validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const validator = validators[fieldName];
        const value = field.value.trim();
        
        // Clear previous error
        clearError(fieldName);
        
        // Required field check
        if (validator.required && !value) {
            showError(fieldName, `${getFieldLabel(fieldName)} is required`);
            return false;
        }
        
        // Skip other validations if field is empty and not required
        if (!value && !validator.required) {
            return true;
        }
        
        // Minimum length check
        if (validator.minLength && value.length < validator.minLength) {
            showError(fieldName, validator.message);
            return false;
        }
        
        // Pattern check
        if (validator.pattern && !validator.pattern.test(value)) {
            showError(fieldName, validator.message);
            return false;
        }
        
        return true;
    }

    function validateDomains() {
        const domains = document.querySelectorAll('input[name="domains"]:checked');
        return domains.length > 0;
    }

    function showError(fieldName, message) {
        const formGroup = document.getElementById(fieldName).closest('.form-group');
        const errorElement = document.getElementById(fieldName + 'Error');
        
        formGroup.classList.add('error');
        errorElement.textContent = message;
    }

    function clearError(fieldName) {
        const formGroup = document.getElementById(fieldName).closest('.form-group');
        const errorElement = document.getElementById(fieldName + 'Error');
        
        formGroup.classList.remove('error');
        errorElement.textContent = '';
    }

    function getFieldLabel(fieldName) {
        const field = document.getElementById(fieldName);
        const label = field.closest('.form-group').querySelector('label');
        return label.textContent.replace('*', '').trim();
    }

    function validateForm() {
        let isValid = true;
        
        // Validate all fields
        Object.keys(validators).forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });
        
        // Check if password and confirm password match
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        
        if (passwordField && confirmPasswordField && passwordField.value !== confirmPasswordField.value) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate domains (at least one required)
        if (!validateDomains()) {
            const domainsGroup = document.querySelector('input[name="domains"]').closest('.form-group');
            const errorElement = document.getElementById('domainsError');
            domainsGroup.classList.add('error');
            errorElement.textContent = 'Please select at least one domain of interest';
            isValid = false;
        } else {
            const domainsGroup = document.querySelector('input[name="domains"]').closest('.form-group');
            const errorElement = document.getElementById('domainsError');
            if (domainsGroup && errorElement) {
                domainsGroup.classList.remove('error');
                errorElement.textContent = '';
            }
        }
        
        return isValid;
    }

    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Collect regular form fields
        for (let [key, value] of formData.entries()) {
            // Skip confirmPassword as it's only for validation
            if (key !== 'domains' && key !== 'confirmPassword') {
                data[key] = value;
            }
        }
        
        // Collect domains separately (checkboxes)
        const domains = [];
        const domainCheckboxes = document.querySelectorAll('input[name="domains"]:checked');
        domainCheckboxes.forEach(checkbox => {
            domains.push(checkbox.value);
        });
        data.domains = domains;
        
        // Rename fullName to match backend
        if (data.fullName) {
            data.fullName = data.fullName;
        }
        
        // Rename phone to phoneNumber to match backend
        if (data.phone) {
            data.phoneNumber = data.phone;
            delete data.phone;
        }
        
        // Rename experience to match backend
        if (data.experience) {
            data.experience = data.experience;
        }
        
        return data;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(true);
        
        try {
            const formData = collectFormData();
            
            // Submit registration to backend
            const response = await submitRegistration(formData);
            
            // Show success message
            showSuccessMessage();
            form.reset();
            
        } catch (error) {
            console.error('Registration error:', error);
            // Show more detailed error message
            const errorMessage = error.message || 'Registration failed. Please try again later.';
            showNotification(errorMessage, 'error');
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(loading) {
        const formContainer = document.querySelector('.form-container');
        
        if (loading) {
            formContainer.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Submitting...</span>';
        } else {
            formContainer.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit Registration</span><i class="fas fa-arrow-right"></i>';
        }
    }

    function showSuccessMessage() {
        const successHTML = `
            <div class="success-message show">
                <h3>🎉 Registration Successful!</h3>
                <p>Welcome to BLOTIC! Your registration has been submitted successfully.</p>
                <p>You will receive a confirmation email shortly with next steps.</p>
            </div>
        `;
        
        const formContainer = document.querySelector('.form-container');
        formContainer.insertAdjacentHTML('afterbegin', successHTML);
        
        // Scroll to success message
        document.querySelector('.success-message').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        
        // Remove success message after 10 seconds
        setTimeout(() => {
            const successMsg = document.querySelector('.success-message');
            if (successMsg) {
                successMsg.remove();
            }
        }, 10000);
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#4CAF50'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Submit registration API call
    async function submitRegistration(data) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            // Check if response is ok
            if (!response.ok) {
                // Try to parse error response
                try {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || `Registration failed with status ${response.status}`);
                } catch (jsonError) {
                    // If JSON parsing fails, throw a generic error
                    if (jsonError instanceof SyntaxError) {
                        throw new Error(`Registration failed with status ${response.status}: ${response.statusText}`);
                    } else {
                        // Re-throw if it's not a JSON parsing error
                        throw jsonError;
                    }
                }
            }

            // Try to parse success response
            try {
                const result = await response.json();
                return result;
            } catch (jsonError) {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            // Re-throw network or other errors
            throw error;
        }
    }

    function generateRegistrationId() {
        return 'BLOTIC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);
});

// Utility function to get registration statistics (for admin purposes)
function getRegistrationStats() {
    const registrations = JSON.parse(localStorage.getItem('blotic_registrations') || '[]');
    
    const stats = {
        total: registrations.length,
        byYear: {},
        byBranch: {},
        byRole: {},
        byDomains: {},
        recent: registrations.slice(-10)
    };
    
    registrations.forEach(reg => {
        // Count by year
        stats.byYear[reg.year] = (stats.byYear[reg.year] || 0) + 1;
        
        // Count by branch
        stats.byBranch[reg.branch] = (stats.byBranch[reg.branch] || 0) + 1;
        
        // Count by role
        stats.byRole[reg.role] = (stats.byRole[reg.role] || 0) + 1;
        
        // Count domains
        if (reg.domains) {
            reg.domains.forEach(domain => {
                stats.byDomains[domain] = (stats.byDomains[domain] || 0) + 1;
            });
        }
    });
    
    return stats;
}