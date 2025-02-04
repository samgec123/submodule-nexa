/* eslint-disable no-multi-str */
import utility from '../../../utility/utility.js';
import {
  withdrawnConsent, getLoanStatus, loanStatusGoBack, getCustomerData,
} from '../../../utility/sfUtils.js';

import { saveMrLoanApplication, consentMrLoanApplication } from '../../../utility/smart-finance/loanStatusUtils.js';

async function generateLoanHtml(elements, jsonData) {
  const formsff = await utility.fetchFormSf('placeholders-sf.json', 'default');
  const [
    titleEl,
    viewDetailEl,
    applicantIdEl,
    applicantNameEl,
    appliedEl,
    underProcessEl,
    sanctionedEl,
    disbursedEl,
    backDealerEl,
    bookDriveEl,
    payAmountEl,
    despara,
    deslist,
    journeyEl,
    submitEl,
    backE1,
    withPopUpTitleEl,
    withPopUpTextEl,
    withPopUpYesEl,
    withPopUpNoEl,
    feedbkPopUpTitleEl,
    feedbkPopUpTextEl,
    feedbkPopUpRatingEl,
    feedbkPopUpSubmitEl,
    feedbkPopUpThankyouEl,
    finalWithPopUpTitleEl,
    finalWithPopUpTextEl,
    finalWithPopUpDelayEl,
    finalWithPopUpChangeEl,
    finalWithPopUpCancelEl,
    finalWithPopUpCaseEl,
    finalWithPopUpOtherEl,
    finalWithPopUpWithdrawButtonEl,
    finalWithPopUpCancelButtonEl,
    bookingPopUpSubmitEl,
    bookingPopUpSkipEl,
    bookingPopUpTextEl,
    offersPageLinkEl,
  ] = elements;

  const getFieldData = (element) => element?.textContent?.trim() || '';
  const getOuterHTML = (element) => Array.from(element ? [element] : []).map((el) => el.outerHTML).join('');
  const getAnchorHref = (element) => element?.querySelector('a')?.href || '#';

  const htmlContent = `
  <section class="employerFormSec applicationStatusSec">
  <input type="hidden" value="INTERESTED" tabindex="7">
  <input type="hidden" value="CANCELLED" tabindex="8">
  <input type="hidden" value="MSIL_REJECTED" tabindex="9">
  <input type="hidden" value="RE-UPLOAD DOCUMENT COMPLETE" tabindex="10">
  <input type="hidden" value="RE_UPLOAD_NOT_INTERESTED" tabindex="11">
  <input type="hidden" value="UNDER PROCESS WITH BANK" tabindex="12">
  <input type="hidden" value="RETRY_SUBMISSION" tabindex="13">
  <input type="hidden" value="RETRY_SUBMISSION_FAILED" tabindex="14">
  <input type="hidden" value="RE-UPLOAD DOCUMENT" tabindex="15">
  <input type="hidden" value="NOT_INTERESTED" tabindex="16">
  <input type="hidden" value="ASSET_BLOCKED" tabindex="17">
  <input type="hidden" value="APPLICATION WITHDRAWN" tabindex="18">
  <input type="hidden" value="APPLIED" tabindex="19">
  <input type="hidden" value="UNDER PROCESS" tabindex="20">
  <input type="hidden" value="SANCTIONED" tabindex="21">
  <input type="hidden" value="REJECTED" tabindex="22">
  <input type="hidden" value="DISBURSED" tabindex="23">
  <input type="hidden" value="EXPIRED" tabindex="24">
  <div class="container">
      <h3>${getFieldData(titleEl)}</h3>
      <div class="employerFormBox employerFormBox1">
          <div class="applicationStatusWrap">
              <div class="bnklogo">
                  <img src=${jsonData.loan_status?.financier_logo} alt="financier logo">
                  ${jsonData.loan_status?.loan_type === 'PRE_APPROVED' ? '<span class="loan_type_approval">pre-approved</span>' : ''}
                  <a href="javascript:void(0);" onclick="" class="v-details" data-toggle="modal"
                      data-target=".loanOfferView2-popup">${getFieldData(viewDetailEl)}</a>
                  <div class="row user_full_name_modify">
                      <div class="col-md-9">
                          <div class="pt-2">
                              <div class="mt-0">
                                  <strong class="applicant-name-id">${getFieldData(applicantIdEl)}</strong>
                                  <span class="user-full-name" >${jsonData.loan_status?.bank_applicant_id}</span>
                              </div>
                              ${jsonData.loan_status?.bankApplicantName ? `
                              <div class="mt-1">
                                <strong class="applicant-name-id">${getFieldData(applicantNameEl)} </strong>
                                <span class="user-full-name" id="user-full-name-out">${jsonData.loan_status?.bankApplicantName}</span>
                            </div>` : ''}
                          </div>
                      </div>
                      <div class="col-md-3 d-flex justify-content-md-end" style="align-items:end">
                          <div class="application-status-right bnklogo-right mt-2 mt-md-0">
                              <a href="javascript:void(0)" data-toggle="modal"
                                  data-target="#modifyApllicantDetailModal" class="mt-auto modify-applicant-details-link">
                                  Modify Applicant Details
                              </a>
                          </div>
                      </div>
                  </div>
              </div>
              <ul class="statuSteps status_list">
                  <li class="disbursh grey"><span></span>
                      <div class="content">
                          <div class="title">${getFieldData(appliedEl)}</div>
                          ${jsonData.loan_status?.loan_type === 'PRE_APPROVED' && jsonData.loan_status.financier_id === '280003'
    ? `<p id="xpressTitle">Please <a href="javascript:void(0);" id="click_here_btn"
                          class="hdfc_xpress_URL">click here</a> to complete the verification for the
                      digital disbursement</p>` : ''}
                          
                      </div>
                  </li>
                  <li class="disbursh grey"><span></span>
                      <div class="content">
                          <div class="title">${getFieldData(underProcessEl)}</div>
                      </div>
                  </li>
                  <li class="disbursh grey"><span></span>
                      <div class="content">
                          <div class="title">${getFieldData(sanctionedEl)}</div>
                      </div>
                  </li>
                  <li class="disbursh grey"><span></span>
                      <div class="content">
                          <div class="title">${getFieldData(disbursedEl)}</div>
                      </div>
                  </li>
              </ul>
              ${jsonData.loan_status?.branch_detail ? `
              <div class="submit">

                   ${getOuterHTML(submitEl)}
                   <p class="branch_detail">${jsonData.loan_status.branch_detail}</p>
                   </div>` : ''}

              
              <div class="bottom ">
                  <a class="download download_sanct dis"
                      href="/api/sitecore/LoanOffer/DownLoadSanctionLetter?enquiry_id=NX-01082024-432461537"
                      onclick="">Download Sanction Letter</a>
                  <div class="linkBtn loan_approve">
                      <div class="whiteButton withdrawJourney">
                          <a class="btn1" href="javascript:void(0);">${getFieldData(backE1)}</a>
                      </div>
                      <div class="whiteButton BackHome">
                          <a class="btn1" href="/nexa-finance/nexafinance-dealer-dashboard">${getFieldData(backDealerEl)}</a>
                      </div>
                      <div class="whiteButton BookDrive">
                          <a onclick="" href="/book-test-drive" class="noFill btn1">${getFieldData(bookDriveEl)}</a>
                      </div>

                      <div class="whiteButton">
                          <a href="javascript:void(0);" class="bookAmt btn1">${getFieldData(payAmountEl)}</a>
                      </div>
                  </div>
              </div>

              <div class="nfDiscTxt">
                  <h3 class="feedback"> Please <a onclick="" href="javascript:void(0);">click here</a> to
                      provide your feedback.</h3>
                  <span>Disclaimer:${getOuterHTML(despara)}</span>
                   ${getOuterHTML(deslist)}
              </div>
          </div>
      </div>
  </div>

</section>
<div class=" fade nexa_finance-modal userloginpopup popUpmain" id="nexa_finance_widthraw_confirm" tabindex="-1"
  aria-labelledby="myLargeModalLabel" aria-modal="true" role="dialog">
  <div class="modal-dialog loginmodal">
      <div class="modal-content">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"></span>
          </button>
          <div class="loginBoxContainer">
              <div class="loginSignUpBox">
                  <div class="loginLeftBox">
                      <div class="clearfix"></div>
                      <div class="row nf-mobile-box">
                          <div class="title">
                              <h2>${getFieldData(withPopUpTitleEl)}</h2>
                          </div>
                          <p class="go-back-text">${getOuterHTML(withPopUpTextEl)}</p>
                          <div class="col-sm-12 form-group" style="text-align: center;">
                              <button type="button" class="sub-btn yes-button">${getFieldData(withPopUpYesEl)}</button>
                              <button type="button" data-dismiss="modal" class="sub-btn cancel-button">${getFieldData(withPopUpNoEl)}</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
<div class="loanOfferViewDetailPopupMain">
  <div class=" loanOfferView2-popup popUpmain fade-in fade" tabindex="-1"
      aria-labelledby="myLargeModalLabel" aria-hidden="true">
      <div class="modal-content modal-dialog modal-lg modal-dialog-centered">
          <div class="popupContainer_fmp">
              <div class="close closeIcon" aria-label="Close">
              </div>
              ${jsonData.loan_status.loanDetails}
          </div>

      </div>
  </div>
</div>
<div class=" fade nexa_finance-modal popUpmain userloginpopup" tabindex="-1" role="dialog"
  aria-labelledby="myLargeModalLabel" aria-hidden="true" id="nexa_finance-booking">
  <div class="modal-dialog modal-dialog-centered loginmodal">
      <div class="modal-content">
          <button type="button" class="close closeIcon" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"> </span>
          </button>
          <div class="loginBoxContainer">
              <div class="loginSignUpBox loginSignUpPadding">
                  <div class="loginLeftBox loginLeftPadding">
                      <form novalidate="novalidate">
                          <div class="clearfix"></div>
                          <div class="row nf-mobile-box">
                              <div class="col-sm-12">
                                  <input type="text" placeholder="Enter Booking ID" name="BookingID"
                                      tabindex="29">
                              </div>
                              <div class="col-sm-12 form-group">
                                  <button type="button" class="sub-btn">${getFieldData(bookingPopUpSubmitEl)}</button>
                                  <button type="button" class="sub-btn cancel-button">${getFieldData(bookingPopUpSkipEl)}</button>
                              </div>
                          </div>
                      </form>
                      <p>${getFieldData(bookingPopUpTextEl)} <span class="green-tick-icon-booking" ></span></p>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
<div class="nfFeedbackSmileyPopupMain">
<div class="fade nfFeedbackSmileyPopup popUpmain" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-modal="true" style="">
  <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
          <button type="button" class="close closeIcon" ></button>
          <div class="nfFeedbackSmileyPopupContent feedbackmain">
              <input type="hidden" id="loan_status_id" value="" tabindex="57">
              <h2>${getFieldData(feedbkPopUpTitleEl)}</h2>
              <p>${getOuterHTML(feedbkPopUpTextEl)}</p>
              <input type="hidden" id="question_id1" value="20051" tabindex="58">
              <input type="hidden" id="question_type1" value="rating" tabindex="59">
              <input type="hidden" id="question_seq1" value="1" tabindex="60">
              <div class="nfFeedbackSmileySec">
                  <ul>
                      <li class="smileySad"></li>
                      <li class="smileyNormal"></li>
                      <li class="smileyComfort"></li>
                      <li class="smileyHappy"></li>
                      <li class="smileyExellent"></li>
                  </ul>
                  <p style="">${getFieldData(feedbkPopUpRatingEl)}</p>
              </div>
              <form>
                  <div class="nfFeedSmileyQues2">
                      <span>Please share your valuable feedback to help us improve your experience</span>
                      <input type="hidden" id="question_id2" value="20052" tabindex="61">
                      <input type="hidden" id="question_type2" value="text" tabindex="62">
                      <input type="hidden" id="question_seq2" value="2" tabindex="63">
                      <textarea id="message" maxlength="1000"></textarea>
                  </div>
                  <div class="nfFeedSmileyButtMain">
                      <div class="blackButton"><button type="button" class="feedback_submit">${getFieldData(feedbkPopUpSubmitEl)}</button></div>
                  </div>
              </form>
          </div>
          <div class="nfFeedbackSmileyPopupContent feedbackthank">
              <p>${getFieldData(feedbkPopUpThankyouEl)}</p>
          </div>
      </div>
  </div>
</div>
</div>
<div class="fade modal-modify popUpmain" id="modifyApllicantDetailModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-modal="true" role="dialog">
<div class="modal-dialog modal-dialog-centered modal-dialog-modify">
  <div class="modal-content modal-modify-content">
      <button type="button" class="close closeIcon" data-dismiss="modal" aria-label="Close"></button>
      <div class="modal-body modal-dialog-body popupContent">
          <h4 class="modal-modify-title">${formsff.applicantDetails}</h4>
          <div class="row no-gutters row8" data-id="applicant-step1">
              <div class="col-md-6">
                  <div class="form-group mb-md-0">
                      <label for="" class="label">Full Name</label>
                      <div class="position-relative">
                          <input type="text" name="" id="user_full_name_filed" class="form-control" readonly tabindex="46">
                          <a href="javascript:void(0)" class="applicant-edit">${formsff.edit}</a>
                      </div>
                  </div>
              </div>
              <div class="col-md-6">
                  <div class="form-group mb-md-0">
                      <label for="" class="label">DOB</label>
                      <input type="text" name="" id="user_dob" class="form-control" readonly="" tabindex="47">
                  </div>
              </div>
              <div class="col-md-6 mt-72">
                  <small class="small">${formsff.editAppDiscOne}</small>
              </div>
              <div class="col-md-6 mt-72 text-right">
                  <span class ="whiteButton" id="whiteButton-1"><a href="javascript:void(0)" data-dismiss="modal" class="btn btn-outline-dark btn-outline-custom">${formsff.cancel}</a></span>
              </div>
          </div>
          <form id="modify_fullname" novalidate="novalidate" >
              <div class="is-edit-block" data-id="applicant-step2" style="display: none;">
                  <div class="modal-modify-title" id="modal-modify-title-2">${formsff.editAppTitleTwo}</div>
                  <div class="modal-modify-title" id="modal-modify-title-3" style="display: none;">${formsff.editAppTitleThree}</div>
                  <div class="row no-gutters row8">
                      <div class="col-md-4">
                          <div class="form-group mb-md-4">
                              <label for="" class="label">${formsff.firstName}*</label>
                              <input type="text" maxlength="30" name="first_name" class="form-control" tabindex="48">
                              <em id="downpayment-error" class="error invalid-feedback"style="display: none;">${formsff.editfirstNameValuerror}</em>
                          </div>
                      </div>
                      <div class="col-md-4">
                          <div class="form-group mb-md-4">
                              <label for="" class="label">${formsff.middleName}</label>
                              <input type="text" maxlength="30" name="middle_name" class="form-control" tabindex="49">
                          </div>
                      </div>
                      <div class="col-md-4">
                          <div class="form-group mb-md-4">
                              <label for="" class="label">${formsff.lastName}</label>
                              <input type="text" maxlength="30" name="last_name" class="form-control" tabindex="50">
                          </div>
                      </div>
                      <div class="col-md-12 mt-3">
                          <div class="form-check pl-0">
                              <input class="form-check-input" name="checkbox" type="checkbox" id="defaultCheck1" tabindex="51">
                              <input name="checkbox" type="hidden" value="false" tabindex="52">
                              <label class="form-check-label" for="defaultCheck1" id="checkboxLabel">
                              ${formsff.editCheckBoc}
                              </label>
                          </div>
                      </div>
                      <div class="col-md-12 text-right modify-button">
                          <span class ="whiteButton" id="whiteButton-2"><a href="javascript:void(0)" data-dismiss="modal" class="btn btn-outline-dark btn-outline-custom">${formsff.cancel}</a></span>
                          <div class ="blackButton"><a href="javascript:void(0)" class="btn btn-dark btn-dark-custom modify-btn-next">${formsff.next}</a></div>
                      </div>
                  </div>
              </div>
              <div class="is-verified" data-id="applicant-step3" style="display: none;">
                  <h5 class="verified-title">
                  ${formsff.optMsgOne}
                      <strong class="user_mobile_number">${jsonData.loan_status.mobile_number}</strong> <br>${formsff.otpMsgTwo}
                  </h5>
                  <div class="otp-block">
                      <div class="otp-input">
                          <input type="tel" name="otp" maxlength="4" class="form-control" placeholder="${formsff.otp}" tabindex="56">
                          <a href="javascript:void(0)" class="resend-otp">${formsff.resend}</a>
                      </div>
                      <div id="opt-timer" class="otp-timer">
                          ${formsff.otpTimeCount}<strong class="full_name_timer"></strong>
                      </div>
                  </div>
                  <div class="text-right modify-button modify-button-last">
                      <div class ="whiteButton"><a href="javascript:void(0)" class="btn btn-outline-dark btn-outline-custom modify-btn-back">${formsff.back}</a></div>
                      <div class ="blackButton"><a href="javascript:void(0)" class="btn btn-dark btn-dark-custom modify-btn-submit">${formsff.submit}</a></div>

                  </div>
              </div>
          </form>
      </div>
  </div>
</div>
</div>

<div class="fade modal-modify-thankyou popUpmain" id="modifyApllicantDetailThankyouModal" tabindex="-1" aria-labelledby="modifyApllicantDetailThankyouModal" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered  modal-modify-thankyou__dialog">
  <div class="modal-content modal-modify-thankyou__content">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
      <div class="modal-body modal-modify-thankyou__body popupContent">
          <h1 class="modal-modify-thankyou__title">${formsff.thankPopupTitle}</h1>
          <p class="modal-modify-thankyou__text">${formsff.thankPopupTitleDiscOne}<br> ${formsff.thankPopupTitleDiscTwo}</p>
      </div>
  </div>
</div>
</div>
<div class=" fade modal-withdraw popUpmain" id="withdrawModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
">
<div class="modal-dialog modal-dialog-centered" id="withdraw-pop-up">
  <div class="modal-content">
      <form id="withdraw_form" novalidate="novalidate">
          <div class="modal-body modal-withdraw-body popupContent">
              <h5 class="modal-title modal-withdraw--title">${getFieldData(finalWithPopUpTitleEl)}</h5>
              <div class="relative modal-withdraw-control">
                  <select name="withdrow_reason" data-error="Please select reason for application withdrawal" class="form-control" id="withdrow_reason" tabindex="45">
                      <option value="">Select</option>
                              <option value="530001">${getFieldData(finalWithPopUpDelayEl)}</option>
                              <option value="530002">${getFieldData(finalWithPopUpChangeEl)}</option>
                              <option value="530003">${getFieldData(finalWithPopUpCancelEl)}</option>
                              <option value="530004">${getFieldData(finalWithPopUpCaseEl)}</option>
                              <option value="530005">${getFieldData(finalWithPopUpOtherEl)}</option>
                  </select>
                  <label>${getOuterHTML(finalWithPopUpTextEl)}</label>
              </div>
              <div class="form-group" id="withdrow_comment">
                  <textarea name="comments" id="comments" cols="30" rows="9" class="form-control" placeholder="Your comment" minlength="5" maxlength="100" data-error="Please enter comments"></textarea>
              </div>
              <div class="d-flex btn-withdraw-group">
                  <div class ="blackButton"><a href="javacript:void(0)" class="btn btn-primary btn-withdraw btn-withdraw-gray" id="btn-withdrow-save">${getFieldData(finalWithPopUpWithdrawButtonEl)}</a></div>
                  <span class ="whiteButton"><a href="javacript:void(0)" data-dismiss="modal" class="btn btn-primary btn-withdraw ml-2" id="withdraw-cancel">${getFieldData(finalWithPopUpCancelButtonEl)}</a></span>
              </div>
          </div>
      </form>
  </div>
</div>
</div>
<div class="popUpmain fade-in" id="amt_error_popup" style="display: none;">
<div class="modal-content">
  <div class="close" id="close-amt-error-popup"></div>
  <div class="popupContent red">
      <h2><div class="icon-img "></div>${formsff.errorTitlePopup}</h2>
      <p>${formsff.editErrorPopup}</p>
      <div class="btn-container">
          <div class="blackButton"><button type="button" id="close-popup-btn">${formsff.okBtn}</button></div>
      </div>      
  </div>
</div>
</div>
<div class="popUpmain" id="click_here_popup" style="display: none;">
  <div class="modal-content">

      <div class="close" id="close_click_here" aria-label="Close">
      </div>
      <div class="popupContent">
          <h2>${formsff.mssfTitle}</h2>
          <p>${formsff.redirectText}</p>
          <div class="col-sm-12 form-group" style="text-align: center;">
              <div class="blackButton">
                  <button type="button" class="sub-btn mdl_cnfrm-OK">Ok</button>
              </div>
              <div class="blackButton"> <button type="button" class="sub-btn cancel-redirect">Cancel</button>
              </div>
          </div>
      </div>
  </div>
</div>
  `;
  return { offersPageLink: `${getAnchorHref(offersPageLinkEl)}`, journeyType: `${getFieldData(journeyEl)}`, htmlContent };
}
export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const elements = Array.from(innerDiv.children);
  const enquiryId = sessionStorage.getItem('enquiry_id') || 'NX-27112024-046828766';
  const customerResponse = await getCustomerData(enquiryId);
  if (customerResponse.data.customer_data.enquiry.status !== '10056') {
    const offersPageLink = elements.find((el) => el.matches('.offers-page-link'))?.querySelector('a')?.href || '#';
    window.location.href = offersPageLink;
    return;
  }
  const response = await getLoanStatus(enquiryId);
  const jsonData = response.data;

  const loanHtmlResponse = generateLoanHtml(elements, jsonData);
  const loanHtml = loanHtmlResponse.htmlContent;
  // Update the loan HTML with sanitized content
  block.innerHTML = utility.sanitizeHtml(loanHtml);

  // Set journey type to either 'dealer' or 'customer'
  const journeyTypefunc = loanHtmlResponse.journeyType;

  // ---- Add JavaScript functionality here ----

  // Function to hide buttons specific to the customer journey
  function updateJourneyButtons() {
    if (journeyTypefunc === 'customer') {
    // Hide all dealer-specific buttons for the customer journey
      block.querySelector('.download_sanct').style.display = 'none'; // Hide "Download Sanction Letter"
      block.querySelector('.BackHome').style.display = 'none'; // Hide "Back to Dealer"
      block.querySelector('.BookDrive').style.display = 'none'; // Hide "Book a Test Drive"
      block.querySelector('.bookAmt').style.display = 'none'; // Hide "Pay Booking Amount"
    } else if (journeyTypefunc === 'dealer') {
      block.querySelector('.application-status-right').style.display = 'none'; // Show modify applicant button
    } else {
      block.querySelector('.application-status-right').style.display = 'block'; // Hide modify applicant button
    }
  }
  // Call the function to update buttons on page load
  updateJourneyButtons();

  // Feedback Response By deafault hide
  const feedbackField = block.querySelector('.nfFeedSmileyQues2');
  feedbackField.style.display = 'none';

  // Add event listener to the feedback link
  const feedbackLink = block.querySelector('.feedback a');
  feedbackLink.addEventListener('click', () => {
    document.querySelector('.nfFeedbackSmileyPopup').style.display = 'block';
  });

  // Feedback Functionality
  const emojisToShow = ['.smileySad', '.smileyNormal', '.smileyComfort'];
  const emojisToHide = ['.smileyHappy', '.smileyExellent'];

  emojisToShow.forEach((className) => {
    block.querySelector(className).addEventListener('click', () => {
      document.querySelector('.nfFeedSmileyQues2').style.display = 'block';
    });
  });

  emojisToHide.forEach((className) => {
    block.querySelector(className).addEventListener('click', () => {
      document.querySelector('.nfFeedSmileyQues2').style.display = 'none';
    });
  });

  // Select the popup container and the submit button
  const popup = document.querySelector('.nfFeedbackSmileyPopupMain');
  const submitButton = document.querySelector('.feedback_submit');

  // Add an event listener to the submit button
  submitButton.addEventListener('click', () => {
    // Optionally check if feedback is provided
    const feedback = document.querySelector('#message').value.trim();

    if (feedback.length === 0) {
      popup.style.display = 'none';
    } else {
      // Hide the popup
      popup.style.display = 'none';
    }
  });

  // Redirect to dealer dashboard when "Back to Dealer" is clicked (only for dealer journey)
  const backToDealerBtn = block.querySelector('.BackHome a');
  backToDealerBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = '/nexa-finance/nexafinance-dealer-dashboard';
  });

  // Modal-related elements and event listeners
  const customerWithdrawModal = document.querySelector('#nexa_finance_widthraw_confirm');
  const customerWithdrawGoBackBtn = document.querySelector('.withdrawJourney');
  const startNewJourneyModal = document.querySelector('#nexa_finance_loanexpire_confirm');
  const startNewJourneyBtn = document.querySelector('.startJourney');
  const finaliseLoanModal = document.querySelector('#nexa_finance-modal_finalize');
  const finaliseLoanBtn = document.querySelector('.final_loan_approval');
  const payBookingAmountModal = document.querySelector('#nexa_finance-booking');
  const payBookingAmountBtn = document.querySelector('.bookAmt');
  const viewDetailsBtn = document.querySelector('.v-details');
  const viewDetailsModal = document.querySelector('.loanOfferViewDetailPopupMain .loanOfferView2-popup');
  const viewModalCloseIcon = document.querySelector('.loanOfferViewDetailPopupMain .modal-content .closeIcon');
  const modifyApplicantDetailModal = document.querySelector('#modifyApllicantDetailModal');
  const modifyApplicantDetailsBtn = document.querySelector('.modify-applicant-details-link');
  const modalCloseIcon = document.querySelectorAll('.modal.popUpmain .close');
  const modalCancelButton = document.querySelectorAll('.modal.popUpmain .cancel-button');

  modifyApplicantDetailsBtn.addEventListener('click', () => {
    modifyApplicantDetailModal.style.display = 'block';
  });
  viewDetailsBtn?.addEventListener('click', () => {
    viewDetailsModal.style.display = 'block';
  });
  viewModalCloseIcon?.addEventListener('click', () => {
    viewDetailsModal.style.display = 'none';
  });
  customerWithdrawGoBackBtn?.addEventListener('click', () => {
    customerWithdrawModal.style.display = 'block';
  });
  startNewJourneyBtn?.addEventListener('click', () => {
    startNewJourneyModal.style.display = 'block';
  });
  finaliseLoanBtn?.addEventListener('click', () => {
    finaliseLoanModal.style.display = 'block';
  });
  payBookingAmountBtn?.addEventListener('click', () => {
    payBookingAmountModal.style.display = 'block';
  });

  // Close modals when clicking outside
  window.onclick = function handleModalClick(e) {
    if (e?.target.classList.contains('modal-dialog') || e?.target.classList.contains('modal')) {
      const clickedModal = e?.target?.closest('.modal.popUpmain');
      clickedModal.style.display = 'none';
    }
  };

  // Function to close pop-ups
  function closePopUp(elem) {
    elem.addEventListener('click', () => {
      const clickedModal = elem.closest('.modal.popUpmain');
      clickedModal.style.display = 'none';
    });
  }

  modalCloseIcon?.forEach((elem) => {
    closePopUp(elem);
  });
  modalCancelButton?.forEach((elem) => {
    closePopUp(elem);
  });

  document.querySelector('.yes-button').addEventListener('click', async () => {
    // Hide the current modal (if needed)
    document.querySelector('#nexa_finance_widthraw_confirm').style.display = 'none';
    if (jsonData.can_withdraw_application === false) {
      const requestBody = {
        enquiry_id: jsonData.enquiry_id,
        financier_id: jsonData.loan_status.financier_id,
        mobile: '6602910015',
        is_not_interested: true,
        status_id: jsonData.loan_status.loan_status_id,
        mssf_loan_reference_id: jsonData.mssf_loan_reference_id,
      };
      const goBackResponse = await loanStatusGoBack(requestBody, loanHtmlResponse.journeyType);
      if (goBackResponse.success) {
        window.location.href = loanHtmlResponse.offersPageLink;
      }
    }

    // Show the modal-withdraw modal
    document.querySelector('#withdrawModal').style.display = 'block';
  });

  const withdrawReason = document.getElementById('withdrow_reason');
  const withdrawComment = document.getElementById('withdrow_comment');

  // Hide the comment section initially
  withdrawComment.style.display = 'none';

  // Listen for changes on the dropdown
  withdrawReason.addEventListener('change', () => {
    if (withdrawReason.value === '530005') { // "Others" option
      withdrawComment.style.display = 'block';
    } else {
      withdrawComment.style.display = 'none';
    }
  });

  //   // Get modal and buttons
  const modal = document.getElementById('modifyApllicantDetailThankyouModal');
  const withdrawPop = document.getElementById('withdrawModal');
  const withdrawReasons = document.getElementById('withdrow_reason');
  const withdrawButton = document.getElementById('btn-withdrow-save');

  // Disable the Withdraw button initially
  withdrawButton.style.pointerEvents = 'none';
  withdrawButton.style.opacity = '0.5';

  // Enable the button when a reason is selected
  withdrawReasons.addEventListener('change', () => {
    if (withdrawReasons.value) {
      withdrawButton.style.pointerEvents = 'auto';
      withdrawButton.style.opacity = '1';
    } else {
      withdrawButton.style.pointerEvents = 'none';
      withdrawButton.style.opacity = '0.5';
    }
  });

  // Show modal when Withdraw button is clicked
  withdrawButton.addEventListener('click', async () => {
    if (withdrawReasons.value) {
      let comments = null;
      if (withdrawReason.value === '530005') {
        comments = document.getElementById('comments').value;
      }
      const requestBody = {
        enquiry_id: jsonData.enquiry_id,
        loan_application_id: jsonData.loan_application_id,
        financier_id: jsonData.loan_status.financier_id,
        los_id: jsonData.loan_application_id,
        withdrawn_reason: withdrawReasons.selectedOptions[0].text,
        withdrawn_reason_text: comments,
        status_id: jsonData.loan_status.loan_status_id,
        mssf_loan_reference_id: jsonData.mssf_loan_reference_id,
      };
      // add data from auth popup for dealer journey
      if (loanHtmlResponse.journeyType === 'dealer') {
        requestBody.otp = '1234';
        requestBody.otp_type = 'CUSTOMER_WITHDRAWN_CONSENT';
        requestBody.mobile = '9292929292';
      }
      const withdrawResponse = await withdrawnConsent(requestBody, loanHtmlResponse.journeyType);
      if (withdrawResponse.success) {
        modal.style.display = 'block'; // Show the modal
        withdrawPop.style.display = 'none';
      }
    }
  });

  // Close modal when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none'; // Hide the modal
    }
  });

  // Function to update the loan status and show/hide buttons accordingly
  function updateLoanStatus(currentStatus) {
    const statusSteps = document.querySelectorAll('.statuSteps .disbursh'); // Get all status steps
    const downloadSanctionLetter = document.querySelector('.download_sanct'); // Select the download button
    const goBackButton = document.querySelector('.withdrawJourney'); // Go Back button container

    // Hide the download button initially
    downloadSanctionLetter.style.display = 'none';

    goBackButton.style.display = 'none';

    // Reset all statuses to grey
    statusSteps.forEach((step) => {
      step.classList.add('grey');
      step.classList.remove('active');
    });

    // update status and show/hide elements based on status and journey type
    switch (currentStatus) {
      case 'APPLIED':
        statusSteps[0].classList.remove('grey');
        statusSteps[0].classList.add('active');

        goBackButton.style.display = 'block';

        break;

      case 'UNDER_PROCESS':
        statusSteps[0].classList.remove('grey');
        statusSteps[0].classList.add('active');
        statusSteps[1].classList.remove('grey');
        statusSteps[1].classList.add('active');

        goBackButton.style.display = 'block';

        break;

      case 'SANCTIONED':
        statusSteps[0].classList.remove('grey');
        statusSteps[0].classList.add('active');
        statusSteps[1].classList.remove('grey');
        statusSteps[1].classList.add('active');
        statusSteps[2].classList.remove('grey');
        statusSteps[2].classList.add('active');

        // Show the "Download Sanction Letter" button only for dealer journey
        if (journeyTypefunc === 'dealer') {
          downloadSanctionLetter.style.display = 'block';
        }

        // Hide the "Back to Dealer" button in sanctioned status
        backToDealerBtn.style.display = 'none';
        break;

      case 'DISBURSED':
        statusSteps.forEach((step) => step.classList.add('active'));

        // Show "Download Sanction Letter" button for dealer journey
        if (journeyTypefunc === 'dealer') {
          downloadSanctionLetter.style.display = 'block';
        }

        // Hide the "Back to Dealer" button
        backToDealerBtn.style.display = 'none';
        break;

      default:
        downloadSanctionLetter.style.display = 'none';
        break;
    }
  }
  updateLoanStatus(jsonData.loan_status.status);
  if (jsonData.loan_status?.loan_type === 'PRE_APPROVED' && jsonData.loan_status.financier_id === '280003') {
    const hdfcXpressURL = block.querySelector('.hdfc_xpress_URL');
    const redirectPopup = block.querySelector('#click_here_popup');
    hdfcXpressURL.addEventListener('click', () => {
      redirectPopup.style.display = 'flex';
      redirectPopup.classList.add('fade-in');
    });
    const closeClickHerePopup = block.querySelectorAll('#close_click_here, .cancel-redirect');
    closeClickHerePopup.forEach((closeButton) => {
      closeButton.addEventListener('click', () => {
        redirectPopup.style.display = 'none';
        redirectPopup.classList.remove('fade-in');
      });
    });
  }

  document.querySelector('#whiteButton-2').addEventListener('click', () => {
    document.getElementById('modifyApllicantDetailModal').style.display = 'none';
    document.querySelector('.col-md-6.mt-72').style.display = 'block';
    document.querySelector('.col-md-6.mt-72.text-right').style.display = 'block';
    document.querySelector('.applicant-edit').style.display = 'block';
    document.querySelector('#whiteButton-1').style.display = 'block';
    document.querySelector('.is-edit-block[data-id="applicant-step2"]').style.display = 'none';
  });
  document.querySelector('#whiteButton-1').addEventListener('click', () => {
    document.getElementById('modifyApllicantDetailModal').style.display = 'none';
  });

  // ----------edit loan application pop-up js functionality -------//

  document.querySelector('.applicant-edit').addEventListener('click', () => {
    document.querySelector('.col-md-6.mt-72').style.display = 'none';
    document.querySelector('.col-md-6.mt-72.text-right').style.display = 'none';
    document.querySelector('.applicant-edit').style.display = 'none';
    document.querySelector('#whiteButton-1').style.display = 'none';

    document.querySelector('.is-edit-block[data-id="applicant-step2"]').style.display = 'block';
  });
  if (jsonData.loan_status && jsonData.loan_status?.dob
     && jsonData.loan_status?.bankApplicantName) {
    const { bankApplicantName, dob } = jsonData.loan_status;
    document.getElementById('user_full_name_filed').value = `${bankApplicantName}`;
    document.getElementById('user_dob').value = `${dob}`;
    document.getElementById('user-full-name-out').textContent = `${bankApplicantName}`;
  }
  document.querySelector('.modify-btn-next').addEventListener('click', async () => {
    const firstName = document.querySelector('input[name="first_name"]').value.trim();
    const middleName = document.querySelector('input[name="middle_name"]').value.trim();
    const lastName = document.querySelector('input[name="last_name"]').value.trim();
    const firstNameInput = document.querySelector('input[name="first_name"]');
    const middleNameInput = document.querySelector('input[name="middle_name"]');
    const lastNameInput = document.querySelector('input[name="last_name"]');
    const confirmCheckbox = document.getElementById('defaultCheck1');
    const confirmLabel = document.getElementById('checkboxLabel');
    const firstNameValuerror = document.getElementById('downpayment-error');

    firstNameValuerror.style.display = 'none';
    confirmLabel.classList.remove('invalid-feedback');
    confirmLabel.classList.add('valid-feedback');
    confirmLabel.style.color = '';

    let isValid = true;

    if (firstName === '') {
      firstNameValuerror.style.display = 'block';
      isValid = false;
    } else {
      firstNameValuerror.style.display = 'none';
    }

    if (!confirmCheckbox.checked) {
      confirmLabel.classList.remove('invalid-feedback');
      confirmLabel.style.color = 'var(--tertiary-red)';
      isValid = false;
    } else {
      confirmLabel.classList.add('valid-feedback');
      confirmLabel.style.color = 'var(--tertiary-green)';
    }

    let timeLeft = 300;
    const timerElement = document.querySelector('.full_name_timer');
    const countdownTimer = setInterval(() => {
      timerElement.textContent = `${timeLeft}`;
      timeLeft -= 1;
      if (timeLeft < 0) {
        clearInterval(countdownTimer);
        timerElement.textContent = '$0';
      }
    }, 1000);

    if (isValid) {
      firstNameInput.disabled = true;
      middleNameInput.disabled = true;
      lastNameInput.disabled = true;
      document.querySelector('.form-check').style.display = 'none';
      document.querySelector('.col-md-12.text-right.modify-button').style.display = 'none';
      document.querySelector('#modal-modify-title-2').style.display = 'none';
      document.querySelector('#modal-modify-title-3').style.display = 'block';

      document.querySelector('.is-verified').style.display = 'block';
      document.querySelector('input[name="first_name"]').value = firstName;
      document.getElementById('middle-name-updated').value = document.querySelector('input[name="middle_name"]').value.trim();
      document.getElementById('last-name-updated').value = document.querySelector('input[name="last_name"]').value.trim();

      sessionStorage.setItem('firstName', firstName);
      const body = {
        enquiry_id: jsonData.enquiry_id,
        financier_id: jsonData.loan_status.financier_id,
        loan_application_id: jsonData.loan_application_id,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        mr_first_name: firstNameInput,
        mr_middle_name: middleNameInput,
        mr_last_name: lastNameInput,
        loan_status: jsonData.loan_status.loan_status_id,
      };

      try {
        const result = await saveMrLoanApplication(body);

        if (result.success) {
        // UI updates for successful API call
          document.querySelector('input[name="first_name"]').disabled = true;
          document.querySelector('input[name="middle_name"]').disabled = true;
          document.querySelector('input[name="last_name"]').disabled = true;
          document.querySelector('.form-check').style.display = 'none';
          document.querySelector('.col-md-12.text-right.modify-button').style.display = 'none';
          document.querySelector('#modal-modify-title-2').style.display = 'none';
          document.querySelector('#modal-modify-title-3').style.display = 'block';
          document.querySelector('.is-verified').style.display = 'block';
        } else {
        // Throw an error if API call fails
          throw new Error(result.message || 'Failed to save MR loan application.');
        }
      } catch (error) {
      // Throw error for any issue (API failure or unexpected)
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    } else {
    // If form validation fails, throw an error
      throw new Error('Validation failed. Please check the form and try again.');
    }
  });

  document.querySelector('.modify-btn-submit').addEventListener('click', async () => {
    const firstNameValue = document.querySelector('input[name="first_name"]').value.trim();
    const middleNameValue = document.querySelector('input[name="middle_name"]').value.trim();
    const lastNameValue = document.querySelector('input[name="last_name"]').value.trim();
    window.correctOtp = '1111';
    const otpField = document.querySelector('input[name="otp"]');
    const enteredOtp = otpField.value.trim();

    if (enteredOtp === window.correctOtp) {
      const firstNameInputValue = document.querySelector('input[name="first_name"]');
      const middleNameInputeValue = document.querySelector('input[name="middle_name"]');
      const lastNameInputValue = document.querySelector('input[name="last_name"]');
      firstNameInputValue.disabled = false;
      middleNameInputeValue.disabled = false;
      lastNameInputValue.disabled = false;

      const fullName = `${firstNameValue} ${document.querySelector('input[name="middle_name"]').value.trim()} ${document.querySelector('input[name="last_name"]').value.trim()}`.trim();
      jsonData.loan_status.bankApplicantName = fullName;

      document.getElementById('user_full_name_filed').value = fullName;
      document.getElementById('user-full-name-out').textContent = fullName;

      const body = {
        enquiry_id: jsonData.enquiry_id,
        financier_id: jsonData.loan_status.financier_id,
        loan_application_id: jsonData.loan_application_id,
        first_name: firstNameValue,
        middle_name: middleNameValue,
        last_name: lastNameValue,
        mr_first_name: firstNameInputValue,
        mr_middle_name: middleNameInputeValue,
        mr_last_name: lastNameInputValue,
        mobile: jsonData.loan_status.mobile_number,
        otp: enteredOtp,
        otp_type: 'MR_CONSENT',
        loan_status: jsonData.loan_status.loan_status_id,
      };
      try {
        const result = await consentMrLoanApplication(body);

        if (result.success) {
          document.getElementById('modifyApllicantDetailModal').style.display = 'none';
          document.getElementById('modifyApllicantDetailThankyouModal').style.display = 'flex';
          document.querySelector('.col-md-6.mt-72').style.display = 'block';
          document.querySelector('.applicant-edit').style.display = 'block';
          document.querySelector('#whiteButton-1').style.display = 'block';
          document.querySelector('.form-check').style.display = 'block';
          document.querySelector('.col-md-12.text-right.modify-button').style.display = 'block';
          document.querySelector('.is-edit-block[data-id="applicant-step2"]').style.display = 'none';
          document.querySelector('[data-id="applicant-step3"]').style.display = 'none';
        } else {
          throw new Error(result.message || 'Failed to submit the loan application.');
        }
      } catch (error) {
        throw new Error(error.message || 'An unexpected error occurred.');
      }
    } else {
      try {
        document.getElementById('amt_error_popup').style.display = 'flex';
        document.getElementById('close-popup-btn').addEventListener('click', () => {
          document.getElementById('amt_error_popup').style.display = 'none';
        });
        document.getElementById('close-amt-error-popup').addEventListener('click', () => {
          document.getElementById('amt_error_popup').style.display = 'none';
        });
      } catch (error) {
        throw new Error('Failed to display OTP error popup.');
      }
    }
  });

  document.querySelector('.modify-btn-back').addEventListener('click', () => {
    const firstNameInputt = document.querySelector('input[name="first_name"]');
    const middleNameInputt = document.querySelector('input[name="middle_name"]');
    const lastNameInputt = document.querySelector('input[name="last_name"]');
    firstNameInputt.disabled = false;
    middleNameInputt.disabled = false;
    lastNameInputt.disabled = false;
    document.querySelector('.is-verified').style.display = 'none';
    document.querySelector('.form-check').style.display = 'block';
    document.querySelector('.col-md-12.text-right.modify-button').style.display = 'block';
    document.querySelector('#modal-modify-title-2').style.display = 'block';
    document.querySelector('#modal-modify-title-3').style.display = 'none';
  });

  document.getElementById('defaultCheck1').addEventListener('change', function confirming() {
    const confirmLabel = document.getElementById('checkboxLabel');
    if (this.checked) {
      confirmLabel.classList.add('valid-feedback');
      confirmLabel.classList.remove('invalid-feedback');
      confirmLabel.style.color = 'var(--tertiary-green)';
    } else {
      confirmLabel.classList.add('invalid-feedback');
      confirmLabel.classList.remove('valid-feedback');
      confirmLabel.style.color = 'var(--tertiary-red)';
    }
  });
}
