import utility from '../../../utility/utility.js';
import {
  validateFields, CheckFormValid, showSuccessPopup,
} from './validations.js';
import { fetchPlaceholders } from '../../../scripts/aem.js';
import { getCustomerData, personalDetailsSubmit, personalDetailsSave } from '../../../utility/sfUtils.js';
import sfUtil from '../../../utility/smart-finance/utility.js';

const updateField = (id, value, labelText = '') => {
  // Update label text based on provided labelText argument
  const labelElement = document.querySelector(`label[for="${id}"]`);
  if (labelElement && labelText) {
    labelElement.textContent = labelText;
  }

  const inputElement = document.getElementById(id);
  if (inputElement && value !== '' && value !== null && value !== undefined) {
    inputElement.value = value;
  }
};

function insertConditionalParams(requestBody) {
  const itrYesChecked = document.getElementById('ItrYes').checked;
  if (document.querySelector('#EmploymentType').value === '200002'
  && document.querySelector('#SubEmployee').value === '440001' && itrYesChecked) {
    const yearsOfExperience = document.getElementById('ProfessionalYear')?.value.trim();
    const monthsOfExperience = document.getElementById('ProfessionalMonth')?.value.trim();
    requestBody.self_work_experience_in_years = yearsOfExperience;
    requestBody.self_work_experience_in_months = monthsOfExperience;
    requestBody.employer_type = '';
  } else if (document.querySelector('#SubEmployee').value === '440002'
  || document.querySelector('#SubEmployee_no').value === '440004'
  || document.querySelector('#SubEmployee_no').value === '440003'
  || document.querySelector('#SubEmployee_no').value === '440005'
  || document.querySelector('#SubEmployee_no').value === '440006') {
    const tenureYearsOfBusiness = document.getElementById('TenureBussinessYear')?.value.trim();
    const tenureMonthsOfBusiness = document.getElementById('TenureBussinessMonth')?.value.trim();
    requestBody.tenure_of_business_in_years = tenureYearsOfBusiness;
    requestBody.tenure_of_business_in_months = tenureMonthsOfBusiness;
    requestBody.employer_type = '';
  } else if (document.querySelector('#EmploymentType').value === '200003') {
    requestBody.sub_employment_id = document.querySelector('#SubCategory').value;
    delete requestBody.work_experience_years;
    delete requestBody.work_experience_months;
    delete requestBody.current_emi;
  } else {
    const employerTypeElement = document.getElementById('EmployerType');
    const employerTypeCode = employerTypeElement?.value;
    requestBody.employer_type = employerTypeCode;
    const emplyerElement = document.getElementById('Employer')?.value.trim();
    requestBody.employer = emplyerElement || '';
    const yearsOfExperience = document.getElementById('Years')?.value.trim();
    const monthsOfExperience = document.getElementById('Month')?.value.trim();
    requestBody.work_experience_years = yearsOfExperience;
    requestBody.work_experience_months = monthsOfExperience;
  }
}

