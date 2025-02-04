/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { hnodeAs, MultiStepFormContext } from './multi-step-form.js';
import Calendar from './calendar.js';
import DropDown from './dropdown.js';
import { openModal } from '../../../../blocks/modal/modal.js';
import { generatePAOffers } from '../../../utility/sfUtils.js';

function BasicUserDetailsStep({ config }) {
  const { intro, guidance, disclaimer, submitButton, modelSelectionLink } = config;
  const { formState, updateFormState, placeholders } = useContext(MultiStepFormContext);
  const [showError, setShowError] = useState(false);
  const [city, setCity] = useState('');
  const formRef = useRef();
  const cityRef = useRef(null);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);
  const [dob, setDOB] = useState('');
  const [dummyDOB, setDummyDOB] = useState('');
  const dobRef = useRef(null);
  const dropDownArrowRef = useRef(null);
  const isInitialRenderDOB = useRef(true);
  const isInitialRenderCity = useRef(true);

  useEffect(() => {
    const handleClick = (event) => {
      if ((cityRef.current && cityRef.current.contains(event.target))
          || event.target.className.includes('select-selection__arrow')
          || event.target.className.includes('city-arrow')) {
        if (dropdownRef.current) {
          dropdownRef.current.classList.toggle('active');
          dropDownArrowRef.current.classList.toggle('active');
          if(dropdownRef.current.classList.contains('active')){
            document.querySelector('.select-search__field').focus();
          }
        }
        if (calendarRef.current) {
          calendarRef.current.classList.remove('active');
        }
      } else if ((dobRef.current && dobRef.current.contains(event.target))
          || event.target.className.includes('fa-calendar')) {
        if (calendarRef.current) {
          calendarRef.current.classList.toggle('active');
        }
        if (dropdownRef.current) {
          dropdownRef.current.classList.remove('active');
          dropDownArrowRef.current.classList.remove('active');
        }
      } else if (calendarRef.current && calendarRef.current.contains(event.target)) {
        // do nothing
      } else if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        // do nothing
      } else {
        if (calendarRef.current) {
          calendarRef.current.classList.remove('active');
        }
        if (dropdownRef.current) {
          dropdownRef.current.classList.remove('active');
          dropDownArrowRef.current.classList.remove('active');
        }
      }
    };

    document.addEventListener('click', handleClick);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleLinkClick = async (e) => {
    e.preventDefault();
    await openModal(e.target.href);
  };

  // Add event listeners to links in disclaimer
  useEffect(() => {
    const disclaimerElement = document.querySelector('.basic-user-details-step-disclaimer');
    if (disclaimerElement) {
      const links = disclaimerElement.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', handleLinkClick);
      });
    }
    return () => {
      if (disclaimerElement) {
        const links = disclaimerElement.querySelectorAll('a');
        links.forEach((link) => {
          link.removeEventListener('click', handleLinkClick);
        });
      }
    };
  }, []);

  useEffect(()=>{
    if (isInitialRenderDOB.current) {
      // Skip the first execution
      isInitialRenderDOB.current = false;
      return;
    }
      handleBlur('dob', dob);

  },[dob])

  useEffect(()=>{
    if (isInitialRenderCity.current) {
      // Skip the first execution
      isInitialRenderCity.current = false;
      return;
    }
      handleBlur('city', city);
  },[city])

  const handleCitySelect = (selectedCity) => {
    if (dropdownRef.current) {
      dropdownRef.current.classList.remove('active');
    }
    setCity(selectedCity); // Set selected city to input field
  };

  const handleDOBSelect = (selectedDOB) => {
    document.querySelector('.date-container-dob').value = selectedDOB;
    setDummyDOB(selectedDOB);
    setDOB(selectedDOB);
    if (calendarRef.current) {
      calendarRef.current.classList.remove('active');
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const isValidName = (name) => {
    const namePattern = /^[A-Za-z\s]+$/; // Assuming a valid name only has letters and spaces
    return namePattern.test(name);
  };

  const isValidDOB = (dob)=>{
    const dobPattern = /^(29-02-(19|20)([02468][048]|[13579][26])|((0[1-9]|1[0-9]|2[0-8])-02-(19|20)\d{2})|((0[1-9]|[12][0-9]|3[01])-(0[13578]|1[02])-(19|20)\d{2})|((0[1-9]|[12][0-9]|30)-(0[469]|11)-(19|20)\d{2}))$/;
    return dobPattern.test(dob);
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();

    // Get form data from formRef
    const formEntries = Object.fromEntries([...new FormData(formRef.current)]);

    // Split the fullname into parts
    const fullName = formEntries.fullname?.trim() || '';
    const nameParts = fullName.split(/\s+/);

    let dateOfBirth = '';
    let emailData = '';

    // Process name splitting logic
    const [firstName, ...rest] = nameParts;
    let lastName = '';
    let middleName = '';

    if (rest.length === 1) {
      [lastName] = rest;
    } else if (rest.length >= 2) {
      [lastName, ...middleName] = [rest.pop(), rest.join(' ')];
    }

    // Extract email and date of birth with checks
    dateOfBirth = formEntries.dob;
    emailData = formEntries.email ? formEntries.email.trim() : '';

    // Add split names, email, and dob to formEntries
    formEntries.firstName = firstName;
    formEntries.middleName = middleName;
    formEntries.lastName = lastName;
    formEntries.dob = dateOfBirth;
    formEntries.email = emailData;

    // Validation logic for fields
    const errors = {
      fullname: !isValidName(formEntries.fullname),
      email: !isValidEmail(formEntries.email),
      dob: !isValidDOB(formEntries.dob),
      city: !formEntries.city,
      disclaimer: !formEntries.disclaimer,
    };

    // Show errors if any validation fails
    setShowError(errors);

    if (Object.values(errors).some((error) => error)) {
      return;
    }

    // Update form state with new values
    updateFormState((currentState) => ({ ...currentState, ...formEntries }));
    setShowError(false);

    // Store values in sessionStorage
    sessionStorage.setItem('firstName', firstName);
    sessionStorage.setItem('middleName', middleName);
    sessionStorage.setItem('lastName', lastName);
    sessionStorage.setItem('dob', dateOfBirth);
    sessionStorage.setItem('email', emailData);

    function removeSessionStorageItems(keys) {
      keys.forEach((key) => {
          sessionStorage.removeItem(key);
      });
    }

  const keysToRemove = ['applicantTypeId', 'employmentTypeId', 'enquiryId', 'model','registrationType',
  'salesType', 'selectedDealerCityCode', 'variant', 'temp-enquiryId'];
  removeSessionStorageItems(keysToRemove);

    // Store the full form data in sessionStorage
    sessionStorage.setItem(
      'userDetails',
      JSON.stringify({ ...formState, ...formEntries }),
    );

    async function callPAOffersOnLoad() {
      try {
        const mobile = sessionStorage.getItem('mobile');
        const dobValue = sessionStorage.getItem('dob');

        const response = await generatePAOffers(mobile, dobValue);

        if (response.success) {
          sessionStorage.setItem('temp-enquiryId', response.enquiry_id);
        }
        return { success: false, message: response.message };
      } catch (error) {
        return { success: false, error: '', details: error };
      }
    }

    // Call the function immediately
    callPAOffersOnLoad();

    // Redirect to the next page
    window.location.href = modelSelectionLink?.props?.children[0]?.props?.href;
  };
  const userFullName = document.querySelector('.limit-word');

  if (userFullName) {
    userFullName.addEventListener('input', () => {
        // Replace multiple spaces with a single space
        userFullName.value = userFullName.value.replace(/\s+/g, ' ');
        const words = userFullName.value.trim().split(' '); // Split by single space
        if (words.length > 4) {
            const truncated = words.slice(0, 4).join(' '); // Keep only the first 4 words
            userFullName.value = truncated;
        }
    });
}
const validateField = (field, value) => {
  switch (field) {
    case 'fullname':
      return isValidName(value) ? '' : 'Full name must only contain letters and spaces.';
    case 'email':
      return isValidEmail(value) ? '' : 'Enter a valid email address.';
    case 'dob':
      return isValidDOB(value) ? '' : 'Date of birth is required.';
    case 'city':
      return value ? '' : 'City selection is required.';
    default:
      return '';
  }
};

const handleBlur = (field, value) => {
  const error = validateField(field, value);
  setShowError((prevErrors) => ({ ...prevErrors, [field]: error }));
};

const handleInput = (field, e) => {
  let valid = true;
  // Clear error when the user starts typing
  if(field ==='fullname'){
    e.target.value = e.target.value.toUpperCase();
  }
  if(field ==='dob'){
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters

      // Ensure the date is padded dynamically and formatted correctly
      let day = '';
      let month = '';
      let year = '';

      if (value.length > 0) {
        day = value.slice(0, 2)
      }
      if (value.length > 2) {
        month = value.slice(2, 4)
      }
      if (value.length > 4) {
        year = value.slice(4, 8); // Year takes the remaining characters
      }

      // Build the formatted date
      const formattedDate = `${day}${month ? '-' + month : ''}${year ? '-' + year : ''}`;
      e.target.value = formattedDate;
      setDummyDOB(formattedDate);
      const error = validateField(field, formattedDate);
      if(error){
        valid= false;
        setShowError((prevErrors) => ({ ...prevErrors, [field]: error }));
      }else{
        setDOB(formattedDate);
      }

  }
  if(valid){
    setShowError((prevErrors) => ({ ...prevErrors, [field]: '' }));
  }

};

  return html`
      <form ref=${formRef} onsubmit=${(e) => handleOnSubmit(e)}>
        <div class="basic-user-details-step-description">
          ${intro}
        </div>
        <div class="basic-user-details-step-fields">
          <div>
            <input type="text" name="fullname" class=${`${showError.fullname ? 'in-valid' : ''} limit-word`} placeholder='${placeholders.fullname}*'
            onBlur=${(e) => handleBlur('fullname', e.target.value)} onInput=${(e) => handleInput('fullname', e)}/>
            <em class=${`error-form ${showError.fullname ? 'active' : ''}`}>
              ${placeholders.fullnameMissing}
            </em>
          </div>
          <div>
            <input type="text" name="email" class=${`${showError.email ? 'in-valid' : ''}`} placeholder='${placeholders.email}*'
            onBlur=${(e) => handleBlur('email', e.target.value)} onInput=${(e) => handleInput('email', e)} />
            <em class=${`error-form ${showError.email ? 'active' : ''}`}>
              ${placeholders.emailMissing}
            </em>
          </div>
          <div class="date-container">
            <input ref=${dobRef} type="text" name="dob" value=${dummyDOB} class=${`date-container-dob ${showError.dob ? 'in-valid' : ''}`} placeholder='${placeholders.dob}*' id="dob-input"
            onBlur=${(e) => handleBlur('dob', e.target.value)}
            onInput=${(e) => handleInput('dob', e)}
            onChange=${(e) => handleBlur('dob', e.target.value)} />
            <i class="fa fa-calendar calendar-icon" ></i>
            ${html`<div class="calendar-container" ref=${calendarRef}>${Calendar({ inputValue: dob, onDOBSelect: handleDOBSelect })}</div>`}
            <em class=${`error-form ${showError.dob ? 'active' : ''}`}>
              ${placeholders.dobMissing}
            </em>
          </div>
          <div class="city-container">
            <input ref=${cityRef} type="text" value=${city} name="city" class=${`city-container-city ${showError.city ? 'in-valid' : ''}`} placeholder='${placeholders.searchCity}*' id="city-input" readonly
            onBlur=${(e) => handleBlur('city', e.target.value)} onInput=${(e) => handleInput('city', e)} />
            <span class="select-selection__arrow" role="presentation">
              <b  ref=${dropDownArrowRef} role="presentation" class="city-arrow"}></b>
            </span>
            ${html`<div class="dropdown-container" ref=${dropdownRef}>${DropDown({ inputValue: city, onSelectCity: handleCitySelect })}</div>`}
            <em class=${`error-form ${showError.city ? 'active' : ''}`}>
              ${placeholders.searchCityMissing}
            </em>
          </div>
          <div>
            <button type="submit">
              ${hnodeAs(submitButton, 'span')}
            </button>
          </div>

        </div>
        <div class="basic-user-details-step-guidance">
          ${guidance}
        </div>
        <div class="basic-user-details-step-disclaimer">
        <label class="d-flex">
          <input type="checkbox" name="disclaimer" value="accepted" class=${`${showError.disclaimer ? 'in-valid' : ''}`} />
            ${disclaimer}</label>
        </div>

      </form>
    `;
}

BasicUserDetailsStep.parse = (block) => {
  const [
    introWrapper,
    guidanceWrapper,
    disclaimerWrapper,
    submitButtonWrapper,
  ] = [...block.children].map((row) => row.firstElementChild);
  const intro = introWrapper?.children[0];
  const guidance = guidanceWrapper?.children;
  const disclaimer = disclaimerWrapper?.children;
  const submitButton = submitButtonWrapper?.firstElementChild;
  const modelSelectionLink = introWrapper?.children[1];
  return { intro, guidance, disclaimer, submitButton, modelSelectionLink };
};

BasicUserDetailsStep.defaults = {
  into: html`<p>Introduction</p>`,
  guidance: html`<p>guidance</p>`,
  disclaimer: html`<p>Disclaimer</p>`,
  submitButton: html`<button>Submit</button>`,
};

export default BasicUserDetailsStep;
