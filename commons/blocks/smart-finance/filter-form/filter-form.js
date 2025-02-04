import filterForm from '../../../utility/filterFormUtils.js';
import utility from '../../../utility/utility.js';

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const [titleEl,
    homePageLinkEl,
    journeyTypeEl,
    modelSelectionLinkEl,
    loanOfferLinkEl,
    loanStatusLinkEl,
    priceSummaryLinkEl,
    personalDetailsLinkEl,
  ] = innerDiv.children;


  let dealerActionInvolved = 'Y';
  const placeholders = await utility.fetchFormSf('placeholders-sf.json', 'default');
  const title = titleEl?.textContent.trim();
  const journeyType = journeyTypeEl?.textContent.trim();
  const homePageLink = homePageLinkEl?.querySelector('a')?.href || '#';
  const modelSelectionLink = modelSelectionLinkEl?.querySelector('a')?.href || '#';
  const loanOfferLink =  loanOfferLinkEl?.querySelector('a')?.href || '#';
  const loanStatusLink =  loanStatusLinkEl?.querySelector('a')?.href || '#';
  const priceSummaryLink =  priceSummaryLinkEl?.querySelector('a')?.href || '#';
  const personalDetailsLink =  personalDetailsLinkEl?.querySelector('a')?.href || '#';
  let redirectLink = modelSelectionLink;

  let today = new Date();

  let dmsEnquiryRes = [];

  async function fetchDisbursedLoanSearch(mobile, loanApplication, dmsLeadId) {
    const url = `${placeholders.apiDomain}/app-service/api/v1/search/disbursed-leads`;
    const headers = {
      'x-dealer-authorization': sessionStorage.getItem('mspin_token'),
      'Content-Type': 'application/json',
    };
    let body = {
      dealer_id: sessionStorage.getItem('dealer_id'),
      loan_application_id: loanApplication,
      dms_lead_id: dmsLeadId,
      mobile,
    };

    body = JSON.stringify(body);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return null;
    }
  }

  async function fetchDealerSearch(mobile, bookingId, dmsEnquiry) {
    const url = `${placeholders.apiDomain}/app-service/api/v1/search/dms-enquiry`;
    const headers = {
      'x-dealer-authorization': sessionStorage.getItem('mspin_token'),
      'Content-Type': 'application/json',
    };
    let body = {
      mspin: sessionStorage.getItem('mspin'),
      enquiry_id: dmsEnquiry,
      booking_id: bookingId,
      mobile,
      page_type: journeyType,
    };
    if (journeyType === 'CUSTOMER_REQUEST' || journeyType === 'ONGOING_FINANCE') {
      body.FMP_ENQUIRY_STATUS = 'IN_PROGRESS';
    } else if (journeyType === 'CLARIFICATION') {
      body.FMP_LOAN_STATUS = 'FTNR';
      body.dealer_action_involved = dealerActionInvolved;
    } else if (journeyType === 'NEW_FINANCE') {
      body.dealer_action_involved = null;
      body.page_number = null;
    }
    body = JSON.stringify(body);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if(response.ok){
        const data = await response.json();
        return data;

      }
      else{
        const data = await response.json();
        document.querySelector('#no-results-popup').style.display='block';
        return data;
      }
    } catch (error) {
      document.querySelector('#no-results-popup').style.display='block';
      return null;
    }
  }

  function getTableHeader() {
    let tableHeader;
    if (
      journeyType === 'NEW_FINANCE'
            || journeyType === 'ONGOING_FINANCE'
            || journeyType === 'TRACK_FINANCE'
            || journeyType === 'CLARIFICATION'
    ) {
      tableHeader = filterForm.getNewFinance(placeholders);
    } else if (journeyType === 'CUSTOMER_REQUEST') {
      tableHeader = filterForm.getCustomerRequestHeader(placeholders);
    } else if (journeyType === 'archived_disbursed_loans') {
      tableHeader = filterForm.getArchivedDisbursedLoansHeader(placeholders);
    }
    return tableHeader;
  }

  function getTableData(item, index, startIndex) {
    let tableData;
    if (
      journeyType === 'NEW_FINANCE'
            || journeyType === 'ONGOING_FINANCE'
    ) {
      tableData = filterForm.getNewFinanceData(
        item,
        index,
        startIndex,
        placeholders,
      );
    } else if (journeyType === 'CUSTOMER_REQUEST') {
      tableData = filterForm.getCustomerRequestData(
        item,
        index,
        startIndex,
        placeholders,
      );
    } else if (journeyType === 'TRACK_FINANCE') {
      tableData = filterForm.getTrackFinanceData(
        item,
        index,
        startIndex,
        placeholders,
      );
    } else if (journeyType === 'CLARIFICATION') {
      tableData = filterForm.getClarificationData(
        item,
        index,
        startIndex,
        placeholders,
      );
    } else if (journeyType === 'archived_disbursed_loans') {
      tableData = filterForm.getArchivedDisbursedLoansData(
        item,
        index,
        startIndex,
        placeholders,
      );
    }
    return tableData;
  }
  const fiReferenceHtml = ` <div class="col-xs-12 col-md-3 form-group">
    ${placeholders.fiReference
    ? `<input type="text"
    onkeypress="return event.charCode >= 97 &amp;&amp; event.charCode <= 122 || event.charCode >= 65 &amp;&amp; event.charCode <= 90 || event.charCode >= 48 &amp;&amp; event.charCode <= 57"
    class="form-control" placeholder="${placeholders.fiReference}" id="fiReferenceId" tabindex="2">`
    : ''
}
    </div>`;

  const bookingIdHtml = ` <div class="col-xs-12 col-md-3 form-group">
    ${placeholders.bookingId
    ? `<input type="text"
    onkeypress="return event.charCode >= 97 &amp;&amp; event.charCode <= 122 || event.charCode >= 65 &amp;&amp; event.charCode <= 90 || event.charCode >= 48 &amp;&amp; event.charCode <= 57"
    class="form-control" placeholder="${placeholders.bookingId}" id="bookingID" tabindex="2">`
    : ''
}
    </div>`;

  const dealerActionHtml = `<div class="dealer-action">
    <div class="row">
      <div class="dealer-action-wrapper">
        <div class="col-sm-3"><label class="radio-title">Dealer action involved?</label></div>
        <div class="col-sm-9">
          <div class="radiobtn">
            <div class="radio-option radio-wrapper">
              <input type="radio" checked="checked" name="dealerType" id="dealerTypeYes" value="Y" tabindex="10" />
              <label for="dealerTypeYes">Yes</label>
            </div>
            <div class="radio-option radio-wrapper">
              <input type="radio"  name="dealerType" id="dealerTypeNo" value="N" tabindex="11" />
              <label for="dealerTypeNo">No</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  function getFormHtml() {
    return `
      <div class="New">
        <div class="container">
          <ul class="cd_breadcrumb">
            <li><a href="${homePageLink}" class="home-icon"></a></li>
            <li><a href="${homePageLink}" class="back-icon">Back</a></li>
          </ul>
             <div class="row">
            <div class="col-sm-12"><h2 class="dealer-page-title">${title}</h2></div>
          </div>
        </div>

        <div class="container search-component-wrapper">
        <div >
          <div class="search-form-wrapper">
            <form class="cd_form" id="filter_form">
              <div class="row">
                <div class="col-xs-12 col-md-3 form-group">
                  ${placeholders.mobileNum
    ? `<input type="text" class="form-control mobileNumber valid" name="mobileNumber" maxlength="10" placeholder="${placeholders.mobileNum}" id="mobileNumber" tabindex="1" aria-invalid="false">`
    : ''
}
                  <em id="mobileNumber-error" class="error invalid-feedback" style="display:none;">Please enter valid Number</em>
                </div>
                ${journeyType === 'archived_disbursed_loans'
    ? fiReferenceHtml
    : bookingIdHtml
}
                <div class="col-xs-12 col-md-3 form-group">

                ${placeholders.dmsEnquiry
    ? `<input type="text"
                onkeypress="return event.charCode >= 97 &amp;&amp; event.charCode <= 122 || event.charCode >= 65 &amp;&amp; event.charCode <= 90 || event.charCode >= 48 &amp;&amp; event.charCode <= 57"
                class="form-control" placeholder="${placeholders.dmsEnquiry}" id="enquiryId" tabindex="3">
                <em id="dmsEnquiry-error" class="error invalid-feedback" style="display:none;">Please enter valid Number</em>`
    : ''
}
                </div>
                <div class="col-xs-12 col-md-3 form-group btn-group">
                ${placeholders.search
    ? `<button type="button" class="btn btn--primary-solid btn-dealer" id="dealer_filter_search">${placeholders.search}</button>`
    : ''
}
                ${placeholders.clearAll
    ? `<button type="button" class="btn btn--primary-solid btn-dealer" id="clear_filter">${placeholders.clearAll}</button>`
    : ''
}
                </div>
              </div>
            </form>
            ${journeyType === 'archived_disbursed_loans'
    ? '<div><p>Search enquiries Disbursed & Closed within last 1 year</p></div>'
    : ''
}

          </div>
          ${journeyType === 'CLARIFICATION' ? dealerActionHtml : ''}
          <div class="row">
            <div class="col-sm-12">
              <div class="search_table_listings" style="display: none;">
                <div class="table-responsive">
                  <table class="table table-bordered pagination1 table-hover" id="example">
                    <thead>
                      <tr>
                      ${getTableHeader()}
                      </tr>
                    </thead>
                    <tbody id="myTable"></tbody>
                  </table>
                </div>
                <div class="col-md-12">
              <div class="row">
                <div class="col-sm-6"><p class="result-count">0 Total</p></div>
                <div class="col-sm-6">
                  <ul class="pagination" id="myPager">
                    <li><a href="#" class="prev_link">«</a></li>
                    <li class="active"><a href="#" class="page_link active">1</a></li>
                    <li><a href="#" class="next_link">»</a></li>
                  </ul>

              </div>
            </div>
          </div>
                <div class="clearfix"></div>
              </div>
            </div>
          </div>


        </div>
        </div>
      </div>
    `;
  }

  function getErrorPopupHtml() {
    return `
        <div class="popUpmain" id="popup" style="display: none;">
            <div class="modal-content">
                <div class="close" id="close-popup"></div>
                <div class="popupContent red">
                    <div class="logo-wrapper">
                        <div class="icon-img"></div>
                        <h2>Error</h2>
                    </div>
                    <p>Please Enter at least one field</p>
                    <div class="blackButton">
                        <button type="button" data-dismiss="modal" class="submitcibil" id="close-popup-btn" value="OK">OK</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="popUpmain" id="no-results-popup" style="display: none;">
            <div class="modal-content">
                <div class="close" id="close-no-results-popup"></div>
                <div class="popupContent blue">
                    <div class="logo-wrapper">
                        <div class="icon-img"></div>
                        <h2>Information</h2>
                    </div>
                    <p>No search result found</p>
                    <div class="blackButton">
                        <button type="button" data-dismiss="modal" class="submitcibil" id="close-no-results-popup-btn" value="OK">OK</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="popUpmain" id="invalid-enquiry-popup" style="display: none;">
            <div class="modal-content">
                <div class="close" id="close-invalid-enquiry-popup"></div>
                <div class="popupContent red">
                    <div class="logo-wrapper">
                        <div class="icon-img"></div>
                        <h2>Error</h2>
                    </div>
                    <p>Invalid enquiry id</p>
                    <div class="blackButton">
                        <button type="button" data-dismiss="modal" class="submitcibil" id="close-invalid-enquiry-popup-btn" value="OK">OK</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="popUpmain" id="details-popup">
          <div class="modal-content">
              <div class="close" id="close-details-popup">
              </div>
              <div class="popupContent ">
                  <div class="row">
                      <div class="col-sm-12">
                          <div class="input-group-otp datebox-sort">
                              <div class="inputField otpTxt blur">
                                  <input type="text" id="Name" name="Name" class="form-control is-valid" placeholder="Full Name*" tabindex="16" required onkeypress="return event.charCode >= 97 &amp;&amp; event.charCode <= 122 || event.charCode >= 65 &amp;&amp; event.charCode <= 90 || event.charCode == 32">
                                  <em id="Name-error" style='display:none;' class="error invalid-feedback">Please enter Full Name as per pan
                                      card</em>
                              </div>
                              <div class="inputField otpTxt">
                                  <input type="email" id="Email" maxlength="50" name="Email" class="form-control "
                                      placeholder="Email*" tabindex="17">
                                  <em id="Email-error" style='display:none;' class="error invalid-feedback">Please enter a valid Email</em>
                              </div>
                              <div class="dateselectorpop date">
                                  <input type="date" id="dob_land" class="pdate form-control"
                                      placeholder="DD-MM-YYYY (DOB*)" name="dob_land" tabindex="18">
                                  <em id="dob_land-error" style='display:none;' class="error invalid-feedback">Please Enter valid Date Of Birth</em>
                                  <span class="input-group-addon">
                                      <i class="cal-icon"></i>
                                  </span>
                              </div>
                          </div>
                      </div>
                      <div class="col-sm-12">
                      <a  class="blackButton" id="submit_btn" href='${modelSelectionLink}'>
                          Submit
                      </a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div class="popUpmain" id="existing-loan-popup">
        <div class="modal-content">
            <div class="close" id="close-existing-loan-popup">
            </div>
            <div class="popupContent blue">
                <h2>
                    <div class="icon-img"></div>Information
                </h2>

                <div class="blackButton existing-loan-popup"><button type="button">PROCEED</button></div>
            </div>
        </div>
    </div>
        `;
  }

  block.innerHTML = utility.sanitizeHtml(getFormHtml() + getErrorPopupHtml());

  const searchButton = document.getElementById('dealer_filter_search');
  const clearButton = document.getElementById('clear_filter');
  const tableContainer = document.querySelector('.search_table_listings');
  const tableBody = document.getElementById('myTable');
  const resultCount = document.querySelector('.result-count');
  const popup = document.getElementById('popup');
  const noResultsPopup = document.getElementById('no-results-popup');
  const invalidEnquiryPopup = document.getElementById('invalid-enquiry-popup');
  const closePopupButtons = document.querySelectorAll(
    '#close-popup, #close-popup-btn, #close-no-results-popup, #close-no-results-popup-btn, #close-invalid-enquiry-popup, #close-invalid-enquiry-popup-btn',
  );
  const paginationContainer = document.getElementById('myPager');

  let currentPage = 1;
  const rowsPerPage = 5;
  let listData = [];

  async function fetchData(mobileNumber, bookingId, dmsEnquiry) {
    const result = await fetchDealerSearch(mobileNumber, bookingId, dmsEnquiry);
    dmsEnquiryRes = result?.enquiries || [];
    return result;
  }
  function renderTable(enquiries) {
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = enquiries.slice(startIndex, endIndex);

    paginatedData.forEach((item, index) => {
      const row = getTableData(item, index, startIndex);
      tableBody.appendChild(row);
    });

    resultCount.textContent = `${enquiries.length} Total`;
    tableContainer.style.display = 'block'; // Ensure the table container is displayed
    // eslint-disable-next-line no-use-before-define
    updatePagination(enquiries.length);
  }

  function setMinimumDate() {
    today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    const yyyy = today.getFullYear() - 18;
    if (dd < 10) {
      dd = `0${dd}`;
    }
    if (mm < 10) {
      mm = `0${mm}`;
    }
    today = `${yyyy}-${mm}-${dd}`;
    block.querySelector('#dob_land').setAttribute('max', today);
  }
  /* eslint-disable no-unused-vars */
  function showExistingLoanPopup(displayMessage, rowIndex) {
    const existingLoanPopup = block.querySelector('#existing-loan-popup');
    existingLoanPopup.classList.add('fade-in');
    existingLoanPopup.style.display = 'flex';

    // Dynamically create a <p> tag for the displayMessage
    const popupContent = existingLoanPopup.querySelector('.popupContent.blue');
    const existingMessage = popupContent.querySelector('p'); // Check if a <p> already exists
    if (existingMessage) {
      existingMessage.remove(); // Remove the old message to avoid duplication
    }

    const messageContainer = document.createElement('p'); // Create a new <p> tag
    messageContainer.textContent = displayMessage; // Set the text content
    popupContent.insertBefore(messageContainer, popupContent.querySelector('.blackButton')); // Add before the button

    const closeExistingLoanPopup = () => {
      existingLoanPopup.classList.remove('fade-in');
      existingLoanPopup.style.display = 'none';
    };
    const selectedMobile = dmsEnquiryRes[rowIndex]?.mobile;
    const handleRedirect = () => {
      const cityId = sessionStorage.getItem('city_id');
    const dealerId = sessionStorage.getItem('dealer_id');
      const enquiryDetails = {
        mobile: selectedMobile,
        state: sessionStorage.getItem('state_id'),
        city: cityId,
        dealer: dealerId,
      }
      sessionStorage.setItem('enquiry_details',JSON.stringify(enquiryDetails));
      sessionStorage.setItem('dmsLeadId', dmsEnquiryRes[rowIndex]?.dms_enquiry_id);
      window.location.href = redirectLink;
    };

    // Close functionality
    block.querySelector('#close-existing-loan-popup').addEventListener('click', closeExistingLoanPopup);
    block.querySelector('.existing-loan-popup button').addEventListener('click', handleRedirect);
  }

  function handleDateInputChange(elementhtml) {
    const element = elementhtml instanceof HTMLElement ? elementhtml : this;
    const date = element.value;
    if (new Date(date) < new Date(today)) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.nextElementSibling.style.display = 'none';
    } else {
      element.classList.add('is-invalid');
      element.classList.remove('is-valid');
      element.nextElementSibling.style.display = 'flex';
    }
  }

  function handleNameInputKeyup(elementhtml) {
    const element = elementhtml instanceof HTMLElement ? elementhtml : this;
    const name = element.value;
    const maxLength = 93;
    const spaceCount = (name.match(/\s/g) || []).length;
    const isValid = /^[a-zA-Z\s]*$/.test(name) && name.length <= maxLength && spaceCount <= 3;
    if (isValid) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.nextElementSibling.style.display = 'none';
    } else {
      element.classList.add('is-invalid');
      element.classList.remove('is-valid');
      element.nextElementSibling.style.display = 'flex';
    }
  }

  function handleEmailInputKeyup(elementhtml) {
    const element = elementhtml instanceof HTMLElement ? elementhtml : this;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = element.value;
    const isValid = emailRegex.test(email);
    if (isValid) {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
      element.nextElementSibling.style.display = 'none';
    } else {
      element.classList.add('is-invalid');
      element.classList.remove('is-valid');
      element.nextElementSibling.style.display = 'flex';
    }
  }

  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  async function handleSubmitButtonClick(event, rowIndex, dateInput, emailInput, nameInput) {
    // Prevent default behavior
    event.preventDefault();

    handleNameInputKeyup(nameInput);
    handleDateInputChange(dateInput);
    handleEmailInputKeyup(emailInput);
    // Validate fields
    const isNameValid = nameInput.classList.contains('is-valid');
    const isEmailValid = emailInput.classList.contains('is-valid');
    const isDateValid = dateInput.classList.contains('is-valid');

    if (!isNameValid || !isEmailValid || !isDateValid) {
      return;
    }

    const cityId = sessionStorage.getItem('city_id');
    const dealerId = sessionStorage.getItem('dealer_id');
    const dobValue = formatDateToDDMMYYYY(dateInput.value);
    const nameValue = nameInput.value;
    const nameParts = nameValue.split(/\s+/);

      // Process name splitting logic
    const [firstName, ...rest] = nameParts;
    let lastName = '';
    let middleName = '';

    if (rest.length === 1) {
      [lastName] = rest;
    } else if (rest.length >= 2) {
      [lastName, ...middleName] = [rest.pop(), rest.join(' ')];
    }

    const selectedMobile = dmsEnquiryRes[rowIndex]?.mobile;
    const enquiryDetails ={
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      mobile: selectedMobile,
      email: emailInput.value,
      dob: dobValue,
      city: cityId,
      state: sessionStorage.getItem('state_id'),
      dealer: dealerId,
    }
    sessionStorage.setItem('enquiry_details',JSON.stringify(enquiryDetails));
    sessionStorage.setItem('dmsLeadId', dmsEnquiryRes[rowIndex]?.dms_enquiry_id);
    window.location.href = modelSelectionLink;

  }

  function handleYesOptionClick(rowIndex, validationPopupNew) {
    const custDetailsPopup = block.querySelector('#details-popup');

    custDetailsPopup.querySelector('#Email').value='';
    custDetailsPopup.querySelector('#Email').classList.remove('is-invalid');
    custDetailsPopup.querySelector('#Email-error').style.display = 'none';
    custDetailsPopup.querySelector('#dob_land').value='';
    custDetailsPopup.querySelector('#dob_land').classList.remove('is-invalid');
    custDetailsPopup.querySelector('#dob_land-error').style.display = 'none';
    custDetailsPopup.classList.add('fade-in');
    custDetailsPopup.style.display = 'flex';
    if (validationPopupNew !== null) {
      validationPopupNew.style.display = 'none';
    }
    custDetailsPopup.querySelector('#Name').setAttribute('value', dmsEnquiryRes[rowIndex]?.customer_name);
    setMinimumDate();

    const dateInput = block.querySelector('#dob_land');
    dateInput.addEventListener('change', handleDateInputChange);

    const nameInput = block.querySelector('#Name');
    nameInput.addEventListener('keyup', handleNameInputKeyup);

    const emailInput = block.querySelector('#Email');
    emailInput.addEventListener('keyup', handleEmailInputKeyup);
    emailInput.addEventListener('blur', handleEmailInputKeyup);
    emailInput.addEventListener('input', handleEmailInputKeyup);

    const closeDetailsPopup = () => {
      custDetailsPopup.classList.remove('fade-in');
      custDetailsPopup.style.display = 'none';
    };

    block.querySelector('#close-details-popup').addEventListener('click', closeDetailsPopup);

    block.querySelector('#submit_btn').addEventListener('click', (event) => handleSubmitButtonClick(event, rowIndex, dateInput, emailInput, nameInput));
  }

  function showValidationPopup(displayMessage, rowIndex) {
    const validationPopup = block.querySelector('#validation-popup');
    if (validationPopup) {
      block.removeChild(validationPopup);
    }

    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
        <div class="popUpmain" id="validation-popup">
          <div class="modal-content">
              <div class="close" id="close-validation-popup"></div>
              <div class="popupContent blue">
                  <h2><div class="icon-img"></div>Information</h2>
                  <p>${displayMessage}</p>
                  <div class="blackButton"><button type="button" id="yes_option">Yes</button></div>
                  <div class="blackButton validation-popup"><button type="button">No</button></div>
              </div>
          </div>
        </div>`),
    );
    const detailsPopup = block.querySelector('#details-popup');
    const validationPopupNew = block.querySelector('#validation-popup');
    validationPopupNew.classList.add('fade-in');
    validationPopupNew.style.display = 'flex';

    const closePopup = () => {
      validationPopupNew.classList.remove('fade-in');
      validationPopupNew.style.display = 'none';
    };
    const closeDetailsPopup = () => {
      detailsPopup.classList.remove('fade-in');
      detailsPopup.style.display = 'none';
    };
    const handleNoButtonclick = () => {
      window.location.href = redirectLink;
    };

    block.querySelector('#close-details-popup').addEventListener('click', closeDetailsPopup);
    block.querySelector('#close-validation-popup').addEventListener('click', closePopup);
    block.querySelector('.validation-popup').addEventListener('click', handleNoButtonclick);
    block.querySelector('#yes_option').addEventListener('click', () => handleYesOptionClick(rowIndex, validationPopupNew));
  }

  async function handleLaunchFinanceClick(e) {
    // Step 1: Validate OTP
    const mspinToken = sessionStorage.getItem('mspin_token');
    // Extract rowData and mobile number
    const rowIndex = e.target.closest('tr').getAttribute('row-index');
    const mobileNumber = dmsEnquiryRes[rowIndex]?.mobile;

    if (!mobileNumber) {
      throw new Error('Mobile number not found.');
    }

    // Step 2: Fetch active details
    const activeDetailResponse = await fetch(`${placeholders.apiDomain}/app-service/api/v1/dealer/enquiry/active`, {
      method: 'POST',
      headers: {
        'x-dealer-Authorization': mspinToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile: mobileNumber,
      }),
    });

    if (!activeDetailResponse.ok) {
      throw new Error('Failed to fetch active details');
    }

    const activeDetailData = await activeDetailResponse.json();
    const displayMessage = activeDetailData?.display_message;
    const activeEnquiryStatus = activeDetailData?.enquiry_status;
    const yesOptionsAllValues = ['NA','CLOSED'];
    const redirectToLoanOfferValues = ['USER_DETAILS_SAVED','LOAN_APPLICATION_SAVED'];
    const redirectToLoanStatusValues = ['LOAN_APPLICATION_SUBMITTED','AWAIT_RETRY'];
    const redirectToPriceSummaryValues = ['CAR_PERSONALIZED'];
    const redirectToPersonalDetailsValues = ['USER_PARTIAL_DETAILS_SAVED'];
    sessionStorage.setItem('existingEnquiryId', activeDetailData?.enquiry_id);
    // Step 3: Call appropriate function based on displayMessage
    if (yesOptionsAllValues.includes(activeEnquiryStatus)) {
      handleYesOptionClick(rowIndex, null);
    } else if(redirectToLoanOfferValues.includes(activeEnquiryStatus)){
      //yes/no and loan offer
      redirectLink= loanOfferLink;
      showValidationPopup(displayMessage, rowIndex);
    }
    else if(redirectToLoanStatusValues.includes(activeEnquiryStatus)){
      // proceed and loan status
      redirectLink= loanStatusLink;
      showExistingLoanPopup(displayMessage, rowIndex);

    }
    else if(redirectToPriceSummaryValues.includes(activeEnquiryStatus)){
      // yes/no and price summary
      redirectLink= priceSummaryLink;
      showValidationPopup(displayMessage, rowIndex);
    }else if(redirectToPersonalDetailsValues.includes(activeEnquiryStatus)){
      // yes/no and price details
      redirectLink= personalDetailsLink;
      showValidationPopup(displayMessage, rowIndex);
    }
    else {
      handleYesOptionClick(rowIndex, null);
    }
  }

  function addLaunchFinanceListeners() {
    const launchFinanceButtons = block.querySelectorAll('.launch_deal_btn_new_finance');

    launchFinanceButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        // Extract rowData when the button is clicked
        const row = event.target.closest('tr');
        if (row) {
          handleLaunchFinanceClick(event); // Pass rowData to the handler
        }
      });
    });
  }

  function changePage(page) {
    const totalPages = Math.ceil(listData.length / rowsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderTable(listData);
    addLaunchFinanceListeners();
  }
  function updatePagination(totalRecords) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalRecords / rowsPerPage);

    const prevLink = document.createElement('li');
    prevLink.innerHTML = '<a href="#" class="prev_link">«</a>';
    prevLink.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(prevLink);

    if (currentPage > 1) {
      prevLink.style.display = 'block';
    } else {
      prevLink.style.display = 'none';
    }

    for (let i = 1; i <= totalPages; i += 1) {
      const pageLink = document.createElement('li');
      pageLink.classList.add('page_link');
      if (i === currentPage) pageLink.classList.add('active');
      pageLink.innerHTML = `<a href="#">${i}</a>`;
      pageLink.addEventListener('click', () => changePage(i));
      paginationContainer.appendChild(pageLink);
    }

    const nextLink = document.createElement('li');
    nextLink.innerHTML = '<a href="#" class="next_link">»</a>';
    nextLink.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(nextLink);

    if (currentPage < totalPages) {
      nextLink.style.display = 'block';
    } else {
      nextLink.style.display = 'none';
    }
  }

  // -----------radio button logic for Dealer Clarification page----
  const radios = document.querySelectorAll(
    'input[type=radio][name="dealerType"]',
  );
  async function changeHandler(event) {
    dealerActionInvolved = event.target.value;
    listData = (await fetchData()).enquiries;
    renderTable(listData);
  }
  Array.prototype.forEach.call(radios, (radio) => {
    radio.addEventListener('change', changeHandler);
  });

  // Fetch and render data when the page loads
  async function init() {
    listData = (await fetchData()).enquiries;
    renderTable(listData);
  }
  if (journeyType === 'NEW_FINANCE') {
    resultCount.style.display = 'none';
    paginationContainer.style.display = 'none';
  } else if (journeyType === 'ONGOING_FINANCE') {
    await init();
    addLaunchFinanceListeners();
  } else if (journeyType === 'archived_disbursed_loans') {
    renderTable(listData);
  } else {
    await init();
  }

  const validEnquiryIdFormat = /^enq\d{8}$/i;

  async function handleSearch() {
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const bookingID = document.getElementById('bookingID').value.trim();
    const enquiryId = document.getElementById('enquiryId').value.trim();
    const clear = document.getElementById('clear_filter');

    if (!mobileNumber && !bookingID && !enquiryId) {
      popup.style.display = 'flex'; // Show the error popup
      return;
    }
    clear.style.display = 'block';

    if (enquiryId && !validEnquiryIdFormat.test(enquiryId)) {
      invalidEnquiryPopup.style.display = 'flex';
      return;
    }

    if (journeyType === 'NEW_FINANCE') {
      resultCount.style.display = 'block';
      paginationContainer.style.display = 'flex';
    }

    const data = await fetchData(mobileNumber, bookingID, enquiryId);

    // Filter data based on search inputs
    listData = data.enquiries.filter(
      (item) => (!mobileNumber || item.mobile.includes(mobileNumber))
                && (!bookingID || item.dms_enquiry_id.includes(bookingID))
                && (!enquiryId || item.dms_enquiry_id.includes(enquiryId)),
    );
    if (listData.length === 0) {
      noResultsPopup.style.display = 'flex';
      return;
    }

    currentPage = 1;
    renderTable(listData);
    addLaunchFinanceListeners();
  }

  async function archivedHandleSearch() {
    const mobileNumber = document.getElementById('mobileNumber').value.trim();
    const fiReferenceId = document.getElementById('fiReferenceId').value.trim();
    const enquiryId = document.getElementById('enquiryId').value.trim();
    const clear = document.getElementById('clear_filter');

    if (!mobileNumber && !fiReferenceId && !enquiryId) {
      popup.style.display = 'flex'; // Show the error popup
      return;
    }
    clear.style.display = 'block';

    if (enquiryId && !validEnquiryIdFormat.test(enquiryId)) {
      invalidEnquiryPopup.style.display = 'flex';
      return;
    }

    const data = await fetchDisbursedLoanSearch(mobileNumber, fiReferenceId, enquiryId);

    // Filter data based on search inputs
    listData = data.data.filter(
      (item) => (!mobileNumber || item.mobile.includes(mobileNumber))
                && (!fiReferenceId || item.loan_application_id.includes(fiReferenceId))
                && (!enquiryId || item.dms_lead_id.includes(enquiryId)),
    );
    if (listData.length === 0) {
      noResultsPopup.style.display = 'flex';
      return;
    }

    currentPage = 1;
    renderTable(listData);
  }

  async function clearSearchFields() {
    document.getElementById('mobileNumber').value = '';
    document.getElementById('bookingID').value = '';
    document.getElementById('enquiryId').value = '';

    const mobileNumber = this.value;
    const isValid = document.getElementById('mobileNumber');
    isValid.classList.remove('is-valid');

    const booking = document.getElementById('bookingID');
    booking.classList.remove('is-valid');

    const enquiry = document.getElementById('enquiryId');
    enquiry.classList.remove('is-valid');

    const errorMessage = document.getElementById('mobileNumber-error');
    if (mobileNumber.length) {
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }

    // Fetch and render all data on clear

    if (journeyType !== 'NEW_FINANCE') {
      listData = (await fetchData()).enquiries;
      renderTable(listData);
      addLaunchFinanceListeners();
    }

  }

  async function archivedclearSearchFields() {
    document.getElementById('mobileNumber').value = '';
    document.getElementById('fiReferenceId').value = '';
    document.getElementById('enquiryId').value = '';

    const mobileNumber = this.value;
    const isValid = document.getElementById('mobileNumber');
    isValid.classList.remove('is-valid');

    const fiReference = document.getElementById('fiReferenceId');
    fiReference.classList.remove('is-valid');

    const enquiry = document.getElementById('enquiryId');
    enquiry.classList.remove('is-valid');

    const errorMessage = document.getElementById('mobileNumber-error');
    if (mobileNumber.length) {
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }

    // Fetch and render all data on clear
    if (journeyType !== 'NEW_FINANCE') {
      listData = (await fetchData()).enquiries;
      renderTable(listData);
      addLaunchFinanceListeners();
    }
  }

  function closeSearchClearPopup() {
    popup.style.display = 'none'; // Hide the error popup
    noResultsPopup.style.display = 'none';
    invalidEnquiryPopup.style.display = 'none';
  }

  // ------custom search and clear functionality of Archived disbursed loans----
  if (journeyType === 'archived_disbursed_loans') {
    document
      .getElementById('fiReferenceId')
      .addEventListener('input', function fiReferenceValid() {
        this.classList.add('is-valid');
      });
    document
      .getElementById('enquiryId')
      .addEventListener('input', function enquiryValid() {
        this.classList.add('is-valid');
      });
    searchButton.addEventListener('click', archivedHandleSearch);
    clearButton.addEventListener('click', archivedclearSearchFields);
  } else {
    clearButton.addEventListener('click', clearSearchFields);
    searchButton.addEventListener('click', handleSearch);
  }

  closePopupButtons.forEach((button) => button.addEventListener('click', closeSearchClearPopup));

  function validateNumber(event) {
    const charCode = event.which ? event.which : event.keyCode;
    return !!(charCode >= 48 && charCode <= 57);
  }

  // Attach validateNumber function to the input after adding it to the DOM
  document.getElementById('mobileNumber').addEventListener('keypress', validateNumber);
  document
    .getElementById('mobileNumber')
    .addEventListener('input', function mobileNumberValid() {
      const mobileNumber = this.value;
      const errorMessage = document.getElementById('mobileNumber-error');
      if (mobileNumber.length !== 10 && mobileNumber.length !== 0) {
        errorMessage.style.display = 'block';
        this.classList.add('not-valid');
        this.classList.remove('valid');
        this.classList.remove('is-valid');
      } else if (mobileNumber.length === 10) {
        this.classList.add('is-valid');
        this.classList.remove('not-valid');
        errorMessage.style.display = 'none';
        searchButton.addEventListener('click', handleSearch);
      } else {
        errorMessage.style.display = 'none';
        this.classList.add('valid');
        this.classList.remove('not-valid');
        this.classList.remove('is-valid');
      }
    });
  document
    .getElementById('bookingID')
    .addEventListener('input', function bookingValid() {
      this.classList.add('is-valid');
    });

  document
    .getElementById('enquiryId')
    .addEventListener('input', function enquiryValid() {
      this.classList.add('is-valid');
    });
}