export default async function decorate(block) {
  const getFieldData = (element) => element?.textContent?.trim() || '';

  const innerDiv = block.children[0].children[0];
  const [
    preTitleEl,
    titleEl,
    firstNameEl,
    middleNameEl,
    lastNameEl,
    mobileNumberEl,
    emailIdEl,
    panNumberEl,
    dateOfBirthEl,
    genderEl,
    employmentTypeEl,
    employerTypeEl,
    employerEl,
    netSalaryAnnualEl,
    grossSalaryAnnualEl,
    workExperienceEl,
    yearEl,
    monthEl,
    currentEMIsMonthlyEl,
    residenceTypeEl,
    residenceSinceEl,
    subEmpEl,
    subEmpNoEl,
    subCatEl,
    avgMonthEl,
    ProfWorkEl,
    buisnessEl,
    cattleEl,
    agriEl,
    carOwnedEl,
    checkBoxEl,
    backEl,
    backLinkEl,
    saveEl,
    continueEl,
    nextLinkEl,
    nextBtnEl,
  ] = innerDiv.children;

  const elementsToHide = [
    preTitleEl,
    titleEl,
    firstNameEl,
    middleNameEl,
    lastNameEl,
    mobileNumberEl,
    emailIdEl,
    panNumberEl,
    dateOfBirthEl,
    genderEl,
    employmentTypeEl,
    employerTypeEl,
    employerEl,
    netSalaryAnnualEl,
    grossSalaryAnnualEl,
    workExperienceEl,
    yearEl,
    monthEl,
    currentEMIsMonthlyEl,
    residenceTypeEl,
    residenceSinceEl,
    subEmpEl,
    subEmpNoEl,
    subCatEl,
    avgMonthEl,
    ProfWorkEl,
    buisnessEl,
    cattleEl,
    agriEl,
    carOwnedEl,
    checkBoxEl,
    backEl,
    saveEl,
    continueEl,
    nextBtnEl,
    backLinkEl,
    nextLinkEl,
  ];

  const formsff = await utility.fetchFormSf();
  const { apiDomain } = await fetchPlaceholders();

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const preTitle = getFieldData(preTitleEl);
  const title = getFieldData(titleEl);
  const firstName = getFieldData(firstNameEl);
  const middleName = getFieldData(middleNameEl);
  const lastName = getFieldData(lastNameEl);
  const mobileNumber = getFieldData(mobileNumberEl);
  const emailId = getFieldData(emailIdEl);
  const panNumber = getFieldData(panNumberEl);
  const dateOfBirth = getFieldData(dateOfBirthEl);
  const gender = getFieldData(genderEl);
  const employmentType = getFieldData(employmentTypeEl);
  const employerType = getFieldData(employerTypeEl);
  const employer = getFieldData(employerEl);
  const netSalaryAnnual = getFieldData(netSalaryAnnualEl);
  const grossSalaryAnnual = getFieldData(grossSalaryAnnualEl);
  const workExperience = getFieldData(workExperienceEl);
  const currentEMIsMonthly = getFieldData(currentEMIsMonthlyEl);
  const residenceType = getFieldData(residenceTypeEl);
  const residenceSince = getFieldData(residenceSinceEl);
  const checkBox = getFieldData(checkBoxEl);
  const back = getFieldData(backEl);
  const save = getFieldData(saveEl);
  const continueText = getFieldData(continueEl);
  const subEmp = getFieldData(subEmpEl);
  const subEmpNo = getFieldData(subEmpNoEl);
  const subCat = getFieldData(subCatEl);
  const avgMonth = getFieldData(avgMonthEl);
  const ProfWork = getFieldData(ProfWorkEl);
  const buisness = getFieldData(buisnessEl);
  const cattle = getFieldData(cattleEl);
  const agri = getFieldData(agriEl);
  const carOwned = getFieldData(carOwnedEl);
  const nextBtn = getFieldData(nextBtnEl);
  const backLink = backLinkEl?.querySelector('a')?.href || '#';
  const nextLink = nextLinkEl?.querySelector('a')?.href || '#';
  let detailsSubmitted = false;
  const htmlContent = `
    <div class="container sectionDiv clearfix">
      <div class="personalDetail">
        <div class="noApprovedOffer d-flex align-items-center">
        <div class="noApprovedOffer-icon"></div>
          <h2>
            You don't have any <strong>pre-approved offers</strong> at this
            moment
          </h2>
        </div>
        <div class="title">
          <h3>
           ${preTitle}
          </h3>
        </div>
        <form id="form" action="/">
          <div class="personalDetaiForm">
            <div class="withoutCoApplicant">
              <div class="title">
                <h3>${title}</h3>
              </div>
              <div class="formInputField row no-gutters numberOfRow">
                <div class="col-md-4">
                  <div class="formInputBox field--not-empty">
                    <label for="Name">first</label>
                    <input name="Name" placeholder="${firstName}" id="Name" maxlength="30" type="text"/>
                    <em id="name-error" class="error invalid-feedback">${formsff.firstNameError}</em>
                  </div>
                  <div class="formInputBox">
                    <input
                      name="MiddleName"
                      placeholder=""
                      id="MiddleName"
                      maxlength="30"
                      type="text"

                    />
                    <label for="MiddleName">${middleName}</label>
                  </div>
                  <div class="formInputBox">
                    <input
                      name="LastName"
                      placeholder=" "
                      id="LastName"
                      maxlength="30"
                      type="text"
                    />
                    <em id="last-error" class="error invalid-feedback">${formsff.lastNameError}</em>
                    <label for="LastName">${lastName}</label>
                  </div>
                  <div class="formInputBox ">
                    <input
                      placeholder=" "
                      id="Mobile"
                      maxlength="10"
                      name="Mobile"
                      type="tel"
                      disabled
                    />
                    <label for="Mobile">${mobileNumber}</label>
                  </div>
                  <div class="formInputBox DefaultSelected1 ">
                    <input
                      placeholder=" "
                      id="Email"
                      maxlength="30"
                      name="Email"
                      type="text"
                    />
                    <label for="Email">${emailId}</label>
                    <em id="email-error" class="error invalid-feedback">${formsff
    .emailId}</em>
                  </div>
                  <div class="panRadioBtn">
                    <p>Do you have PAN Card?</p>
                    <div style="display:flex;gap:20px">
                    <div class="radio-wrapper">
                     <input
                          type="radio"
                          checked="checked"
                          id="PanAvailable"
                          name="PanAvailable"
                        />
                      <label >
                        Yes
                      </label>
                      </div>
                      <div class="radio-wrapper">
                        <input
                          type="radio"
                          id="PanAvailable"
                          name="PanAvailable"
                        />
                      <label>
                        No    
                      </label>
                    </div>
                  </div>
                  </div>
                  <div class="formInputBox DefaultSelected" style="display:none">
                      <select id="Non-Pan"name="Non-Pan">
                        <option >No PANCard*</option>
                        <option >Driving Liscense</option>
                        <option >Voter Id Card</option>
                        <option >Passport</option>
                     </select>
                     <label for="Non-Pan">${gender}</label>
                     <em id="non-Pan-error" class="error invalid-feedback" style="display: none;">${formsff.gender}</em>
                  </div>
                  <div class="formInputBox Pan">
                  <input
                    placeholder=" "
                    id="Pan"
                    maxlength="10"
                    name="Pan"
                    type="text"
                  />
                  <label for="Pan">${panNumber}</label>
                  <em id="pan-error" class="error invalid-feedback">${formsff
    .panCard}</em>
                </div>
                  <div class="row no-gutters date-wrapper">
                    <div class="col">
                      <div
                        class="formInputBox dateselector date DefaultSelected1 "
                      >
                      <input  id="dob" type="text"placeholder="" onfocus="(this.type='date');setMaxDate();"onblur="(this.type='text')">
                        <label for="dob">${dateOfBirth}</label>
                        <em id="dob-error" class="error invalid-feedback" style="display: none;">${formsff.dob}</em>
                      </div>
                    </div>
                    <div class="col pl-3">
                      <div class="formInputBox DefaultSelected">
                        <select
                          id="Gender"
                          name="Gender"
                        >
                          <option >Gender*</option>
                          <option value='210001'>Male</option>
                          <option value='210002'>Female</option>
                          <option value='210003'>Transgender</option>
                        </select>
                        <label for="Gender">${gender}</label>
                        <em id="gender-error" class="error invalid-feedback" style="display: none;">${formsff.gender}</em>
                      </div>
                    </div>
                  </div>

                  <div class="formInputField KYCdiv" style="display:none">
                    <div class="formInputBox DefaultSelected">
                      <select
                        id="kyc"
                        name="kyc"
                      >
                        <option >KYC</option>
                        <option >Driving License</option>
                        <option >Passport</option>
                        <option >Voter ID Card</option>
                      </select>
                    </div>
                    <div class="formInputBox dl_id" style="display: none">
                      <input
                        placeholder=" "
                        id="dl_id"
                        name="dl_id"
                        type="text"
                      />
                      <label for="dl_id">Driving licence*</label>
                    </div>
                    <div class="formInputBox passportId" style="display: none">
                      <input
                        placeholder=" "
                        id="passportId"
                        name="passportId"
                        type="text"
                      />
                      <label for="passportId">Passport*</label>
                    </div>
                    <div class="formInputBox vtr_id" style="display: none">
                      <input
                        placeholder=" "
                        id="vtr_id"
                        name="vtr_id"
                        type="text"
                      />
                      <label for="vtr_id">Voter ID*</label>
                    </div>
                  </div>
                  <div
                    class="formInputBox defence_id mr-0"
                    style="display: none"
                  >
                    <input
                      placeholder=" "
                      id="defence_id"
                      maxlength="10"
                      name="defence_id"
                      type="text"
                    />
                    <label for="defence_id">Defence id*</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="formInputBox EmploymentType DefaultSelected">
                    <select
                      id="EmploymentType"
                      name="EmploymentType"
                      enabled=""
                    >
                      <option >Employment Type*</option>
                      <option value="200001">Salaried</option>
                      <option value="200003">No Income Source</option>
                      <option value="200002">Self-Employed</option>
                    </select>
                    <label for="EmploymentType">${employmentType}</label>
                    <em id="employmentType-error" class="error invalid-feedback" style="display: none;">${formsff.employmentType}</em>
                  </div>
                  <div class="formInputBox EmployerType DefaultSelected">
                  <select id="EmployerType" name="EmployerType">
                    <option >Employer Type*</option>
                    <option value="440008">Private Salaried</option>
                    <option value="440007">Government Salaried</option>
                  </select>
                  <label for="EmployerType">${employerType}</label>
                  <em id="employerType-error" class="error invalid-feedback" style="display: none;">${formsff.employerType}</em>
                  </div>
                  <div class="itrRadioBtnSec" >
                  <div class="itrRadioBtn mb-3">
                    <p class="mb-2 mb-lg-0">Do you have an ITR?</p>
                    <div class="radiobtn d-flex ml-lg-auto float-right">
                      <label class="customRadioBtn DefaultSelected">
                        Yes
                        <input type="radio" id="ItrYes" name="ItrType" checked="checked"/>

                        <span class="radioButtonSelected"></span>
                      </label>
                      <label class="customRadioBtn ml-4 DefaultSelected">
                        No
                      <input type="radio" id="ItrNo" name="ItrType"/>

                        <span class="radioButtonSelected"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="formInputBox SubEmployee DefaultSelected">
                <select id="SubEmployee" name="SubEmployee" >
                     <option >Sub Employment*</option>
                     <option value="440001">Professional</option>
                     <option value="440002">Business Individuals</option>
                </select>
              <label for="SubEmployee">${subEmp}</label>
              <em id="subEmployee-error" class="error invalid-feedback" style="display: none;">${formsff.subEmployment}</em>
      </div>
      <div class="formInputBox SubEmployee_no DefaultSelected">
                <select id="SubEmployee_no" name="SubEmployee_no" >
                     <option >Sub Employment*</option>
                     <option value="440004">Farmer(Agri/Dairy)</option>
                     <option value="440003">Trader/Commission Agent</option>
                     <option value="440005">Driver</option>
                     <option value="440006">Others</option>
                </select>
              <label for="SubEmployee_no">${subEmpNo}</label>
              <em id="subEmployeeNo-error" class="error invalid-feedback" style="display: none;">${formsff.subEmployment}</em>
      </div>

                  <div class="formInputBox Employer autocomplete_fmp">
                    <input
                      autocomplete="off"
                      placeholder=" "
                      id="Employer"
                      name="Employer"
                      type="text"
                      minlength="3"
                      class="searchCompaney"
                      id="companeysearch"
                    />
                    <label for="Employer">${employer}</label>
                    <em id="employer-error" class="error invalid-feedback">${formsff.employer}</em>
                    <div id="companyList" class="company-list"></div>
                  </div>
                  <div class="formInputBox net_income">
                     <input name="net_income" placeholder=" " id="net_income" maxlength="8" minlength="2" type="number"/>
                     <label for="net_income">${netSalaryAnnual}</label>
                     <em id="net-error" class="error invalid-feedback">${formsff.netSalary}</em>
                  </div>
                <div class="formInputBox Salary">
                  <input placeholder=" " id="Salary" maxlength="8" minlength="2" name="Salary" type="number"/>
                  <label for="Salary">${grossSalaryAnnual}</label>
                  <em id="gross-error" class="error invalid-feedback">${formsff.grossSalary}</em>
                </div>

                <div class="formInputField wpexp monthYears">
                <div
                  class="formInputBox wpexp"
                >
                  <div class="title">${workExperience}</div>
                  <div class="wrkExpSelectMain wrkExpBox">
                    <div class="d-flex flex-column">
                      <select
                        id="Years"
                        name="Years"
                      >
                        <option>Year*</option>
                      </select>
                      <em id="workyear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
                    </div>
                    <div class="d-flex flex-column">
                      <select
                        name="Month"
                        id="Month"
                      >
                        <option >Month*</option>

                      </select>
                      <em id="month-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
                    </div>
                  </div>
                </div>
              </div>
              <div class="formfieldRow wpexp">
              <div class="formInputBox wpexp tenuremonthYears">
            <div
              class="d-flex align-items-lg-center justify-content-between flex-column flex-lg-row"
            >
              <div class="title">${buisness}</div>
              <div class="wrkExpSelectMain d-flex">
                <div class="d-flex flex-column">
                  <select
                    name="TenureBussinessYear"
                    class="form-control select2-hidden-accessible"
                    id="TenureBussinessYear"
                  >
                    <option>Year*</option>
                  </select>
                  <em id="tenureBussinessYear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
                </div>
                <div class="d-flex flex-column">
                  <select
                    name="TenureBussinessMonth"
                    class="form-control ml-1 select2-hidden-accessible"
                    id="TenureBussinessMonth"
                  >
                    <option>Month*</option>

                  </select>
                  <em id="tenureBussinessMonth-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
                </div>
              </div>
            </div>
          </div>
          <div
          class="formInputBox wpexp ProfmonthYears"
          style="display: none"
        >
          <div class="title">${ProfWork}</div>
          <div class="wrkExpSelectMain d-flex">
            <div class="d-flex flex-column">
              <select
                name="ProfessionalYear"
                class="form-control"
                id="ProfessionalYear"
              >
                <option >Year*</option>
              </select>
              <em id="professionalYear-error" class="error invalid-feedback" style="display: none;">${formsff.year}</em>
            </div>
            <div class="d-flex flex-column">
              <select
                name="ProfessionalMonth"
                class="form-control ml-2"
                id="ProfessionalMonth"
              >
                <option >Month*</option>
              </select>
              <em id="professionalMonth-error" class="error invalid-feedback" style="display: none;">${formsff.month}</em>
            </div>
          </div>
        </div>
        </div>
        <div class="formInputBox AvgMonthyIncome">
        <input
          placeholder=" "
          id="AvgMonthyIncome"
          maxlength="6"
          minlength="1"
          name="AvgMonthyIncome"
          type="number"
        />
        <label for="AvgMonthyIncome">${avgMonth}</label>
        <em id="avg-error" class="error invalid-feedback">${formsff.avgMonthyIncome}</em>
      </div>

              <div class="formInputBox SubCategory DefaultSelected">
              <select id="SubCategory" name="SubCategory">
                     <option >Sub category*</option>
                     <option value="440009">Student</option>
                     <option value="440010">Retd Individual</option>
                     <option value="440012">Other</option>
                     <option value="440011">Housewife</option>
              </select>
            <label for="SubCategory">${subCat}</label>
            <em id="subCategory-error" class="error invalid-feedback" style="display: none;">${formsff.subCategory}</em>
          </div>
          <div class="formfieldRow">

          <div class="formInputBox CarOwn DefaultSelected">
<select id="CarOwn" name="CarOwn" >
<option >Number of Cars Owned*</option>
<option >0</option>
<option >1</option>
<option >2</option>
<option >3</option>
<option >4</option>
<option >5</option>
<option >More than 5</option>
</select>
<label for="CarOwn">${carOwned}</label>
<em id="carOwn-error" class="error invalid-feedback" style="display: none;">${formsff.carsOwned}</em>
</div>
<div class="formInputBox cattles">
<input
  placeholder=" "
  id="cattles"
  max="8"
  minlength="1"
  name="cattles"
  type="number"
/>
<label for="cattles">${cattle}</label>
<em id="cattles-error" class="error invalid-feedback">${formsff.dairyCattle}</em>
</div>
</div>
<div class="formInputBox agriLand">
  <input
    placeholder=" "
    id="agriLand"
    maxlength="6"
    minlength="1"
    name="agriLand"
    type="number"
  />
  <label for="agriLand">${agri}</label>
  <em id="agri-error" class="error invalid-feedback">${formsff.agriLand}</em>
</div>

                </div>


                        <div class="col-md-4">
                        <div class="formInputBox CurrentEMI">
                        <input
                          placeholder=" "
                          id="CurrentEMI"
                          maxlength="8"
                          minlength="1"
                          name="CurrentEMI"
                          type="number"
                        />
                        <label for="CurrentEMI">${currentEMIsMonthly}</label>
                        <em id="currentEMI-error" class="error invalid-feedback">${formsff.currentEmi}</em>
                      </div>
              <div class="formInputField">
                <div class="formInputBox residenceType DefaultSelected">
                  <select
                    id="ResidenceType"
                    name="ResidenceType"
                  >
                    <option >Residence Type*</option>
                    <option value='230001'>Rented</option>
                    <option value='230002'>Self/Family Owned</option>
                  </select>
                  <label for="ResidenceType">${residenceType}</label>
                  <em id="residenceType-error" class="error invalid-feedback" style="display: none;">${formsff.residenceType}</em>
                </div>
                <div class="formInputBox ResidentSince DefaultSelected">
                  <select
                    id="ResidentSince"
                    name="ResidentSince"
                  >
                    <option >Residence Since*</option>
                    <option value='260002'>1-2 year</option>
                    <option value='260002'>2+ year</option>
                    <option value='260003'>&lt;1 year</option>
                  </select>
                  <label for="ResidentSince">${residenceSince}</label>
                  <em id="residentSince-error" class="error invalid-feedback" style="display: none;">${formsff.residenceSince}</em>
                </div>
              </div>
            </div>

                </div>

                <div class="formInputField col-12">
                  <div class="nfAddCoApplicant">
                    <label class="customCheckBox DefaultSelected">
                      ${checkBox}
                      <input
                        type="checkbox"
                        name="addCoApplicant"
                      />
                      <span class="cusCheckMark"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="pageButton applicant_buttons">
              <div class="whiteButton">
                <a href="${backLink}"
                  class="applicantBack_back-btn"
                  >${back}</a
                >
              </div>
              <div class="blackButton" id="save_btn">
                <a
                  class="prsnl_dtls_save"
                  >${save}</a
                >
              </div>
              <div class="blackButton" id="continue_btn" >
                <a href="${nextLink}"
                  class="prsnl_dtls_sbmt_slry"
                  >${continueText}</a
                >
              </div>
              <div class="blackButton" style="display: none;">
                <a class="prsnl_dtls_next">${nextBtn}</a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="popUpmain" id="save-popup">
    <div class="modal-dialog-centered">
        <div class="modal-content">
        <div class="close" id="close-save-popup" aria-label="Close">
        </div>
        <div class="popupContent green">
          <h2><div class="icon-img"></div> Success</h2>
          <p>${formsff.saveSuccess}</p>
          <div class="btn-container">
              <div class="blackButton"><button type="button" id="ok-btn">${formsff.okBtn}</button></div>
              <div>
              </div>
          </div>
      </div>
      </div>
  </div>
    </div>
    <div class="popUpmain" id="cibil-score-popup">
      <div class="modal-dialog-centered">
      <div class="modal-content">
          <div class="cibilPopupContent">
              <div class="cibilLogo">
              </div>
              <p>${formsff.cibilScore}</p>
              <div class="cibilButtMain">
                  <div class="blackButton" style=""><a href="${nextLink}" class="skiptooffer">${formsff.proceedBtn}</a></div>
              </div>
          </div>
      </div>
      </div>
     </div>

     <div class="popUpmain fade-in" id="ocr_error_popup" style="display: none;">
      <div class="modal-dialog-centered">
          <div class="modal-content ">
              <div class="close" id="close-ocr-error-popup"></div>
              <div class="popupContent red">
                  <h2>
                  <span class="error-icon"></span>
                     Error
                  </h2>
                  <p>${formsff.panCardError}</p>
                  <div class="btn-container">
                      <div class="blackButton">
                          <button type="button">${formsff.okBtn}</button>
                      </div>
                  </div>
              </div>
          </div>
    </div>
</div>
<div class="popUpmain fade-in" id="email_error_popup" style="display: none;">
  <div class="modal-dialog-centered">
    <div class="modal-content">
        <div class="close" id="close-email-error-popup"></div>
        <div class="popupContent red">
            <h2>
            <span class="error-icon"></span>Error
            </h2>
            <p>${formsff.emailError}</p>
            <div class="btn-container">
                <div class="blackButton">
                    <button type="button">${formsff.okBtn}</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</div>

<div class="popUpmain" id="bank_validation_popup" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.netSalaryInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="popUpmain" id="bank_validation_popup_emiSal" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup-emiSal">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.currentEmiInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <div class="popUpmain" id="bank_validation_popup_avgSal" style="display: none;">
      <div class="modal-dialog-centered">
        <div class="modal-content">
            <div class="close" id="close-bank-popup-avgSal">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span> Information</h2>
                <p>${formsff.avgMonthlyInfo}</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
                <div>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
<div class="popUpmain" id="cibil-positive-score-popup">
      <div class="modal-content">
        <div class="cibilPopupContent">
          <div class="cibilLogo">
            </div>
          <h2>${formsff.cibilTitle}</h2>
          <p class="question">${formsff.cibilPopupPara}</p>
          <div class="cibilOtpResendMain">
              <form id="cibil-popup1" novalidate="novalidate">
                  <div class="cibilOtpTxtField"><input type="tel" placeholder="${formsff.cibilOtpPlaceholder}" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" name="otp" id="otp" maxlength="6" data-error="This field is required." tabindex="94"></div>
                  <div class="cibilResendOtpTxt"><a href="javascript:void(0)" class="resend0_cibil" style="cursor: pointer; right: 10px; top: 8px; color: rgb(255, 0, 0); font-weight: bold; pointer-events: inherit;">${formsff.cibilResend}</a></div>
                  <p id="counter_cibil" style="font-size: 10px; color: green;display: none;">
                      ${formsff.cibilResendTime}<strong id="count_cibil"></strong>
                  </p>
              </form>
              <div class="skip_offer_dis" style="display: none;">
                  <h6 class="or">OR</h6>
                  <p>
                  ${formsff.cibilPopupParaSucesss}<a href="javascript:;" id="know-more">${formsff.cibilKnow}</a>
                  </p>
                  <div class="check_dic">
                      <input class="disclamer form-check-input" id="disclaimer" name="skip_offer_dis" type="checkbox" value="true" tabindex="95">
                      <label class="form-check-label">
                       ${formsff.cibilCheckbox}
                      </label>
                  </div>
              </div>
          </div>
          <div class="cibilButtMain">
              <div class="blackButton"><button type="button" class="submitcibil skiptooffer_disable" href="${nextLink}" >${formsff.cibilSubmitBtn}</button></div>
              <div class="blackButton" style="display: none;"><button type="button" class="skiptooffer skiptooffer_disable" href="${nextLink}" >${formsff.cibilSkipOfferBtn}</button></div>
          </div>
      </div>
      </div>

  </div>
  <div class="popUpmain" id="know-more-popup">
  <div class="modal-content">
    <button type="button" class="close-btn">
      <span >×</span>
  </button>
    <div class="popupContent">
<p>
Validation with Credit Bureau is
essential to show customized offer on
MSSF
</p>
    </div>
  </div>

</div>
`;

  // Injecting the rendered HTML into the block element
  block.innerHTML = utility.sanitizeHtml(htmlContent);
  sfUtil.addOptions('Years', 0, 50);
  sfUtil.addOptions('ProfessionalYear', 0, 50);
  sfUtil.addOptions('TenureBussinessYear', 0, 50);
  sfUtil.addOptions('Month', 0, 11);
  sfUtil.addOptions('ProfessionalMonth', 0, 11);
  sfUtil.addOptions('TenureBussinessMonth', 0, 11);

  document.getElementById('EmploymentType').addEventListener('change', function employmentField() {
    const selectedValue = this.selectedOptions[0].textContent.trim();

    // Sections to be shown/hidden
    const itrSection = document.querySelector('.itrRadioBtnSec');
    const subEmploymentSection = document.querySelector('.formInputBox.SubEmployee');
    const CarOwnSection = document.querySelector('.formInputBox.CarOwn');
    const subEmployeeNoSection = document.querySelector('.formInputBox.SubEmployee_no');
    const TenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const ProfmonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const subCategorySection = document.querySelector('.formInputBox.SubCategory');
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');
    const employerTypeSection = document.getElementById('EmployerType').closest('.formInputBox');
    const employerSection = document.querySelector('.formInputBox.Employer');
    const netIncomeSection = document.querySelector('.formInputBox.net_income');
    const salarySection = document.querySelector('.formInputBox.Salary');
    const workExpSection = document.querySelector('.formInputField.wpexp');
    const currentEMISection = document.querySelector('.formInputBox.CurrentEMI');

    // Logic for hiding/showing sections based on the selected value
    if (selectedValue === 'Employment Type*') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
    } else if (selectedValue === 'Salaried') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      subCategorySection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
      TenureBussinessYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else if (selectedValue === 'No Income Source') {
      itrSection.style.display = 'none';
      subEmploymentSection.style.display = 'none';
      avgMonthlyIncomeSection.style.display = 'none';
      employerTypeSection.style.display = 'none';
      employerSection.style.display = 'none';
      netIncomeSection.style.display = 'none';
      salarySection.style.display = 'none';
      workExpSection.style.display = 'none';
      currentEMISection.style.display = 'none';
      subCategorySection.style.display = '';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else if (selectedValue === 'Self-Employed') {
      itrSection.style.display = '';
      subEmploymentSection.style.display = '';
      avgMonthlyIncomeSection.style.display = '';
      employerTypeSection.style.display = 'none';
      employerSection.style.display = 'none';
      netIncomeSection.style.display = 'none';
      salarySection.style.display = 'none';
      workExpSection.style.display = 'none';
      currentEMISection.style.display = '';
      subCategorySection.style.display = 'none';
      TenureBussinessYearSection.style.display = 'none';
      ProfmonthYearsYearSection.style.display = 'none';
      subEmployeeNoSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      CarOwnSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      itrSection.style.display = '';
      subEmploymentSection.style.display = '';
      avgMonthlyIncomeSection.style.display = '';
      employerTypeSection.style.display = '';
      employerSection.style.display = '';
      netIncomeSection.style.display = '';
      salarySection.style.display = '';
      workExpSection.style.display = '';
      currentEMISection.style.display = '';
      TenureBussinessYearSection.style.display = '';
      ProfmonthYearsYearSection.style.display = '';
    }
  });

  document.getElementById('EmployerType').addEventListener('change', function employerField() {
    const selectedOption = this.selectedOptions[0];
    if (selectedOption) {
      const selectedValue = selectedOption.textContent.trim();
      // Sections to be shown/hidden
      const itrSection = document.querySelector('.itrRadioBtnSec');
      const subEmploymentSection = document.querySelector('.formInputBox.SubEmployee');
      const subCategorySection = document.querySelector('.formInputBox.SubCategory');
      const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
      const employerTypeSection = document.getElementById('EmployerType').closest('.formInputBox');
      const employerSection = document.querySelector('.formInputBox.Employer');
      const netIncomeSection = document.querySelector('.formInputBox.net_income');
      const salarySection = document.querySelector('.formInputBox.Salary');
      const workExpSection = document.querySelector('.formInputField.wpexp');
      const currentEMISection = document.querySelector('.formInputBox.CurrentEMI');

      // Logic for hiding/showing sections based on the selected value
      if (selectedValue === 'Government Salaried') {
        employerSection.style.display = 'none';
        itrSection.style.display = 'none';
        subEmploymentSection.style.display = 'none';
        subCategorySection.style.display = 'none';
        avgMonthlyIncomeSection.style.display = 'none';
        employerTypeSection.style.display = '';
        netIncomeSection.style.display = '';
        salarySection.style.display = '';
        workExpSection.style.display = '';
        currentEMISection.style.display = '';
      } else if (selectedValue === 'Employer Type*' || selectedValue === 'Private Salaried') {
        itrSection.style.display = 'none';
        subEmploymentSection.style.display = 'none';
        subCategorySection.style.display = 'none';
        avgMonthlyIncomeSection.style.display = 'none';
        employerTypeSection.style.display = '';
        employerSection.style.display = '';
        netIncomeSection.style.display = '';
        salarySection.style.display = '';
        workExpSection.style.display = '';
        currentEMISection.style.display = '';
      } else {
        // Show all sections for other selections
        itrSection.style.display = '';
        subEmploymentSection.style.display = '';
        avgMonthlyIncomeSection.style.display = '';
        employerTypeSection.style.display = '';
        employerSection.style.display = '';
        netIncomeSection.style.display = '';
        salarySection.style.display = '';
        workExpSection.style.display = '';
        currentEMISection.style.display = '';
        subCategorySection.style.display = '';
      }
    }
  });

  // Function to handle the change in SubEmployee dropdown when ITR "Yes" is selected
  function handleSubEmployeeChange() {
    const selectedValue = document.getElementById('SubEmployee').value;
    // Sections to be shown/hidden
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const tenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const profMonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const carOwnSection = document.querySelector('.formInputBox.CarOwn');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');

    // Logic for showing/hiding based on selected value
    if (selectedValue === '440002') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else if (selectedValue === '440001') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else if (selectedValue === 'Sub Employment*') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
    }
  }

  // Function to handle the change in SubEmployee_no dropdown when ITR "No" is selected
  function handleSubEmployeeNoChange() {
    const selectedValue = document.getElementById('SubEmployee_no').value;

    // Sections to be shown/hidden
    const avgMonthlyIncomeSection = document.querySelector('.formInputBox.AvgMonthyIncome');
    const tenureBussinessYearSection = document.querySelector('.formInputBox.tenuremonthYears');
    const profMonthYearsYearSection = document.querySelector('.formInputBox.ProfmonthYears');
    const carOwnSection = document.querySelector('.formInputBox.CarOwn');
    const cattlesSection = document.querySelector('.formInputBox.cattles');
    const agriLandSection = document.querySelector('.formInputBox.agriLand');

    // Logic for showing/hiding based on selected value
    if (selectedValue === '440004') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
    } else if (selectedValue === '440003' || selectedValue === '440006') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      carOwnSection.style.display = 'none';
    } else if (selectedValue === '440005') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
      carOwnSection.style.display = '';
    } else if (selectedValue === 'Sub Employment*') {
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = 'none';
      profMonthYearsYearSection.style.display = 'none';
      carOwnSection.style.display = 'none';
      cattlesSection.style.display = 'none';
      agriLandSection.style.display = 'none';
    } else {
      // Show all sections for other selections
      avgMonthlyIncomeSection.style.display = '';
      tenureBussinessYearSection.style.display = '';
      profMonthYearsYearSection.style.display = '';
      carOwnSection.style.display = '';
      cattlesSection.style.display = '';
      agriLandSection.style.display = '';
    }
  }

  // Function to handle the change in ITR "Yes" or "No"
  function handleITRChange() {
    const itrYesChecked = document.getElementById('ItrYes').checked;
    const itrNoChecked = document.getElementById('ItrNo').checked;

    if (itrYesChecked) {
      document.querySelector('.formInputBox.SubEmployee').style.display = '';
      document.querySelector('.formInputBox.SubEmployee_no').style.display = 'none';
      handleSubEmployeeChange();
    } else if (itrNoChecked) {
      document.querySelector('.formInputBox.SubEmployee_no').style.display = '';
      document.querySelector('.formInputBox.SubEmployee').style.display = 'none';
      handleSubEmployeeNoChange();
    }
  }

  // Attach event listeners
  document.getElementById('ItrYes').addEventListener('change', handleITRChange);
  document.getElementById('ItrNo').addEventListener('change', handleITRChange);
  document.getElementById('SubEmployee').addEventListener('change', handleSubEmployeeChange);
  document.getElementById('SubEmployee_no').addEventListener('change', handleSubEmployeeNoChange);
  handleITRChange();

  const accessToken = sessionStorage.getItem('access_token');

  const companyListElement = document.getElementById('companyList');
  const searchInput = document.getElementById('Employer');

  // Function to fetch and filter companies from API
  const fetchCompanies = async (query) => {
    if (query.length < 3) {
      companyListElement.innerHTML = '';
      return;
    }

    try {
      const response = await fetch(`${apiDomain}/app-service/api/v1/company/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: accessToken,
        },
        body: JSON.stringify({ search_text: query }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }

      const data = await response.json();

      // Populate the company list with the response
      const listItems = data.company_list.map((company) => `
      <div class="company-item" data-company="${company.company_name}">
          <strong>${company.company_name}</strong>
      </div>
    `).join('');

      companyListElement.innerHTML = listItems;
    } catch (error) {
      companyListElement.innerHTML = '<div class="error">Failed to load companies. Please try again later.</div>';
    }
  };

  // Function to handle the selection of a company
  const selectCompany = (companyName) => {
    searchInput.value = companyName;
    companyListElement.innerHTML = '';
  };

  // Event listener for input in the search field
  searchInput.addEventListener('input', (event) => {
    const searchValue = event.target.value.trim();
    fetchCompanies(searchValue);
  });

  // Event delegation to handle clicks on dynamically generated company items
  companyListElement.addEventListener('click', (event) => {
    const companyItem = event.target.closest('.company-item');
    if (companyItem) {
      const selectedCompanyName = companyItem.getAttribute('data-company');
      selectCompany(selectedCompanyName);
    }
  });

  // --------------------North East States Start---------------------//
  // Retrieve the state code from session storage
  const stateCdValue = sessionStorage.getItem('selectedDealerStateCd');

  // List of states for which the section should be displayed
  const allowedStates = ['ML', 'AR', 'MZ', 'NL', 'TR'];

  // Check if the current state is in the allowed list
  if (allowedStates.includes(stateCdValue)) {
  // Show the .panRadioBtn section
    document.querySelector('.panRadioBtn').style.display = 'block';
  } else {
  // Hide the .panRadioBtn section
    //  document.querySelector('.panRadioBtn').style.display = 'none';
  }

  // --------------------North East States END ---------------------//

  // --------------------------companies Search API END--------------------//

  // // Function to populate the form fields with JSON data
  function populateFormFields(enquiryData) {
    const employmentTypeField = document.getElementById('EmploymentType');
    employmentTypeField.value = enquiryData.employment_type_id;

    const event = new Event('change');
    employmentTypeField.dispatchEvent(event);
    employmentTypeField.disabled = true;
    const employerTypeField = document.getElementById('EmployerType');
    employerTypeField.value = enquiryData.sub_employment_type_id || '';
    employerTypeField.dispatchEvent(event);
    employerTypeField.disabled = true;
  }

  validateFields('Name', 'name-error');
  validateFields('MiddleName', 'name-error', false);
  validateFields('LastName', 'last-error');
  validateFields('Email', 'email-error');
  validateFields('Pan', 'pan-error');
  validateFields('EmploymentType', 'employmentType-error');
  validateFields('Employer', 'employer-error');
  validateFields('net_income', 'net-error');
  validateFields('Salary', 'gross-error');
  validateFields('AvgMonthyIncome', 'avg-error');
  validateFields('cattles', 'cattles-error');
  validateFields('agriLand', 'agri-error');
  validateFields('CurrentEMI', 'currentEMI-error');
  validateFields('dob', 'dob-error');

  const saveButton = document.getElementById('save_btn');

  let mobileFromApi = '';
  let cityFromApi = '';
  let stateFromApi = '';
  let dealerFromApi = '';
  let modelFromCarApi = '';
  let subEmployeeFromApi = '';
  let varientFromCarApi = '';
  const aadharFromNumberApi = '';
  let pancardAvailableFromApi = '';
  let kycDocumentFromApi = '';
  let kycDocumentIdFromApi = '';
  let creditCheckFlagFromApi = '';
  let solicitFlagFromApi = '';
  const registrationFromApi = '';
  const isCustomerCoApplicantTypeFromApi = 'false';

  document.getElementById('continue_btn').addEventListener('click', async (event) => {
    event.preventDefault();
    const hasErrors = CheckFormValid();
    if (!hasErrors) {
    // Collecting user input values
      const firstNameSubmit = document.getElementById('Name')?.value.trim();
      const middleNameSubmit = document.getElementById('MiddleName')?.value.trim();
      const lastNameSubmit = document.getElementById('LastName')?.value.trim();
      const emailSubmit = document.getElementById('Email')?.value.trim();
      const dobSubmit = document.getElementById('dob')?.value.trim();
      const panNumberSubmit = document.getElementById('Pan').value;

      // Get the selected residence type and map to its code
      const residenceTypeElementSubmit = document.getElementById('ResidenceType');
      const residenceTypeCode = residenceTypeElementSubmit?.value;

      // Get the selected gender and map to its code
      const genderElement = document.getElementById('Gender');
      const genderCode = genderElement?.value;

      // Get the selected residence since and map to its code
      const residentSinceElement = document.getElementById('ResidentSince');
      const residentSinceCode = residentSinceElement?.value;

      // Get the selected residence since and map to its code
      const subEmployeeElement = document.getElementById('SubEmployee');
      const subEmployeeCode = subEmployeeFromApi || subEmployeeElement?.value;

      // Collecting user input values
      const netIncome = document.getElementById('net_income')?.value.trim();
      const currentEMI = document.getElementById('CurrentEMI')?.value.trim();

      const grossSalaryElement = document.getElementById('Salary')?.value.trim();
      const employmentTypeIdCode = sessionStorage.getItem('employmentTypeId');
      const avgSalarySubmit = document.getElementById('AvgMonthyIncome')?.value.trim() || '';
      const enquiryIdValue = sessionStorage.getItem('enquiryId');

      // API request body
      const requestBody = {
        aadhar_number: aadharFromNumberApi,
        first_name: firstNameSubmit,
        middle_name: middleNameSubmit,
        last_name: lastNameSubmit,
        email: emailSubmit,
        dob: dobSubmit,
        mobile: mobileFromApi,
        auth_mobile: mobileFromApi,
        city: cityFromApi,
        state: stateFromApi,
        dealer: dealerFromApi,
        registration: registrationFromApi,
        is_customer_co_applicant_type: isCustomerCoApplicantTypeFromApi,
        car_model: modelFromCarApi,
        car_variant: varientFromCarApi,
        employment_type: employmentTypeIdCode,
        sub_employment_id: subEmployeeCode,
        residence_type: residenceTypeCode,
        solicit_flag: 'Y',
        gender: genderCode,
        credit_check_flag: 'Y',
        pan_number: panNumberSubmit,
        defence_id: '',
        annual_salary: grossSalaryElement,
        net_annual_income: netIncome,
        current_emi: currentEMI,
        enquiry_id: enquiryIdValue,
        residing_since: residentSinceCode,
        avg_monthly_income: avgSalarySubmit,
        pancard_available: pancardAvailableFromApi,
      };
      insertConditionalParams(requestBody);
      try {
        const response = await personalDetailsSubmit(requestBody);
        if (response.success) {
          detailsSubmitted = true;
        }
        document.querySelector('.skiptooffer').addEventListener('click', () => {
          if (detailsSubmitted) {
            document.getElementById('cibil-score-popup').style.display = 'none';
            window.location.href = nextLink;
          }
        });
        // Store relevant data in sessionStorage
        sessionStorage.setItem('annual_salary', grossSalaryElement);
        sessionStorage.setItem('net_annual_income', netIncome);
        sessionStorage.setItem('residing_since', residentSinceCode);
        sessionStorage.setItem('residence_type', residenceTypeCode);
        sessionStorage.setItem('sub_employment_id', subEmployeeCode);
        sessionStorage.setItem('email', emailSubmit);
        sessionStorage.setItem('dob', dobSubmit);
        sessionStorage.setItem('mobile', mobileFromApi);
      } catch (error) {
        const notification = document.getElementById('notification');
        if (notification) {
          notification.textContent = `${formsff.errorFetchingApi}`;
          notification.style.color = 'red';
        }
      }
    }
  });

  if (saveButton) {
    saveButton.addEventListener('click', async () => {
      // Collect user inputs
      const hasErrors = showSuccessPopup();
      if (!hasErrors) {
        const firstNameSave = document.getElementById('Name').value;
        const middleNameSave = document.getElementById('MiddleName').value;
        const lastNameSave = document.getElementById('LastName').value;
        const emailSave = document.getElementById('Email').value;
        const dobSave = document.getElementById('dob')?.value.trim() || '';
        const panNumberSave = document.getElementById('Pan').value;

        // Get the selected residence type and map to its code
        const residenceTypeElementSave = document.getElementById('ResidenceType');
        const residenceTypeCodeSave = residenceTypeElementSave?.value;

        // Get the selected residence since and map to its code
        const residentSinceElementSave = document.getElementById('ResidentSince');
        const residentSinceCodeSave = residentSinceElementSave?.value;

        const subEmployeeElementSave = document.getElementById('SubEmployee');
        const subEmployeeCodeSave = subEmployeeElementSave?.value;

        // Collecting user input values
        const netIncomeSave = document.getElementById('net_income')?.value.trim();
        const currentEMISave = document.getElementById('CurrentEMI')?.value.trim();
        const avgSalarySubmitSave = document.getElementById('AvgMonthyIncome')?.value.trim();
        const carOwnSave = document.getElementById('CarOwn')?.value;
        const cattlesSave = document.getElementById('cattles')?.value;
        const agriLandSave = document.getElementById('agriLand')?.value;
        const employmentTypeIdCodeValue = sessionStorage.getItem('employmentTypeId');
        const grossSalaryElementsave = document.getElementById('Salary')?.value.trim();
        const emplyerElementSave = document.getElementById('Employer')?.value.trim();
        const enquiryId = sessionStorage.getItem('enquiry_id');

        // Validate required inputs (optional)
        if (!firstNameSave || !lastNameSave || !emailSave) {
          return;
        }

        // API body
        const body = {
          first_name: firstNameSave,
          middle_name: middleNameSave,
          last_name: lastNameSave,
          email: emailSave,
          mobile: mobileFromApi,
          auth_mobile: mobileFromApi,
          city: cityFromApi,
          state: stateFromApi,
          dob: dobSave,
          dealer: dealerFromApi,
          car_model: modelFromCarApi,
          car_variant: varientFromCarApi,
          employment_type: employmentTypeIdCodeValue,
          annual_salary: grossSalaryElementsave,
          solicit_flag: solicitFlagFromApi,
          credit_check_flag: creditCheckFlagFromApi,
          current_emi: currentEMISave,
          enquiry_id: enquiryId,
          net_annual_income: netIncomeSave,
          avg_monthly_income: avgSalarySubmitSave,
          total_agri_land: agriLandSave,
          no_of_dairy_cattle: cattlesSave,
          car_owner: carOwnSave,
          sub_employment_id: subEmployeeCodeSave,
          pan_number: panNumberSave,
          residence_type: residenceTypeCodeSave,
          employer: emplyerElementSave,
          aadhar_number: aadharFromNumberApi,
          residing_since: residentSinceCodeSave,
          pancard_available: pancardAvailableFromApi,
          kyc_document: kycDocumentFromApi,
          kyc_document_id: kycDocumentIdFromApi,
        };
        insertConditionalParams(body);
        // API call
        try {
          const response = await personalDetailsSave(body);
          const result = await response.json();

          if (result.success) {
            const savePopup = document.getElementById('save-popup');
            savePopup.style.display = 'block';
          }
        } catch (error) {
          throw new Error(`Failed to save details: ${error}`);
        }
      }
    });
  }

  function setMaxDate() {
    const dateInput = document.getElementById('dob');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    dateInput.setAttribute('max', today); // Set max attribute to today's date
  }

  try {
    const apiResponse = await getCustomerData(sessionStorage.getItem('enquiryId'));

    // Parse the JSON response
    const apiData = await apiResponse.data;

    // Extract firstName from the response
    const enquiryData = apiData?.customer_data?.enquiry;
    if (enquiryData) {
      populateFormFields(enquiryData);

      // Update global variable with mobile value
      mobileFromApi = enquiryData.mobile;
      cityFromApi = enquiryData.city;
      stateFromApi = enquiryData.state;
      dealerFromApi = enquiryData.dealer;
      modelFromCarApi = apiData?.customer_data?.car_summary?.model_code;
      subEmployeeFromApi = enquiryData.sub_employment_type_id;
      varientFromCarApi = apiData?.customer_data?.car_summary?.variant_code;
      pancardAvailableFromApi = enquiryData.pancard_available;
      kycDocumentFromApi = enquiryData.kyc_document;
      kycDocumentIdFromApi = enquiryData.kyc_document_id;
      creditCheckFlagFromApi = enquiryData.credit_check_flag;
      solicitFlagFromApi = enquiryData.solicit_flag;

      // Update fields with specific labels and placeholders
      updateField('Name', enquiryData.first_name, firstName);
      updateField('LastName', enquiryData.last_name, lastName);
      updateField('MiddleName', enquiryData.middle_name, middleName);
      updateField('Email', enquiryData.email, emailId);
      updateField('Mobile', enquiryData.mobile, mobileNumber);
      updateField('dob', enquiryData.dob, dateOfBirth);
      updateField('Pan', apiData?.customer_data?.customer?.pan_number, panNumber);
      updateField('net_income', apiData?.customer_data?.customer?.net_annual_income, netSalaryAnnual);
      updateField('Salary', apiData?.customer_data?.customer?.annual_salary, grossSalaryAnnual);
      updateField('CurrentEMI', apiData?.customer_data?.customer?.current_emi, currentEMIsMonthly);
      updateField('Years', apiData?.customer_data?.customer?.work_experience_years, 'Year*');
      updateField('Month', apiData?.customer_data?.customer?.work_experience_months, 'Month*');
      updateField('ProfessionalYear', apiData?.customer_data?.customer?.professional_experience_years, 'Year*');
      updateField('ProfessionalMonth', apiData?.customer_data?.customer?.professional_experience_months, 'Month*');
      updateField('TenureBussinessYear', apiData?.customer_data?.customer?.tenure_business_years, 'Year*');
      updateField('TenureBussinessMonth', apiData?.customer_data?.customer?.tenure_business_months, 'Month*');
      updateField('AvgMonthyIncome', apiData?.customer_data?.customer?.avg_monthly_income, avgMonth);
      updateField('ResidenceType', apiData?.customer_data?.customer?.residence_type, residenceType);
      updateField('ResidentSince', apiData?.customer_data?.customer?.residing_since, residenceSince);
      updateField('Gender', apiData?.customer_data?.customer?.gender, gender);
      updateField('Employer', enquiryData.customer_data?.customer?.employer, employerType);
    }
  } catch (error) {
    // do nothing
  }

  setMaxDate();
}
