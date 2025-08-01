// Contact Form Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFormValidation();
});

/**
 * Initialize contact form functionality
 */
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const successMessage = document.getElementById('successMessage');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateContactForm()) {
            submitContactForm(contactForm, submitButton, successMessage);
        }
    });
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

/**
 * Validate the entire contact form
 */
function validateContactForm() {
    const form = document.getElementById('contactForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Validate individual form field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required.`;
    }
    
    // Specific validation based on field type
    if (value && !isValid !== false) {
        switch (fieldType) {
            case 'email':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'tel':
                if (!isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
                break;
                
            default:
                if (fieldName === 'message' && value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters long.';
                }
                break;
        }
    }
    
    // Update field styling and error message
    updateFieldValidation(field, isValid, errorMessage);
    
    return isValid;
}

/**
 * Update field validation styling and messages
 */
function updateFieldValidation(field, isValid, errorMessage) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (feedback) {
            feedback.textContent = '';
        }
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        if (feedback) {
            feedback.textContent = errorMessage;
        }
    }
}

/**
 * Submit contact form
 */
async function submitContactForm(form, submitButton, successMessage) {
    // Show loading state
    showLoadingState(submitButton);
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API call (replace with actual endpoint)
        await simulateFormSubmission(data);
        
        // Show success message
        showSuccessMessage(form, successMessage);
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Clear validation classes
        const inputs = form.querySelectorAll('.is-valid, .is-invalid');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage('There was an error sending your message. Please try again.');
    } finally {
        hideLoadingState(submitButton);
    }
}

/**
 * Show loading state on submit button
 */
function showLoadingState(button) {
    const submitText = button.querySelector('.submit-text');
    const submitSpinner = button.querySelector('.submit-spinner');
    const submitIcon = button.querySelector('.submit-icon');
    
    if (submitText) submitText.textContent = 'Sending...';
    if (submitSpinner) submitSpinner.classList.remove('d-none');
    if (submitIcon) submitIcon.classList.add('d-none');
    
    button.disabled = true;
}

/**
 * Hide loading state on submit button
 */
function hideLoadingState(button) {
    const submitText = button.querySelector('.submit-text');
    const submitSpinner = button.querySelector('.submit-spinner');
    const submitIcon = button.querySelector('.submit-icon');
    
    if (submitText) submitText.textContent = 'Send Message';
    if (submitSpinner) submitSpinner.classList.add('d-none');
    if (submitIcon) submitIcon.classList.remove('d-none');
    
    button.disabled = false;
}

/**
 * Show success message
 */
function showSuccessMessage(form, successMessage) {
    if (successMessage) {
        successMessage.classList.remove('d-none');
        form.style.display = 'none';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Reset form display after 10 seconds
        setTimeout(() => {
            successMessage.classList.add('d-none');
            form.style.display = 'block';
        }, 10000);
    }
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    // Create or update error alert
    let errorAlert = document.querySelector('.contact-error-alert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger contact-error-alert';
        errorAlert.setAttribute('role', 'alert');
        
        const contactForm = document.getElementById('contactForm');
        contactForm.parentNode.insertBefore(errorAlert, contactForm);
    }
    
    errorAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
                <h6 class="mb-1">Error</h6>
                <p class="mb-0">${message}</p>
            </div>
        </div>
    `;
    
    // Scroll to error message
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.remove();
    }, 5000);
}

/**
 * Initialize form validation with Bootstrap
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

/**
 * Utility functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Nigerian phone number patterns
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
}

/**
 * Simulate form submission (replace with actual API call)
 */
function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate success/failure
            if (Math.random() > 0.1) { // 90% success rate
                console.log('Form submitted:', data);
                resolve({ success: true, message: 'Message sent successfully' });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

/**
 * Character counter for textarea
 */
function initializeCharacterCounter() {
    const textareas = document.querySelectorAll('textarea[maxlength]');
    
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        const counter = document.createElement('div');
        counter.className = 'character-counter text-muted small mt-1';
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 50) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.remove('text-warning');
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    });
}

// Initialize character counter
document.addEventListener('DOMContentLoaded', initializeCharacterCounter);

/**
 * Auto-resize textarea
 */
function initializeAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        textarea.style.resize = 'none';
        textarea.style.overflow = 'hidden';
        
        const resize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };
        
        textarea.addEventListener('input', resize);
        resize(); // Initial resize
    });
}

// Initialize auto-resize
document.addEventListener('DOMContentLoaded', initializeAutoResize);