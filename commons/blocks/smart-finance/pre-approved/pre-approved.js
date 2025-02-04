import utility from '../../../utility/utility.js';
import {
  getAllLoanOffers, getLoanScheme, getPreApprovedLoanOffers, selectedLoanOffer, loanOffersDownload,
} from '../../../utility/smart-finance/sfLoanUtils.js';
import { getCustomerData } from '../../../utility/sfUtils.js';
import { fetchPlaceholders } from '../../../scripts/aem.js';

async function initializeLoanOffersData(enquiryId) {
  let emailValue; let dobValue; let mobileValue; let employmentTypeIdCode; let
    dealerValue; let onRoadPrice;

  try {
    // Fetch the customer data from the API
    const apiResponse = await getCustomerData(enquiryId);

    if (apiResponse && apiResponse.success && apiResponse.data.customer_data) {
      const enquiryData = apiResponse.data.customer_data?.enquiry;

      // Extract required values from the API response
      emailValue = enquiryData.email || '';
      dobValue = enquiryData.dob || '';
      mobileValue = enquiryData.mobile || '';
      employmentTypeIdCode = enquiryData.employment_type_id || '';
      dealerValue = enquiryData.dealer || '';
      onRoadPrice = apiResponse.data.customer_data.car_summary.on_road_price;
      sessionStorage.setItem('mobile', mobileValue);
      sessionStorage.setItem('enquiryId', apiResponse.data.enquiry_id);
      sessionStorage.setItem('employmentTypeId', employmentTypeIdCode);
    } else {
      return { error: '' };
    }
  } catch (error) {
    return { error: '' };
  }

  // Return the fetched data as an object for reuse
  return {
    emailValue,
    dobValue,
    mobileValue,
    employmentTypeIdCode,
    dealerValue,
    onRoadPrice,
  };
}
function populateCarDetails(customerData) {
  document.getElementById('carDetail').textContent = JSON.parse(sessionStorage.getItem('variant'))?.variantDesc || 'Toyota Innova Crysta 2.7 GX 7 STR';
  document.getElementById('roadPrice').insertAdjacentHTML('afterbegin', `₹ ${customerData.onRoadPrice}`);
}

function checkEmptyResponseMessage(response) {
  const loanList = document.getElementById('loanList');
  if (response.data?.applicant_offers?.offers.length === 0) {
    loanList.innerHTML = `<p style="text-align: center;margin-top: 20px;font-weight: bold;">
    ${response.data?.applicant_offers?.message}</p>`;
  }
}

