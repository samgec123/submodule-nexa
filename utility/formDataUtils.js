import { toCamelCase } from '../commons/scripts/aem.js';

const formDataUtils = {
  fetchFormData: async (formType, prefix = 'default') => {
    const getFormData = async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          return {};
        }
        const json = await res.json();
        const formDataConfig = {};
        json.data
          .filter((data) => data.id)
          .forEach((data) => {
            const name = toCamelCase(data.id);
            const item = {};
            item.id = data.id;
            item.name = name;
            item.label = data.label;
            item.placeholderText = data.placeholderText;
            item.requiredMessage = data.requiredMessage;
            item.validationMessage = data.validationMessage;
            item.value = data.value?.split(',') || [];
            formDataConfig[name] = item;
          });
        return formDataConfig;
      } catch (error) {
        return {};
      }
    };
    try {
      const formData = await getFormData(`${prefix === 'default' ? '' : prefix}/form-data.json`);
      const specificFormData = await getFormData(`${prefix === 'default' ? '' : prefix}/${formType}.json`);
      Object.keys(specificFormData).forEach((item) => {
        formData[item] = specificFormData[item];
      });
      return formData;
    } catch (error) {
      return {};
    }
  },

  createLabel: (label, id, className, isRequired, isReadOnly = false) => {
    if (!label) {
      return '';
    }
    return `
      <label class="${className}" for="${id}" id="${id}-label">
        ${label}
        ${(isRequired && !isReadOnly) ? '<span class="required"><sup>*</sup></span>' : ''}
      </label>
    `;
  },

  createLabelAndPlaceholder: (data, className, isRequired, style, isReadOnly = false) => {
    const {
      id,
      label,
      placeholderText,
    } = data;
    const result = {};
    if (!label || style === 'no-label') {
      result.placeholder = placeholderText + ((isRequired && !isReadOnly) ? '*' : '');
      result.label = '';
      return result;
    }
    result.placeholder = placeholderText;
    result.label = formDataUtils.createLabel(label, id, className, isRequired, isReadOnly);
    return result;
  },

  createAttributesString: (attributes) => {
    let attributesString = '';
    Object.keys(attributes).forEach((key) => {
      if (typeof (attributes[key]) === typeof (true) && attributes[key]) {
        attributesString += `${key} `;
      } else {
        attributesString += `${key}="${attributes[key]}" `;
      }
    });
    return attributesString;
  },

  getPlaceholderText: (placeholder, isRequired) => ((isRequired) ? `${placeholder}*` : placeholder),

  getDisclaimer: (data, layout = 'line', className = 'half-width', attributes = {}, style = '') => {
    const {
      id,
      label = '',
    } = data || {};

    const [disclaimerHeading, disclaimerText] = label.split(':');
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
        <div class="form-disclaimer ${className} form-field ${(style) ? `disclaimer-${style}` : ''}">
          <div class="form-disclaimer-item ${layout === 'line' ? 'sameline' : 'newline'} ${className}">
            <label class="form-disclaimer-label">
                <input type="checkbox" name="${id}" value="true" aria-labelledby="${id}-label" required ${attributeString}/>
                <p class="form-disclaimer-text"><strong>${disclaimerHeading}:</strong>${disclaimerText}</p>
            </label>
          </div>
        </div>
      `;
  },

  createDropdown: (data, className = 'half-width', hasPlaceholder = true, attributes = {}, style = '') => {
    const {
      id,
      name,
      value = [],
      requiredMessage = '',
      validationMessage = '',
    } = data || {};

    const optionsHtml = value
      .map((item) => {
        const [optionText, optionValue] = item.split(':');
        return `<option value="${optionValue}">${optionText}</option>`;
      })
      .join('');

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-dropdown-label', (requiredMessage !== ''), style);
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-dropdown ${className} form-field ${(style) ? `dropdown-${style}` : ''}">
        ${labelObj.label}
        <select class="form-dropdown-select" id="${id}" name="${name}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributeString}>
          ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
          ${optionsHtml}
        </select>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="validation-text validation-pattern">${validationMessage}</span>` : ''}
      </div>
    `;
  },

  createDropdownFromArray: (data, optionsArray, className = 'half-width', bindingClass = '', hasPlaceholder = true, attributes = {}, style = '',sortArray=true, type= 'default') => {
    const {
      id,
      requiredMessage = '',
    } = data || {};

    const optionsHtml = optionsArray
      .map((item) => {
        const [text, value] = item.split(':');
        return { text, value };
      })
      .sort((a, b) => (sortArray ? a.text.localeCompare(b.text) : 0)) // Conditionally sort
      .map(({ text, value }) => `<option value="${value}" draggable="false">${text}</option>`)
      .join('');

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-dropdown-label', (requiredMessage !== ''), style);
    const attributeString = formDataUtils.createAttributesString(attributes);

    if(type === 'custom'){
      return `
      <div class="form-dropdown ${className} form-field ${(style) ? `dropdown-${style}` : ''}" id="${id}-div">
        <custom-select class="form-dropdown-select ${bindingClass}" id="${id}" name="${id}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributeString}>
          <div class="selected-option" id="${id}-selected">${hasPlaceholder ? labelObj.placeholder : ''}</div>
          <div class="dropdown-options" id="${id}-options">${optionsHtml}</div>          
        </custom-select>
        ${requiredMessage ? `<span class="validation-text validation-required" id="${id}-validation-message">${requiredMessage}</span>` : ''}
      </div>
    `;
    }
    else{
      return `
      <div class="form-dropdown ${className} form-field ${(style) ? `dropdown-${style}` : ''}">
        ${labelObj.label}
        <select class="form-dropdown-select ${bindingClass}" id="${id}" name="${id}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributeString}>
          ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
          ${optionsHtml}
        </select>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
      </div>
    `;
    }
  },

  createEmptyDropdown: (data, className = 'half-width', bindingClass = '', hasPlaceholder = true, attributes = {}, style = '') => {
    const {
      id,
      requiredMessage = '',
    } = data || {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-dropdown-label', (requiredMessage !== ''), style);
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
       <div class="form-dropdown ${className} form-field ${(style) ? `dropdown-${style}` : ''}">
           ${labelObj.label}
           <select class="form-dropdown-select ${bindingClass}" id="${id}" name="${id}" aria-labelledby="${id}-label"
               ${hasPlaceholder ? `data-placeholder="${labelObj.placeholder}"` : ''}
               ${requiredMessage ? 'required' : ''}
               ${attributeString}>
               ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
           </select>
           ${requiredMessage ? `<span class="validation-text  validation-required">${requiredMessage}</span>` : ''}
       </div>
   `;
  },

  createRadioButtons: (
    data,
    layout = 'line',
    className = 'half-width',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      label = '',
      requiredMessage = '',
      value = [],
    } = data || {};

    let isCustomRadio = false;
    if (data.name === 'transmission' || data.name === 'testDriveAt') {
      isCustomRadio = true;
    }

    const attributesString = formDataUtils.createAttributesString(attributes);
    const optionsHtml = value
      .map((item, index) => {
        const [optionText, optionValue] = item.split(':');
        const isFirst = index === 0;
        if (!isCustomRadio) {
          return `
            <div class="form-radio-item ${layout === 'line' ? 'sameline' : 'newline'} ${className}">
              <label class="form-radio-label">
                  ${optionText}
                  <input type="radio" name="${id}" value="${optionValue}" aria-labelledby="${id}-label" ${isFirst && requiredMessage ? 'required=true' : ''} ${attributesString}/>
              </label>
              ${isFirst && requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
            </div>
          `;
        }
        return `
          <div class="form-radio-item ${layout === 'line' ? 'sameline' : 'newline'} ${className} customRadio">
           <input type="radio" name="${id}" ${isFirst ? 'checked' : ''} value="${optionValue}" id="${optionText}" aria-labelledby="${id}-label" ${isFirst && requiredMessage ? 'required' : ''} ${attributesString}/>
           <label for="${optionText}" class="form-radio-label ${optionText.toLowerCase().replace(/\s+/g, '-')}">${optionText}</label>
            ${isFirst && requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
          </div>
        `;
      })
      .join('');

    const labelHtml = formDataUtils.createLabel(
      label,
      id,
      'form-radio-group-label',
      requiredMessage !== '',
    );

    return `
      <div class="form-radio ${className} form-field ${style ? `radio-${style}` : ''}">
        ${labelHtml}
        <div class="${isCustomRadio ? 'custom-' : ''}radio-container">${optionsHtml}</div>
      </div>
    `;
  },

  createCheckboxes: (data, layout = 'line', className = 'half-width', attributes = {}, style = '') => {
    const {
      id,
      label = '',
      requiredMessage = '',
      value = [],
    } = data || {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const optionsHtml = value
      .map((item, index) => {
        const [optionText, optionValue] = item.split(':');
        const isFirst = index === 0;
        return `
          <div class="form-checkbox-item ${layout === 'line' ? 'sameline' : 'newline'} ${className}">
            <label class="form-checkbox-label">
                ${optionText}
                <input type="checkbox" name="${id}" value="${optionValue}" aria-labelledby="${id}-label" ${isFirst && requiredMessage ? 'required' : ''} ${attributesString}/>
            </label>
            ${isFirst && requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
          </div>
        `;
      })
      .join('');

    const labelHtml = formDataUtils.createLabel(label, id, 'form-checkbox-group-label', (requiredMessage !== ''));
    return `
      <div class="form-checkbox ${className} form-field ${(style) ? `checkbox-${style}` : ''}">
        ${labelHtml}
        ${optionsHtml}
      </div>
    `;
  },

  createSendOtpField: (data, className = 'half-width', buttonId = 'send-otp-button', attributes = {}, style = '') => {
    const {
      id,
      requiredMessage = '',
    } = data ?? {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-data-label', (requiredMessage !== ''), style);
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
          <div class="otp-container ${className} form-field">
            ${labelObj.label}
            <div class="otp-input">
            <div class="otp-input-container">
              <input type="text" maxlength="1" class="otp-digit" aria-label="OTP digit 1" required>
              <input type="text" maxlength="1" class="otp-digit" aria-label="OTP digit 2" required>
              <input type="text" maxlength="1" class="otp-digit" aria-label="OTP digit 3" required>
              <input type="text" maxlength="1" class="otp-digit" aria-label="OTP digit 4" required>
              <input type="text" maxlength="1" class="otp-digit" aria-label="OTP digit 5" required>
            </div>

            <input type="text" id="${id}" name="${id}" placeholder="${labelObj.placeholder}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributesString} style="display: none;"/>
            <span type="button" id="${buttonId}" class="otp-button">Resend OTP</span>
            </div>
            ${requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
          </div>
        `;
  },

  createButton: (data, className = 'half-width', type = 'button', attributes = {}, style = '') => {
    const {
      id,
      label = '',
      onClick = '',
      disabled = false,
      ariaLabel = '',
    } = data || {};

    const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-button ${className} form-field ${(style) ? `button-${style}` : ''}">
        <button
          id="${id}"
          class="${className}"
          type="${type}"
          ${ariaLabelAttr}
          ${disabledAttr}
          ${onClick ? `onclick="${onClick}"` : ''}
          ${attributesString}
        >
          ${label}
        </button>
      </div>
    `;
  },

  createTextArea: (data, className = 'half-width', attributes = {}, style = '') => {
    const {
      id,
      requiredMessage = '',
      validationMessage = '',
      characterLimit = 4000,
    } = data || {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-textarea-label', (requiredMessage !== ''), style, attributes.readonly);
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-textarea ${className} form-field ${(style) ? `textarea-${style}` : ''}">
        ${labelObj.label}
        <textarea id="${id}" name="${id}" placeholder="${labelObj.placeholder}" rows="4" aria-labelledby="${id}-label" ${attributesString} ${requiredMessage ? 'required' : ''}></textarea>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="character-count" data-character-limit="${characterLimit}">${validationMessage}${characterLimit}</span>` : ''}
      </div>
    `;
  },

  createFileUpload: (data, className = 'half-width', attributes = {}, style = '') => {
    const {
      id,
      label = '',
      requiredMessage,
      validationMessage,
    } = data || {};

    const fileSizeErrorMsg = validationMessage?.split(';')[1];

    const labelHtml = formDataUtils.createLabel(label, id, 'form-file-upload-label', (requiredMessage !== ''));
    const attributesString = formDataUtils.createAttributesString(attributes);
    return `
          <div class="form-file-upload ${className} form-field ${(style) ? `file-upload-${style}` : ''}">
            ${labelHtml}
            <input type="file" id="${id}" name="${id}" data-validation-message="${validationMessage}" aria-labelledby="${id}-label" aria-describedby="${id}-errors" ${attributesString}/>
            <span id="${id}-errors" class="validation-text file-size-error" role="alert" aria-live="assertive" hidden>${fileSizeErrorMsg}</span>
          </div>
        `;
  },

  createOtpField: (data, className = 'half-width', buttonId = 'send-otp-button', attributes = {}, style = '') => {
    const {
      id,
      requiredMessage = '',
    } = data ?? {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-data-label', (requiredMessage !== ''), style);
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
        <div class="otp-container ${className} form-field ${(style) ? `otp-${style}` : ''}">
          ${labelObj.label}
          <div class="otp-input">
          <input type="text" id="${id}" name="${id}" placeholder="${labelObj.placeholder}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributesString}/>
          <button type="button" id="${buttonId}" class="otp-button">Send OTP</button>
           ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
          </div>
        </div>
      `;
  },

  createOtpInputs: (count = 5) => {
    const parent = document.createElement('div');
    parent.classList.add('otp-inputs', 'hidden');

    for (let i = 0; i < count; i += 1) {
      const input = `
          <div class='form-field form-input input-no-label'>
            <input type='text' maxlength='1' class='otp-input' data-otp-index=${i}></input>
          </div>`;
      parent.insertAdjacentHTML('beforeend', input);
    }

    return parent.outerHTML;
  },

  createInputField: (data, className = 'half-width', type = 'text', attributes = {}, style = '') => {
    const {
      id,
      name,
      requiredMessage = '',
      validationMessage = '',
    } = data ?? {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-data-label', (requiredMessage !== ''), style, attributes.readonly);
    return `
      <div class="form-input ${className} form-field ${(style) ? `input-${style}` : ''}">
        ${labelObj.label}
        <input type="${type}" id="${id}" name="${name}" placeholder="${labelObj.placeholder}" ${attributesString} aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''}  autocomplete="off" />
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="validation-text validation-pattern" id="${id}-validation">${validationMessage}</span>` : ''}
        ${name === 'pincode' ? '<span class="pincode-icon inner-detect-location__box_tab"></span>' : ''}
      </div>
    `;
  },

  validateInputField: (text, regex) => {
    const regexPattern = new RegExp(regex);
    return (!text.match(regexPattern));
  },

  validateDropdown: (text, options) => !(options.map((item) => item.split(':')[1]).includes(text)),

  toggleValidationMessage: (input, status) => {
    const span = input.closest('.form-field').querySelector('.validation-text.validation-pattern');
    const style = (status) ? 'block' : 'none';
    span.style.display = style;
  },

  restrictInputValue: (input, regex) => {
    const regexPattern = new RegExp(regex);
    input.value = regexPattern.exec(input.value);
  },

  validateFile: (fileInput, fileTypeErrorMsg, fileSizeErrorMsg, fileSizeErrorSpan) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    const maxSizeMB = 5;
    const file = fileInput?.files[0];

    if (!file) return;

    const fileTypeValid = validTypes.includes(file.type);
    const fileSizeValid = file.size <= maxSizeMB * 1024 * 1024;

    if (!fileTypeValid) {
      // eslint-disable-next-line
      alert(fileTypeErrorMsg);
      fileInput.value = '';
      fileSizeErrorSpan.hidden = true;
    } else if (!fileSizeValid) {
      fileSizeErrorSpan.textContent = fileSizeErrorMsg;
      fileSizeErrorSpan.hidden = false;
      fileInput.value = '';
    } else {
      fileSizeErrorSpan.hidden = true;
    }
  },

  updateCharacterCount: (textarea, characterCountSpan, maxLength, validationMessage) => {
    if (!textarea || !characterCountSpan) return;

    const currentLength = textarea.value.length;
    const remaining = maxLength - currentLength;
    // Show the validation message span after user starts typing
    if (currentLength > 0) {
      characterCountSpan.style.display = 'inline'; // Show the validation span
    } else {
      characterCountSpan.style.display = 'none'; // Hide if no input
    }

    // Update the span content with dynamic characters remaining part
    characterCountSpan.textContent = `${validationMessage} ${Math.max(remaining, 0)}`;

    if (currentLength > maxLength) {
      textarea.value = textarea.value.substring(0, maxLength);
      // eslint-disable-next-line
      alert(textarea.placeholder);
    }
  },

  toggleVisibility: (showComponents = [], hideComponents = []) => {
    hideComponents.forEach((component) => {
      if (component instanceof HTMLElement && !component.classList.contains('hidden')) {
        component?.classList?.add('hidden');
      }
    });

    showComponents.forEach((component) => {
      if (component instanceof HTMLElement && component.classList.contains('hidden')) {
        component?.classList?.remove('hidden');
      }
    });
  },
};

export default formDataUtils;
