import formDataUtils from './formDataUtils.js';
import utility from './utility.js';
import { fetchPlaceholders } from '../scripts/aem.js';
let referenceFields = '';
let incomeDetailFields = '';
const formsff = await utility.fetchFormSf();
export function getBankName(financier) {
  switch (financier) {
    case '280001': return 'icici';
    case '280003': return 'hdfc';
    case '280028': return 'uco';
    case '280011': return 'sbi';
    case '280010': return 'axis';
    case '280008': return 'kotak';
    case '280002': return 'yes';
    case '280004': return 'mahindra';
    case '280005': return 'chola';
    case '280006': return 'au';
    case '280007': return 'indus';
    case '280019': return 'boi';
    case '280018': return 'canara';
    case '280020': return 'pnb';
    case '280021': return 'ubi';
    case '280022': return 'indian';
    case '280023': return 'karnataka';
    case '280024': return 'central';
    case '280025': return 'bom';
    case '280026': return 'bajaj';
    case '280027': return 'jnk';
    case '280029': return 'idbi';
    case '280030': return 'iob';
    case '280031': return 'south';
    case '280032': return 'punjabsind';
    case '280015': return 'federal';

    default: return '';
  }
}
async function addFormFields(data, employmentType, financier, incomeDetailLabel) {
  let fields;
  if (employmentType === '200002') {
    fields = await formDataUtils.fetchBankFieldMap('se-fieldmap');
  } else if (employmentType === '200001') {
    fields = await formDataUtils.fetchBankFieldMap('sal-fieldmap');
  }
  incomeDetailFields = `
    <div class="right common1" id="incomeDetail" style="display: none;">
        <h6>${incomeDetailLabel}</h6>
        <div class="formWrap">
        </div>
    </div>`;
  if (Object.prototype.hasOwnProperty.call(fields.educationQual, financier)) {
    if (fields.grossIncome && fields.grossIncome[financier] !== undefined) {
      if (fields.grossIncome[financier] === '' || fields.employmentType[financier] === '') {
        incomeDetailFields = `
        <div class="right common1" id="incomeDetail">
            <h6>${incomeDetailLabel}</h6>
            <div class="formWrap">
                    ${fields.employmentType[financier] === 'N' ? '' : `
                    <div class="form-group">
                        ${formDataUtils.createDropdown(data.employmentType, 'full-width', true, '')}
                    </div>`}
                    ${fields.subemploymentType[financier] === 'N' ? '' : `
                    <div class="form-group">
                        ${formDataUtils.createDropdown(data.subemploymentType, 'full-width', true, '')}
                    </div>`}
                    ${fields.netIncome[financier] === 'N' ? '' : `
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.netIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>`}
                    ${fields.grossIncome[financier] === 'N' ? '' : `
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.grossIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>`}
                    ${fields.currentEmi[financier] === 'N' ? '' : `
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.currentEmi, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>`}
                    ${fields.currentWorkexp[financier] === 'N' ? '' : `
                    <div class="form-group">
                        <div class="workExpRow">
                            <span>Current Organisation Work Experience</span>
                            <select id="current_work_experience_years" name="current_work_experience_years" tabindex="37" disabled=true>
                                <option value="">Year*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Year</span>
                            <select name="current_work_experience_months" id="current_work_experience_months" tabindex="38" disabled=true>
                                <option value="">Month*</option>
                                
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Month</span>
                        </div>
                    </div>`}
                    ${fields.totalWorkexp[financier] === 'N' ? '' : `
                    <div class="form-group">
                        <div class="workExpRow">
                            <span>Total Work Experience</span>
                            <select id="work_experience_years" name="work_experience_years" tabindex="37" disabled=true>
                                <option value="">Year*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Year</span>
                            <select name="work_experience_months" id="work_experience_months" tabindex="38" disabled=true>
                                <option value="">Month*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Month</span>
                        </div>
                    </div>`}
            </div>
        </div>`;
      }
    }
    if (fields.reference[financier] === '') {
      referenceFields = '';
    } else if (fields.reference[financier] === '1') {
      referenceFields = `
        <h2>Reference Details 1</h2>
        <div class="form-group">
            <div class="nfAppFormLeft">
                ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '', 'ref1')}
            </div>
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createDropdown(data.relation, 'full-width', true, { required: true }, '', 'ref1')}
        </div>`;
    } else if (fields.reference[financier] === '2') {
      referenceFields = `
        <h2>Reference Details 1</h2>
        <div class="form-group">
            <div class="nfAppFormLeft">
                ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '', 'ref1')}
            </div>
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref1')}
        </div>
        <div class="form-group">
            ${formDataUtils.createDropdown(data.relation, 'full-width', true, { required: true }, '', 'ref1')}
        </div>
        <h2>Reference Details 2</h2>
        <div class="form-group">
            <div class="nfAppFormLeft">
                ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '','ref2')}
            </div>
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {},'ref2')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {},'ref2')}
        </div>
        <div class="form-group">
            ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {},'ref2')}
        </div>
        <div class="form-group">
            ${formDataUtils.createDropdown(data.relation, 'full-width', true, { required: true }, '', 'ref2')}
        </div>`;
    }
    return utility.sanitizeHtml(`
          ${fields.educationQual[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createDropdown(data.educationalQual, 'full-width', true, '')}
          </div>`}
          ${fields.maritalStatus[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createDropdown(data.maritalStatus, 'full-width', true, {}, '')}
          </div>`}
          ${fields.fatherName[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createInputField(data.fatherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
          </div>`}
          ${fields.motherName[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createInputField(data.motherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
          </div>`}
          ${fields.dependents[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createInputField(data.dependents, 'full-width', 'number', {}, '', 'form-control is-valid dependent-trim')}
          </div>`}
          ${fields.residenceType[financier] === 'N' ? '' : `
          <div class="form-group">
              ${formDataUtils.createDropdown(data.residenceType, 'full-width', true, {}, '')}
          </div>`}
            ${fields.avgMonthlyIncome ? (fields.avgMonthlyIncome[financier] === 'N' ? '' : `
            <div class="form-group">
               ${formDataUtils.createInputField(data.avgMonthlyIncome, 'full-width', 'number', {}, '', 'form-control is-valid dependent-trim')}
            </div>`) :''}
            ${fields.businessName ? (fields.businessName[financier] === 'N' ? '' : `
            <div class="form-group">
                ${formDataUtils.createInputField(data.businessName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>`):''}
             ${fields.businessExp ? (fields.businessExp[financier] === 'N' ? '' : `
                    <div class="form-group">
                        <div class="workExpRow">
                            <span>Tenure Of Business / <br> Professional Work Exp</span>
                            <select id="business_experience_years" name="business_experience_years" tabindex="37" disabled=true>
                                <option value="">Year*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Year</span>
                            <select name="business_experience_months" id="business_experience_months" tabindex="38" disabled=true>
                                <option value="">Month*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Month</span>
                        </div>
                    </div>`) :''}
          `);
  }
  return '';
}
const bankFormUtils = {
  commonForm: async (data, employmentType, financier, personalDetailLabel, incomeDetailLabel) => {
    const formFields = await addFormFields(
      data,
      employmentType,
      getBankName(financier),
      incomeDetailLabel,
    );
    return utility.sanitizeHtml(`
    <div class="personalDetailForm">
        <div class="left common1" id="aboutYou">
            <h6>${personalDetailLabel}</h6>
            <div class="formWrap">
                <div class="form-group">
                    <div class="nfAppFormLeft">
                        ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '')}
                    </div>
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.middleName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
                </div>
                <div class="form-group gender" id="Gender">
                    ${formDataUtils.createRadioButtons(data.gender, 'line', 'full-width', '', '', true)}
                </div>
                <div class="popUpmain fade-in" id="gender_title_validation_popup" style="display: none;">
                    <div class="modal-content">
                        <div class="close" id="close-gender-title-popup"></div>
                        <div class="popupContent blue">
                        <h2><div class="info-icon"></div>Information</h2>
                            <p>${formsff.genderSalutationError}</p>
                            <div class="btn-container">
                            <div class="blackButton" id="ok-gender-title-popup"><button type="button">${formsff.okBtn}</button></div>
                            <div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    ${formDataUtils.createDobField(data.dob, 'full-width', {}, '')}
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.pan, 'full-width', 'text', { maxlength: 10 }, '', 'form-control is-valid')}
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim')}
                </div>
                <div class="form-group">
                    ${formDataUtils.createInputField(data.email, 'full-width', 'text', {}, '', 'form-control is-valid')}
                </div>
                ${formFields}
                ${referenceFields}
            </div>
        </div>
        ${incomeDetailFields}
    </div>
        `);
  },
  // eslint-disable-next-line no-unused-vars
  iciciForm: async (data, employmentType, personalDetailLabel, incomeDetailLabel) => {
    incomeDetailFields = `<div class="right common1" id="incomeDetail">
            <h6>${incomeDetailLabel}</h6>
                    <div class="form-group">
                        ${formDataUtils.createDropdown(data.subemploymentType, 'full-width', true, '')}
                    </div>
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.netIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.grossIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>
                    <div class="form-group">
                        <div class="workExpRow">
                            <span>Total Work Experience</span>
                            <select id="work_experience_years" name="work_experience_years" tabindex="37" disabled=true>
                                <option value="">Year*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Year</span>
                            <select name="work_experience_months" id="work_experience_months" tabindex="38" disabled=true>
                                <option value="">Month*</option>
                            </select>
                            <span class="validation-text validation-required">Please select valid Work Experience in Month</span>
                        </div>
                    </div>
            </div>
        </div>`
    if(employmentType === '200002') {
        return utility.sanitizeHtml(`
            <div class="personalDetailForm">
                  <div class="left common1" id="aboutYou">
                      <h6>${personalDetailLabel}</h6>
              <div class="formWrap">
              <div class="form-group">
                  <div class="nfAppFormLeft">
                      ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '')}
                  </div>
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.middleName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.motherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.fatherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.email, 'full-width', 'text', {}, '', 'form-control is-valid')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.pan, 'full-width', 'text', { maxlength: 10 }, '', 'form-control is-valid')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDobField(data.dob, 'full-width', {}, '')}
              </div>
              <div class="form-group gender" id="Gender">
                  ${formDataUtils.createRadioButtons(data.gender, 'line', 'full-width', '', '', true)}
              </div>
              <div class="popUpmain fade-in" id="gender_title_validation_popup" style="display: none;">
                    <div class="modal-content">
                        <div class="close" id="close-gender-title-popup"></div>
                        <div class="popupContent blue">
                        <h2><div class="info-icon"></div>Information</h2>
                            <p>${formsff.genderSalutationError}</p>
                            <div class="btn-container">
                            <div class="blackButton" id="ok-gender-title-popup"><button type="button">${formsff.okBtn}</button></div>
                            <div></div>
                            </div>
                        </div>
                    </div>
                </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.educationalQual, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.maritalStatus, 'full-width', true, {}, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.category, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.religion, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.industry, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.profession, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.natureOfBusiness, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.businessType, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.businessName, 'full-width', 'text', { maxlength: 40 }, '', 'form-control is-valid')}
              </div>
              <div class="form-group">
                  <div class="workExpRow">
                      <span>Current Business Stability</span>
                      <select class="form-control" id="Current_Business_Stability_Years"
                          name="Current_Business_Stability_Years" tabindex="33" disabled=true>
                          <option value="">Year*</option>
                      </select>
                      <span class="validation-text validation-required">Please select valid Current Business Stability
                      in Year</span>
                      <select class="form-control" id="Current_Business_Stability_Month"
                          name="Current_Business_Stability_Month" tabindex="34" disabled=true>
                          <option value="">Month*</option>
                      </select>
                      <span class="validation-text validation-required">Please select valid Current Business
                      Stability in Month</span>
                  </div>
              </div>
              <div class="form-group">
                  <div class="workExpRow">
                      <span>Total Business Stability</span>
                      <select class="form-control"
                          id="Total_Business_Stability_Years" name="Total_Business_Stability_Years"
                          tabindex="31" disabled=true>
                          <option value="">Year*</option>
                      </select>
                      <span class="validation-text validation-required">Please select valid Total Business Stability
                      in Year</span>
                      <select class="form-control"
                           id="Total_Business_Stability_Month"
                          name="Total_Business_Stability_Month" tabindex="32" disabled=true>
                          <option value="">Month*</option>
                      </select>
                      <span class="validation-text validation-required">Please select valid Total Business Stability
                      in Month</span>
                  </div>
              </div>
              <h2>Reference Details 1</h2>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref1')}
                  </div>
                  <h2>Reference Details 2</h2>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref2')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref2')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref2')}
                  </div>
          </div>
          </div>
          </div>`)
    }else{
       return utility.sanitizeHtml(`
            <div class="personalDetailForm">
                  <div class="left common1" id="aboutYou">
                      <h6>${personalDetailLabel}</h6>
              <div class="formWrap">
              <div class="form-group">
                  <div class="nfAppFormLeft">
                      ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '')}
                  </div>
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.middleName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.motherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.fatherName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.email, 'full-width', 'text', {}, '', 'form-control is-valid')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.pan, 'full-width', 'text', { maxlength: 10 }, '', 'form-control is-valid')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDobField(data.dob, 'full-width', {}, '')}
              </div>
              <div class="form-group gender" id="Gender">
                  ${formDataUtils.createRadioButtons(data.gender, 'line', 'full-width', '', '', true)}
              </div>
              <div class="popUpmain fade-in" id="gender_title_validation_popup" style="display: none;">
                    <div class="modal-content">
                        <div class="close" id="close-gender-title-popup"></div>
                        <div class="popupContent blue">
                        <h2><div class="info-icon"></div>Information</h2>
                            <p>${formsff.genderSalutationError}</p>
                            <div class="btn-container">
                            <div class="blackButton" id="ok-gender-title-popup"><button type="button">${formsff.okBtn}</button></div>
                            <div></div>
                            </div>
                        </div>
                    </div>
                </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.educationalQual, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.maritalStatus, 'full-width', true, {}, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.spouseName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.category, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.religion, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.industry, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createDropdown(data.profession, 'full-width', true, '')}
              </div>
              <div class="form-group">
                  ${formDataUtils.createInputField(data.dependents, 'full-width', 'number', {}, '', 'form-control is-valid dependent-trim')}
              </div>
              <h2>Reference Details 1</h2>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref1')}
                  </div>
                  <h2>Reference Details 2</h2>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref2')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref2')}
                  </div>
                  <div class="form-group">
                      ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref2')}
                  </div>
          </div>
          </div>
          ${incomeDetailFields}
          </div>`)
    }
  },
  // eslint-disable-next-line no-unused-vars
  hdfcForm: async (data, employmentType, personalDetailLabel, incomeDetailLabel) => {
    incomeDetailFields = `<div class="right common1" id="incomeDetail">
            <h6>${incomeDetailLabel}</h6>
                    <div class="form-group">
                        ${formDataUtils.createDropdown(data.subemploymentType, 'full-width', true, '')}
                    </div>
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.netIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>
                    <div class="form-group">
                        ${formDataUtils.createInputField(data.grossIncome, 'full-width', 'number', {}, '', 'form-control is-valid')}
                    </div>
            </div>
        </div>`
    if(employmentType === '200002'){
        return utility.sanitizeHtml(`
            <div class="personalDetailForm">
                <div class="left common1" id="aboutYou">
                    <h6>${personalDetailLabel}</h6>
          <div class="formWrap">
            <div class="form-group">
                <div class="nfAppFormLeft">
                    ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '')}
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.middleName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group gender" id="Gender">
                ${formDataUtils.createRadioButtons(data.gender, 'line', 'full-width', '', '', true)}
            </div>
            <div class="popUpmain fade-in" id="gender_title_validation_popup" style="display: none;">
                <div class="modal-content">
                    <div class="close" id="close-gender-title-popup"></div>
                    <div class="popupContent blue">
                    <h2><div class="info-icon"></div>Information</h2>
                        <p>${formsff.genderSalutationError}</p>
                        <div class="btn-container">
                        <div class="blackButton" id="ok-gender-title-popup"><button type="button">${formsff.okBtn}</button></div>
                        <div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createDobField(data.dob, 'full-width', {}, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.educationalQual, 'full-width', true, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.dependents, 'full-width', 'number', {}, '', 'form-control is-valid dependent-trim')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.pan, 'full-width', 'text', { maxlength: 10 }, '', 'form-control is-valid')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.email, 'full-width', 'text', {}, '', 'form-control is-valid')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.maritalStatus, 'full-width', true, {}, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.previousYearProfit, 'full-width', 'number', {}, '', 'form-control is-valid only-eighteen-digits')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.lastItr, 'full-width', true, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastProfit, 'full-width', 'number', {}, '', 'form-control is-valid only-eighteen-digits')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastDepreciation, 'full-width', 'number', {}, '', 'form-control is-valid only-eighteen-digits')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.landOwnership, 'full-width', true, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.businessFirmName, 'full-width', 'text', { maxlength: 40 }, '', 'form-control is-valid')}
            </div>
            <h2>Reference Details 1</h2>
            <div class="form-group">
                <div class="nfAppFormLeft">
                    ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '', 'ref1')}
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref1')}
            </div>
        </div>
        </div>
        </div>`)
    }else{
        return utility.sanitizeHtml(`
            <div class="personalDetailForm">
                <div class="left common1" id="aboutYou">
                    <h6>${personalDetailLabel}</h6>
          <div class="formWrap">
            <div class="form-group">
                <div class="nfAppFormLeft">
                    ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '')}
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.middleName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet')}
            </div>
            <div class="form-group gender" id="Gender">
                ${formDataUtils.createRadioButtons(data.gender, 'line', 'full-width', '', '', true)}
            </div>
            <div class="popUpmain fade-in" id="gender_title_validation_popup" style="display: none;">
                <div class="modal-content">
                    <div class="close" id="close-gender-title-popup"></div>
                    <div class="popupContent blue">
                    <h2><div class="info-icon"></div>Information</h2>
                        <p>${formsff.genderSalutationError}</p>
                        <div class="btn-container">
                        <div class="blackButton" id="ok-gender-title-popup"><button type="button">${formsff.okBtn}</button></div>
                        <div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createDobField(data.dob, 'full-width', {}, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.educationalQual, 'full-width', true, '')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.dependents, 'full-width', 'number', {}, '', 'form-control is-valid dependent-trim')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.pan, 'full-width', 'text', { maxlength: 10 }, '', 'form-control is-valid')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.email, 'full-width', 'text', {}, '', 'form-control is-valid')}
            </div>
            <div class="form-group">
                ${formDataUtils.createDropdown(data.maritalStatus, 'full-width', true, {}, '')}
            </div>
            <h2>Reference Details 1</h2>
            <div class="form-group">
                <div class="nfAppFormLeft">
                    ${formDataUtils.createDropdown(data.salutation, 'full-width', true, { required: true }, '', 'ref1')}
                </div>
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.firstName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.lastName, 'full-width', 'text', { maxlength: 30 }, '', 'form-control is-valid only-alphabet', {}, 'ref1')}
            </div>
            <div class="form-group">
                ${formDataUtils.createInputField(data.mobile, 'full-width', 'number', {}, '', 'form-control is-valid mobile-number-trim', {}, 'ref1')}
            </div>
        </div>
        </div>
        ${incomeDetailFields}
        </div>`)
    }
  },
};
export default bankFormUtils;