// Function to handle the download functionality
async function handleDownload(enquiryId, apiChannel) {
  function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = Array.from(slice, (char) => char.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  // Determine the loan type based on the active tab
  const customTabValue = document.getElementById('Custom-tab');
  const preApprovedTabValue = document.getElementById('Pre-approved-tab');
  let loanType = 'custom';

  if (customTabValue?.classList.contains('active')) {
    loanType = 'custom';
  } else if (preApprovedTabValue?.classList.contains('active')) {
    loanType = 'PA';
  }

  // Example payload for the API
  const bodyData = {
    enquiry_id: enquiryId,
    channel_id: apiChannel,
    loan_type: loanType,
  };

  try {
    const response = await loanOffersDownload(bodyData);
    if (response.success) {
      const { data } = response.data; // Extract the Base64 data

      // Convert Base64 string to Blob
      const pdfBlob = b64toBlob(data, 'application/pdf');

      // Create a download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = 'Loan-Offers.pdf'; // Set a default file name
      document.body.appendChild(link); // Append link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link); // Clean up the DOM
      return '';
    }
    return `${response.message}`;
  } catch (error) {
    return `${error}`;
  }
}

export default async function decorate(block) {
  const getFieldData = (element) => element?.textContent?.trim() || '';
  const formsff = await utility.fetchFormSf();
  let ballooningHtml = '';

  const innerDiv = block.children[0].children[0];
  const [
    PreTitleEl,
    descrEl,
    downloadEl,
    roadEl,
    filEl,
    downEl,
    tenureEl,
    yearsEl,
    financierEl,
    loanAmtEl,
    rateEl,
    miniEl,
    feeEl,
    tenEl,
    emiEl,
    backEl,
    disclaimertextEl,
    disclaimerEl,
    prevLinkEl,
    loanAppLinkEl,
    comparePageLinkEl,
  ] = innerDiv.children;

  const PreTitle = getFieldData(PreTitleEl);
  const descr = getFieldData(descrEl);
  const download = getFieldData(downloadEl);
  const road = getFieldData(roadEl);
  const fil = getFieldData(filEl);
  const down = getFieldData(downEl);
  const tenure = getFieldData(tenureEl);
  const years = getFieldData(yearsEl);
  const financier = getFieldData(financierEl);
  const loanAmt = getFieldData(loanAmtEl);
  const rate = getFieldData(rateEl);
  const mini = getFieldData(miniEl);
  const fee = getFieldData(feeEl);
  const ten = getFieldData(tenEl);
  const emi = getFieldData(emiEl);
  const back = getFieldData(backEl);
  const disclaimer = disclaimertextEl?.textContent?.trim();
  const disclaimerList = [...disclaimerEl.querySelectorAll('li')]
    .map((li) => li.outerHTML)
    .join('');
  const loanAppLink = loanAppLinkEl?.querySelector('a')?.href || '#';
  const prevLink = prevLinkEl?.querySelector('a')?.href || '#';
  const comparePageLink = comparePageLinkEl?.querySelector('a')?.href || '#';

  const createBallooningHtml = (ballooning) => {
    ballooning.forEach((percent) => {
      ballooningHtml += `
      <li class="list-flexibleEmi__item"><a href="javascipt:void(0);"
      class="list-flexibleEmi__item--text ">${percent}%</a></li>`;
    });
  };

  const enquiryId = sessionStorage.getItem('enquiryId');

  document.addEventListener('DOMContentLoaded', initializeLoanOffersData);
  const customerData = await initializeLoanOffersData(enquiryId);

  const resp = await getLoanScheme();
  if (resp.success) {
    const ballooning = resp.data?.loan_scheme[0]?.percentage;
    createBallooningHtml(ballooning);
  }
  const response = await getAllLoanOffers(null, enquiryId);
  let jsonData = [];
  if (response.success) {
    jsonData = response.data?.applicant_offers?.offers;
  }
  const body = {
    email: customerData.emailValue,
    dob: customerData.dobValue,
    mobile: customerData.mobileValue,
    tenure: null,
    dealer_id: customerData.dealerValue,
    down_payment: '',
  };
  const preapprovedResponse = await getPreApprovedLoanOffers(body, enquiryId);
  let preapprovedLoansData = [];
  if (preapprovedResponse.success) {
    preapprovedLoansData = preapprovedResponse.data?.preapproved_loan_offers;
  }
  let highestDownPayValue = jsonData.reduce((max, offer) => Math.max(max, offer.down_payment), 0);
  const htmlContent = `
    <section class="loanOfferPage">
        <div class="container clearfix">
            <div class="pageTitle">
                <div class="carDetail">
                    <div class="carImg">
                        <div class="car-img"></div>
                    </div>

                    <div class="carTxt">
                    <h3 id="carDetail"></h3>
                    <h4 id="roadPrice"><span>${road}</span></h4>
                </div>
                </div>
                <h1 class="pageTitle-mob ">Loan Offers for you</h1>
                <div class="eligibleBank">
                    <ul class="nav nav-tabs " id="myTab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="Custom-tab"  role="tab">Custom Offers<span
                                    class="custom-count"> (${jsonData.length})</span></a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="Pre-approved-tab" role="tab">${PreTitle}<span
                                    class="preapproved-count"> (${preapprovedLoansData.length})</span></a>
                        </li>
                    </ul>
                    <div class="download-offer-wrapper">
                        <a class="download_Offer" style="" id="download-pdf">${download}</a>
                    </div>
                </div>
            </div>
            <div class="tab-content" id="myTabContent">
                <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                    <div class="mobileFilterBtn" id="mobileFilterBtn">
                        <a class="download_Offer" style="">
                            Download
                            Offers
                        </a>
                        <div class="icon-wrapper">
                            <a href="javascript:;" id="searchBtn" class="icon-circle search-financer">

                            </a>
                            <a href="javascript:;" id="filterBtn" class="icon-circle filter-icon">

                            </a>
                            <a href="javascript:;" id="sortBtn" class="icon-circle sorting" style="">

                            </a>
                        </div>
                    </div>

                    <div class="search-panel" style="display: none;" id="search-popup">
                        <a href="javascript:void(0)" class="search-panel__close" id="search-panel-close"></a>
                        <div class="search-panel-body">
                            <div class="position-relative">
                                <input type="text" class="form-control search-panel-input" placeholder="Search financer"
                                    tabindex="8" id="search-box">
                                <a href="javascript:void(0)" class="search-reset" id="search-reset"></a>
                            </div>

                            <ul class="list-unstyled search-list" style="display: none;" id="search-list">
                                <li class="search-list__list" style="display: flex;">Axis Bank</li>
                                <li class="search-list__list" style="display: none;">Kotak Mahindra Prime</li>
                                <li class="search-list__list" style="display: none;">Toyota Finance</li>
                                <li class="search-list__list" style="display: flex;">AU Small Finance</li>
                                <li class="search-list__list" style="display: none;">HDB Financial Services</li>
                            </ul>
                        </div>
                    </div>
                    <div class="sorting-panel" id="sorting-panel">
                        <a href="javascript:void(0)" class="sorting-panel__close"></a>
                        <div class="sorting-panel__body">
                            <h5 class="sorting-panel-title">Sort by</h5>
                            <ul class="list-unstyled sorting-group">
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByLAhl">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-down"></i>
                                        Loan Amount - High to Low
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByLAlh">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-up"></i>
                                        Loan Amount - Low to High
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByIRhl">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-down"></i>
                                        Interest Rate - High to Low
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByIRlh">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-up"></i>
                                        Interest Rate - Low to High
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByDPhl">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-down"></i>
                                        Min Down Payment - High to Low
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByDPlh">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-up"></i>
                                        Min Down Payment - Low to High
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByEMIhl">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-down"></i>
                                        Estimated EMI - High to Low
                                    </a>
                                </li>
                                <li class="sorting-group__list">
                                    <a href="#" class="sorting-group__list--item sortByEMIlh">
                                        <i class="sorting-group__list--arrow sorting-group__list--arrow-up"></i>
                                        Estimated EMI - Low to High
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>
                    <div class="loanOfferTable">
                        <div class="left" id="left-table">
                            <div class="calcEmiBox">
                                <a href="javascript:void(0)" class="calcEmiBox-close">
                                <img src="/icons/cross-form.webp" alt="close icon">
                                </a>
                                <h3>${fil}<div class="reset_filter">
                                    </div>
                                </h3>
                                <div class="calcRangeSlider">
                                    <div class=" text calcRangeSlider-wrapper">
                                        ${down}
                                        <div class="irs-single-get" contenteditable="true">${highestDownPayValue}</div>
                                    </div>
                                    <input type="range" id="demo_3n" class="custom-slider" min="0" max="${Number(customerData.onRoadPrice) - 100000}" step="1"" readonly="">

                                </div>
                                <div class="calcRangeSlider loanPeriodBtn">
                                    <div class="text tenure-wrapper">${tenure}<strong
                                            class="tenure_tile ml-auto">${years}</strong></div>
                                    <ul>
                                        <li><a href="javascript:;" class="tenure ">1</a></li>
                                        <li><a href="javascript:;" class="tenure">2</a></li>
                                        <li><a href="javascript:;" class="tenure">3</a></li>
                                        <li><a href="javascript:;" class="tenure">4</a></li>
                                        <li><a href="javascript:;" class="tenure">5</a></li>
                                        <li><a href="javascript:;" class="tenure">6</a></li>
                                        <li><a href="javascript:;" class="tenure">7</a></li>
                                        <li><a href="javascript:;" class="tenure">8</a></li>
                                        <li><a href="javascript:;" class="tenure active">All</a></li>
                                    </ul>
                                </div>
                                <div class="mobResetBtn">
                                    <div class="whiteButton"><a href="javascript:;" class="reset_filter"> Reset</a>
                                    </div>
                                    <div class="blackButton"><a href="javascript:;" id="applyFilter"> Apply Filter</a>
                                    </div>
                                </div>
                                <div class="flexible-emi">
                                  <h5 class="flexible-emi__title">Flexible EMI Option(s)</h5>
                                    <a href="javascript:void(0)" class="filter-clear" id="filter-clear"
                                        style="display: flex;">
                                        <i class="filter-clear__close"></i>
                                        <span>Clear Selection</span>
                                    </a>
                                    <div class="loan_schema_list">
                                    <div class="custom-control custom-radio">
                                    <input type="radio" id="balloon-finance" name="ballon" class="custom-control-input radio-style">
                                    <label class="custom-control-label" for="balloon-finance">
                                        Balloon Financing
                                        <a href="javascript:void(0)" class="flexible-emi-info" ></a>
                                    </label>
                                     </div>
                                        <div class="flexible-emi__toggle 250001" style="display: block;">
                                            <div class="flexible-emi__toggle-body">
                                                <h5 class="flexible-emi__toggle-title">Select Last month EMI% </h5>
                                                <ul class="list-unstyled list-flexibleEmi">
                                                    ${ballooningHtml}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                            </div>
                        </div>
                        <div class="rightTableMain">
                            <p class="offer-text" style="display: block;">${descr}</p>
                            <!-- <div class="radioCoApp" style="display: none;">
                                <label class="customCheckBox checkColor">
                                    Single Applicant Based Offers
                                    <input type="radio" name="radioCoApp" checked=""  tabindex="11" class="radio-style">
                                    <span class="cusCheckMark"></span>
                                </label>
                                <label class="customCheckBox checkColor">
                                    Co-Applicant Based Offers
                                    <input type="radio" name="radioCoApp"  tabindex="12" class="radio-style">
                                    <span class="cusCheckMark"></span>
                                </label>
                            </div> -->
                            <div class="rightTable">
                                <ul class="tableheadSec">
                                    <li>
                                        <div class="bnkLoanRowBx">
                                            <a href="#" id="link_search"
                                                class="bnkLoanRowBx-link bnkLoanRowBx-link__search"
                                                style="display: flex;">
                                               ${financier}
                                                <span class="bnkLoanRowBx__search-icon"></span>
                                            </a>
                                            <div class="bnkLoanRowBx-search input-group" id="input_group"
                                                style="display: none;">
                                                <input type="text" class="form-control bnkLoanRowBx-search__input"
                                                    placeholder="Search Financier" tabindex="13" id="search_input">
                                                <span class="input-group-text bnkLoanRowBx-search__text" id="input_icon"></span>
                                            </div>
                                            <div class="bnkLoanRowBx-search__list" id="bnkLoanRowBx-search__list" style="display: none;">
                                                <ul class="list-unstyled">
                                                 
                                                        <li class="bnkLoanRowBx-search__list--item"
                                                            style="display: flex;">Axis Bank</li> 
                                                        <li class="bnkLoanRowBx-search__list--item"
                                                            style="display: flex;">AU Small Finance</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="bnkLoanRowBx">
                                            <a href="#" class="bnkLoanRowBx-link lowTohigh sortByLA">
                                               ${loanAmt}
                                                <i class="bnkLoanRowBx__sort-arrow " style=""></i>
                                            </a>
                                        </div>
                                        <div class="bnkLoanRowBx">
                                            <a href="#" class="bnkLoanRowBx-link lowTohigh sortByIR">
                                                ${rate}
                                                <i class="bnkLoanRowBx__sort-arrow " style=""></i>
                                            </a>
                                        </div>
                                        <div class="bnkLoanRowBx">
                                            <a href="#" class="bnkLoanRowBx-link lowTohigh sortByDP">
                                                ${mini}
                                                <i class="bnkLoanRowBx__sort-arrow " style=""></i>
                                            </a>
                                        </div>
                                        <div class="bnkLoanRowBx">${fee}</div>
                                        <div class="bnkLoanRowBx">${ten}</div>
                                        <div class="bnkLoanRowBx">
                                            <a href="#" class="bnkLoanRowBx-link lowTohigh sortByEMI">${emi}<i
                                                    class="bnkLoanRowBx__sort-arrow " style=""></i>
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                                <ul  id="loanList" class="bankloadofferList tableListSec scroll scroll1" style="height: 680px;">
                                    <li class="lists">
                                        <div class="bnkLoanRowBx "> <img src="images/icici.bmp" alt=""><span
                                                class="festive_offer"></span><span class="loan_type"></span></div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Loan Amount</label>
                                            <div class="edit-wrapper"><a class="loanamount" href="javascript:void(0);">₹
                                                    6 20 962</a><a href="javascript:void(0)" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="loanammount_edit" type="tel"
                                                        maxlength="7"><button id="loanammount_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx interest_rate"> <label class="row-title">Interest
                                                Rate</label>8.8%</div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Min. Down Payment</label>
                                            <div class="edit-wrapper"><a class="downpayment"
                                                    href="javascript:void(0);">₹ 1 01 679</a><a
                                                    href="javascript:void(0);" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="downpayment_edit" type="tel"
                                                        maxlength="7"><button id="downpayment_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx processing_fee"> <label class="row-title">Processing
                                                Free</label>₹ 0</div>
                                        <div class="bnkLoanRowBx tenure"> <label class="row-title">Tenure</label>5 yrs
                                        </div>
                                        <div class="bnkLoanRowBx est_emi"> <label class="row-title">Estimated
                                                EMI</label>₹ 12 830</div>
                                        <div class="bnkLoanRowBx full-basis">
                                        <label
                                                class="addToCompareCheck" >
                                            <input type="checkbox" class="custom-check">Add to
                                                compare </label>
                                            <div class="processing-loan" id="info-btn"></div>

                                            <p class="whiteButton mb-0 margin-0" style="margin:0"><a href="javascript:void(0);"
                                                    class="view_details" id="view-details-btn">View Details</a></p>
                                            <p class="blackButton margin-0" style="margin:0"><a href="javascript:;" class="apply_loan">Apply For
                                                    Loan</a></p>
                                        </div>
                                        <div class="flexible-emi-offer" style="display: none">
                                            <p class="flexible-emi-offer__text">Financier also offers flexible payment
                                                options. Click on the Flexible EMI Options</p>
                                        </div>
                                    </li>
                                    <li class="lists">
                                        <div class="bnkLoanRowBx "> <img src="images/icici.bmp" alt=""><span
                                                class="festive_offer"></span><span class="loan_type"></span></div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Loan Amount</label>
                                            <div class="edit-wrapper"><a class="loanamount" href="javascript:void(0);">₹
                                                    6 20 962</a><a href="javascript:void(0)" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="loanammount_edit" type="tel"
                                                        maxlength="7"><button id="loanammount_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx interest_rate"> <label class="row-title">Interest
                                                Rate</label>8.8%</div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Min. Down Payment</label>
                                            <div class="edit-wrapper"><a class="downpayment"
                                                    href="javascript:void(0);">₹ 1 01 679</a><a
                                                    href="javascript:void(0);" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="downpayment_edit" type="tel"
                                                        maxlength="7"><button id="downpayment_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx processing_fee"> <label class="row-title">Processing
                                                Free</label>₹ 0</div>
                                        <div class="bnkLoanRowBx tenure"> <label class="row-title">Tenure</label>5 yrs
                                        </div>
                                        <div class="bnkLoanRowBx est_emi"> <label class="row-title">Estimated
                                                EMI</label>₹ 12 830</div>
                                        <div class="bnkLoanRowBx full-basis">
                                        <label
                                                class="addToCompareCheck" >
                                            <input type="checkbox" class="custom-check">Add to
                                                compare </label>
                                            <div class="processing-loan"></div>

                                            <p class="whiteButton mb-0"><a href="javascript:void(0);"
                                                    class="view_details">View Details</a></p>
                                            <p class="blackButton"><a href="javascript:;" class="apply_loan">Apply For
                                                    Loan</a></p>
                                        </div>
                                        <div class="flexible-emi-offer" style="display: none">
                                            <p class="flexible-emi-offer__text">Financier also offers flexible payment
                                                options. Click on the Flexible EMI Options</p>
                                        </div>
                                    </li>
                                    <li class="lists">
                                        <div class="bnkLoanRowBx "> <img src="images/icici.bmp" alt=""><span
                                                class="festive_offer"></span><span class="loan_type"></span></div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Loan Amount</label>
                                            <div class="edit-wrapper"><a class="loanamount" href="javascript:void(0);">₹
                                                    6 20 962</a><a href="javascript:void(0)" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="loanammount_edit" type="tel"
                                                        maxlength="7"><button id="loanammount_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx interest_rate"> <label class="row-title">Interest
                                                Rate</label>8.8%</div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Min. Down Payment</label>
                                            <div class="edit-wrapper"><a class="downpayment"
                                                    href="javascript:void(0);">₹ 1 01 679</a><a
                                                    href="javascript:void(0);" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="downpayment_edit" type="tel"
                                                        maxlength="7"><button id="downpayment_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx processing_fee"> <label class="row-title">Processing
                                                Free</label>₹ 0</div>
                                        <div class="bnkLoanRowBx tenure"> <label class="row-title">Tenure</label>5 yrs
                                        </div>
                                        <div class="bnkLoanRowBx est_emi"> <label class="row-title">Estimated
                                                EMI</label>₹ 12 830</div>
                                        <div class="bnkLoanRowBx full-basis">
                                        <label
                                                class="addToCompareCheck" >
                                            <input type="checkbox" class="custom-check">Add to
                                                compare </label>
                                            <div class="processing-loan"></div>

                                            <p class="whiteButton mb-0"><a href="javascript:void(0);"
                                                    class="view_details">View Details</a></p>
                                            <p class="blackButton"><a href="javascript:;" class="apply_loan">Apply For
                                                    Loan</a></p>
                                        </div>
                                        <div class="flexible-emi-offer" style="display: none">
                                            <p class="flexible-emi-offer__text">Financier also offers flexible payment
                                                options. Click on the Flexible EMI Options</p>
                                        </div>
                                    </li>
                                    <li class="lists">
                                        <div class="bnkLoanRowBx "> <img src="images/icici.bmp" alt=""><span
                                                class="festive_offer"></span><span class="loan_type"></span></div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Loan Amount</label>
                                            <div class="edit-wrapper"><a class="loanamount" href="javascript:void(0);">₹
                                                    6 20 962</a><a href="javascript:void(0)" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="loanammount_edit" type="tel"
                                                        maxlength="7"><button id="loanammount_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx interest_rate"> <label class="row-title">Interest
                                                Rate</label>8.8%</div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Min. Down Payment</label>
                                            <div class="edit-wrapper"><a class="downpayment"
                                                    href="javascript:void(0);">₹ 1 01 679</a><a
                                                    href="javascript:void(0);" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="downpayment_edit" type="tel"
                                                        maxlength="7"><button id="downpayment_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx processing_fee"> <label class="row-title">Processing
                                                Free</label>₹ 0</div>
                                        <div class="bnkLoanRowBx tenure"> <label class="row-title">Tenure</label>5 yrs
                                        </div>
                                        <div class="bnkLoanRowBx est_emi"> <label class="row-title">Estimated
                                                EMI</label>₹ 12 830</div>
                                        <div class="bnkLoanRowBx full-basis">
                                        <label
                                                class="addToCompareCheck" >
                                            <input type="checkbox" class="custom-check">Add to
                                                compare </label>
                                            <div class="processing-loan"></div>

                                            <p class="whiteButton mb-0"><a href="javascript:void(0);"
                                                    class="view_details">View Details</a></p>
                                            <p class="blackButton"><a href="javascript:;" class="apply_loan">Apply For
                                                    Loan</a></p>
                                        </div>
                                        <div class="flexible-emi-offer" style="display: none">
                                            <p class="flexible-emi-offer__text">Financier also offers flexible payment
                                                options. Click on the Flexible EMI Options</p>
                                        </div>
                                    </li>
                                    <li class="lists">
                                        <div class="bnkLoanRowBx "> <img src="images/icici.bmp" alt=""><span
                                                class="festive_offer"></span><span class="loan_type"></span></div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Loan Amount</label>
                                            <div class="edit-wrapper"><a class="loanamount" href="javascript:void(0);">₹
                                                    6 20 962</a><a href="javascript:void(0)" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="loanammount_edit" type="tel"
                                                        maxlength="7"><button id="loanammount_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx interest_rate"> <label class="row-title">Interest
                                                Rate</label>8.8%</div>
                                        <div class="bnkLoanRowBx">
                                            <label class="row-title">Min. Down Payment</label>
                                            <div class="edit-wrapper"><a class="downpayment"
                                                    href="javascript:void(0);">₹ 1 01 679</a><a
                                                    href="javascript:void(0);" id="nfeditLoanTxt"
                                                    class="loanamount-edit d-block">EDIT</a></div>
                                            <div class="nfLoanEditPopupMain">
                                                <div id="nfLoanEditFieldPopup" class="nfLoanEditArrowBox"
                                                    style="display: none;"><input id="downpayment_edit" type="tel"
                                                        maxlength="7"><button id="downpayment_edit_ok">OK</button></div>
                                            </div>
                                        </div>

                                        <div class="bnkLoanRowBx processing_fee"> <label class="row-title">Processing
                                                Free</label>₹ 0</div>
                                        <div class="bnkLoanRowBx tenure"> <label class="row-title">Tenure</label>5 yrs
                                        </div>
                                        <div class="bnkLoanRowBx est_emi"> <label class="row-title">Estimated
                                                EMI</label>₹ 12 830</div>
                                        <div class="bnkLoanRowBx full-basis">
                                        <label
                                                class="addToCompareCheck" >
                                            <input type="checkbox" class="custom-check">Add to
                                                compare </label>
                                            <div class="processing-loan"></div>

                                            <p class="whiteButton mb-0"><a href="javascript:void(0);"
                                                    class="view_details">View Details</a></p>
                                            <p class="blackButton"><a href="javascript:;" class="apply_loan">Apply For
                                                    Loan</a></p>
                                        </div>
                                        <div class="flexible-emi-offer" style="display: none">
                                            <p class="flexible-emi-offer__text">Financier also offers flexible payment
                                                options. Click on the Flexible EMI Options</p>
                                        </div>
                                    </li>

                                </ul>
                                <div class="nfSeeAllLoanOffer1" style="display: none;">
                                    <h3>We have offers from other partner financiers</h3>
                                    <div class="nfSeeAllLoanOfferLogo">
                                        <div class="whiteButton">
                                            <a href="/nexa-finance/nexafinance-personal-details">See all Loan Offers</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="pageButton">
                                    <div class="whiteButton"><a href="${prevLink}" class="backbtn">${back}</a></div>
                                    <div class="blackButton" id="compare-btn"><a href="javascript:(void)" class="compareLoan"
                                            style="">Compare</a></div>
                                </div>
                            </div>

                            \

                            <div class="inner-disclaimer">
                                <strong>${disclaimer}</strong>
                                <ul>
                                    ${disclaimerList}
                                </ul>

                            </div>
                        </div>

                    </div>
                </div>
                <!-- <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    <div class="downloadLoanOffers">
                        <ul class="non_eligible_list"></ul>
                        <div class="pageButton">
                            <div class="whiteButton"><a onclick="return DataLayerMSILDL_FMP_Common.Push('Nexa Smart Finance - Loan Offers','  nexa_finance-loan form ', 'Click', 'back');" href="/nexa-finance/nexafinance-personal-details">Back</a></div>
                        </div>
                        <div class="pageButton">
                        </div>
                    </div>
                </div> -->
            </div>

        </div>
    </section>
    <div class="popUpmain" id="view-info-popup">
        <div class="modal-content">
            <div class="popupContent">
                <div class="close" id="close-info-popup" aria-label="Close">
                </div>
                <p class="info-text">
                    This does not include GST and other related charges like (documentation, stamp duty etc) which may
                    vary from state to state/Financier .
                </p>
            </div>
        </div>

    </div>
    <div class="popUpmain" id="view-details-popup">
        <div class="modal-content">
            <div class="popupContainer_fmp">
                <div class="close" aria-label="Close" id="close-details"></div>
                <div class="nfLoanDetailGreyBox" id="loan-details-section">
                    <div class="nfLoanDetailGreyBox">
                        <div class="nfLoanDetailElement">
                            <div class="nfLoanDetailtitle">Positive/Unique Feature</div>
                            <div class="nfLoanDetailpointer">
                                <ul>
                                    <li><span style="color: #444444;">Car loan solutions customized as per your
                                            need</span></li>
                                    <li><span style="color: #444444;">Funding upto 7 years &amp; 100% of Ex-showroom
                                            price OR 90% of on-road price.</span></li>
                                    <li><span style="color: #444444;">Pre-Approved loan for Insurance, Extended Warranty
                                            &amp; Genuine Accessories</span></li>
                                    <li><span style="color: #444444;">Planned &amp; Flexible EMI Outflow</span></li>
                                    <li><span style="color: #444444;">Car finance for all customer profiles</span></li>
                                    <li><span style="color: #444444;">Quick &amp; Hassle-Free Process</span></li>
                                </ul>
                            </div>
                        </div>
                        <div class="nfLoanDetailElement">
                            <div class="nfLoanDetailtitle">Eligibility</div>
                            <div class="nfLoanDetailpointer">
                                <span
                                    style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">The
                                    following individuals are eligible to apply for a New Car Loan:
                                </span>
                                <ul>
                                    <li><span style="color: #444444;">Salaried Individuals: Employees working for
                                            Private Sector, Public Sector and MNCs</span></li>
                                    <li><span style="color: #444444;">Self Employed (With ITR): 1) Business Individuals
                                            2) Professionals 3) Others as applicable</span></li>
                                    <li><span style="color: #444444;">Minimum age of Applicant: 21 years</span></li>
                                    <li><span style="color: #444444;">Maximum age of Applicant at loan maturity: Up to
                                            65 years</span></li>
                                </ul>
                            </div>
                        </div>
                        <div class="nfLoanDetailElement">
                            <div class="nfLoanDetailtitle">Documents</div>
                            <div class="nfLoanDetailpointer">
                                <span
                                    style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">Salaried
                                    Individuals</span>
                                <ul>
                                    <li>Identity Proof: Pan, Passport, Aadhaar, Voters ID, Driving License (Any One)
                                    </li>
                                    <li>Address proof: Passport, Aadhaar, Voters ID, Driving License, Electricity Bill,
                                        NREGA Card (Any One)</li>
                                    <li>Income Proof: Latest 3-month salary slip &amp; last 2 years Form 16/ITR</li>
                                    <li>Bank Statement of the last 3 months</li>
                                </ul>
                                <span
                                    style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">Self
                                    Employed </span>
                                <ul>
                                    <li>Proof of Identity:&nbsp;Passport copy, PAN Card, Voters Id Card, Driving
                                        license, Aadhar Card (Any One)</li>
                                    <li>Income Proof:&nbsp;Latest 2 years ITR, Bank Statement &amp; Audited Financials
                                        as applicable</li>
                                    <li>Address Proof:&nbsp;Driving license, Voters Card, Passport copy, Telephone bill,
                                        Electricity bill, Aadhaar, Establishment Certificate, Residence Ownership proof
                                        (Any One)</li>
                                    <li>Documents required may vary as per customer profile</li>
                                </ul>
                            </div>
                        </div>
                        <div class="nfLoanDetailElement">
                            <div class="nfLoanDetailtitle">Fees &amp; Penalties </div>
                            <div class="nfLoanDetailpointer">
                                <ul>
                                    <li><span style="color: #444444;">Documentation Charges: Nil</span></li>
                                    <li><span style="color: #444444;">Foreclosure Charges: Nil </span></li>
                                    <li><span style="color: #444444;">Stamp Duty Charges (Non-Refundable): As per
                                            applicable State Guidelines</span></li>
                                    <li><span style="color: #444444;">Processing Fees: @ 0.25% of loan amount, Minimum -
                                    &#8377. 1,000/- Maximum- &#8377. 1,500/- + Taxes</span></li>
                                    <li><span style="color: #444444;">Late Payment Charges: 2% per month on default
                                            /irregular amount</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <div class="popUpmain" id="view-ballon-popup">
        <div class="modal-content">

            <div class="close" id="close-ballon-details" aria-label="Close">
            </div>
            <div class="popupContent">
                <h5 class="modal-FilterClear__title">
                    <div class="icon-img"></div>PLEASE NOTE!
                </h5>
                <p class="modal-FilterClear__text">
                    All the calculation done for Balloon Financing will be lost. <br>
                    Do you still want to continue?
                </p>
                <div class="text-center">
                    <button type="button" class="whiteButton">Yes</button>
                    <button type="button" class="blackButton">No</button>
                </div>
            </div>

        </div>

    </div>
    <div class="popUpmain" id="success_popup">
        <div class="modal-content">
            <div class="close" id="close-success-popup">
            </div>
            <div class="popupContent blue">
                <h2><div class="info-icon"></div>Information</h2>
                <p>Congratulations! You have Xpress Loan Offer from HDFC.</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">OK</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="popUpmain" id="bank_validation_popup" style="display: none;">
    <div class="modal-content">
        <div class="close" id="close-bank-popup">
        </div>
        <div class="popupContent blue">
            <h2><span class="info-icon"></span> Information</h2>
            <p>You can compare upto 3 Banks</p>
            <div class="btn-container">
                <div class="blackButton"><button type="button">OK</button></div>
                <div>
                </div>
            </div>
        </div>
    </div>
</div>
    <div class="popUpmain" id="edit_validation_popup">
        <div class="modal-content">
            <div class="close" id="close-edit-popup">
            </div>
            <div class="popupContent blue">
                <h2><span class="info-icon"></span>Information</h2>
                <p>Loan amount can not be less than ₹100000 or greater than ₹ 666189</p>
                <div class="btn-container">
                    <div class="blackButton"><button type="button">OK</button></div>
                    <div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="popUpmain" id="preapproved_consent_form">
    <div class="modal-content">
        <div class="close" id="close-preapproved-consent-form">
        </div>
        <div class="popupContent blue">
            <h3 class="sec-title">${formsff.hdfcPopupTitle}</h3>
            <h5 class="heading-sm">${formsff.hdfcPopupSubtitle}</h5>
            <div class="formfieldRow row no-gutters row8">
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="text" name="FirstName" id="CustomerHDFCName" maxlength="30"
                            value="Anirudha Anirudha" placeholder=" " readonly="readonly" tabindex="55">
                        <label for="FirstName">${formsff.hdfcPopupCustomer}</label>
                    </div>
                </div>
                <div style="display: flex;align-items: flex-start;gap:20px">
                    <input class="disclamer form-check-input IsDisclaimerAccepted_xpress" id="disclaimer-preapproved"
                        name="IsDisclaimerAccepted_xpress" type="checkbox" tabindex="56">
                    <label for="disclaimer-preapproved" class="form-check-label">
                       ${formsff.hdfcCheckboc}
                    </label>
                </div>
                <div class="btn-mt">
                    <div class="whiteButton">
                        <button type="button" id="backToLoanOffer">
                           ${formsff.backLoanBtn}
                        </button>
                    </div>
                    <div class="blackButton">
                        <button type="button" id="hdfcPaXpress_submit"> ${formsff.subLoanBtn}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

    <div class="popUpmain" id="custom_consent_form">
    <div class="modal-content">
        <div class="close" id="close-express-loan-offer">
        </div>
        <div class="popupContent blue">
            <h3 class="sec-title">${formsff.xpressTitle}</h3>
            <h5 class="heading-sm">${formsff.xpressSubTitle}</h5>
            <div class="formfieldRow row no-gutters row8">
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select id="Title" name="Title"
                            tabindex="29">
                            <option value="">${formsff.salutation}*</option>
                            <option value="240005">OTHER</option>
                            <option value="240001">Mr</option>
                            <option value="240002">Ms</option>
                            <option value="240004">Dr</option>
                            <option value="240003">Mx</option>
                        </select>
                        <em id="Title-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.salutation}</em>
                        <label for="Title">${formsff.salutation}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="text" name="FirstName" id="FirstName" maxlength="15" value="" placeholder=" "
                            readonly="readonly" tabindex="30">
                        <em id="FirstName-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.firstName}</em>
                        <label for="FirstName">${formsff.firstName}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx">
                        <input type="text" name="MiddleName" id="MiddleName" value="" placeholder=" "
                            readonly="readonly"
                        tabindex="31">
                        <em id="MiddleName-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.middleName}</em>
                        <label for="MiddleName">${formsff.middleName}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="text" name="LastName" id="LastName" value="" placeholder=" "
                            readonly="readonly" tabindex="32">
                        <em id="LastName-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.lastName}</em>
                        <label for="LastName">${formsff.lastName}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="text" name="Address1" id="Address1" value="" placeholder="${formsff.address1}*" maxlength="40" tabindex="33">
                        <em id="Address1-error" class="error invalid-feedback" style="display: none;">Please enter ${formsff.address1} without special characters like “@, &amp;,-” etc and max character length 40</em>
                        <label for="Address1">${formsff.address1}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="text" name="Address2" id="Address2" value="" placeholder="${formsff.address2}*"
                            maxlength="40" tabindex="34">
                        <em id="Address2-error" class="error invalid-feedback" style="display: none;">Please enter ${formsff.address2} without special characters like “@, &amp;,-” etc and max character length 40</em>
                        <label for="Address2">${formsff.address2}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select name="State" id="State"
                            onchange="this.setAttribute('value', this.value);"
                            onclick="this.setAttribute('value', this.value);" size="" value="" tabindex="-1"
                            class="select2-hidden-accessible" aria-hidden="true">
                            <option value="">${formsff.state}*</option>
                            <option value="120001">ANDHRA PRADESH</option>
                            <option value="120003">BIHAR</option>
                            <option value="120002">ASSAM</option>
                            <option value="120005">CHANDIGARH</option>
                            <option value="120004">CHHATTISGARH</option>
                            <option value="120007">GUJARAT</option>
                            <option>DELHI</option>
                            <option>HARYANA</option>
                            <option>GOA</option>
                            <option>JHARKHAND</option>
                            <option>HIMACHAL PRADESH</option>
                            <option>KERALA</option>
                            <option>JAMMU AND KASHMIR</option>
                            <option>MAHARASHTRA</option>
                            <option>KARNATAKA</option>
                            <option>MANIPUR</option>
                            <option>MEGHALAYA</option>
                            <option>MIZORAM</option>
                            <option>MADHYA PRADESH</option>
                        </select>
                        <em id="State-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.state}</em>
                        <label for="State">${formsff.state}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select name="City" id="City"  value="" size=""
                            tabindex="-1" class="select2-hidden-accessible"
                            aria-hidden="true">
                            <option selected="selected" value="">${formsff.city}*</option>
                            <option >ABHONA</option>
                            <option >ACHALPUR</option>
                            <option >ADVAD</option>
                            <option >AHMEDNAGAR</option>
                            <option >AHMEDPUR</option>
                            <option >AJARA</option>
                            <option >AKKALKUWA</option>
                          </select>
                        <em id="City-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.city}</em>
                        <label for="City">${formsff.city}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <input type="tel" name="Pincode" id="Pincode" value="" placeholder="${formsff.pincode}*"
                            maxlength="6"
                            minlength="6" tabindex="37">
                        <em id="Pincode-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.pincode}</em>
                        <label for="Pincode">${formsff.pincode}*</label>
                    </div>
                </div>
            </div>
            <h3 class="sec-title mt-3">${formsff.xpressTitle2}</h3>
            <div class="formfieldRow row no-gutters row8">
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select name="MaritalStatus" 
                            id="MaritalStatus" value="" tabindex="38">
                            <option value=''>${formsff.maritalStatus}*</option>
                            <option>Single</option>
                            <option>Married</option>
                            <option>Divorced</option>
                        </select>
                        <em id="MaritalStatus-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.maritalStatus}</em>
                        <label for="MaritalStatus">${formsff.maritalStatus}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select name="Profession" id="Profession"
                            size="" value="" tabindex="-1"
                            class="select2-hidden-accessible" aria-hidden="true">
                            <option value="">${formsff.profession}*</option>
                            <option>ABRASIVES AND GRINDING</option>
                            <option>ACCOUNTING,AUDITING TAX ACTIVITIES</option>
                            <option>ACTOR</option>
                            <option>ADVERTISING AND PUBLICITY CONCERNS</option>
                            <option>ADVOCATE</option>
                            <option>AGRICULTURE</option>
                            <option>AIRCRAFTS SPACECRAFTS BUILD REPAIR</option>
                            <option>ALUMINIUM PRODUCTS</option>
                            <option>APPAREL/DRESSING/DYEING-MFG</option>
                            <option>ARCHITECTURAL ,ENGG ,TECH ACTIVITY</option>
                            <option>ART DIRECTOR</option>
                            </select>
                        <em id="Profession-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.profession}</em>
                        <label for="Profession">${formsff.profession}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select id="Designation" name="Designation" size="" value="" tabindex="-1"
                            class="select2-hidden-accessible" aria-hidden="true">
                            <option value="">${formsff.designation}*</option>
                            <option value="6">Accountant</option>
                            <option value="39">Area Sales Manager</option>
                            <option value="4">Assistant</option>
                            <option value="8">Assistant Manager</option>
                            <option value="42">Associate Consultant</option>
                            <option value="55">Asst General Manager</option>
                            <option value="14">Asst Vice President</option>
                            <option value="43">Cfo</option>
                            <option value="1">Chief Executive Officer</option>
                        </select>
                        <em id="Designation-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.designation}</em>
                        <label for="Designation">${formsff.designation}*</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="formInputBx field--not-empty">
                        <select name="Industry" id="Industry"
                            onchange="this.setAttribute('value', this.value);"
                            onclick="this.setAttribute('value', this.value);" size="" value="" tabindex="-1"
                            class="select2-hidden-accessible" aria-hidden="true">
                            <option value="">${formsff.industry}*</option>
                            <option>Agriculture Direct</option>
                            <option>Agriculture Indirect</option>
                            <option>Dairy Products Mfg</option>
                            <option>Dairying</option>
                            <option>Diamonds, Gems, Jewellery</option>
                            <option>Education Service</option>
                            <option>Extraction-Petroleum/Natural Gas</option>
                            <option>Fishing</option>
                            <option>Manufacturing</option>
                            <option>Mining Of Coal And Lignite</option>
                            <option>Motor Vehicles And Parts</option>
                            <option>Real Estate Activities</option>
                            <option>Recycling</option>
                            <option>Research And Development</option>
                            <option>Services</option>
                            <option>Tourism/Hotels/Restaurants</option>
                            <option>Wholesale &amp; Retail Trade</option>
                        </select>
                        <em id="Industry-error" class="error invalid-feedback" style="display: none;">Please Select Valid ${formsff.industry}</em>
                        <label for="Industry">${formsff.industry}*</label>
                    </div>
                </div>
            </div>
            <h3 class="heading-sm mt-4">${formsff.confirmationText}</h3>
            <div class="d-flex align-items-center">
                <div class="radioXpress">
                  <div style="display: flex;justify-content: center;align-items: center;gap:5px">
                    <input type="radio" class="radio-style" name="politically_exposed" value="Y" autocomplete="off" tabindex="42">
                    <label class="customCheckBox checkColor field--not-empty">
                        ${formsff.yes}     
                    </label>
                </div>
                <div style="display: flex;justify-content: center;align-items: center;gap:5px">                            <input type="radio" class="radio-style" name="politically_exposed" value="N" autocomplete="off" tabindex="43"
                            checked="">
                            <label class="customCheckBox checkColor field--not-empty">
                            ${formsff.no}   
                    </label>
                </div>

                </div>
            </div>
            <div class="field--not-empty" style="display: flex;
            gap:7px;align-items: flex-start;">
                <input title="Designation" class="disclamer form-check-input IsDisclaimerAccepted_xpress" id="disclaimer-custom"
                    name="IsDisclaimerAccepted_xpress" type="checkbox" tabindex="44">
                <label for="disclaimer-custom" class="form-check-label">
                      ${formsff.checkLabel1}
                </label>
            </div>
            <div class="text-center btn-mt">
                <div class="whiteButton">
                    <button type="button" class="cancel-expresscustom"
                        data-dismiss="modal">${formsff.cancel}</button>
                </div>
                <div class="blackButton">
                    <button type="submit" class= "disable_submit" id="submit_btn"      
                        >${formsff.submit}</button>
                </div>
            </div>
        </div>
    </div>
</div>

    `;

  block.innerHTML = utility.sanitizeHtml(htmlContent);
  populateCarDetails(customerData);
  // ------------------Pop-up js functionality  section start --------------

  let currentSortOrderAmount = 'ascending';
  let currentSortOrderRate = 'ascending';
  let currentSortOrderDownPayment = 'ascending';
  let currentSortOrderEstEMI = 'ascending';
  let currentSortField = '';

  // sorting function
  function sortLoanData(data, field, order) {
    return data.sort((a, b) => {
      const valueA = parseFloat(a[field].replace(/[^0-9.]/g, ''));
      const valueB = parseFloat(b[field].replace(/[^0-9.]/g, ''));
      return order === 'ascending' ? valueA - valueB : valueB - valueA;
    });
  }

  function toggleCompareCheckboxVisibility() {
    const loanItems = document.querySelectorAll('#loanList li');
    const showCompare = loanItems.length > 1; // Show if more than one bank field
    const nfSeeAllLoanOfferSection = document.querySelector('.nfSeeAllLoanOffer1'); // The section to show/hide

    loanItems.forEach((item) => {
      const compareCheckbox = item.querySelector('.custom-check');
      const compareLabel = item.querySelector('.addToCompareCheck');
      const preApprovedText = item.querySelector('.preApprovedText');

      if (showCompare) {
        compareCheckbox.style.display = 'block';
        compareLabel.style.display = 'block';
      } else {
        compareCheckbox.style.display = 'none';
        compareLabel.style.display = 'none';
      }

      // Check if the Custom Offers tab is active
      const isCustomOffersTabActive = document.querySelector('#Custom-tab').classList.contains('active');
      if (isCustomOffersTabActive) {
        if (preApprovedText) {
          preApprovedText.style.display = 'none'; // Hide preApprovedText if Custom tab is active
        }
        if (nfSeeAllLoanOfferSection) {
          nfSeeAllLoanOfferSection.style.display = 'none'; // Hide nfSeeAllLoanOfferSection if Custom tab is active
        }
      } else {
        if (preApprovedText) {
          preApprovedText.style.display = 'block'; // Show preApprovedText if Custom tab is not active
        }
        if (nfSeeAllLoanOfferSection) {
          document.getElementById('loanList').style.height = 'unset';
          nfSeeAllLoanOfferSection.style.display = 'block'; // Show nfSeeAllLoanOfferSection if Custom tab is not active
        }
      }
    });
  }

  // ------------------Edit Loan Amount Start------------------
  function handleLoanAmountEdit(listItem, loan) {
    const editPopup = listItem.querySelector('.loan-popup');
    const inputField = editPopup.querySelector('input');
    const okButton = editPopup.querySelector('.loan-edit-ok');
    const loanAmountDisplay = listItem.querySelector('.loanamount');

    // Get the bank validation popup and close button
    const bankValidationPopup = document.getElementById('edit_validation_popup');
    const closeBankPopupBtn = document.getElementById('close-edit-popup');
    const bankPopupOkButton = bankValidationPopup.querySelector('.blackButton button');
    const popupMessage = bankValidationPopup.querySelector('p');

    inputField.value = loan.bank_offer_amount;

    okButton.addEventListener('click', async () => {
      const newValue = parseInt(inputField.value, 10);
      const maxLoanAmount = parseInt(loan.max_loan, 10);
      if (!Number.isNaN(newValue) && newValue >= 100000 && newValue <= maxLoanAmount) {
        loanAmountDisplay.textContent = `₹ ${newValue}`;
        loan.bank_offer_amount = newValue;
        const updatedLoanoffers = await getAllLoanOffers(loan?.tenure, enquiryId, customerData.onRoadPrice - loan.bank_offer_amount, Number(loan?.financier_id), loan?.loan_type, 'singleApplicant', customerData?.dealerValue);

        if (updatedLoanoffers.success) {
          const updatedOffers = updatedLoanoffers.data?.applicant_offers?.offers;

          // Update the specific loan in the existing jsonData
          updatedOffers.forEach((updatedLoan) => {
            const index = jsonData.findIndex(
              (financierIndex) => financierIndex.financier_id === updatedLoan.financier_id,
            );
            if (index !== -1) {
              jsonData[index] = { ...jsonData[index], ...updatedLoan };
            }
          });

          checkEmptyResponseMessage(updatedLoanoffers);
        }
        // eslint-disable-next-line no-use-before-define
        populateLoanList(jsonData);
        // Hide the edit popup after editing
        editPopup.style.display = 'none';
      } else {
        popupMessage.textContent = `Loan amount can not be less than ₹100000 or greater than ₹ ${maxLoanAmount}`;
        bankValidationPopup.style.display = 'flex';
      }
    });

    closeBankPopupBtn.addEventListener('click', () => {
      bankValidationPopup.style.display = 'none';
    });

    bankPopupOkButton.addEventListener('click', () => {
      bankValidationPopup.style.display = 'none';
    });
  }

  // -----------------------------------Edit Down-Payment Amount Start----------------------------//
  function handleDownPaymentEdit(listItem, loan) {
    const editPopup = listItem.querySelector('.downpayment-popup');
    const inputField = editPopup.querySelector('input');
    const okButton = editPopup.querySelector('.downpayment-edit-ok');
    const downPaymentDisplay = listItem.querySelector('.downpayment');

    // Get the bank validation popup and close button
    const bankValidationPopup = document.getElementById('bank_validation_popup');
    const closeBankPopupBtn = document.getElementById('close-bank-popup');
    const bankPopupOkButton = bankValidationPopup.querySelector('.blackButton button');
    const popupMessage = bankValidationPopup.querySelector('p'); // Get the paragraph element where the message is displayed

    inputField.value = Math.floor(loan.down_payment);

    okButton.addEventListener('click', async () => {
      const newValue = parseInt(inputField.value, 10);
      const maxDownPayment = parseInt(loan.max_loan, 10) - 100000;
      // Get the max_down_payment value from the loan object

      if (!Number.isNaN(newValue) && newValue >= 100000 && newValue <= maxDownPayment) {
        // Update the down payment in the display
        downPaymentDisplay.textContent = `₹ ${newValue}`;

        // Optionally, update the loan data (if you need to save it somewhere)
        loan.down_payment = newValue;
        const updatedRangeLoanOffers = await getAllLoanOffers(loan?.tenure, enquiryId, loan?.down_payment, Number(loan?.financier_id), loan?.loan_type, 'singleApplicant', customerData?.dealerValue);

        if (updatedRangeLoanOffers.success) {
          const updatedOffers = updatedRangeLoanOffers.data?.applicant_offers?.offers;

          // Update the specific loan in the existing jsonData
          updatedOffers.forEach((updatedLoan) => {
            const index = jsonData.findIndex(
              (downPaymentIndex) => downPaymentIndex.financier_id === updatedLoan.financier_id,
            );
            if (index !== -1) {
              jsonData[index] = { ...jsonData[index], ...updatedLoan };
            }
          });

          checkEmptyResponseMessage(updatedRangeLoanOffers);
        }
        // eslint-disable-next-line no-use-before-define
        populateLoanList(jsonData);
        // Hide the edit popup after editing
        editPopup.style.display = 'none';
      } else {
        // Update the popup message with the dynamic max down payment amount
        popupMessage.textContent = `Down payment cannot be less than ₹100000 or greater than ₹ ${maxDownPayment}`;

        // Show the bank validation popup if the amount is out of range
        bankValidationPopup.style.display = 'flex';
      }
    });

    // Close the bank validation popup
    closeBankPopupBtn.addEventListener('click', () => {
      bankValidationPopup.style.display = 'none';
    });

    // Also close the popup when clicking the "OK" button inside the popup
    bankPopupOkButton.addEventListener('click', () => {
      bankValidationPopup.style.display = 'none';
    });
  }
  // -----------------------------------Edit Down-Payment Amount End----------------------//
  function addXpressListeners() {
    const expressConsentForm = block.querySelector('#custom_consent_form');
    const expressPreapproved = block.querySelector('#preapproved_consent_form');

    if (block.querySelector('.express-preapproved')) {
      block.querySelector('.express-preapproved').addEventListener('click', () => {
        expressPreapproved.classList.add('fade-in');
        expressPreapproved.style.display = 'flex';
      });
    }

    block.querySelector('#close-preapproved-consent-form').addEventListener('click', () => {
      expressPreapproved.classList.remove('fade-in');
      expressPreapproved.style.display = 'none';
    });
    if (block.querySelector('#express-loan-offer')) {
      block.querySelector('#express-loan-offer').addEventListener('click', () => {
        expressConsentForm.classList.add('fade-in');
        expressConsentForm.style.display = 'flex';
      });
    }
    const closeElements = block.querySelectorAll('#close-express-loan-offer, .cancel-expresscustom');

    closeElements.forEach((element) => {
      element.addEventListener('click', () => {
        expressConsentForm.classList.remove('fade-in');
        expressConsentForm.style.display = 'none';
      });
    });

    const disclaimerCheckbox = block.querySelector('#disclaimer-custom');
    const submitButton = block.querySelector('#submit_btn');

    if (disclaimerCheckbox) {
      disclaimerCheckbox.addEventListener('change', function removeDisableSubmit() {
        if (this.checked) {
          submitButton.classList.remove('disable_submit');
        } else {
          submitButton.classList.add('disable_submit');
        }
      });
    }

    block.querySelector('#submit_btn').addEventListener('click', () => {
      let isValid = true;
      const requiredFields = [
        'Title', 'FirstName', 'LastName', 'Address1', 'Address2', 'State', 'City', 'Pincode',
        'MaritalStatus', 'Profession', 'Designation', 'Industry',
      ];

      requiredFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        const errorElement = field.nextElementSibling;
        if (field && !field.value) {
          isValid = false;
          errorElement.style.display = 'block';
        } else if (field) {
          errorElement.style.display = 'none';
        }
      });

      if (isValid) {
        // Submit the form or perform the desired action
        block.querySelector('#success_popup').classList.add('fade-in');
        block.querySelector('#success_popup').style.display = 'flex';
      } else {
        // Prevent form submission
      }
    });
  }
  function populateLoanList(data) {
    const loanList = document.getElementById('loanList');
    if (data.length === 0) {
      return;
    }
    loanList.innerHTML = '';
    loanList.style.height="680px";
    data.forEach((loan, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'lists';
      if (loan.expressCustom === true) {
        listItem.classList.add('loan-express');
      }
      listItem.innerHTML = `
        <div class="bnkLoanRowBx">
        <!-- Check if the URL is correct -->
        <img src="${loan.financier_logo ? loan.financier_logo : 'images/default-logo.png'}" alt="${loan.financier} Logo">
        <span class="festive_offer"></span>
        <span class="loan_type"></span>
        </div>
    
    <div class="bnkLoanRowBx">
        <label class="row-title">Loan Amount</label>
        <div class="edit-wrapper">
            <a class="loanamount" href="javascript:void(0);">₹ ${loan.max_loan}</a>
            <a href="javascript:void(0)" class="loanamount-edit d-block edit-loan-amount">EDIT</a>
        </div>
        <div class="nfLoanEditPopupMain">
            <div class="nfLoanEditArrowBox loan-popup" style="display: none;">
                <input type="tel" value="${loan.max_loan}" maxlength="7">
                <button class="loan-edit-ok">OK</button>
            </div>
        </div>
    </div>

    <div class="bnkLoanRowBx interest_rate">
        <label class="row-title">Interest Rate</label>${loan.interest_rate}
    </div>

    <div class="bnkLoanRowBx">
        <label class="row-title">Min. Down Payment</label>
        <div class="edit-wrapper">
            <a class="downpayment" href="javascript:void(0);">₹ ${Math.floor(loan.down_payment)}</a>
            <a href="javascript:void(0);" class="loanamount-edit d-block edit-down-payment">EDIT</a>
        </div>
        <div class="nfLoanEditPopupMain">
            <div class="nfLoanEditArrowBox downpayment-popup" style="display: none;">
                <input type="tel" value="${Math.floor(loan.down_payment)}" maxlength="7">
                <button class="downpayment-edit-ok">OK</button>
            </div>
        </div>
    </div>

    <div class="bnkLoanRowBx processing_fee">
        <label class="row-title">Processing Fee</label>${loan.processing_fee}
    </div>

    <div class="bnkLoanRowBx tenure">
        <label class="row-title">Tenure</label>${loan.tenure} yrs
    </div>

    <div class="bnkLoanRowBx est_emi">
        <label class="row-title">Estimated EMI</label>₹ ${loan.est_emi}
    </div>

    ${loan.expressCustom === true ? `
    <div class="bnkLoanRowBx" style="justify-content: flex-end;flex: 0 0 100%;">
    <a href="javascript:void(0)" class="express-loan-offer" id="express-loan-offer">Check Xpress offer
      <span class="d-inline-block ml-3"></span>
    </a>
  </div>` : ''}

    <div class="bnkLoanRowBx full-basis" style="gap:1.25rem">
    <span class="preApprovedText" style="font-size: 14px;font-weight: 700;color: #458FF4;">PreApproved</span>
    <div style="width:100%;display:flex;align-items:center;justify-content:flex-end">
        <input type="checkbox" loan-id="${loan.loan_offer_id}" class="custom-check">
        <label class="addToCompareCheck customCheckBox" >Add to compare</label>
        <!-- Add the "PreApproved" text, hidden initially -->
        
        <div class="processing-loan info-btn"></div>
        <p class="whiteButton mb-0 margin-0" style="margin:0">
            <a href="javascript:void(0);" class="view_details view-details-btn" id="view_popup">View Details</a>
        </p>
        ${loan.expressPreapproved === true ? `
        <p class="blackButton margin-0" style="margin:0">
          <a href="javascript:;" class="apply_loan express-preapproved">Apply For Loan</a>
        </p>` : `<p class="blackButton margin-0" style="margin:0">
        <a href="javascript:;" class="apply_loan">Apply For Loan</a>
      </p>`}
        
        </div>
    </div>

    <div class="flexible-emi-offer" style="display: none">
        <p class="flexible-emi-offer__text">Financier also offers flexible payment options. Click on the Flexible EMI Options</p>
    </div>
        `;

      loanList.appendChild(listItem);

      listItem.querySelector('.edit-loan-amount').addEventListener('click', () => {
        listItem.querySelector('.loan-popup').style.display = 'flex';
      });

      handleLoanAmountEdit(listItem, loan);

      listItem.querySelector('.edit-down-payment').addEventListener('click', () => {
        listItem.querySelector('.downpayment-popup').style.display = 'flex';
      });

      handleDownPaymentEdit(listItem, loan);

      listItem.querySelector('.info-btn').addEventListener('click', () => {
        document.getElementById('view-info-popup').classList.add('fade-in');
        document.getElementById('view-info-popup').style.display = 'flex';
      });
      document.getElementById('close-info-popup').addEventListener('click', () => {
        document.getElementById('view-info-popup').classList.remove('fade-in');
        document.getElementById('view-info-popup').style.display = 'none';
      });

      listItem.querySelector('.view-details-btn').addEventListener('click', () => {
        document.getElementById('view-details-popup').classList.add('fade-in');
        document.getElementById('view-details-popup').style.display = 'flex';
      });
      document.getElementById('close-details').addEventListener('click', () => {
        document.getElementById('view-details-popup').classList.remove('fade-in');
        document.getElementById('view-details-popup').style.display = 'none';
      });
      listItem.querySelector('.apply_loan').addEventListener('click', async () => {
        const requestBody = {
          enquiry_id: enquiryId,
          mobile: customerData.mobileValue,
          financier_id: data[index].financier_id,
          financier_name: data[index].financier_name,
          loan_type: data[index].loan_type,
          interest_rate: data[index].interest_rate,
          tenure: data[index].tenure,
          down_payment: data[index].down_payment,
          interest_rate_type: data[index].interest_type || '',
          loan_amount: data[index].loan_amount || '',
          max_loan_amount: data[index].max_loan || '',
          emi: data[index].est_emi || '',
          processing_fee: data[index].processing_fee || '',
          ltv: data[index].ltv || '',
          processing_fee_display: data[index].processing_fee_display || '',
          ltv_based_on: data[index].ltv_based_on || '',
          component_ltv_amount: data[index].component_ltv_amount || '',
          employment_type: customerData.employmentTypeIdCode,
          branch_code: data[index].branch_code || '',
          branch_name: data[index].branch_name || '',
          sales_promo_code: data[index].sales_promo_code || '',
          credit_promo_code: data[index].credit_promo_code || '',
        };
        const selectLoanResponse = await selectedLoanOffer(requestBody);
        sessionStorage.setItem('financier_id', data[index].financier_id);
        if (selectLoanResponse.success) {
          window.location.href = loanAppLink;
        }
      });
    });

    toggleCompareCheckboxVisibility();
    addXpressListeners();
  }
  // Function to update the loan list based on the selected financier
  function updateLoanList(loanFinancier) {
    let filteredData;

    if (loanFinancier === '') {
      // If no specific financier is selected, show all items
      filteredData = jsonData;
    } else {
      // Filter data to show only the selected financier
      filteredData = jsonData.filter((item) => item.financier === loanFinancier);
    }

    populateLoanList(filteredData);
  }
  const sortArrowAmount = document.querySelector('.sortByLA');
  sortArrowAmount.addEventListener('click', () => {
    if (currentSortField === 'loan-amount') {
      currentSortOrderAmount = currentSortOrderAmount === 'ascending' ? 'descending' : 'ascending';
    } else {
      currentSortField = 'loan-amount';
      currentSortOrderAmount = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderAmount);
    populateLoanList(sortedData);
  });

  const sortArrowRate = document.querySelector('.sortByIR');
  sortArrowRate.addEventListener('click', () => {
    if (currentSortField === 'interest_rate') {
      currentSortOrderRate = currentSortOrderRate === 'ascending' ? 'descending' : 'ascending';
    } else {
      currentSortField = 'interest_rate';
      currentSortOrderRate = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderRate);
    populateLoanList(sortedData);
  });

  const sortArrowDownPayment = document.querySelector('.sortByDP');
  sortArrowDownPayment.addEventListener('click', () => {
    if (currentSortField === 'down_payment') {
      currentSortOrderDownPayment = currentSortOrderDownPayment === 'ascending' ? 'descending' : 'ascending';
    } else {
      currentSortField = 'down_payment';
      currentSortOrderDownPayment = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderDownPayment);
    populateLoanList(sortedData);
  });

  const sortArrowEstEMI = document.querySelector('.sortByEMI');
  sortArrowEstEMI.addEventListener('click', () => {
    if (currentSortField === 'est_emi') {
      currentSortOrderEstEMI = currentSortOrderEstEMI === 'ascending' ? 'descending' : 'ascending';
    } else {
      currentSortField = 'est_emi';
      currentSortOrderEstEMI = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderEstEMI);
    populateLoanList(sortedData);
  });

  populateLoanList(jsonData);

  document.getElementById('searchBtn').addEventListener('click', () => {
    document.getElementById('search-popup').style.display = 'block';
  });
  document.getElementById('search-panel-close').addEventListener('click', () => {
    document.getElementById('search-popup').style.display = 'none';
  });
  document.getElementById('search-box').addEventListener('keypress', () => {
    document.getElementById('search-list').style.display = 'block';
  });
  document.getElementById('search-reset').addEventListener('click', () => {
    document.getElementById('search-list').style.display = 'none';
    document.getElementById('search-box').value = '';
  });
  document.getElementById('filterBtn').addEventListener('click', () => {
    document.getElementById('left-table').classList.add('active');
  });
  document.getElementById('sortBtn').addEventListener('click', () => {
    document.getElementById('sorting-panel').style.display = 'block';
  });
  document.getElementById('compare-btn').addEventListener('click', () => {
    const checkedOffers = document.querySelectorAll('.full-basis .custom-check:checked');
    const checkedCount = checkedOffers.length;
    const bankValidationPopup = document.getElementById('bank_validation_popup');
    const popupMessage = bankValidationPopup.querySelector('p');
    if (checkedCount > 3) {
      bankValidationPopup.classList.add('fade-in');
      bankValidationPopup.style.display = 'flex';
      popupMessage.textContent = 'You can compare upto 3 Banks';
    } else if (checkedCount < 2) {
      bankValidationPopup.classList.add('fade-in');
      bankValidationPopup.style.display = 'flex';
      popupMessage.textContent = 'Please select at least two Bank Offers to compare';
    } else {
      const selectedOffers = [];

      checkedOffers.forEach((offer) => {
        const offerId = offer.getAttribute('loan-id');
        const offerData = jsonData.find((item) => item.loan_offer_id === offerId);
        selectedOffers.push(offerData);
      });

      localStorage.setItem('selectedOffers', JSON.stringify(selectedOffers));
      window.location.href = comparePageLink;
    }
  });

  document.getElementById('close-bank-popup').addEventListener('click', () => {
    document.getElementById('bank_validation_popup').classList.remove('fade-in');
    document.getElementById('bank_validation_popup').style.display = 'none';
  });
  document.getElementById('link_search').addEventListener('click', () => {
    document.getElementById('link_search').style.display = 'none';
    document.getElementById('input_group').style.display = 'flex';
  });
  document.getElementById('search_input').addEventListener('keypress', () => {
    document.getElementById('bnkLoanRowBx-search__list').style.display = 'block';
    document.getElementById('input_icon').classList.add('bnkLoanRowBx-search__reset');
  });
  document.getElementById('input_icon').addEventListener('click', () => {
    const icon = document.getElementById('input_icon');
    if (icon.classList.contains('bnkLoanRowBx-search__reset')) {
      document.getElementById('bnkLoanRowBx-search__list').style.display = 'none';
    }
  });
  document.getElementById('filter-clear').addEventListener('click', () => {
    document.getElementById('view-ballon-popup').classList.add('fade-in');
    document.getElementById('view-ballon-popup').style.display = 'flex';
  });
  document.getElementById('close-ballon-details').addEventListener('click', () => {
    document.getElementById('view-ballon-popup').classList.remove('fade-in');
    document.getElementById('view-ballon-popup').style.display = 'none';
  });

  const infoModal = document.getElementById('view-info-popup');
  const detailsModal = document.getElementById('view-details-popup');
  const ballonDetailsModal = document.getElementById('view-ballon-popup');
  const linkSearchIcon = document.getElementById('link_search');
  const searchInputField = document.getElementById('search_input');
  const bankValidationModal = document.getElementById('bank_validation_popup');

  window.onclick = function hideModal(e) {
    if (e.target === infoModal) {
      infoModal.style.display = 'none';
    }
    if (e.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
    if (e.target === ballonDetailsModal) {
      ballonDetailsModal.style.display = 'none';
    }
    if (e.target !== linkSearchIcon && e.target !== searchInputField) {
      document.getElementById('link_search').style.display = 'flex';
      document.getElementById('input_group').style.display = 'none';
    }
    if (e.target === bankValidationModal) {
      bankValidationModal.style.display = 'none';
    }
  };

  document.querySelectorAll('.close-info-popup').forEach((button) => {
    button.addEventListener('click', () => {
      infoModal.style.display = 'none';
    });
  });
  document.querySelectorAll('.close-details-popup').forEach((button) => {
    button.addEventListener('click', () => {
      detailsModal.style.display = 'none';
    });
  });

  const header = document.getElementById('mobileFilterBtn');
  const sticky = header.offsetTop;

  function stickyHeader() {
    if (window.scrollY > sticky) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  }

  window.onscroll = function scrollField() {
    stickyHeader();
  };

  // -----------------------------------Edit Loan Amount End-------------------------------------//

  // -----------------------------------Sorting Arrow Fnction Start---------------------//
  let currentSortOrder = 'asc';
  let activeField = '';

  // Function to toggle sort order and update the icon
  function toggleSortOrder(field) {
    const iconElement = document.querySelector(`.sortBy${field.charAt(0)
      .toUpperCase() + field.slice(1)} .bnkLoanRowBx__sort-arrow`);

    // Reset the previous active field's icon to default, if any
    if (activeField && activeField !== field) {
      const previousIconElement = document.querySelector(`.sortBy${activeField.charAt(0).toUpperCase() + activeField.slice(1)} .bnkLoanRowBx__sort-arrow`);
      previousIconElement.classList.remove('sort-asc', 'sort-desc');
    }

    // Toggle between ascending and descending
    if (currentSortOrder === 'asc') {
      currentSortOrder = 'desc';
      iconElement.classList.remove('sort-asc');
      iconElement.classList.add('sort-desc');
    } else {
      currentSortOrder = 'asc';
      iconElement.classList.remove('sort-desc');
      iconElement.classList.add('sort-asc');
    }

    // Update the active field
    activeField = field;
  }

  document.querySelector('.sortByLA').addEventListener('click', () => {
    toggleSortOrder('LA');
    sortLoanData('loan-amount');
  });

  // Event listener for interest rate sorting
  document.querySelector('.sortByIR').addEventListener('click', () => {
    toggleSortOrder('IR');
    sortLoanData('interest_rate');
  });

  // Event listener for down payment sorting
  document.querySelector('.sortByDP').addEventListener('click', () => {
    toggleSortOrder('DP');
    sortLoanData('down_payment');
  });

  // Event listener for EMI sorting
  document.querySelector('.sortByEMI').addEventListener('click', () => {
    toggleSortOrder('EMI');
    sortLoanData('est_emi');
  });
  // ----------------------Sorting Arrow Function Start-------------------------------//
  // ------------------Flexiable EMI Option Section Start -----------------------------//
  const radioButton = document.getElementById('balloon-finance');
  const filterClear = document.getElementById('filter-clear');
  const flexibleEmiToggle = document.querySelector('.flexible-emi__toggle');

  radioButton.addEventListener('click', () => {
    // Show the filter clear and flexible EMI toggle sections
    if (filterClear) filterClear.style.display = 'flex';
    if (flexibleEmiToggle) flexibleEmiToggle.style.display = 'block';
    const balloonOffers = response.data?.scheme_offers?.offers;
    if (balloonOffers.length === 0) {
      const loanList = document.getElementById('loanList');
      loanList.style.height="auto";
      loanList.innerHTML = `<p style="text-align: center;margin-top: 20px;font-weight: bold;">
      ${response.data?.scheme_offers?.message}</p>`;
    } else {
      populateLoanList(balloonOffers);
    }
  });

  document.getElementById('filter-clear').style.display = 'none';
  const flexibleEmiTogglee = document.querySelector('.flexible-emi__toggle');
  if (flexibleEmiTogglee) {
    flexibleEmiTogglee.style.display = 'none';
  }
  // Event listener for the "Yes" button
  document.querySelector('#view-ballon-popup .whiteButton').addEventListener('click', () => {
    // Hide the specific sections
    document.querySelector('.filter-clear').style.display = 'none';
    document.querySelector('.flexible-emi__toggle').style.display = 'none';

    // Close the pop-up
    document.getElementById('view-ballon-popup').classList.remove('fade-in');
    document.getElementById('view-ballon-popup').style.display = 'none';
    radioButton.checked = false;
    populateLoanList(jsonData);
  });

  // Event listener for the "No" button
  document.querySelector('#view-ballon-popup .blackButton').addEventListener('click', () => {
    // Close the pop-up
    document.getElementById('view-ballon-popup').classList.remove('fade-in');
    document.getElementById('view-ballon-popup').style.display = 'none';
  });

  // Event listener for the close icon
  document.getElementById('close-ballon-details').addEventListener('click', () => {
    // Close the pop-up
    document.getElementById('view-ballon-popup').classList.remove('fade-in');
    document.getElementById('view-ballon-popup').style.display = 'none';
  });
  // ------------------Flexiable EMI Option Section END --------------------------------//
  // ------------------Search Functionality--------------------------------------//
  const searchInput = document.getElementById('search_input');
  const searchList = document.getElementById('bnkLoanRowBx-search__list');
  const linkSearch = document.getElementById('link_search');
  const inputGroup = document.getElementById('input_group');

  // Toggle search input visibility on clicking the link
  linkSearch.addEventListener('click', (e) => {
    e.preventDefault();
    inputGroup.style.display = 'flex';
    searchInput.focus();
  });

  // Handle search input
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    searchList.style.display = 'block';
    const list = searchList.querySelector('ul');
    list.innerHTML = '';

    if (query === '') {
      // If the search input is empty, show all financiers
      jsonData.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'bnkLoanRowBx-search__list--item';
        li.style.display = 'flex';
        li.textContent = item.financier;
        li.addEventListener('click', () => {
          searchInput.value = item.financier;
          searchList.style.display = 'none';
          updateLoanList(item.financier);
        });
        list.appendChild(li);
      });
      updateLoanList('');
    } else {
      // Filter and show financiers that match the query
      jsonData.forEach((item) => {
        if (item.financier.toLowerCase().includes(query)) {
          const li = document.createElement('li');
          li.className = 'bnkLoanRowBx-search__list--item';
          li.style.display = 'flex';
          li.textContent = item.financier;
          li.addEventListener('click', () => {
            searchInput.value = item.financier;
            searchList.style.display = 'none';
            updateLoanList(item.financier);
          });
          list.appendChild(li);
        }
      });
    }

    // Hide the list if no results found
    if (list.childElementCount === 0) {
      searchList.style.display = 'none';
    }
  });

  // Hide search list when clicking outside
  document.addEventListener('click', (e) => {
    if (!inputGroup.contains(e.target) && !searchList.contains(e.target)
      && !linkSearch.contains(e.target)) {
      searchList.style.display = 'none';
    }
  });

  // Initial call to populate the list with all data
  populateLoanList(jsonData);

  // ------------------End Search Functionality-------------------------------//
  // ------------------Pre-ApprovedTab Functionality Start-----------------------//

  const preApprovedTab = document.getElementById('Pre-approved-tab');
  const customTab = document.getElementById('Custom-tab');
  const flexibleEmiSection = document.querySelector('.flexible-emi');
  const offerText = document.querySelector('.offer-text');

  preApprovedTab.addEventListener('click', () => {
    // Hide sections
    flexibleEmiSection.style.display = 'none';
    offerText.style.display = 'none';

    // Toggle active class
    customTab.classList.remove('active');
    preApprovedTab.classList.add('active');
    populateLoanList(preapprovedLoansData);

    // Make all .preApprovedText elements visible
    const preApprovedTexts = document.querySelectorAll('.preApprovedText');
    preApprovedTexts.forEach((span) => {
      span.style.display = 'flex'; // or 'block' depending on your layout needs
    });
  });

  customTab.addEventListener('click', () => {
    // Show sections
    flexibleEmiSection.style.display = 'block';
    offerText.style.display = 'block';

    // Toggle active class
    preApprovedTab.classList.remove('active');
    customTab.classList.add('active');
    populateLoanList(jsonData);

    // Hide all .preApprovedText elements when switching back
    const preApprovedTexts = document.querySelectorAll('.preApprovedText');
    preApprovedTexts.forEach((span) => {
      span.style.display = 'none';
    });
  });

  // ----------------------view detail api render start------------------------//
  // Function to render loan details based on the selected index
  function renderLoanDetails(loanIndex) {
    const loan = jsonData[loanIndex];
    const loanDetailsSection = document.getElementById('loan-details-section');

    if (loan) {
      // Clear existing content
      loanDetailsSection.innerHTML = '';

      // Insert the details of the selected loan
      const detailsElement = document.createElement('div');
      detailsElement.innerHTML = loan.LoanDetails;
      loanDetailsSection.appendChild(detailsElement);
    }
  }
  renderLoanDetails(0);
  // ----------------------view deatil api render end ----------------------//

  // Get references to the slider and the display element
  const slider = document.getElementById('demo_3n');
  const displayElement = document.querySelector('.irs-single-get');
  // Function to filter and populate the loan list based on the down payment value
  function filterAndPopulateLoans(value) {
    if (value === 0) {
      // If the value is 0, render all loans
      populateLoanList(jsonData);
    } else {
      // Filter loans where down_payment matches the slider value
      const filteredData = jsonData.filter((loan) => parseInt(loan.down_payment, 10) === value);
      populateLoanList(filteredData);
    }
  }

  slider.addEventListener('change', async () => {
    const value = parseInt(slider.value, 10); // Get the value of the slider
    highestDownPayValue = value;
    const updatedRangeLoanOffers = await getAllLoanOffers(null, enquiryId, value);

    if (updatedRangeLoanOffers.success) {
      jsonData = updatedRangeLoanOffers.data?.applicant_offers?.offers;
      checkEmptyResponseMessage(updatedRangeLoanOffers);
    }

    populateLoanList(jsonData);
  });

  // Update the display when the slider moves
  slider.addEventListener('input', () => {
    const value = parseInt(slider.value, 10);
    displayElement.textContent = value;
    filterAndPopulateLoans(value);
  });

  // Update the slider when the value in the display element is changed manually
  displayElement.addEventListener('input', (event) => {
    const newValue = parseInt(event.target.textContent.replace(/\s/g, ''), 10);
    if (!Number.isNaN(newValue)) {
      slider.value = newValue;
      filterAndPopulateLoans(newValue);
    }
  });

  // Make the display element contenteditable to allow manual input
  displayElement.contentEditable = true;

  // Prevent line breaks and other unwanted behavior in contenteditable
  displayElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  });
  // ----------------------Filter on Mock API for Down-Payment End-----------------//
  // ----------------------Filter on Mock API for Tenure Start--------------------//
  // Function to filter and populate the loan list based on the tenure value
  async function filterByTenure(tenureValue, downPaymentValue) {
    if (tenureValue === 'All') {
      const updatedResponse = await getAllLoanOffers(null, enquiryId, downPaymentValue);

      if (updatedResponse.success) {
        jsonData = updatedResponse.data?.applicant_offers?.offers;

        checkEmptyResponseMessage(updatedResponse);
      }
    } else {
      const updatedResponse = await getAllLoanOffers(tenureValue, enquiryId, downPaymentValue);
      if (updatedResponse.success) {
        jsonData = updatedResponse.data?.applicant_offers?.offers;
        checkEmptyResponseMessage(updatedResponse);
      }
    }

    populateLoanList(jsonData);
  }
  const tenureContainer = document.querySelector('.loanPeriodBtn ul');

  tenureContainer.addEventListener('click', (event) => {
    const loanTenure = event.target.closest('.tenure');
    if (loanTenure) {
      // Remove 'active' class from all tenure elements
      document.querySelectorAll('.tenure').forEach((t) => t.classList.remove('active'));

      // Add 'active' class to the clicked tenure element
      loanTenure.classList.add('active');

      // Get the selected tenure value and update the tenure title text
      const tenureValue = loanTenure.textContent.trim();
      document.querySelector('.tenure_tile').textContent = tenureValue === 'All' ? 'All years' : `${tenureValue} years`;

      // Apply the filter based on the selected tenure value
      filterByTenure(tenureValue, highestDownPayValue);
    }
  });

  // ----------------------Filter on Mock API for Tenure End----------------------//
  // ----------------------Filter on Mock API for Last Month EMI Start------------//
  function filterByLastMontEmi(lastMontEmiValue) {
    if (lastMontEmiValue === 'All') {
      // Render all loans if 'All' is selected
      populateLoanList(jsonData);
    } else {
      // Filter loans where LastMontEmi matches the selected value
      const filteredData = jsonData.filter((loan) => loan.LastMontEmi === lastMontEmiValue);
      populateLoanList(filteredData);
    }
  }

  // Add click event listener to each flexible EMI item
  document.querySelectorAll('.list-flexibleEmi__item--text').forEach((item) => {
    item.addEventListener('click', function itemField() {
      // Remove 'list-flexibleEmi__item--active' class from all items
      document.querySelectorAll('.list-flexibleEmi__item--text').forEach((t) => t.classList.remove('list-flexibleEmi__item--active'));

      // Add 'list-flexibleEmi__item--active' class to the clicked item
      this.classList.add('list-flexibleEmi__item--active');

      // Get the selected LastMontEmi value and apply the filter
      const lastMontEmiValue = this.textContent.trim();
      filterByLastMontEmi(lastMontEmiValue);
    });
  });
  // ----------------------Filter on Mock API for Last Month EMI End-----------------//
  // ----------------------Sorting for Mobile View Starting -----------------------//
  // Select the close button and sorting panel elements
  const closeButton = document.querySelector('.sorting-panel__close');
  const sortingPanel = document.getElementById('sorting-panel');

  // Add a click event listener to the close button
  closeButton.addEventListener('click', () => {
    // Hide the sorting panel when the close button is clicked
    sortingPanel.style.display = 'none';
  });

  // Sorting functionality for Loan Amount - High to Low
  document.querySelector('.sortByLAhl').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    if (currentSortField === 'loan-amount') {
      currentSortOrderAmount = 'descending';
    } else {
      currentSortField = 'loan-amount';
      currentSortOrderAmount = 'descending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderAmount);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Loan Amount - Low to High
  document.querySelector('.sortByLAlh').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'loan-amount') {
      currentSortOrderAmount = 'ascending';
    } else {
      currentSortField = 'loan-amount';
      currentSortOrderAmount = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderAmount);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Interest Rate - High to Low
  document.querySelector('.sortByIRhl').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'interest_rate') {
      currentSortOrderRate = 'descending';
    } else {
      currentSortField = 'interest_rate';
      currentSortOrderRate = 'descending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderRate);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Interest Rate - Low to High
  document.querySelector('.sortByIRlh').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'interest_rate') {
      currentSortOrderRate = 'ascending';
    } else {
      currentSortField = 'interest_rate';
      currentSortOrderRate = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderRate);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Min Down Payment - High to Low
  document.querySelector('.sortByDPhl').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'down_payment') {
      currentSortOrderDownPayment = 'descending';
    } else {
      currentSortField = 'down_payment';
      currentSortOrderDownPayment = 'descending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderDownPayment);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Min Down Payment - Low to High
  document.querySelector('.sortByDPlh').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'down_payment') {
      currentSortOrderDownPayment = 'ascending';
    } else {
      currentSortField = 'down_payment';
      currentSortOrderDownPayment = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderDownPayment);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Estimated EMI - High to Low
  document.querySelector('.sortByEMIhl').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'est_emi') {
      currentSortOrderEstEMI = 'descending';
    } else {
      currentSortField = 'est_emi';
      currentSortOrderEstEMI = 'descending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderEstEMI);
    populateLoanList(sortedData);
  });

  // Sorting functionality for Estimated EMI - Low to High
  document.querySelector('.sortByEMIlh').addEventListener('click', (event) => {
    event.preventDefault();
    if (currentSortField === 'est_emi') {
      currentSortOrderEstEMI = 'ascending';
    } else {
      currentSortField = 'est_emi';
      currentSortOrderEstEMI = 'ascending';
    }
    const sortedData = sortLoanData(jsonData, currentSortField, currentSortOrderEstEMI);
    populateLoanList(sortedData);
  });

  // ----------------------Sorting for Mobile View End --------------------//
  // ----------------------Search for Mobile View Start --------------------//
  // ------------------Mobile Search Functionality-------------------//
  const mobileSearchInput = document.getElementById('search-box');
  const mobileSearchList = document.getElementById('search-list');
  const mobileSearchReset = document.getElementById('search-reset');

  // Function to update search list based on query
  function updateSearchList(query) {
    mobileSearchList.innerHTML = ''; // Clear previous search results
    mobileSearchList.style.display = 'block';

    if (query === '') {
      // Show all items if the search input is empty
      jsonData.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'search-list__list';
        li.style.display = 'flex';
        li.textContent = item.financier;
        li.addEventListener('click', () => {
          mobileSearchInput.value = item.financier;
          mobileSearchList.style.display = 'none';
          updateLoanList(item.financier); // Assuming updateLoanList is a function you need
        });
        mobileSearchList.appendChild(li);
      });
      // Optionally, call updateLoanList with an empty string
      updateLoanList('');
    } else {
      // Filter and show items that match the query
      let hasResults = false;
      jsonData.forEach((item) => {
        if (item.financier.toLowerCase().includes(query)) {
          const li = document.createElement('li');
          li.className = 'search-list__list';
          li.style.display = 'flex';
          li.textContent = item.financier;
          li.addEventListener('click', () => {
            mobileSearchInput.value = item.financier;
            mobileSearchList.style.display = 'none';
            updateLoanList(item.financier);
          });
          mobileSearchList.appendChild(li);
          hasResults = true;
        }
      });

      // Hide the list if no results found
      if (!hasResults) {
        mobileSearchList.style.display = 'none';
      }
    }
  }
  // Handle mobile search input
  mobileSearchInput.addEventListener('input', () => {
    const query = mobileSearchInput.value.toLowerCase();
    updateSearchList(query);
  });

  // Hide search list when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileSearchInput.contains(e.target)
      && !mobileSearchList.contains(e.target)
      && !mobileSearchReset.contains(e.target)) {
      mobileSearchList.style.display = 'none';
    }
  });

  // Function to reset the search input and show all financiers
  function resetSearch() {
    mobileSearchInput.value = '';
    updateSearchList('');
  }

  // Reset search input and list visibility when clicking reset button
  mobileSearchReset.addEventListener('click', () => {
    resetSearch();
  });

  // ----------------------Search for Mobile View End ---------------//
  const closeIcon = document.querySelector('.calcEmiBox-close');
  const filterBtn = document.querySelector('#filterBtn');
  const sectionToToggle = document.getElementById('left-table');
  closeIcon.addEventListener('click', () => {
    sectionToToggle.style.display = 'none';
  });

  filterBtn.addEventListener('click', () => {
    sectionToToggle.style.display = 'block';
  });

  const displayDiv = document.querySelector('.irs-single-get');

  // Function to allow only numbers
  displayDiv.addEventListener('input', function displayField() {
    // Replace any character that is not a digit with an empty string
    const numericValue = this.textContent.replace(/\D/g, '');

    // Update the div content to reflect only allowed characters
    this.textContent = numericValue;
  });

  const { apiChannel } = await fetchPlaceholders();

  const downloadBtn = document.getElementById('download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      handleDownload(enquiryId, apiChannel);
    });
  }
}
