// Registration Form Functionality

let currentStep = 1;
const totalSteps = 4;
let formData = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeRegistrationForm();
    initializeUserTypeSelection();
    initializeFormValidation();
    initializeProgressIndicator();
});

/**
 * Initialize registration form functionality
 */
function initializeRegistrationForm() {
    const form = document.getElementById('registrationForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCurrentStep()) {
            submitRegistration();
        }
    });
    
    // Initialize step navigation
    updateStepDisplay();
    updateNavigationButtons();
}

/**
 * Initialize user type selection
 */
function initializeUserTypeSelection() {
    const userTypeCards = document.querySelectorAll('.user-type-card');
    const userTypeInput = document.getElementById('userType');
    
    userTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.dataset.type;
            selectUserType(type);
        });
    });
}

/**
 * Select user type and update form
 */
function selectUserType(type) {
    const userTypeInput = document.getElementById('userType');
    const userTypeCards = document.querySelectorAll('.user-type-option');
    const step2Title = document.getElementById('step2Title');
    const individualFields = document.getElementById('individualFields');
    const organizationFields = document.getElementById('organizationFields');
    
    // Update hidden input
    userTypeInput.value = type;
    
    // Update card selection
    userTypeCards.forEach(card => card.classList.remove('selected'));
    const selectedCard = document.querySelector(`[data-type="${type}"] .user-type-option`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update step 2 content
    if (type === 'individual') {
        step2Title.textContent = 'Personal Information';
        individualFields.style.display = 'block';
        organizationFields.style.display = 'none';
        toggleFieldRequirements('individual');
    } else if (type === 'organization') {
        step2Title.textContent = 'Organization Information';
        individualFields.style.display = 'none';
        organizationFields.style.display = 'block';
        toggleFieldRequirements('organization');
    }
    
    // Clear validation errors
    clearValidationErrors();
}

/**
 * Toggle field requirements based on user type
 */
function toggleFieldRequirements(type) {
    const individualInputs = document.querySelectorAll('#individualFields input, #individualFields select');
    const organizationInputs = document.querySelectorAll('#organizationFields input, #organizationFields select, #organizationFields textarea');
    
    if (type === 'individual') {
        individualInputs.forEach(input => input.setAttribute('required', ''));
        organizationInputs.forEach(input => input.removeAttribute('required'));
    } else {
        organizationInputs.forEach(input => input.setAttribute('required', ''));
        individualInputs.forEach(input => input.removeAttribute('required'));
    }
}

/**
 * Change form step
 */
function changeStep(direction) {
    if (direction === 1) {
        // Moving forward
        if (validateCurrentStep()) {
            saveCurrentStepData();
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepDisplay();
                updateNavigationButtons();
                updateProgressIndicator();
                
                if (currentStep === 4) {
                    populateReviewSection();
                }
            }
        }
    } else {
        // Moving backward
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
            updateNavigationButtons();
            updateProgressIndicator();
        }
    }
}

/**
 * Update step display
 */
function updateStepDisplay() {
    const steps = document.querySelectorAll('.form-step');
    const currentStepSpan = document.querySelector('.current-step');
    
    steps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    if (currentStepSpan) {
        currentStepSpan.textContent = currentStep;
    }
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    if (currentStep === 1) {
        prevBtn.style.visibility = 'hidden';
    } else {
        prevBtn.style.visibility = 'visible';
    }
    
    // Next/Submit button
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

/**
 * Update progress indicator
 */
function updateProgressIndicator() {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepCircle = step.querySelector('.step-circle');
        const stepNumber_el = step.querySelector('.step-number');
        const stepCheck = step.querySelector('.step-check');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
            if (stepNumber_el) stepNumber_el.classList.add('d-none');
            if (stepCheck) stepCheck.classList.remove('d-none');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            if (stepNumber_el) stepNumber_el.classList.remove('d-none');
            if (stepCheck) stepCheck.classList.add('d-none');
        } else {
            step.classList.remove('active', 'completed');
            if (stepNumber_el) stepNumber_el.classList.remove('d-none');
            if (stepCheck) stepCheck.classList.add('d-none');
        }
    });
}

/**
 * Validate current step
 */
