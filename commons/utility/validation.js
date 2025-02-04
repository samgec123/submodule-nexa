// validation.js
import utility from './utility.js';

export const validationRules = {
  name: /^[a-zA-Z ]+$/,
  email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, // Email regex
  mobile: /^[6-9]\d{9}$/, // Phone: 10 digits
  otp: /^[0-9]\d$/, // 6 digit otp validation
  totalKms: /^[0-9]\d$/,
  select: /^.+$/, // Simple non-empty validation for select elements
  checkbox: /^.+$/, // Checkbox must be checked
  radio: /^.+$/, // At least one radio button must be checked
};

// Merge custom validation rules with the default ones
export function mergeValidationRules(customRules = {}) {
  return { ...validationRules, ...customRules };
}

export function restrictInvalidCharacters(event, element, rules) {
  const { value } = element;
  const fieldName = element.getAttribute('name');
  const allowedPattern = rules[fieldName];

  if (allowedPattern && !allowedPattern.test(value)) {
    event.preventDefault();

    // Dynamically build the replace pattern based on the allowed pattern
    let invalidCharsPattern;

    // For common patterns like alphabets, numbers, etc., adjust accordingly
    if (fieldName === 'name' || fieldName === 'nameFeedback') {
      // Allow only letters, apostrophes, spaces, and hyphens for name
      invalidCharsPattern = /[^a-zA-Z ]/g;
    } else if (fieldName === 'email') {
      // Allow only valid email characters
      invalidCharsPattern = /[^a-zA-Z0-9_.+-@]/g;
    } else if (fieldName === 'mobile' || fieldName === 'otp' || fieldName === 'totalKms') {
      // Allow only numbers for phone
      invalidCharsPattern = /[^0-9]/g;
    } else {
      // Default to removing all characters not matching the allowedPattern
      invalidCharsPattern = new RegExp(`[^${allowedPattern.source}]`, 'g');
    }

    // Replace invalid characters for the specific field based on its pattern
    element.value = value.replace(invalidCharsPattern, '');
  }
}

export function validateField(element, rules, skipHiddenCondition = false) {
  if (!skipHiddenCondition && (element.type === 'hidden' || !utility.isFieldVisible(element))) {
    return true; // Skip this element if hidden
  }
  const form = element.closest('form');
  const isCheckboxOrRadio = element.type === 'checkbox' || element.type === 'radio';
  const value = isCheckboxOrRadio
    ? form.querySelector(`[name="${element.name}"]:checked`)
    : element.value.trim();

  const fieldName = element.getAttribute('name');
  const isRequired = element.hasAttribute('required');
  const regex = rules[fieldName];

  const requiredMessage = element.type === 'radio'
    ? element.parentElement?.parentElement?.querySelector('.validation-required')
    : element.parentElement?.querySelector('.validation-required');
  const patternMessage = element.parentElement.querySelector('.validation-pattern');

  if (requiredMessage) requiredMessage.style.display = 'none';
  if (patternMessage) patternMessage.style.display = 'none';
  if (isCheckboxOrRadio) element.classList.remove('is-invalid');

  if (isRequired && (value === '' || !value)) {
    if (isCheckboxOrRadio) {
      element.classList.add('is-invalid');
    }
    if (requiredMessage) requiredMessage.style.display = skipHiddenCondition ? 'inline' : 'block';
    return false;
  }

  if (regex && !regex.test(value)) {
    if (patternMessage) patternMessage.style.display = skipHiddenCondition ? 'inline' : 'block';
    return false;
  }

  return true;
}

export function validateFormOnSubmit(form, rules, skipHiddenCondition) {
  let formIsValid = true;
  form.querySelectorAll('input, select, textarea').forEach((element) => {
    const isValid = validateField(element, rules, skipHiddenCondition);
    if (!isValid) {
      formIsValid = false;
    }
  });

  return formIsValid;
}

export function attachValidationListeners(form, rules, onSuccess, isSubmitEventRequired = true) {
  form.querySelectorAll('input, select, textarea').forEach((element) => {
    element.addEventListener('input', (event) => {
      if (
        element.type === 'text'
        || element.type === 'email'
        || element.type === 'tel'
      ) {
        restrictInvalidCharacters(event, element, rules);
      }
      validateField(element, rules);
    });
  });
  if (isSubmitEventRequired) {
    form.addEventListener('submit', (event) => {
      if (!validateFormOnSubmit(form, rules)) {
        event.preventDefault();
      } else {
        onSuccess(event);
      }
    });
  }
}

export function removeAllValidationText(form) {
  form.querySelectorAll('input, select, textarea').forEach((element) => {
    const isCheckboxOrRadio = element.type === 'checkbox' || element.type === 'radio';

    const requiredMessage = element.parentElement.querySelector(
      '.validation-required',
    );
    const patternMessage = element.parentElement.querySelector(
      '.validation-pattern',
    );

    if (requiredMessage) requiredMessage.style.display = 'none';
    if (patternMessage) patternMessage.style.display = 'none';
    if (isCheckboxOrRadio) element.classList.remove('is-invalid');
  });
}
