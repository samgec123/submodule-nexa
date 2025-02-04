import utility from '../../../utility/utility.js';
import { customerEnquiry, getCustomerData, } from '../../../utility/sfUtils.js';
import { fetchExchangeDetails, getCompanyListSearch, getCompanyOffers, setInspectionDetails } from '../../../utility/smart-finance/ucUtils.js';

export default async function decorate(block) {
  const getFieldData = (element) => element?.textContent?.trim() || '';
  const innerDiv = block.children[0].children[0];
  const formsff = await utility.fetchFormSf();
  const [
    titleEl,
    roleTitleEl,
    workingTitleEl,
    coApplicantEl,
    corporateTitleEl,
    exchangeTitleEl,
    selectBrandTitleEl,
    formTitleEl,
    regNumEl,
    kilometersEl,
    numOwnersEl,
    carConditionEl,
    expectedPriceEl,
    makeCarEl,
    carModelEl,
    manufactureEl,
    downTitleEl,
    downPaymentEl,
    bonusEl,
    disclaimertextEl,
    disclaimerEl,
    priceSummaryLinkEl,
  ] = innerDiv.children;

  const title = titleEl?.textContent?.trim();
  const roleTitle = getFieldData(roleTitleEl);
  const workingTitle = getFieldData(workingTitleEl);
  const coApplicant = getFieldData(coApplicantEl);
  const corporateTitle = getFieldData(corporateTitleEl);
  const exchangeTitle = getFieldData(exchangeTitleEl);
  const selectBrandTitle = getFieldData(selectBrandTitleEl);
  const formTitle = getFieldData(formTitleEl);
  const regNum = getFieldData(regNumEl);
  const kilometers = getFieldData(kilometersEl);
  const numOwners = getFieldData(numOwnersEl);
  const carCondition = getFieldData(carConditionEl);
  const expectedPrice = getFieldData(expectedPriceEl);
  const makeCar = getFieldData(makeCarEl);

  const carModel = carModelEl?.textContent?.trim();

  const manufacture = getFieldData(manufactureEl);
  const downTitle = getFieldData(downTitleEl);
  const downPayment = getFieldData(downPaymentEl);
  const bonus = getFieldData(bonusEl);
  const disclaimer = disclaimertextEl?.textContent?.trim();
  const priceSummaryLink = priceSummaryLinkEl?.querySelector('a')?.href || '#';
  let selectedCompanyId = '';
  let selectedCompanyName = '';


  // Only attempt to create disclaimerList if disclaimerEl exists
  const disclaimerList = disclaimerEl
    ? [...disclaimerEl.querySelectorAll('li')].map((li) => li.outerHTML).join('')
    : '';

  // HTML template with all fields rendered
  const htmlContent = `
    <div class="container ">
        <section class="carExchangeMain clearfix">
            <div class="carExchangeForm">
                <div class="noApprOffer">
                    <h2><span>${title}</span></h2>
                </div>

                <div class="carExchangeFormStep">
                    <div class="form-section">
                        <h3 class="">
                            <span>${roleTitle}</span>
                        </h3>
                        <div class="rightButt">
                            <div class="whiteButton radio-wrapper">
                                <input type="radio" id="customRadio1" name="customRadio1" value="470002" checked="">
                                <label for="customRadio1">${formsff
      .individualRadioBtn}</label>
                            </div>
                            <div class="whiteButton radio-wrapper" id="CSD-radio">
                                <input type="radio" id="customRadio2" name="customRadio1" value="470001" >
                                <label for="customRadio2">${formsff.csdRadioBtn}</label>
                            </div>
                            <div class="whiteButton inf" id="info-icon">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3 class="">
                            <span>${workingTitle}</span>
                        </h3>
                        <div class="rightButt">
                            <div class="whiteButton radio-wrapper">
                                <input type="radio" id="gov-salaried" name="emloyed-by" data-subEmp="440007" value="200001">
                                <label for="gov-salaried">${formsff.gvtRadio}</label>
                            </div>
                             <div class="whiteButton radio-wrapper">
                                <input type="radio" id="private-salaried" name="emloyed-by" data-subemp="440008" value="200001">
                                <label for="private-salaried">${formsff.pvtRadio}</label>
                            </div>
                          <div class="whiteButton radio-wrapper">
                            <input type="radio" id="no-income-source" name="emloyed-by" value="200003">
                            <label for="no-income-source">${formsff.noIncomeRadio}</label>
                        </div>
                          <div class="whiteButtonm radio-wrapper">
                                <input type="radio" id="self-employed" name="emloyed-by" value="200002" checked="">
                                <label for="self-employed">${formsff.selfEmpRadio}</label>
                            </div>


                        </div>
                    </div>
                    <div class="form-section coAppSec active">
                        <h3 class="coAppSec-wrapper">
                            <span>${coApplicant}</span>
                            <div class="rightButt co-app-button">
                                <div class="whiteButton Applicant">
                                    <label>CO-APPLICANT</label>
                                </div>
                                <div class="whiteButton inf">

                                </div>
                            </div>
                        </h3>
                    </div>
                    <div class="openSec" id="selectCompForm" style="display: block;">
                        <div class="selectCompSec">
                            <strong>${corporateTitle}</strong>
                            <div class="formfieldRow">
                                <div id="companySearchSection" style="position:relative">
                                    <div class="formInputBx">
                                        <div class="autocomplete_fmp">
                                            <input autocomplete="off" class="searchCompaney" placeholder="Company search"
                                                id="companeysearch" type="text" tabindex="14" minlength="3">
                                      <div id="companyList" class="company-list" style="position: absolute;
    top: 100%;
        border-bottom: none;
    border-top: none;
    z-index: 99;
    left: 0;
    right: 0;
    "></div> <!-- Company list element -->
                                                </div>

                                    </div>
                                    <div class="blackButton">
                                        <a href="javascript:void(0);" class="avail_offer">Apply Offer</a>
                                        <a href="javascript:void(0);" class="remove_offer" style="display:none;">Remove Offer</a>
                                    </div>
                                </div>

                                <p class="corporate-offer-text" style="display: none;">Available corporate
                                    discount of ₹ <text id="CorporateOffer">0</text></p>
                            </div>
                        </div>
                    </div>
                    <div class="form-section formClickSecVehicle">
                        <div class="vehicle-info">
                            <h3 class="">
                                <span>${exchangeTitle}</span>
                            </h3>
                            <div class="rightButt">
                                <div class="whiteButton radio-wrapper">
                                    <input type="radio" id="yes-id" value="true" name="customRadio" tabindex="14">
                                    <label for="yes-id">Yes</label>
                                </div>
                                <div class="whiteButton radio-wrapper">
                                    <input type="radio" id="no-id" value="false" name="customRadio" checked=""
                                        tabindex="15">
                                    <label for="no-id">No</label>
                                </div>

                            </div>
                        </div>

                        <div class="openSec" id="selectCarMake" style="display: block;">
                            <div class="selectCarMakeSec">
                                <div class="title">
                                    <strong>${selectBrandTitle}</strong>

                                    <div class="rightButt">
                                        <div class="whiteButton radio-wrapper">
                                            <input type="radio" checked="checked" name="carbrand" id="carbrand-m" tabindex="16" value="1">
                                            <label for="carbrand-m">
                                                Maruti Suzuki India Ltd.
                                            </label>
                                        </div>
                                        <div class="whiteButton radio-wrapper">
                                            <input type="radio" name="carbrand" tabindex="17" id="carbrand-o" value="0">
                                            <label for="carbrand-o">
                                                Others
                                            </label>
                                        </div>
                                    </div>
                                </div>


                                <form id="carExchange" style="overflow:hidden">
                                    <div class="hassleFreeForm samecar">
                                        <strong>${formTitle}</strong>
                                        <div class="formfieldRow">
                                            <div class="formInputBx">
                                                <input placeholder="${regNum}*" id="registration_no"
                                                    maxlength="10" name="registration_no" type="text" value="" maxlength="10" name="registration_no" type="text"
                                                    >
                                                    <em id="registration_no_other-error" class="error invalid-feedback">${formsff
      .errorReg}</em>
                                            </div>
                                            <div class="formInputBx">
                                                <input name="kilometers" placeholder="${kilometers}*" id="kilometers"
                                                    maxlength="6" minlength="2" type="text" value=""  name="kilometers" type="text"
                                                    >
                                                    <em id="kilometers_other-error" class="error invalid-feedback">${formsff
      .errorKm}</em>
                                            </div>
                                            <div class="formInputBx field--not-empty">
                                                <select id="number_of_owners" name="number_of_owners" >
                                                    <option value="0">${numOwners}*</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                </select>
                                                <em id="number_of_owners_other-error" class="error invalid-feedback">${formsff
      .errorOwner}</em>
                                            </div>
                                            <div class="formInputBx field--not-empty">
                                                <select id="car_condition" name="car_condition">
                                                    <option value="0">${carCondition}*</option>
                                                    <option value="Good">Good (No Scratches)</option>
                                                    <option value="Average">Average (Minor Scratches)</option>
                                                    <option value="Poor">Poor (Major Scratches)</option>
                                                </select>
                                                <em id="car_condition_other-error" class="error invalid-feedback">${formsff
      .errorCarCondition}</em>
                                            </div>
                                        </div>
                                        <div class="formfieldRow" id="test2">
                                            <div class="formInputBx">
                                                <input name="customer_expected_price" class="rupee"
                                                    placeholder="₹ ${expectedPrice}*" id="customer_expected_price"
                                                    maxlength="6" minlength="1" type="text" value="" name="customer_expected_price" type="text"
                                                     >
                                                    <em id="expected-error" class="error invalid-feedback">${formsff
      .errorExpectedPrice}</em>
                                            </div>
                                            <div class="formInputBx">
                                                <input placeholder="${makeCar}*" id="make" name="make"
                                                    maxlength="30" type="text" name="kilometers" type="text"
                                                    >
                                                   <em id="make-error" class="error invalid-feedback">${formsff
      .errorMakeCar}</em>
                                            </div>
                                            <div class="formInputBx field--not-empty">
                                                <input placeholder="${carModel}*" id="model" name="model" maxlength="30"
                                                    type="text" class="is-valid" type="text"
                                                    >
                                                    <em id="model-error" class="error invalid-feedback">${formsff
      .errorModel}</em>
                                            </div>
                                            <div class="formInputBx field--not-empty">
                                                <select id="year_of_manufacture" name="year_of_manufacture">
                                                    <option value="">Year Of ${manufacture}*</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2023">2023</option>
                                                    <option value="2022">2022</option>
                                                    <option value="2021">2021</option>
                                                    <option value="2020">2020</option>
                                                    <option value="2019">2019</option>
                                                    <option value="2018">2018</option>
                                                    <option value="2017">2017</option>
                                                    <option value="2016">2016</option>
                                                    <option value="2015">2015</option>
                                                    <option value="2014">2014</option>
                                                    <option value="2013">2013</option>
                                                    <option value="2012">2012</option>
                                                    <option value="2011">2011</option>
                                                    <option value="2010">2010</option>
                                                    <option value="2009">2009</option>
                                                    <option value="2008">2008</option>
                                                    <option value="2007">2007</option>
                                                    <option value="2006">2006</option>
                                                    <option value="2005">2005</option>
                                                    <option value="2004">2004</option>
                                                </select>
                                                <em id="year_of_manufacture-error" class="error invalid-feedback">${formsff
      .errorYm}</em>
                                            </div>
                                        </div>
                                        <div class="amountDownpayment">
                                            <div class="formInputBx">
                                                <span>${downTitle}</span>
                                                <input name="downpayment" class="rupee" placeholder="₹ ${downPayment}*"
                                                   id="downpayment"
                                                    maxlength="6" minlength="1"
                                                    type="text" value="" tabindex="30" name="kilometers" type="text"
                                                     >
                                                <em id="downpayment-error" class="error invalid-feedback">${formsff
      .errorDp}</em>
                                            </div>
                                            <div class="bonusTxt">
                                                ${bonus}<text
                                                    id="exchangeDis"></text>.
                                               <div class="inf"></div>
                                            </div>
                                        </div>

                                        <div class="blackButton">
                                        <a href="javascript:void(0);" class="next-button">${formsff
      .next}</a>
                                        <a href="javascript:void(0);" class="submit-button" style="display: none;" id="submit_btn">${formsff
      .submit}</a>
                                        </div>
                                    </div>

                                </form>
                                <div class="carDetailsMain" style="display: none;">
                                    <div class="carDetailSec1">
                                        <strong>Based on information provided, your car details are as follows:</strong>
                                        <div class="sepLine"></div>
                                        <div class="carDetLeft"><h3></h3><ul><li></li><li></li><li></li></ul></div>
                                        <div class="carDetRight">
                                            <div class="formfieldRow">
                                                <div class="formInputBx">
                                                    <input placeholder="Kms" id="kmrun" type="text" value="" readonly="" tabindex="36" disabled>
                                                </div>
                                                <div class="formInputBx">
                                                    <input placeholder="city" id="city" type="text" value="" readonly="" tabindex="37" class="select2-hidden-accessible" aria-hidden="true"  disabled><span class="select2 select2-container select2-container--default select2-container--below" dir="ltr" style="width: auto;"><span class="selection"><span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-labelledby="select2-city-container"><span class="select2-selection__rendered" id="select2-city-container"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
                                                </div>
                                                <div class="formInputBx">
                                                    <input placeholder="state" id="state" type="text" value="" readonly="" tabindex="38" class="select2-hidden-accessible" aria-hidden="true"  disabled><span class="select2 select2-container select2-container--default select2-container--below" dir="ltr" style="width: auto;"><span class="selection"><span class="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-labelledby="select2-state-container"><span class="select2-selection__rendered" id="select2-state-container"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
                                                </div>
                                            </div>
                                            <div class="formfieldRow">
                                                <div class="formInputBx">
                                                    <input placeholder="Owner" id="Owners" type="text" value="" readonly="" tabindex="39" disabled>
                                                </div>
                                                <div class="formInputBx doubleSize">
                                                    <input placeholder="dealer name" id="dealername" type="text" value="" readonly="" tabindex="40" disabled>
                                                </div>
                                            </div>
                                            <div class="bonusTxt">
                                                Your are entitled to exchange bonus of ₹ <text id="exchange_bonus">0</text>.
                                                <div class="info-icon"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="carDetailSec2">
                                        <div class="sepLine"></div>
                                        <div class="evaluatedPriceRangeLeft">
                                            <strong>Evaluated Price Range</strong>
                                            <h2 id="PriceRange">₹ 0-₹0*</h2>
                                            <p>Average based on your car rating</p>
                                            <div class="discPoints">
                                                <span>${disclaimer}</span>
                                                <ul>
                                                    ${disclaimerList}
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="evaluatedPriceRangeRight">
                                            <form id="Inspection" novalidate="novalidate">
                                                <div class="formfieldRow">
                                                    <div class="formInputBx">
                                                        <span>Feel free to tell us your expected car exchange value</span>
                                                        <input name="customer_expected_price-exc" class="rupee" placeholder="${expectedPrice}*"  id="customer_expected_price-exc" maxlength="8" minlength="2" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" type="number" value="" tabindex="41">
                                                        <em id="customer_expected_price-error-exc" class="error invalid-feedback">${formsff
      .errorExpectedPrice}</em>
                                                    </div>
                                                    <div class="formInputBx">
                                                        <span>Amount you wish to adjust in Down Payment</span>
                                                        <input name="customer_downpayment" class="rupee" placeholder="${downPayment}*"  id="customer_downpayment" maxlength="8" minlength="2" oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" onkeypress="return event.charCode >= 48 &amp;&amp; event.charCode <= 57" type="number" value="" tabindex="42">
                                                        <em id="customer_downpayment-error" class="error invalid-feedback">${formsff
      .errorDp}</em>
                                                    </div>
                                                </div>
                                                <div class="formfieldRow">
                                                    <span>Book an inspection with us</span>
                                                    <div class="formInputBx">
                                                        <div class="preferdateselector date">
                                                            <input type="text" id="dob_prefer" class="form-control" placeholder="${formsff
      .pd}"  name="dob_land" tabindex="43" >
                                                            <span class="input-group-addon">
                                                                <i class="cal-icon"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="formInputBx field--not-empty">
                                                        <select  id="PreferredTime" name="PreferredTime" tabindex="44">
                                                            <option value="">${formsff
      .pt}</option>
                                                            <option value="08:00">08 AM-09 AM</option>
                                                            <option value="09:00">09 AM-10 AM</option>
                                                            <option value="10:00">10 AM-11 AM</option>
                                                            <option value="11:00">11 AM-12 PM</option>
                                                            <option value="12:00">12 PM-01 PM</option>
                                                            <option value="01:00">01 PM-02 PM</option>
                                                            <option value="02:00">02 PM-03 PM</option>
                                                            <option value="03:00">03 PM-04 PM</option>
                                                            <option value="04:00">04 PM-05 PM</option>
                                                            <option value="05:00">05 PM-06 PM</option>
                                                            <option value="06:00">06 PM-07 PM</option>
                                                        </select>
                                                        <em id="PreferredTime-error" class="error invalid-feedback">${formsff
      .errorPt}</em>
                                                    </div>
                                                    <div class="blackButton">
                                                        <a href="javascript:void(0);" class="sunmit_Inspection" id="submit_btn_ex">${formsff.submit}</a>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div class="thankyouSec" style="display: none;">
                                   <h2>Thank You!</h2>
                                   <p>Your request is sent to dealer for further processing.</p>
                                   <div class="blackButton">
                                      <a href="#">${formsff.okBtn}</a>
                                   </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <div class="continueBtn">
                        <p class="user-page-disclaimer"><strong>Disclaimer : </strong> <span>CSD (Canteen Stores
                                Department) approved pricing is applicable on select variants/ cities and for CSD
                                (Canteen Stores Department) customers only.</span></p>
                        <div class="blackButton">
                            <a href="javascript:void(0);" class="main_submit" id="price-summary">${formsff
      .spmBtn}</a>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    </div>
    <div class="popUpmain fade-in" id="amt_error_popup" style="display: none;">
      <div class="modal-content">
        <div class="close" id="close-amt-error-popup"></div>
        <div class="popupContent red">
            <h2><div class="icon-img "></div> Error</h2>
            <p>${formsff.vehicleError}</p>
            <div class="btn-container">
                <div class="blackButton"><button type="button" id="close-popup-btn">${formsff.okBtn}</button></div>
            </div>
        </div>
    </div>
</div>

<div class="popUpmain fade-in" id="amt_error_popup_exc" style="display: none;">
<div class="modal-content">
  <div class="close" id="close-amt-error-popup_exc"></div>
  <div class="popupContent red">
      <h2><div class="icon-img "></div> Error</h2>
      <p></p>
      <div class="btn-container">
          <div class="blackButton"><button type="button" id="close-popup-btn-exc">${formsff.okBtn}</button></div>
      </div>
  </div>
</div>

</div/>
    <div class="popUpmain" id="popup">
        <div class="modal-content">
            <div class="popupContent">
                <div class="close" id="close-popup" >
                </div>
                <p>Canteen Stores Department.</p>
            </div>
        </div>

    </div>
    <div class="popUpmain" id="thank-popup">
        <div class="modal-content">
            <div class="popupContent">
                <h2 class="popup-title">Thank you!!</h2>
                <p class="popup-description">
                    We are curating appropriate ex-showroom price for you. Meanwhile you can proceed with your
                    journey.
                </p>
                <div class="blackButton"><button href="#" data-dismiss="modal" aria-label="Close">${formsff.okBtn}</button></div>
            </div>
        </div>

    </div>
    <div class="popUpmain fade-in" id="doc_validation_popup" style="display: none;">
   <div class="modal-content">
      <div class="close" id="close-doc-popup"></div>
      <div class="popupContent blue">
      <h2><div class="info-icon"></div>Information</h2>
         <p>${formsff.exchangeInfo}</p>
         <div class="btn-container">
            <div class="blackButton"><button type="button">${formsff.okBtn}</button></div>
            <div></div>
         </div>
      </div>
   </div>
</div>
    <div class="popUpmain" id="cibil-score-popup" style="none">
        <div class="modal-content">
            <div class="cibilPopupContent">
                <div class="cibilLogo">
                </div>
                <p>${formsff.cibilScore}</p>
                <div class="cibilButtMain">
                    <div class="blackButton" style=""><a class="skiptooffer" id="proceed-to-offers">${formsff.proceedBtn}</a></div>
                </div>
            </div>
        </div>
    </div>
    `;

  // Injecting the rendered HTML into the block element
  block.innerHTML = utility.sanitizeHtml(htmlContent);
  const proceedToOffersBtn = document.querySelector('#proceed-to-offers');
  proceedToOffersBtn.addEventListener('click', () => {
    window.location.href = priceSummaryLink;
  });

  const getSelectedRadioButtonValue = () => {
    const selectedRadioButton = document.querySelector('input[name="emloyed-by"]:checked');
    if (selectedRadioButton) {
      return selectedRadioButton.value;
    }
    return null;
  };

  const companyListElement = document.getElementById('companyList');
  const searchInput = document.getElementById('companeysearch');
  const availCompanyDiscountbutton = document.querySelector('.avail_offer');
  const removeCompanyDiscountbutton = document.querySelector('.remove_offer');

  const filterCompanies = async (query) => {
    if (query.length < 3) {
      companyListElement.innerHTML = '';
      return;
    }

    try {
      const financierId = getSelectedRadioButtonValue();
      const searchText = searchInput.value;
      const companyListElement = document.getElementsByClassName('company-list');
      const result = await getCompanyListSearch(searchText, financierId);
      if (result.success) {
        const filteredCompanies = result.data.company_list;
        const listItems = filteredCompanies.map((company) => `
          <div class="company-item" data-company-name="${company.company_name}" data-company-id="${company.id}">
            <strong>${company.company_name}</strong>
          </div>
        `).join('');

        companyListElement[0].innerHTML = listItems;
        companyListElement[0].addEventListener('click', (event) => {
          // Check if the clicked element has the class 'company-item'
          const companyItem = event.target.closest('.company-item');
          if (companyItem) {
            const companyName = companyItem.getAttribute('data-company-name');
            searchInput.value = companyName;
            selectedCompanyId = companyItem.getAttribute('data-company-id');
            selectedCompanyName = companyName;
            companyListElement[0].innerHTML = '';
          }
        });

      } else {
        companyListElement[0].innerHTML = '<p>No companies found</p>';
      }
    } catch (error) {
      companyListElement[0].innerHTML = '<p>Error fetching data. Please try again.</p>';
      throw error;
    }
  };

  searchInput.addEventListener('input', (e) => {
    filterCompanies(e.target.value);
  });

  availCompanyDiscountbutton.addEventListener('click', (e) => {
    e.preventDefault();
    applyCompanyDiscount(selectedCompanyId, selectedCompanyName);
  });
  removeCompanyDiscountbutton.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.corporate-offer-text').style.display = 'none';
    document.querySelector('.avail_offer').style.display = 'flex';
    document.querySelector('.remove_offer').style.display = 'none';
    searchInput.value = '';
    window.corporateOfferDetails = null;
  });


  // Initial setup
  companyListElement.innerHTML = '';
  document.getElementById('info-icon').addEventListener('click', () => {
    document.getElementById('popup').classList.add('fade-in');
    document.getElementById('popup').style.display = 'flex';
  });
  document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('popup').classList.remove('fade-in');
    document.getElementById('popup').style.display = 'none';
  });
  document.getElementById('CSD-radio').addEventListener('click', () => {
    document.getElementById('thank-popup').classList.remove('fade-in');
    document.getElementById('thank-popup').style.display = 'flex';
  });

  const errorModal = document.getElementById('popup');
  const thankModal = document.getElementById('thank-popup');
  const cibilScorePopup = document.getElementById('cibil-score-popup');
  window.onclick = function hideModals(e) {
    if (e.target === errorModal) {
      errorModal.style.display = 'none';
    }
    if (e.target === thankModal) {
      thankModal.style.display = 'none';
    }
    if (e.target === cibilScorePopup) {
      cibilScorePopup.style.display = 'none';
    }
  };
  // Select the relevant radio buttons
  const csdRadioButton = document.getElementById('customRadio2'); // CSD radio button
  const individualRadioButton = document.getElementById('customRadio1'); // INDIVIDUAL radio button

  const govSalariedRadioButton = document.getElementById('gov-salaried'); // Government salaried radio button
  const privateSalariedRadioButton = document.getElementById('private-salaried'); // Private salaried radio button
  const noIncomeSourceRadioButton = document.getElementById('no-income-source'); // No Income Source radio button
  const selfEmployedRadioButton = document.getElementById('self-employed'); // Self-Employed radio button

  // Function to disable or enable radio buttons based on the selected option
  const updateRadioButtonsState = (isCSD) => {
    govSalariedRadioButton.disabled = false; // Government salaried should be enabled in all cases
    privateSalariedRadioButton.disabled = isCSD; // Private salaried disabled only for CSD
    noIncomeSourceRadioButton.disabled = isCSD; // No Income Source disabled only for CSD
    selfEmployedRadioButton.disabled = isCSD; // Self-Employed disabled only for CSD
  };

  // Event listener for INDIVIDUAL radio button
  individualRadioButton.addEventListener('click', () => {
    updateRadioButtonsState(false);
  });

  // Initial setup to ensure everything is correct on page load
  updateRadioButtonsState(false);

  // Select the elements you want to show/hide
  const coAppSection = block.querySelector('.form-section.coAppSec');
  const selectCompFormSection = document.getElementById('selectCompForm');

  // Function to update visibility based on the selected radio button
  const updateVisibility = (selectedOption) => {
    if (selectedOption === 'no-income-source') {
      coAppSection.style.display = 'block'; // Show CO-APPLICANT section
      selectCompFormSection.style.display = 'none'; // Hide Corporate Offer section
    } else if (selectedOption === 'self-employed') {
      coAppSection.style.display = 'none'; // Hide CO-APPLICANT section
      selectCompFormSection.style.display = 'none'; // Hide Corporate Offer section
    } else {
      coAppSection.style.display = 'none'; // Hide CO-APPLICANT section
      selectCompFormSection.style.display = 'block'; // Show Corporate Offer section
    }
  };
  const selectCompForm = document.getElementById('selectCompForm');
  // Event listener for CSD radio button
  csdRadioButton.addEventListener('click', () => {
    updateRadioButtonsState(true);

    selectCompForm.style.display = 'block';
    govSalariedRadioButton.checked = true;

    // Ensure Government salaried is selected when CSD is chosen
  });

  // Event listeners for the radio buttons
  govSalariedRadioButton.addEventListener('click', () => {
    updateVisibility('gov-salaried');
  });

  privateSalariedRadioButton.addEventListener('click', () => {
    updateVisibility('private-salaried');
  });

  noIncomeSourceRadioButton.addEventListener('click', () => {
    updateVisibility('no-income-source');
  });

  selfEmployedRadioButton.addEventListener('click', () => {
    updateVisibility('self-employed');
  });

  // Initial setup to ensure everything is correct on page load
  const checkedRadioId = document.querySelector('input[name="emloyed-by"]:checked')?.id;
  updateVisibility(checkedRadioId);

  // Select the elements for visibility
  const selectCarMakeSection = document.getElementById('selectCarMake');
  const yesRadioButton = document.getElementById('yes-id');
  const noRadioButton = document.getElementById('no-id');

  // Function to update visibility of selectCarMake section based on the selected radio button
  const updateCarMakeVisibility = () => {
    if (yesRadioButton.checked) {
      selectCarMakeSection.style.display = 'block';
    } else if (noRadioButton.checked) {
      selectCarMakeSection.style.display = 'none';
    }
  };

  // Event listeners for Yes and No radio buttons
  yesRadioButton.addEventListener('change', updateCarMakeVisibility);
  noRadioButton.addEventListener('change', updateCarMakeVisibility);

  // Initialize the visibility based on the initial selection
  updateCarMakeVisibility();

  const marutiRadio = document.querySelector('input[name="carbrand"][tabindex="16"]');
  const othersRadio = document.querySelector('input[name="carbrand"][tabindex="17"]');

  // Get references to the sections to show/hide
  const amountDownpaymentSection = document.querySelector('.amountDownpayment');
  const formFieldRows = document.querySelectorAll('#test2');
  const registrationSection = document.querySelector('#registration_no').closest('.formfieldRow');
  const nextButton = document.querySelector('.blackButton .next-button'); // Updated reference to the "Next" button
  const submitButton = document.querySelector('.blackButton .submit-button'); // Updated reference to the "Submit" button
  const carDetailsSection = document.querySelector('.carDetailsMain');
  function toggleVisibility() {
    if (marutiRadio.checked) {
      // Hide the specific sections except the registration section
      amountDownpaymentSection.style.display = 'none';
      formFieldRows.forEach((row) => {
        if (row !== registrationSection) {
          row.style.display = 'none';
        }
      });
      // Show the registration section
      registrationSection.style.display = 'block';
      // Show the Next button and hide the Submit button
      nextButton.style.display = 'inline-block';
      submitButton.style.display = 'none';
    } else if (othersRadio.checked) {
      // Show all the specific sections
      amountDownpaymentSection.style.display = 'block';
      carDetailsSection.style.display = 'none';
      formFieldRows.forEach((row) => {
        row.style.display = 'block';
      });
      // Hide the Next button and show the Submit button
      nextButton.style.display = 'none';
      submitButton.style.display = 'inline-block';
    }
  }

  // Attach event listeners to radio buttons
  marutiRadio.addEventListener('change', toggleVisibility);
  othersRadio.addEventListener('change', toggleVisibility);

  // Initial call to set the correct visibility on page load
  toggleVisibility();

  document.getElementById('kilometers').addEventListener('input', function checkNumeric() {
    // Remove any non-numeric characters
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('customer_expected_price').addEventListener('input', function checkNumeric() {
    // Remove any non-numeric characters
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('downpayment').addEventListener('input', function checkNumeric() {
    // Remove any non-numeric characters
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('thank-popup').addEventListener('click', () => {
    document.getElementById('thank-popup').style.display = 'none';
  });

  const fields = [
    { id: 'registration_no', errorId: 'registration_no_other-error' },
    { id: 'kilometers', errorId: 'kilometers_other-error' },
    { id: 'make', errorId: 'make-error' },
    { id: 'customer_expected_price', errorId: 'expected-error' },
    { id: 'model', errorId: 'model-error' },
    { id: 'downpayment', errorId: 'downpayment-error' },
  ];

  fields.forEach((field) => {
    const inputField = document.getElementById(field.id);
    const errorMessage = document.getElementById(field.errorId);

    inputField.addEventListener('blur', () => {
      // Check if the input is empty after interaction
      if (inputField.value.trim() === '') {
        errorMessage.style.display = 'block'; // Show error message
      } else {
        errorMessage.style.display = 'none'; // Hide error message if input has value
      }
    });

    inputField.addEventListener('input', (event) => {
      // Hide error message when the user starts typing
      if (event?.target?.id === 'make') {
        event.target.value = event.target.value.replace(/[^a-zA-Z]/g, '');
      }
      if (field?.id === 'model') {
        inputField.value = inputField.value.replace(/[^a-zA-Z0-9]/g, '');
      }
      if (inputField.value.trim() !== '') {
        errorMessage.style.display = 'none';
      }
    });
  });

  const nextButtonn = document.querySelector('.next-button');
  const errorPopup = document.getElementById('amt_error_popup');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const closePopupBtnx = document.getElementById('close-amt-error-popup');


  nextButtonn.addEventListener('click', async () => {
    // Clear previous error messages
    const errorMessages = document.querySelectorAll('.error.invalid-feedback');
    errorMessages.forEach((error) => {
      error.style.display = 'none';
    });

    let hasError = false;

    // Check input fields
    const fieldss = [
      { id: 'registration_no', errorId: 'registration_no_other-error' },
      { id: 'kilometers', errorId: 'kilometers_other-error' },
    ];

    fieldss.forEach((field) => {
      const inputField = document.getElementById(field.id);
      const errorMessage = document.getElementById(field.errorId);

      if (inputField.value.trim() === '') {
        errorMessage.style.display = 'block';
        hasError = true;
      }
    });

    // Check dropdowns
    const dropdowns = [
      { id: 'number_of_owners', errorId: 'number_of_owners_other-error' },
      { id: 'car_condition', errorId: 'car_condition_other-error' },
    ];

    dropdowns.forEach((dropdown) => {
      const selectField = document.getElementById(dropdown.id);
      const errorMessage = document.getElementById(dropdown.errorId);

      if (selectField.value === '0') {
        errorMessage.style.display = 'block';
        hasError = true;
      }
    });

    // If any fields have errors, exit early
    if (hasError) return;

     let fetchExchangeApiResponse = await fetchExchangeDetailsWrapper();

    // Fetch the registration number value
    const registrationNoInput = document.getElementById('registration_no').value.trim();

    // Check registration number against mock API data
    if (registrationNoInput === fetchExchangeApiResponse?.registration_no) {
      // Populate the details in carDetailsMain
      document.querySelector('.carDetLeft h3').textContent = `${fetchExchangeApiResponse.model} ${fetchExchangeApiResponse.variant}`;
      document.querySelector('.carDetLeft ul').innerHTML = `
                <li>${fetchExchangeApiResponse.year_of_manufacture}</li>
                <li>${fetchExchangeApiResponse.color}</li>
            `;
      document.getElementById('kmrun').value = fetchExchangeApiResponse.kilometers;
      document.getElementById('city').value = fetchExchangeApiResponse.city;
      document.getElementById('state').value = fetchExchangeApiResponse.state;
      document.getElementById('Owners').value = fetchExchangeApiResponse.number_of_owners;
      document.getElementById('dealername').value = fetchExchangeApiResponse.dealer_name;
      document.getElementById('exchange_bonus').textContent = fetchExchangeApiResponse.exchange_bonus;
      document.getElementById('PriceRange').textContent = `₹ ${fetchExchangeApiResponse.tv_estimated_min_price}-₹${fetchExchangeApiResponse.tv_estimated_max_price}*`;
      document.getElementById('customer_expected_price-exc').value = `${fetchExchangeApiResponse.tv_estimated_max_price}`;
      document.getElementById('customer_downpayment').value = `${fetchExchangeApiResponse.tv_estimated_max_price}`;

      // Display the car details section
      carDetailsSection.style.display = 'block';
    } else {
      errorPopup.style.display = 'flex'; // Show error popup
    }
  });

  // Close error popup when OK button is clicked
  closePopupBtn.addEventListener('click', () => {
    errorPopup.style.display = 'none';
  });
  closePopupBtnx.addEventListener('click', () => {
    errorPopup.style.display = 'none';
  });

  document.getElementById('submit_btn_ex').addEventListener('click', async (event) => {
    event.preventDefault();

    // Get the input elements
    const expectedPricee = document.getElementById('customer_expected_price-exc');
    const downPaymentt = document.getElementById('customer_downpayment');
    const preferredTime = document.getElementById('PreferredTime');
    const inspectionDate = document.querySelector('#dob_prefer');

    // Get the error elements
    const expectedPriceError = document.getElementById('customer_expected_price-error-exc');
    const downPaymentError = document.getElementById('customer_downpayment-error');
    const preferredTimeError = document.getElementById('PreferredTime-error');

    // Get the popup elements
    const amtErrorPopup = document.getElementById('amt_error_popup_exc');
    const closePopupBtnn = document.getElementById('close-popup-btn-exc');
    const closePopupBtnnx = document.getElementById('close-amt-error-popup_exc');
    const popupErrorMessage = amtErrorPopup.querySelector('p');

    // Validation flags
    let isValid = true;

    // Validate expected price
    if (!expectedPricee.value.trim()) {
      expectedPriceError.style.display = 'block';
      isValid = false;
    } else {
      expectedPriceError.style.display = 'none';
    }

    // Validate down payment
    if (!downPaymentt.value.trim()) {
      downPaymentError.style.display = 'block';
      isValid = false;
    } else {
      downPaymentError.style.display = 'none';
    }

    // Validate preferred time
    if (preferredTime.value === '') {
      preferredTimeError.style.display = 'block';
      isValid = false;
    } else {
      preferredTimeError.style.display = 'none';
    }

    // Check if down payment is greater than expected price
    if (isValid) {
      const expectedPriceValue = parseFloat(expectedPricee.value);
      const downPaymentValue = parseFloat(downPaymentt.value);

      if (downPaymentValue > expectedPriceValue) {
        // Show error popup
        popupErrorMessage.textContent = `Down payment cannot be greater than ${expectedPriceValue}`;
        amtErrorPopup.style.display = 'flex';
        isValid = false; // Prevent Thank You section from showing
      }
    }

    // Show Thank You section if all fields are valid
    if (isValid) {
      const inspectionApiCallResponse = await updateInspectionDetails(expectedPricee, downPaymentt, preferredTime, inspectionDate);
      if(inspectionApiCallResponse.success){
        expectedPricee.disabled = true;
        downPaymentt.disabled = true;
        preferredTime.disabled = true;
        inspectionDate.disabled = true;
        document.getElementById('registration_no').disabled = true;
        document.getElementById('kilometers').disabled = true;
        document.getElementById('number_of_owners').disabled = true;
        document.getElementById('car_condition').disabled = true;
        const inputRadios = document.querySelectorAll('input[name="carbrand"]');
        inputRadios[0].disabled = true;
        inputRadios[1].disabled = true;

        document.querySelector('.thankyouSec').style.display = 'block';
        amtErrorPopup.style.display = 'none'; // Ensure the popup is hidden

      }
      else{
        // Show error popup
        popupErrorMessage.textContent = `${inspectionApiCallResponse.errorMessage}`;
        amtErrorPopup.style.display = 'flex';
      }
    } else {
      document.querySelector('.thankyouSec').style.display = 'none';
    }

    // Close error popup when OK button is clicked
    closePopupBtnn.addEventListener('click', () => {
      amtErrorPopup.style.display = 'none';
    });
    closePopupBtnnx.addEventListener('click', () => {
      amtErrorPopup.style.display = 'none';
    });
  });

  document.getElementById('submit_btn').addEventListener('click', (event) => {
    event.preventDefault();

    // Get the input elements
    const expectedPrices = document.getElementById('customer_expected_price');
    const downPayments = document.getElementById('downpayment');
    const registrationNo = document.getElementById('registration_no');
    const kilometerss = document.getElementById('kilometers');
    const numberOfOwners = document.getElementById('number_of_owners');
    const carConditions = document.getElementById('car_condition');
    const make = document.getElementById('make');
    const model = document.getElementById('model');
    const yearOfManufacture = document.getElementById('year_of_manufacture');

    // Get the error elements
    const expectedPriceError = document.getElementById('expected-error');
    const downPaymentError = document.getElementById('downpayment-error');
    const registrationNoError = document.getElementById('registration_no_other-error');
    const kilometersError = document.getElementById('kilometers_other-error');
    const numberOfOwnersError = document.getElementById('number_of_owners_other-error');
    const carConditionError = document.getElementById('car_condition_other-error');
    const makeError = document.getElementById('make-error');
    const modelError = document.getElementById('model-error');
    const yearOfManufactureError = document.getElementById('year_of_manufacture-error');

    // Popup elements for down payment validation
    const amtErrorPopup = document.getElementById('amt_error_popup_exc');
    const popupErrorMessage = amtErrorPopup.querySelector('p');
    const closePopupBtnn = document.getElementById('close-popup-btn-exc');
    const closePopupBtnnx = document.getElementById('close-amt-error-popup_exc');

    // Validation flags
    let isValid = true;

    // Validate expected price
    if (!expectedPrices.value.trim()) {
      expectedPriceError.style.display = 'block';
      isValid = false;
    } else {
      expectedPriceError.style.display = 'none';
    }

    // Validate down payment
    if (!downPayments.value.trim()) {
      downPaymentError.style.display = 'block';
      isValid = false;
    } else {
      downPaymentError.style.display = 'none';
    }

    // Check if down payment exceeds expected price
    const expectedPriceValue = parseFloat(expectedPrices.value);
    const downPaymentValue = parseFloat(downPayments.value);
    if (downPaymentValue > expectedPriceValue) {
      popupErrorMessage.textContent = `Down payment cannot be greater than ₹ ${expectedPriceValue}`;
      amtErrorPopup.style.display = 'flex';
      isValid = false; // Prevent Thank You section from showing
    } else {
      amtErrorPopup.style.display = 'none';
    }

    // Validate registration number
    if (!registrationNo.value.trim()) {
      registrationNoError.style.display = 'block';
      isValid = false;
    } else {
      registrationNoError.style.display = 'none';
    }

    // Validate kilometers
    if (!kilometerss.value.trim()) {
      kilometersError.style.display = 'block';
      isValid = false;
    } else {
      kilometersError.style.display = 'none';
    }

    // Validate number of owners
    if (numberOfOwners.value === '0') {
      numberOfOwnersError.style.display = 'block';
      isValid = false;
    } else {
      numberOfOwnersError.style.display = 'none';
    }

    // Validate car condition
    if (carConditions.value === '0') {
      carConditionError.style.display = 'block';
      isValid = false;
    } else {
      carConditionError.style.display = 'none';
    }

    // Validate make
    if (!make.value.trim()) {
      makeError.style.display = 'block';
      isValid = false;
    } else {
      makeError.style.display = 'none';
    }

    // Validate model
    if (!model.value.trim()) {
      modelError.style.display = 'block';
      isValid = false;
    } else {
      modelError.style.display = 'none';
    }

    // Validate year of manufacture
    if (yearOfManufacture.value === '') {
      yearOfManufactureError.style.display = 'block';
      isValid = false;
    } else {
      yearOfManufactureError.style.display = 'none';
    }

    // Show Thank You section if all fields are valid
    if (isValid) {
      document.querySelector('.thankyouSec').style.display = 'block';
      amtErrorPopup.style.display = 'none'; // Ensure the popup is hidden
    } else {
      document.querySelector('.thankyouSec').style.display = 'none';
    }

    closePopupBtnn.addEventListener('click', () => {
      amtErrorPopup.style.display = 'none';
    });
    closePopupBtnnx.addEventListener('click', () => {
      amtErrorPopup.style.display = 'none';
    });
  });

  // Function to handle radio selection and show relevant popups
  async function handleRadioSelection() {
    const priceSummaryButton = document.getElementById('price-summary');

    priceSummaryButton.addEventListener('click', async () => {
      // Check if 'No' radio button is selected
      const selectedJourneyRadioValue = document.querySelector('input[name="customRadio1"]:checked')?.value;
      const selectedEmploymentStatus = document.querySelector('input[name="emloyed-by"]:checked')?.value;
      const selectedSubEmploymentStatus = document.querySelector('input[name="emloyed-by"]:checked')?.dataset?.subemp;
      const selectedExchangeRadioValue = document.querySelector('input[name="customRadio"]:checked')?.value;
      let applicantType;

      if (selectedEmploymentStatus && selectedJourneyRadioValue && selectedExchangeRadioValue === 'false') {
        if (selectedEmploymentStatus === 200003) {
          applicantType = 480002;
        } else { applicantType = 480001; }
        const enquiryId = sessionStorage.getItem('enquiryId');
        const body = {
          customerTypeId: selectedJourneyRadioValue,
          applicantTypeId: applicantType,
          employmentTypeId: selectedEmploymentStatus,
          subEmploymentTypeId: selectedSubEmploymentStatus || '',
          isCarExchange: selectedExchangeRadioValue,
          registrationType: sessionStorage.getItem('registrationType'),
          ...(window.corporateOfferDetails ? { ...window.corporateOfferDetails } : {}),
        };

        const response = await customerEnquiry(enquiryId, body);
        if (selectedJourneyRadioValue === '470002') {
          sessionStorage.setItem('salesType', 'IND');
        } else {
          sessionStorage.setItem('salesType', 'CSD');
        }

        sessionStorage.setItem('employmentTypeId', selectedEmploymentStatus);
        sessionStorage.setItem('applicantTypeId', applicantType);

        if (response.success) {
          window.location.href = priceSummaryLink;
        }
        else {
          throw new Error(`Error: ${response.message}`);
        }
      }
      else if (selectedExchangeRadioValue) {
        // Follow the existing logic if "Yes" is selected
        const thankYouSection = document.querySelector('.thankyouSec');
        const doCValidationPopup = document.getElementById('doc_validation_popup');

        if (!thankYouSection || thankYouSection.style.display !== 'block') {
          // Show validation popup if thank you section is not visible
          doCValidationPopup.style.display = 'flex';
        } else {
          // Show CIBIL popup if thank you section is visible
          document.getElementById('cibil-score-popup').classList.add('fade-in');
          document.getElementById('cibil-score-popup').style.display = 'flex';
        }
      }
    });
  }

  // Function to close the document validation popup
  function closeDocValidationPopup() {
    document.getElementById('doc_validation_popup').style.display = 'none';
  }
  function closeCibilScorePopup() {
    const cibilPopup = document.getElementById('cibil-score-popup');
    cibilPopup.classList.remove('fade-in');
    cibilPopup.style.display = 'none';
  }

  // Event listener for close icon in validation popup
  document.getElementById('close-doc-popup').addEventListener('click', closeDocValidationPopup);

  // Event listener for the "OK" button inside the validation popup
  document.querySelector('#doc_validation_popup .blackButton button').addEventListener('click', closeDocValidationPopup);

  // Event listener for "Proceed to Offers" button inside the CIBIL score popup
  document.getElementById('proceed-to-offers').addEventListener('click', closeCibilScorePopup);

  // Initialize the radio button handler
  handleRadioSelection();

  async function initializeCustomerData() {
    try {
      const enquiryId = sessionStorage.getItem('enquiryId');

      const apiResponse = await getCustomerData(enquiryId);

      // Parse the JSON response
      const apiData = apiResponse.data;
      const customerData = apiData.customer_data;

      // Match and check the appropriate radio button for `customer_type_id`
      const customerTypeId = customerData.enquiry.customer_type_id;
      const customerRadioButtons = document.querySelectorAll('input[name="customRadio1"]');
      customerRadioButtons.forEach((radio) => {
        if (radio.value === customerTypeId.toString()) {
          radio.checked = true;
        }
      });

      // Match and check the appropriate radio button for `employment_type_id`
      const employmentTypeId = customerData.enquiry.employment_type_id;
      const employmentRadioButtons = document.getElementsByName('emloyed-by');
      employmentRadioButtons.forEach((radio) => {
        if (radio.value === employmentTypeId.toString()) {
          radio.checked = true;
        }
      });

      // Example of rendering data to the page (adjust based on your needs)
      const apiResponseContainer = document.getElementById('apiResponseContainer');
      if (apiResponseContainer) {
        apiResponseContainer.textContent = JSON.stringify(apiData, null, 2);
      }
    } catch (error) {
      console.error('Error initializing customer data:', error);
    }
  }

  // Call the function when the page is loaded
  document.addEventListener('DOMContentLoaded', initializeCustomerData);

}

const applyCompanyDiscount = async (companyId, companyName) => {
  try {
    if (companyId) {
      const selectedVariant = JSON.parse(sessionStorage.getItem('variant'));
      const requestBody = {
        "dealer_code": sessionStorage.getItem('selectedDealerId'),
        "variant_code": selectedVariant.variant_code,
        "model_code": sessionStorage.getItem('model'),
        "company_id": companyId,
        "fuel_type": selectedVariant.variantFuelType,
      }

      const discountApiResponse = await getCompanyOffers(requestBody);

      if (discountApiResponse?.success) {
        window.corporateOfferDetails = {
          "company_name": companyName,
          "company_id": companyId,
          "corporate_offer": "0"
        };

        discountApiResponse?.data?.length && discountApiResponse?.data.forEach((offerJson) => {
          if (offerJson.IDENTIFIER.toLowerCase() === 'corporate offer') {
            window.corporateOfferDetails.corporate_offer = `${offerJson.SCHEM_OFR_VAL}`
            document.querySelector('#CorporateOffer').textContent = offerJson.SCHEM_OFR_VAL;
            document.querySelector('.corporate-offer-text').style.display = 'block';
            document.querySelector('.avail_offer').style.display = 'none';
            document.querySelector('.remove_offer').style.display = 'flex';
          }
        })
      }
    }
  }
  catch (error) {
    document.querySelector('.corporate-offer-text').textContent = 'Something went wrong in fetching discount details.'
    document.querySelector('.corporate-offer-text').style.display = 'block';
  }

}

const fetchExchangeDetailsWrapper = async()=>{
  try {
    // Fetch user-entered values from the input fields
    const registrationNoApi = document.getElementById('registration_no').value || 'MH12QT4517';
    const kilometersInput = document.getElementById('kilometers').value;
    const numberOfOwnersInput = document.getElementById('number_of_owners').value;
    const carConditionApi = document.getElementById('car_condition').value || 'Good';
    const isMarutiVehicle = document.querySelector('input[name="carbrand"]:checked')?.value || '0';


    // Use parseInt with radix (base 10)
    const kilometersApi = kilometersInput && !Number.isNaN(kilometersInput)
      ? parseInt(kilometersInput, 10) : 40000;
    const numberOfOwnersApi = numberOfOwnersInput && !Number.isNaN(numberOfOwnersInput)
      ? parseInt(numberOfOwnersInput, 10) : 2;

    const selectedVariant = JSON.parse(sessionStorage.getItem('variant'));
    const requestBody = {
      dealer_id: sessionStorage.getItem('selectedDealerId'),
      enquiryId: sessionStorage.getItem('enquiryId'),
      number_of_owners: numberOfOwnersApi,
      kilometers: kilometersApi,
      car_condition: carConditionApi,
      registration_no: registrationNoApi,
      msil_car: `${isMarutiVehicle}`,
      purchase_car_model_code: sessionStorage.getItem('model'),
      purchase_car_variant_code: selectedVariant.variant_code,
      purchase_car_fuel_type: selectedVariant.variantFuelType,
    };
    const response = await fetchExchangeDetails(requestBody);

    if (response.success) {
      return response.data; // Return the API response for further handling
    }
    return { error: 'Failed to process the request.' }; // Return an error object
  } catch (error) {
    return { error: 'An error occurred while processing the request.' }; // Return a general error
  }
}

const updateInspectionDetails = async(expectedPricee, downPaymentt, preferredTime, inspectionDate) => {
  try{
    const requestBody = {
      enquiry_id: sessionStorage.getItem('enquiryId'),
      customer_expected_price: expectedPricee.value,
      customer_downpayment: downPaymentt.value,
      inspection_date: inspectionDate.value,
      inspection_time: preferredTime.value,

    };
    const response = await setInspectionDetails(requestBody);

    if (response.success) {
      return response; // Return the API response for further handling
    }
    return { ...response, errorMessage: 'Failed to process the request.' }; // Return an error object
  }
  catch(error){
    return { ...response, errorMessage: 'An error occurred while processing the request.' }; // Return a general error
  }
};