function validateCurrentStep() {
    const currentStepElement = document.querySelector('.form-step.active');
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    // Special validation for step 1 (user type)
    if (currentStep === 1) {
        const userType = document.getElementById('userType').value;
        const errorElement = document.getElementById('userTypeError');
        
        if (!userType) {
            errorElement.style.display = 'block';
            return false;
        } else {
            errorElement.style.display = 'none';
        }
    }
    
    // Validate required fields
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Special validation for step 3 (project details)
    if (currentStep === 3) {
        const projectDescription = document.getElementById('projectDescription');
        if (projectDescription.value.length < 100) {
            updateFieldValidation(projectDescription, false, 'Project description must be at least 100 characters.');
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required.`;
    }
    
    // Specific validation based on field type
    if (value && isValid) {
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
                
            case 'url':
                if (value && !isValidURL(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid URL.';
                }
                break;
        }
    }
    
    // Update field styling and error message
    updateFieldValidation(field, isValid, errorMessage);
    
    return isValid;
}

/**
 * Update field validation styling
 */
function updateFieldValidation(field, isValid, errorMessage) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        if (feedback) {
            feedback.textContent = errorMessage;
        }
    }
}

/**
 * Save current step data
 */
function saveCurrentStepData() {
    const currentStepElement = document.querySelector('.form-step.active');
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else {
            formData[input.name] = input.value;
        }
    });
}

/**
 * Populate review section
 */
function populateReviewSection() {
    const reviewContent = document.getElementById('reviewContent');
    const userType = formData.userType;
    
    let reviewHTML = '<div class="row g-4">';
    
    // User Type Section
    reviewHTML += `
        <div class="col-12">
            <div class="review-item">
                <div class="review-label">Registration Type</div>
                <div class="review-value">${userType.charAt(0).toUpperCase() + userType.slice(1)}</div>
            </div>
        </div>
    `;
    
    // Personal/Organization Information
    if (userType === 'individual') {
        reviewHTML += `
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Name</div>
                    <div class="review-value">${formData.firstName || ''} ${formData.lastName || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Email</div>
                    <div class="review-value">${formData.email || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Phone</div>
                    <div class="review-value">${formData.phone || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Profession</div>
                    <div class="review-value">${formData.profession || ''}</div>
                </div>
            </div>
        `;
    } else {
        reviewHTML += `
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Organization</div>
                    <div class="review-value">${formData.organizationName || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Type</div>
                    <div class="review-value">${formData.organizationType || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Contact Person</div>
                    <div class="review-value">${formData.contactPersonName || ''}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="review-item">
                    <div class="review-label">Email</div>
                    <div class="review-value">${formData.organizationEmail || ''}</div>
                </div>
            </div>
        `;
    }
    
    // Project Information
    reviewHTML += `
        <div class="col-12">
            <div class="review-item">
                <div class="review-label">Project Title</div>
                <div class="review-value">${formData.projectTitle || ''}</div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="review-item">
                <div class="review-label">Category</div>
                <div class="review-value">${formData.projectCategory || ''}</div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="review-item">
                <div class="review-label">Duration</div>
                <div class="review-value">${formData.projectDuration || ''}</div>
            </div>
        </div>
        <div class="col-12">
            <div class="review-item">
                <div class="review-label">Project Description</div>
                <div class="review-value">${formData.projectDescription || ''}</div>
            </div>
        </div>
    `;
    
    reviewHTML += '</div>';
    reviewContent.innerHTML = reviewHTML;
}

/**
 * Submit registration
 */
async function submitRegistration() {
    const submitButton = document.getElementById('submitBtn');
    const form = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    
    // Validate compliance checkboxes
    const complianceChecks = form.querySelectorAll('input[type="checkbox"][required]');
    let allChecked = true;
    
    complianceChecks.forEach(checkbox => {
        if (!checkbox.checked) {
            allChecked = false;
            updateFieldValidation(checkbox, false, 'This field is required.');
        } else {
            updateFieldValidation(checkbox, true, '');
        }
    });
    
    if (!allChecked) {
        return;
    }
    
    // Show loading state
    showLoadingState(submitButton);
    
    try {
        // Save final step data
        saveCurrentStepData();
        
        // Submit form data
        await simulateRegistrationSubmission(formData);
        
        // Show success message
        form.style.display = 'none';
        successMessage.classList.remove('d-none');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Registration submission error:', error);
        showErrorMessage('There was an error submitting your registration. Please try again.');
    } finally {
        hideLoadingState(submitButton);
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.getElementById('registrationForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                validateField(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
    const invalidFields = document.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    const errorElement = document.getElementById('userTypeError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Show loading state
 */
function showLoadingState(button) {
    const submitText = button.querySelector('.submit-text');
    const submitSpinner = button.querySelector('.submit-spinner');
    const submitIcon = button.querySelector('.submit-icon');
    
    if (submitText) submitText.textContent = 'Submitting...';
    if (submitSpinner) submitSpinner.classList.remove('d-none');
    if (submitIcon) submitIcon.classList.add('d-none');
    
    button.disabled = true;
}

/**
 * Hide loading state
 */
function hideLoadingState(button) {
    const submitText = button.querySelector('.submit-text');
    const submitSpinner = button.querySelector('.submit-spinner');
    const submitIcon = button.querySelector('.submit-icon');
    
    if (submitText) submitText.textContent = 'Submit Application';
    if (submitSpinner) submitSpinner.classList.add('d-none');
    if (submitIcon) submitIcon.classList.remove('d-none');
    
    button.disabled = false;
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    let errorAlert = document.querySelector('.registration-error-alert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger registration-error-alert';
        errorAlert.setAttribute('role', 'alert');
        
        const form = document.getElementById('registrationForm');
        form.parentNode.insertBefore(errorAlert, form);
    }
    
    errorAlert.innerHTML = `
        <div class="d-flex align-items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-3">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
                <h6 class="mb-1">Submission Error</h6>
                <p class="mb-0">${message}</p>
            </div>
        </div>
    `;
    
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        errorAlert.remove();
    }, 8000);
}

/**
 * Utility functions
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    return field.name.charAt(0).toUpperCase() + field.name.slice(1);
}

/**
 * Simulate registration submission
 */
function simulateRegistrationSubmission(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.05) { // 95% success rate
                console.log('Registration submitted:', data);
                resolve({ success: true, id: 'APP-' + Date.now() });
            } else {
                reject(new Error('Submission failed'));
            }
        }, 3000);
    });
}

// Make changeStep function globally available
window.changeStep = changeStep;