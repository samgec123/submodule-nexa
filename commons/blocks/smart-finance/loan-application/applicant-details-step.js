/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useRef, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext, htmlStringToPreactNode } from './multi-step-form.js';
import formDataUtils from '../../../utility/formDataUtils.js';
import bankFormUtils from '../../../utility/bankFormUtils.js';
import { validateFormOnSubmit, mergeValidationRules, attachValidationListeners } from '../../../utility/validation.js';
import utility from '../../../utility/utility.js';
import { saveDraftLoanApplication, getCustomerData } from '../../../utility/smart-finance/sfLoanApplicationUtils.js';
import util from '../../../utility/smart-finance/utility.js';

function populatingDropdowns() {
  util.addOptions('current_work_experience_years', 0, 50);
  util.addOptions('current_work_experience_months', 0, 11);
  util.addOptions('work_experience_years', 0, 50);
  util.addOptions('work_experience_months', 0, 11);
  util.addOptions('business_experience_years', 0, 50);
  util.addOptions('business_experience_months', 0, 11);
  util.addOptions('Current_Business_Stability_Years', 0, 15);
  util.addOptions('Current_Business_Stability_Month', 0, 11);
  util.addOptions('Total_Business_Stability_Years', 0, 15);
  util.addOptions('Total_Business_Stability_Month', 0, 11);
}
function ApplicantDetails({ config }) {
  const { personalDetailLabel, incomeDetailLabel, previousPageLink } = config;
  const { handleSetActiveRoute,
    bankResponse,
    setBankResponse,
    setSaveDraftRequestBody } = useContext(MultiStepFormContext);
  const [isLoading, setIsLoading] = useState(true);
  const [formHtml, setFormHtml] = useState(null);
  const formRef = useRef();
  const [formData, setFormData] = useState(null);
  let response;
  const customValidationRules = {
    firstName: /^[a-zA-Z ]+$/,
    lastName: /^[a-zA-Z ]+$/,
    dependents: /^\d{1,2}$/,
    pan: /^[A-Z]{5}\d{4}[A-Z]$/,
  };
  const mergedRules = mergeValidationRules(customValidationRules);
  const addressDetails = [{
    address_details1: '',
    address_details2: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'india',
    landmark: '',
    address_type: '170001',
    staying_since: '',
  },
  {
    address_details1: '',
    address_details2: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'india',
    landmark: '',
    address_type: '170002',
  },
  {
    address_details1: '',
    address_details2: '',
    city: '',
    state: '',
    pin_code: '',
    country: 'india',
    landmark: '',
    address_type: '170003',
  },
  ];
  async function fetchFinancierData() {
    return {
      financier_id: sessionStorage.getItem('financier_id'),
      employmentType: sessionStorage.getItem('employmentTypeId'),
      preapproved: false,
    };
  }

  useEffect(async () => {
    async function fetchData() {
      try {
        let data;
        response = await fetchFinancierData();
        setBankResponse(response);
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
        switch (response.financier_id) {
          case '280001':
            data = await formDataUtils.fetchSfFormData('icici-se');
            setFormHtml(await bankFormUtils
              .iciciForm(
                data,
                response.employmentType,
                personalDetailLabel.props.children[0],
                incomeDetailLabel.props.children[0],
              ));
            break;
          case '280003':
            data = await formDataUtils.fetchSfFormData('hdfc-se');
            setFormHtml(await bankFormUtils
              .hdfcForm(
                data,
                response.employmentType,
                personalDetailLabel.props.children[0],
                incomeDetailLabel.props.children[0],
              ));
            break;
          default:
            // common form SE
            data = await formDataUtils.fetchSfFormData('common-fields');
            setFormHtml(await bankFormUtils.commonForm(
              data,
              response.employmentType,
              response.financier_id,
              personalDetailLabel.props.children[0],
              incomeDetailLabel.props.children[0],
            ));
        }
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }

    await fetchData();
    populatingDropdowns();
  }, []);
  if (isLoading) {
    return html`
    ${htmlStringToPreactNode(`<div class="loader" style="height: 1000px; display: flex; align-items: center; justify-content: center;">
        <div class="spinner"></div>
    </div>`)}`;
  }

  useEffect(() => {
    const form = formRef.current;
    attachValidationListeners(form, mergedRules, () => {}, false);
    const mobileInput = document.querySelectorAll('.mobile-number-trim');

    const dependentInput = document.querySelectorAll('.dependent-trim');
    const alphabetOnlyInput = document.querySelectorAll('.only-alphabet');
    const numberMaxLimit = document.querySelectorAll('.only-eighteen-digits');

    mobileInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 10).replace(/\D/g, '');
      });
    });
    dependentInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.slice(0, 2).replace(/\D/g, '');
      });
    });
    alphabetOnlyInput.forEach((input) => {
      input.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, '');
      });
    });
    numberMaxLimit.forEach((input) => {
      input.addEventListener('input', (event) => {
        if (event.target.value.length > 18) {
          event.target.value = event.target.value.slice(0, 18); // Truncate to 18 digits
        }
      });
    });
  }, []);

  useEffect(() => {
    const reverseGenderMapping = {
      210001: 'male',
      210002: 'female',
      210003: 'transgender',
    };
    const reverseResidenceTypeMapping = {
      230001: 'Self/Family Owned',
      230002: 'Rented',
    };

    const reverseEducationMapping = {
      190003: 'Graduate',
      190005: 'Post Graduate',
      190001: 'Matriculate',
      190004: 'B.Tech/BE',
      190008: 'Others',
      190007: 'Lawyer',
      190002: 'Under Graduate',
      190006: 'Doctor',
    };

    const reverseMaritalStatusMapping = {
      220001: 'Married',
      220003: 'Single',
      220002: 'Divorcee',
    };

    const reverseGenderSalutationMapping = {
      male: 'Mr',
      female: 'Ms',
      transgender: 'Other',
    };

    const genderSalutationMapping = {
      Mr: 'male',
      Ms: 'female',
      Other: 'transgender',
    };

    const reverseSalutationMapping = {
      240001: 'Mr',
      240002: 'Ms',
      240003: 'Mx',
      240004: 'Dr',
      240005: 'Other',
    };

    const reverseEmploymentTypeMapping = {
      200003: 'No Income Source',
      200001: 'Salaried',
      200002: 'Self Employed',
    };

    const reverseSubEmploymentTypeMapping = {
      440007: 'Government Salaried',
      440008: 'Private Salaried',
      440002: 'Business Individuals',
      440001: 'Professional',
    };
    // const reverseRelationMapping = {
    //   480002: 'Relative',
    //   480001: 'Friend',
    // };
    let checkedGender;
    function setDropDownValue(id, value, mapping, anotherId) {
      let subEmpSelect;
      const oneSelect = document.getElementById(id);
      subEmpSelect = oneSelect;
      if (!subEmpSelect || value === undefined || value === '' || value === null) return;
      const matchingValue = mapping ? mapping[value] : value;
      if (anotherId) {
        const anotherSelect = document.getElementById(anotherId);
        subEmpSelect = anotherSelect;
      }
      for (let i = 0; i < subEmpSelect.options.length; i += 1) {
        if (subEmpSelect.options[i].value.toLowerCase() === matchingValue.toLowerCase()) {
          subEmpSelect.selectedIndex = i;
          break;
        }
      }
    }
    function getGenderSalutation(radioButtons) {
      radioButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const selectedGender = button.value;
          const selectedSalutation = document.getElementById('salutation');
          const sel = selectedSalutation.options[selectedSalutation.selectedIndex].value;
          if (sel === 'Mr' || sel === 'Ms') {
            if (!((sel === 'Mr' && selectedGender === 'male') || (sel === 'Ms' && selectedGender === 'female'))) {
              button.checked = false;
              checkedGender.checked = true;
              document.getElementById('gender_title_validation_popup').style.display = 'block';
            }
            if ((sel === 'Mr' && selectedGender === 'male') || (sel === 'Ms' && selectedGender === 'female')) {
              button.checked = true;
              document.getElementById('gender_title_validation_popup').style.display = 'none';
            }
          } else {
            button.checked = true;
            document.getElementById('gender_title_validation_popup').style.display = 'none';
          }
        });
      });
    }
    function getReferenceDetails(element, id) {
      setDropDownValue(`${id}-salutation`, element.reference_title, reverseSalutationMapping, null);
      if (document.getElementById(`${id}-first-name`)) {
        document.getElementById(`${id}-first-name`).value = element.reference_first_name;
      }
      if (document.getElementById(`${id}-last-name`)) {
        document.getElementById(`${id}-last-name`).value = element.reference_last_name;
      }
      if (document.getElementById(`${id}-mobile`)) {
        document.getElementById(`${id}-mobile`).value = element.reference_mobile;
      }
      setDropDownValue(`${id}-relation`, element.reference_relation, null, null);
    }
    // Fetch dealer customer data when the component mounts
    const fetchDealerCustomerData = async () => {
      const enquiryId = sessionStorage.getItem('enquiryId'); // Replace with the actual enquiry ID
      try {
        const responseData = await getCustomerData(enquiryId);

        if (responseData.success && responseData.data.status === 'Success') {
          setBankResponse((prevState) => ({
            ...prevState,
            loanId: responseData?.data?.customer_data?.loan_applicant?.id,
          }));
          const { enquiry } = responseData.data.customer_data;
          const { customer } = responseData.data.customer_data;
          const loanApplicant = responseData.data.customer_data.loan_applicant;
          if (enquiry && loanApplicant && customer) {
            // Address details
            loanApplicant.applicant_address_entity.forEach((element) => {
              addressDetails.forEach((address) => {
                if (address.address_type === '170001' && element.address_type === '170001') {
                  address.address_details1 = element.address_details1;
                  address.address_details2 = element.address_details2;
                  address.city = element.city;
                  address.state = element.state;
                  address.pin_code = element.pin_code;
                  address.country = element.country;
                  address.landmark = element.landmark;
                  address.staying_since = loanApplicant.staying_since;
                } else if (address.address_type === '170002' && element.address_type === '170002') {
                  address.address_details1 = element.address_details1;
                  address.address_details2 = element.address_details2;
                  address.city = element.city;
                  address.state = element.state;
                  address.pin_code = element.pin_code;
                  address.country = element.country;
                  address.landmark = element.landmark;
                } else if (address.address_type === '170003' && element.address_type === '170003') {
                  address.address_details1 = element.address_details1;
                  address.address_details2 = element.address_details2;
                  address.city = element.city;
                  address.state = element.state;
                  address.pin_code = element.pin_code;
                  address.country = element.country;
                  address.landmark = element.landmark;
                }
              });
            });
            // Personal Details
            document.getElementById('first-name').value = enquiry.first_name;
            document.getElementById('middle-name').value = enquiry.middle_name ? enquiry.middle_name : '';
            document.getElementById('last-name').value = enquiry.last_name ? enquiry.last_name : '';
            document.getElementById('email').value = enquiry.email;
            document.getElementById('mobile').value = enquiry.mobile;
            if (document.getElementById('father-name')) { document.getElementById('father-name').value = loanApplicant.father_name ? loanApplicant.father_name : ''; }
            if (document.getElementById('mother-name')) { document.getElementById('mother-name').value = loanApplicant.mother_name ? loanApplicant.mother_name : ''; }
            document.getElementById('pan').value = customer.pan_number;
            const dobField = document.querySelector('input[name="dob"]');
            if (dobField) {
              const dob = enquiry.dob?.split('-').reverse().join('-');
              dobField.value = dob || '';
            }

            const radioButtons = document.querySelectorAll('input[name="gender"]');
            radioButtons.forEach((button) => {
              if (button.value === reverseGenderMapping[loanApplicant.gender]) {
                checkedGender = button;
                setDropDownValue('salutation', reverseGenderMapping[loanApplicant.gender], reverseGenderSalutationMapping, null);
                button.checked = true;
              }
            });
            document.getElementById('close-gender-title-popup').addEventListener('click', () => {
              document.getElementById('gender_title_validation_popup').style.display = 'none';
            });
            document.getElementById('ok-gender-title-popup').addEventListener('click', () => {
              document.getElementById('gender_title_validation_popup').style.display = 'none';
            });
            document.getElementById('ok-save-popup-button').addEventListener('click', () => {
              document.getElementById('success-popup').style.display = 'none';
            });
            document.getElementById('close-successe-popup').addEventListener('click', () => {
              document.getElementById('success-popup').style.display = 'none';
            });

            getGenderSalutation(radioButtons);

            setDropDownValue('marital-status', loanApplicant.marital_status, reverseMaritalStatusMapping, null);
            setDropDownValue('educational-qual', loanApplicant.education, reverseEducationMapping, null);

            // Setting some properties in session storage which are mandatory for saveDraft API call
            sessionStorage.setItem('avg_monthly_income', customer.avg_monthly_income);
            sessionStorage.setItem('gross_annual_income', loanApplicant.gross_annual_income ? loanApplicant.gross_annual_income : 25000);
            sessionStorage.setItem('net_annual_income', customer.net_annual_income ? customer.net_annual_income : 25000);
            sessionStorage.setItem('employer_name', loanApplicant.employer_name);
            sessionStorage.setItem('business_name', loanApplicant.business_name);
            sessionStorage.setItem('work_experience_years', loanApplicant.work_experience_years ? loanApplicant.work_experience_years : customer.tenure_of_business_in_years);
            sessionStorage.setItem('work_experience_months', loanApplicant.work_experience_months ? loanApplicant.work_experience_months : customer.tenure_of_business_in_months);
            sessionStorage.setItem('sub_employment_type', loanApplicant.sub_employment_type_id);
            sessionStorage.setItem('residence_type', loanApplicant.residence_type);
            sessionStorage.setItem('staying_since', loanApplicant.staying_since);
            if (document.getElementById('employer-name')) {
              document.getElementById('employer-name').value = loanApplicant.employer_name ? loanApplicant.employer_name : '';
            }
            if (document.getElementById('current-emi')) {
              document.getElementById('current-emi').value = customer.current_emi ? customer.current_emi : '';
            }
            if (document.getElementById('avg-monthly-income')) {
              document.getElementById('avg-monthly-income').value = customer.avg_monthly_income ? customer.avg_monthly_income : '';
            }
            if (document.getElementById('business-name')) {
              document.getElementById('business-name').value = loanApplicant.business_name ? loanApplicant.business_name : '';
            }
            setDropDownValue('business_experience_years', customer.self_work_experience_in_years, null);
            setDropDownValue('business_experience_months', customer.self_work_experience_in_months, null);

            setDropDownValue('business_experience_years', customer.tenure_of_business_in_years, null);
            setDropDownValue('business_experience_months', customer.tenure_of_business_in_months, null);

            setDropDownValue('residence-type', customer.residence_type, reverseResidenceTypeMapping, null);
            if (document.getElementById('residence-since')) {
              document.getElementById('residence-since').value = loanApplicant.staying_since ? loanApplicant.staying_since : '';
            }

            setDropDownValue('work_experience_years', loanApplicant.work_experience_years, null);
            setDropDownValue('work_experience_months', loanApplicant.work_experience_months, null);
            setDropDownValue('current_work_experience_years', loanApplicant.current_org_work_exp_years, null);
            setDropDownValue('current_work_experience_months', loanApplicant.current_org_work_exp_months, null);
            setDropDownValue('employment-type', enquiry.employment_type_id, reverseEmploymentTypeMapping, null);
            setDropDownValue('subemployment-type', enquiry.sub_employment_type_id, reverseSubEmploymentTypeMapping, null);

            if (document.getElementById('net-income')) {
              document.getElementById('net-income').value = customer.net_annual_income ? customer.net_annual_income : '';
            }
            if (document.getElementById('gross-income')) {
              document.getElementById('gross-income').value = loanApplicant.gross_annual_income ? loanApplicant.gross_annual_income : '';
            }
            if (document.getElementById('dependents')) {
              document.getElementById('dependents').value = loanApplicant.no_of_dependents ? loanApplicant.no_of_dependents : '';
            }
            const changeSalutation = document.querySelector('#salutation');
            changeSalutation.addEventListener('change', (event) => {
              event.preventDefault();
              const selectedSal = changeSalutation.value;
              radioButtons.forEach((button) => {
                if (button.value === genderSalutationMapping[selectedSal]) {
                  checkedGender = button;
                  button.checked = true;
                }
              });
            });
            const referenceData = loanApplicant.loan_applicant_reference;
            if (referenceData && referenceData.length === 1) {
              getReferenceDetails(referenceData[0], 'ref1');
            } else if (referenceData && referenceData.length === 2) {
              getReferenceDetails(referenceData[0], 'ref1');
              getReferenceDetails(referenceData[1], 'ref2');
            }
          }
        }
      } catch (error) {
        throw new Error('Error occurred in fetching dealer customer data');
      }
    };

    // Fetch and populate data on component mount
    fetchDealerCustomerData();
  }, []);

  const genderMapping = {
    male: '210001',
    female: '210002',
    transgender: '210003',
  };

  const educationMapping = {
    Graduate: '190003',
    'Post Graduate': '190005',
    Matriculate: '190001',
    'B.Tech/BE': '190004',
    Others: '190008',
    Lawyer: '190007',
    'Under Graduate': '190002',
    Doctor: '190006',
  };

  const maritalStatusMapping = {
    Married: '220001',
    Single: '220003',
    Divorcee: '220002',
  };

  const salutationMapping = {
    Mr: '240001',
    Ms: '240002',
    Mx: '240003',
    Dr: '240004',
    Other: '240005',
  };
  const handleSaveClick = async (isContinueToNextStep = false) => {
    // Collect values or defaults for fields
    const ref1SalutationInput = document.getElementById('ref1-salutation')?.value || '';
    const ref1Salutation = salutationMapping[ref1SalutationInput];
    const ref1FirstName = document.getElementById('ref1-first-name')?.value || '';
    const ref1LastName = document.getElementById('ref1-last-name')?.value || '';
    const ref1Mobile = document.getElementById('ref1-mobile')?.value || '';
    const ref1Relation = document.getElementById('ref1-relation')?.value || '';

    const ref2SalutationInput = document.getElementById('ref2-salutation')?.value || '';
    const ref2Salutation = salutationMapping[ref2SalutationInput];
    const ref2FirstName = document.getElementById('ref2-first-name')?.value || '';
    const ref2LastName = document.getElementById('ref2-last-name')?.value || '';
    const ref2Mobile = document.getElementById('ref2-mobile')?.value || '';
    const ref2Relation = document.getElementById('ref2-relation')?.value || '';

    const firstName = document.getElementById('first-name')?.value || '';
    const middleName = document.getElementById('middle-name')?.value || '';
    const lastName = document.getElementById('last-name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const mobileNo = document.getElementById('mobile')?.value || '';
    const fatherName = document.getElementById('father-name')?.value || '';
    const motherName = document.getElementById('mother-name')?.value || '';
    const dobInput = document.querySelector('[name="dob"]')?.value;
    const dob = dobInput
      ? dobInput.split('-').reverse().join('-') // Converts 'YYYY-MM-DD' to 'DD-MM-YYYY'
      : '12-12-1995';
    const pan = document.getElementById('pan')?.value;
    const genderInput = document.querySelector('[name="gender"]:checked')?.value || '';
    const gender = genderMapping[genderInput];

    const educationInput = document.getElementById('educational-qual')?.value || '';
    const education = educationMapping[educationInput];

    const maritalStatusInput = document.getElementById('marital-status')?.value || '';
    const maritalStatus = maritalStatusMapping[maritalStatusInput];

    const salutationInput = document.getElementById('salutation');
    const title = salutationMapping[salutationInput.options[salutationInput.selectedIndex].value];
    const dependents = document.getElementById('dependents')?.value || 0;

    const requestBody = {
      enquiry_id: sessionStorage.getItem('enquiryId'),
      title,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      email,
      mobile: mobileNo,
      dob,
      marital_status: maritalStatus,
      gender,
      financier_id: bankResponse.financier_id,
      pan,
      employer_name: sessionStorage.getItem('employer_name'),
      is_co_applicant_journey: '0',
      employment_type: bankResponse.employmentType,
      sub_employment_type: sessionStorage.getItem('sub_employment_type'),
      avg_monthly_income: sessionStorage.getItem('avg_monthly_income'),
      kyc_document_id: '',
      kyc_document: '',
      no_of_dependents: dependents,
      education,
      gross_annual_income: sessionStorage.getItem('gross_annual_income'),
      net_annual_income: sessionStorage.getItem('net_annual_income'),
      residence_type: sessionStorage.getItem('residence_type'),
      staying_since: sessionStorage.getItem('staying_since'),
      nationality: 'Indian',
      father_name: fatherName,
      mother_name: motherName,
      work_experience_years: sessionStorage.getItem('work_experience_years'),
      work_experience_months: sessionStorage.getItem('work_experience_months'),
      business_name: sessionStorage.getItem('business_name'),
      references: [
        {
          reference_first_name: ref1FirstName,
          reference_last_name: ref1LastName,
          reference_mobile: ref1Mobile,
          reference_title: ref1Salutation,
          reference_relation: ref1Relation,
        },
        {
          reference_first_name: ref2FirstName,
          reference_last_name: ref2LastName,
          reference_mobile: ref2Mobile,
          reference_title: ref2Salutation,
          reference_relation: ref2Relation,
        },
      ],
      address: addressDetails,
    };
    try {
      const saveDraftResponse = await saveDraftLoanApplication(requestBody);
      if (saveDraftResponse.success) {
        setSaveDraftRequestBody(requestBody);
        if (!isContinueToNextStep) {
          document.getElementById('success-popup').style.display = 'block';
        }
      }
    } catch (error) {
      throw new Error('Error occurred in saving the draft');
    }
  };

  useEffect(() => {
    const saveButton = document.querySelector('.blackButton .btn1.SAVE');
    saveButton?.addEventListener('click', () => {
      handleSaveClick();
    });
    return () => {
      saveButton?.removeEventListener('click', handleSaveClick);
    };
  }, []);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = formRef.current;
      const isValid = validateFormOnSubmit(form, mergedRules);
      if (isValid) {
        await handleSaveClick(true);
        if (bankResponse.preapproved && bankResponse.financier_id === '280003') {
          handleSetActiveRoute('finalize-loan-step');
        } else {
          handleSetActiveRoute('address-details-step');
        }
      }
    } catch (error) {
      throw new Error('Error occurred in submitting the form');
    }
  };
  return html`
  <section class="employerFormSec">
  <div class="container">
      <ul class="steps" style="justify-content:center">
      ${bankResponse.preapproved && bankResponse.financier_id === '280003' ? html`
          <li class="active">
              <span>1</span>
              <div class="content">
                  <div class="image">
                      <div class="step-1"></div>
                  </div>
                  <div class="title">
                  ${formData?.application}
                  <br/>
                  ${formData?.details}</div>
              </div>
          </li>  
          <li>
              <span>2</span>
              <div class="content">
                  <div class="image">
                      <div class="step-4"></div>
                  </div>
                  <div class="title">
                   ${formData?.finalize}
                    <br/>
                   ${formData?.loan}</div>
              </div>
          </li>` : html`
          <li class="active">
              <span>1</span>
              <div class="content">
                  <div class="image">
                      <div class="step-1"></div>
                  </div>
                  <div class="title">
                  ${formData?.application}
                  <br/>
                  ${formData?.details}</div>
              </div>
          </li>
          <li>
          <span>2</span>
          <div class="content">
              <div class="image">
                  <div class="step-2"></div>
              </div>
              <div class="title">
              ${formData?.address}
              <br/>
              ${formData?.details}</div>
          </div>
      </li>
      <li>
          <span>3</span>
          <div class="content">
              <div class="image">
                  <div class="step-3"></div>
              </div>
              <div class="title">
               ${formData?.upload}
              <br/>
              ${formData?.documents}</div>
          </div>
      </li>    
          <li>
              <span>4</span>
              <div class="content">
                  <div class="image">
                      <div class="step-4"></div>
                  </div>
                  <div class="title">
                   ${formData?.finalize}
                    <br/>
                   ${formData?.loan}</div>
              </div>
          </li>
       `}
       </ul>
        <form ref=${formRef} action="" class="form_financeloan" id="form-loanapplication-uco" novalidate="novalidate">
          <div class="employerFormBox personalDetailSec" id="step1" style="display: block;">
          ${formHtml ? htmlStringToPreactNode(formHtml) : null}
              <div class="employerBtn">
                <div class="whiteButton">
                  <a href="${previousPageLink.props.children[0].props.href}" class="noFill btn1">${formData?.back}</a>
                </div>
                <div class="blackButton">
                            <button type="button" class="btn1 SAVE">Save</button>
                        </div>
                <div class="blackButton">
                ${bankResponse.preapproved && bankResponse.financier_id === '280003' ? html`
                <button type="button" class="btn1 SAVE" onClick=${handleOnSubmit}>${formData?.proceedBtn}</button>` : html`
                  <button type="button" class="btn1 SAVE" id="continue-to-address" onClick=${handleOnSubmit}>${formData?.continueToAddress}</button>`}
                </div>
              </div>
              <div class="mobileFooter">
                  <div class="whiteButton">
                      <a class="btn1" href="${previousPageLink.props.children[0].props.href}">
                          <div class="back-icon"></div>
                      </a>
                  </div>
                  <div class="blackButton">
                      <button type="button" onClick=${handleOnSubmit} class="btn1 next_step_mobile">${formData?.continueToAddress}</button>
                  </div>
                  <div class="blackButton">
                      <a href="javascript:;" class="btn1 next_step_mobile_next" style="display: none;">${formData?.next}</a>
                  </div>
                  <div class="blackButton" style="display: none;">
                      <a href="javascript:;" class="btn1 next_step_edit">${formData?.edit}</a>
                  </div>
              </div>
              <div class="popUpmain fade-in" id="success-popup" style="display: none;">
        <div class="modal-content">
            <div class="close" id="close-successe-popup" aria-label="Close">
            </div>
            <div class="popupContent green">
               <h2><div class="icon-img"></div>${formData?.successTitle}</h2>
               <p>${formData?.successDesc}</p>
               <div class="btn-container">
                  <div class="blackButton" id="ok-save-popup-button"><button type="button">${formData?.btnOk}</button></div>
                  <div></div>
               </div>
            </div>
        </div>
     </div>
          </div>
        </form>
    </div>
  </section>
  `;
}

ApplicantDetails.parse = (block) => {
  const [personalDetailLabelEl, incomeDetailLabelEl, previousPageLinkEl] = block.children;
  const personalDetailLabel = personalDetailLabelEl.children[0].children[0];
  const incomeDetailLabel = incomeDetailLabelEl.children[0].children[0];
  const previousPageLink = previousPageLinkEl.children[0].children[0];
  return {
    personalDetailLabel,
    incomeDetailLabel,
    previousPageLink,
  };
};

export default ApplicantDetails;
