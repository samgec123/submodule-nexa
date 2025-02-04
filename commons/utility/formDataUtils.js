import { toCamelCase } from '../scripts/aem.js';

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
  fetchSfFormData: async (formType, prefix = 'default') => {
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
            item.nonEditable = data.nonEditable;
            formDataConfig[name] = item;
          });
        return formDataConfig;
      } catch (error) {
        return {};
      }
    };
    try {
      const formData = await getFormData(`${prefix === 'default' ? '' : prefix}/loan-application-sf/common-fields.json`);
      const specificFormData = await getFormData(`${prefix === 'default' ? '' : prefix}/loan-application-sf/${formType}.json`);
      Object.keys(specificFormData).forEach((item) => {
        formData[item] = specificFormData[item];
      });
      return formData;
    } catch (error) {
      return {};
    }
  },
  fetchBankFieldMap: async (formType, prefix = 'default') => {
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
            item.yes = data.yes;
            item.mahindra = data.mahindra;
            item.chola = data.chola;
            item.au = data.au;
            item.indus = data.indus;
            item.kotak = data.kotak;
            item.bob = data.bob;
            item.axis = data.axis;
            item.sbi = data.sbi;
            item.hdb = data.hdb;
            item.sundram = data.sundram;
            item.toyota = data.toyota;
            item.ubi = data.ubi;
            item.pnb = data.pnb;
            item.boi = data.boi;
            item.idbi = data.idbi;
            item.bajaj = data.bajaj;
            item.uco = data.uco;
            item.canara = data.canara;
            item.central = data.central;
            item.bom = data.bom;
            item.federal = data.federal;
            item.indian = data.indian;
            formDataConfig[name] = item;
          });
        return formDataConfig;
      } catch (error) {
        return {};
      }
    };
    try {
      const formData = await getFormData(`${prefix === 'default' ? '' : prefix}/loan-application-sf/${formType}.json`);
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
        ${isRequired && !isReadOnly ? '<span class="required"><sup>*</sup></span>' : ''}
      </label>
    `;
  },

  createLabelAndPlaceholder: (
    data,
    className,
    isRequired,
    style,
    isReadOnly = false,
  ) => {
    const { id, label, placeholderText } = data ?? {};
    const result = {};
    if (!label || style === 'no-label' || style === 'primary') {
      result.placeholder = placeholderText + (isRequired && !isReadOnly ? '*' : '');
      result.label = '';
      return result;
    }
    result.placeholder = placeholderText;
    result.label = formDataUtils.createLabel(
      label,
      id,
      className,
      isRequired,
      isReadOnly,
    );
    return result;
  },

  createAttributesString: (attributes) => {
    let attributesString = '';
    Object.keys(attributes).forEach((key) => {
      if (typeof attributes[key] === 'boolean' && attributes[key]) {
        attributesString += `${key} `;
      } else {
        attributesString += `${key}="${attributes[key]}" `;
      }
    });
    return attributesString.trim();
  },

  getPlaceholderText: (placeholder, isRequired) => ((isRequired) ? `${placeholder}*` : placeholder),

  getDisclaimer: (
    data,
    layout = 'line',
    className = 'half-width',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      label = '',
    } = data || {};

    const arr = label.split(':');
    let disclaimerHeading = '';
    let disclaimerText = '';
    if (arr.length > 1) {
      [disclaimerHeading, disclaimerText] = arr;
    } else {
      disclaimerText = label;
    }
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-disclaimer ${className} form-field ${style ? `disclaimer-${style}` : ''}">
        <div class="form-disclaimer-item ${layout === 'line' ? 'sameline' : 'newline'} ${className}">
          <label class="form-disclaimer-label">
            <input type="checkbox" name="${id}" value="true" aria-labelledby="${id}-label" required ${attributeString}/>
            <p class="form-disclaimer-text">${disclaimerHeading ? `<strong>${disclaimerHeading}:</strong>` : ''}${disclaimerText}</p>
          </label>
        </div>
      </div>
    `;
  },

  createDropdown: (
    data,
    className = 'half-width',
    hasPlaceholder = true,
    attributes = {},
    style = '',
    prefix,
  ) => {
    const {
      id,
      name,
      value = [],
      requiredMessage = '',
      validationMessage = '',
      nonEditable
    } = data || {};

    const optionsHtml = value
      .map((item) => {
        const [optionText, optionValue] = item.split(':');
        return `<option value="${optionValue}">${optionText}</option>`;
      })
      .join('');

    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-dropdown-label',
      requiredMessage !== '',
      style,
    );
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-dropdown ${className} form-field ${style ? `dropdown-${style}` : ''}">
        ${labelObj.label}
        <select class="form-dropdown-select" id="${prefix ? prefix+'-'+id : id}" name="${name}" aria-labelledby="${id}-label" ${requiredMessage ? 'required=true' : ''} ${attributeString} ${nonEditable === 'Y' ? 'disabled=true' : ''}>
          ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
          ${optionsHtml}
        </select>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="validation-text validation-pattern">${validationMessage}</span>` : ''}
      </div>
    `;
  },

  createDropdownFromArray: (
    data,
    optionsArray,
    className = 'half-width',
    bindingClass = '',
    hasPlaceholder = true,
    attributes = {},
    style = '',
    isLabel = true,
  ) => {
    const {
      id,
      requiredMessage = '',
    } = data || {};

    const optionsHtml = optionsArray
      .map((item) => {
        const [text, value] = item.split(':');
        return { text, value };
      })
      .sort((a, b) => a.text.localeCompare(b.text))
      .map(({ text, value }) => `<option value="${value}">${text}</option>`)
      .join('');

    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-dropdown-label',
      requiredMessage !== '',
      style,
    );
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-dropdown ${className} form-field ${style ? `dropdown-${style}` : ''}">
        ${isLabel ? labelObj.label : ''}
        <select class="form-dropdown-select ${bindingClass}" id="${id}" name="${id}" aria-labelledby="${id}-label" ${requiredMessage ? 'required=true' : ''} ${attributeString}>
          ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
          ${optionsHtml}
        </select>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
      </div>
    `;
  },

  createEmptyDropdown: (
    data,
    className = 'half-width',
    bindingClass = '',
    hasPlaceholder = true,
    attributes = {},
    style = '',
    isLabel = true,
  ) => {
    const {
      id,
      requiredMessage = '',
    } = data || {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-dropdown-label',
      requiredMessage !== '',
      style,
    );
    const attributeString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-dropdown ${className} form-field ${style ? `dropdown-${style}` : ''}">
        ${isLabel ? labelObj.label : ''}
        <select class="form-dropdown-select ${bindingClass}" id="${id}" name="${id}" aria-labelledby="${id}-label"
          ${hasPlaceholder ? `data-placeholder="${labelObj.placeholder}"` : ''}
          ${requiredMessage ? 'required=true' : ''}
          ${attributeString}>
          ${hasPlaceholder ? `<option value="" disabled selected>${labelObj.placeholder}</option>` : ''}
        </select>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
      </div>
    `;
  },

  createRadioButtons: (
    data,
    layout = 'line',
    className = 'half-width',
    attributes = {},
    style = '',
    isSmartFinance = false,
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
        if (isSmartFinance) {
          return `
            <label class="form-radio-label radiobox ${optionText.toLowerCase() === 'transgender' ? 'transgender-gender' : ''}">
                <input type="radio" name="${id}" value="${optionValue}" aria-labelledby="${id}-label" ${requiredMessage ? 'required=true' : ''} ${attributesString}/>
                <span class="checkmark">
                  <span class="tick">
                      <div class="tick-icon"></div>
                  </span>
                  <div class="${optionText.toLowerCase()}"></div>
                  <span class="gName">${optionText}</span>
                </span>
            </label>
          `;
        }
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
           <label class="form-radio-label ${optionText.toLowerCase().replace(/\s+/g, '-')}">${optionText}</label>
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

    if (isSmartFinance) {
      return `
        <div class="form-radio ${className} form-field">
          ${labelHtml}
          <div>
            <div class="radioBtn">
              ${optionsHtml}
            </div>
            ${requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="form-radio ${className} form-field ${style ? `radio-${style}` : ''}">
        ${labelHtml}
        <div class="${isCustomRadio ? 'custom-' : ''}radio-container">${optionsHtml}</div>
      </div>
    `;
  },

  createButton: (
    data,
    className = 'half-width',
    btnClass = '',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      label = '',
      type = '',
      onClick = '',
      disabled = false,
      ariaLabel = '',
    } = data || {};

    const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-button ${className} form-field ${style ? `button-${style}` : ''}">
        <button
          id="${id}"
          class="${btnClass || className}"
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

  createTextArea: (
    data,
    className = 'half-width',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      requiredMessage = '',
      validationMessage = '',
      characterLimit = 4000,
    } = data || {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-textarea-label',
      requiredMessage !== '',
      style,
      attributes.readonly,
    );
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-textarea ${className} form-field ${style ? `textarea-${style}` : ''}">
        ${labelObj.label}
        <textarea id="${id}" name="${id}" placeholder="${labelObj.placeholder}" rows="4" aria-labelledby="${id}-label" ${attributesString}></textarea>
        ${requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="character-count" data-character-limit="${characterLimit}">${validationMessage}${characterLimit}</span>` : ''}
      </div>
    `;
  },

  createFileUpload: (
    data,
    className = 'half-width',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      label = '',
      requiredMessage,
      validationMessage,
    } = data || {};

    const fileSizeErrorMsg = validationMessage?.split(';')[1];

    const labelHtml = formDataUtils.createLabel(
      label,
      id,
      'form-file-upload-label',
      requiredMessage !== '',
    );
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="form-file-upload ${className} form-field ${style ? `file-upload-${style}` : ''}">
        ${labelHtml}
        <input type="file" id="${id}" name="${id}" data-validation-message="${validationMessage}" aria-labelledby="${id}-label" aria-describedby="${id}-errors" ${attributesString}/>
        <span id="${id}-errors" class="validation-text file-size-error" role="alert" aria-live="assertive" hidden>${fileSizeErrorMsg}</span>
      </div>
    `;
  },

  createOtpField: (
    data,
    optionalData = {},
    className = 'half-width',
    buttonId = 'send-otp-button',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      requiredMessage = '',
    } = data ?? {};

    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-data-label',
      requiredMessage !== '',
      style,
    );
    const attributesString = formDataUtils.createAttributesString(attributes);

    return `
      <div class="otp-container ${className} form-field ${style ? `otp-${style}` : ''} input-outlined">
        ${labelObj.label}
        <div class="otp-input">
          <input ${optionalData.isDisabled ? 'disabled' : ''} type="text" id="${id}" name="${id}" placeholder="${labelObj.placeholder}" aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} ${attributesString}/>
          <button type="button" id="${buttonId}" class="otp-button ${optionalData.isDisabled ? 'hideDiv' : ''}">Send OTP</button>
        </div>
        ${requiredMessage ? `<span class="validation-text">${requiredMessage}</span>` : ''}
      </div>
    `;
  },

  createInputField: (
    data,
    className = 'half-width',
    type = 'text',
    attributes = {},
    style = '',
    inputClassName = '',
    optionalData = {},
    prefix,
  ) => {
    const {
      id,
      name,
      requiredMessage = '',
      validationMessage = '',
      nonEditable
    } = data ?? {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const isInnerTextBtn = optionalData.isInnerText;
    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-data-label',
      requiredMessage !== '',
      style,
      attributes.readonly,
    );

    return `
      <div class="form-input ${className} form-field ${style ? `input-${style}` : ''}">
        ${labelObj.label}
        <input class="${inputClassName}" type="${type}" id="${prefix ? prefix+'-'+id : id}" name="${name}" placeholder="${labelObj.placeholder}" ${attributesString} aria-labelledby="${id}-label" ${requiredMessage ? 'required=true' : ''} autocomplete="off" ${nonEditable === 'Y' && !prefix ? 'readonly' : ''}/>
        ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
        ${validationMessage ? `<span class="validation-text validation-pattern" id="${id}-validation">${validationMessage}</span>` : ''}
        ${isInnerTextBtn ? '<a href="javascript:void(0)" class="btn btn-otp" id="SendBTDOtpClk" >Send OTP</a>' : ''}
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
    if (remaining >= 0) {
      characterCountSpan.textContent = `${validationMessage} ${remaining}`;
    } else {
      characterCountSpan.textContent = `${validationMessage} 0`;
    }

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
  createCheckboxes: (data, layout = 'newline', className = 'half-width', attributes = {}) => {
    const {
      id,
      label = '',
      value = [],
    } = data || {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const optionsHtml = value
      .map((item) => {
        const [optionText, optionValue] = item.split(':');
        return `
        <div>
                <input type="checkbox" class="form-checkbox ${layout === 'line' ? 'sameline' : 'newline'} ${className}" id="${optionValue}" name="${optionValue}" value="${optionText}" ${attributesString}>
                <label for="${optionValue}">${optionText}</label>
                </div>
        `;
      })
      .join('');

    const labelHtml = formDataUtils.createLabel(label, id, 'form-checkbox-label');
    return `
      <div class="form-radio ${className} form-field">
        ${labelHtml}
        ${optionsHtml}
      </div>
    `;
  },
  createDobField: (data, className = 'half-width', attributes = {}, style = '', inputClassName = '') => {
    const {
      id,
      name,
      requiredMessage = '',
      validationMessage = '',
      nonEditable
    } = data ?? {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const labelObj = formDataUtils.createLabelAndPlaceholder(data, 'form-data-label', (requiredMessage !== ''), style, attributes.readonly);
    return `
      <div class="form-input ${className} form-field">
          <input class="${inputClassName} form-control" placeholder="${labelObj.placeholder}" type="date" ${attributesString} name="${name}" tabindex="17" ${nonEditable === 'Y' ? 'readonly' : ''} aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''} id="${id}">
          ${requiredMessage ? `<span class="validation-text validation-required">${requiredMessage}</span>` : ''}
          ${validationMessage ? `<span class="validation-text validation-pattern" id="${id}-validation">${validationMessage}</span>` : ''}
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
  createSearchField: (
    data,
    optionalData,
    actionClassName = '',
    className = 'half-width',
    type = 'text',
    attributes = {},
    style = '',
  ) => {
    const {
      id,
      name,
      requiredMessage = '',
      validationMessage = '',
    } = data ?? {};

    const attributesString = formDataUtils.createAttributesString(attributes);
    const labelObj = formDataUtils.createLabelAndPlaceholder(
      data,
      'form-data-label',
      requiredMessage !== '',
      style,
      attributes.readonly,
    );
    return `
      <div class="form-search ${className} form-field ${style ? `search-${style}` : ''
}">
        ${labelObj.label}
        <input type="${type}" id="${id}" name="${name}" placeholder="${labelObj.placeholder
}" ${attributesString} aria-labelledby="${id}-label" ${requiredMessage ? 'required' : ''
}  autocomplete="off" />
        ${optionalData?.isIconDiv ? '<span class="searchIcon"></span>' : ''}
        <a href="javascript:void(0)" class="search-action ${actionClassName}"></a>
        ${requiredMessage
    ? `<span class="validation-text validation-required">${requiredMessage}</span>`
    : ''
}
        ${validationMessage
    ? `<span class="validation-text validation-pattern" id="${id}-validation">${validationMessage}</span>`
    : ''
}
      </div>
    `;
  },
  toggleElementVisibility: (elementSelector, show) => {
    const element = document.querySelector(elementSelector);

    if (element) {
      element.style.display = show ? 'block' : 'none';
    } else {
      console.error(`Element with ID "${elementSelector}" not found.`);
    }
  },
  getAllFormValues: (formSelector) => {
    const form = document.querySelector(formSelector); // Select the first form on the page
    const formData = new FormData(form); // Create a FormData object for the form
    const formObject = {}; // Object to store the form data
    const bookingDate = form.querySelector('.date-box[data-date].selected');
    const bookingTimeSlot = form.querySelector(
      '.DealerTimeSlotVal.selectedDealer',
    );

    if (bookingDate) {
      formObject.TestDriveBookingDate = bookingDate.getAttribute('data-date');
    }

    if (bookingTimeSlot) {
      formObject.TestDriveBookingStartTime = bookingTimeSlot.getAttribute('data-start');
      formObject.TestDriveBookingEndTime = bookingTimeSlot.getAttribute('data-end');
    }

    formData.forEach((value, key) => {
      // Store each key-value pair in the formObject
      formObject[key] = value;
    });

    return formObject; // Return the form data object
  },
  resetFormData: (formSelector, excludeElements) => {
    const form = document.querySelector(`${formSelector} .formDiv`); // Select the form

    // Check if the form exists
    if (!form) {
      console.error('Form not found:', formSelector);
      return;
    }

    // Normalize the excludeElements to be a Set for faster lookups
    const excludeSet = new Set(excludeElements);

    // Convert HTMLCollection to Array and filter out excluded elements
    Array.from(form.elements).forEach((element) => {
      if (excludeSet.has(element.name) || excludeSet.has(element.id)) {
        return; // Skip excluded elements
      }

      switch (element.type) {
        case 'text':
        case 'email':
        case 'textarea':
        case 'tel':
          element.value = '';
          break;
        case 'select-one':
          element.selectedIndex = 0; // Reset to first option
          break;
        case 'radio':
          element.checked = false; // Uncheck all radio buttons
          break;
        case 'checkbox':
          element.checked = false; // Uncheck all checkboxes
          break;
        default:
          // Optionally handle other input types, if needed
          break;
      }
    });
  },
};

export default formDataUtils;
