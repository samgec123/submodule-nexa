/* eslint-disable object-curly-newline */
/* eslint-disable import/no-unresolved */
import { html } from '../../../scripts/vendor/htm-preact.js';
import { useContext, useState, useEffect } from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext } from './multi-step-form.js';
import utility from '../../../utility/utility.js';

function FinalizeLoan({ config }) {
  const {
    finalizeLoanLabel,
    discTitle,
    disList,
    disDescription } = config;

  const { handleSetActiveRoute, bankResponse } = useContext(MultiStepFormContext);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const formValue = await utility.fetchFormSf();
        setFormData(formValue);
      } catch (error) {
        // do nothing
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return 'Loading...';
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    try {
      if (bankResponse.financier_id === '280003' && bankResponse.preapproved) {
        handleSetActiveRoute('applicant-details-step');
      } else {
        handleSetActiveRoute('upload-documents-step');
      }
    } catch (error) {
      // do nothing
    }
  };

  const [loanData, setLoanData] = useState(null);
  // Simulating a fetch call using useEffect to load jsonData
  /* eslint-disable no-multi-str */
  useEffect(() => {
    // Mock fetching jsonData
    const jsonData = {
      preLoan: [
        {
          loan_offer_id: '1',
          'loan-amount': '350000',
          interest_rate: '8.50',
          down_payment: '750000',
          est_emi: '7500',
          processing_fee: '₹ 4500',
          tenure: 7,
          financier: 'HDFC Bank',
          max_loan: '766189',
          max_down_payment: '768621',
          LastMontEmi: '10%',
          financier_logo: 'https://cdn.brandfetch.io/hdfc.com/w/512/h/101/logo',
          LoanDetails: '<div class="nfLoanDetailGreyBox">\
            <div class="nfLoanDetailElement">\
                <div class="nfLoanDetailtitle">Positive/Unique Feature</div>\
                <div class="nfLoanDetailpointer">\
                    <ul>\
                        <li><span style="color: #444444;">Car loan solutions customized as per your need</span></li>\
                        <li><span style="color: #444444;">Funding up to 7 years & 100% of Ex-showroom price OR 90% of on-road price.</span></li>\
                        <li><span style="color: #444444;">Pre-Approved loan for Insurance, Extended Warranty & Genuine Accessories</span></li>\
                        <li><span style="color: #444444;">Planned & Flexible EMI Outflow</span></li>\
                        <li><span style="color: #444444;">Car finance for all customer profiles</span></li>\
                        <li><span style="color: #444444;">Quick & Hassle-Free Process</span></li>\
                    </ul>\
                </div>\
            </div>\
            <div class="nfLoanDetailElement">\
                <div class="nfLoanDetailtitle">Eligibility</div>\
                <div class="nfLoanDetailpointer">\
                    <span style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">\
                        The following individuals are eligible to apply for a New Car Loan:\
                    </span>\
                    <ul>\
                        <li><span style="color: #444444;">Salaried Individuals: Employees working for Private Sector, Public Sector, and MNCs</span></li>\
                        <li><span style="color: #444444;">Self Employed (With ITR): 1) Business Individuals 2) Professionals 3) Others as applicable</span></li>\
                        <li><span style="color: #444444;">Minimum age of Applicant: 21 years</span></li>\
                        <li><span style="color: #444444;">Maximum age of Applicant at loan maturity: Up to 65 years</span></li>\
                    </ul>\
                </div>\
            </div>\
            <div class="nfLoanDetailElement">\
                <div class="nfLoanDetailtitle">Documents</div>\
                <div class="nfLoanDetailpointer">\
                    <span style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">Salaried Individuals</span>\
                    <ul>\
                        <li>Identity Proof: Pan, Passport, Aadhaar, Voters ID, Driving License (Any One)</li>\
                        <li>Address proof: Passport, Aadhaar, Voters ID, Driving License, Electricity Bill, NREGA Card (Any One)</li>\
                        <li>Income Proof: Latest 3-month salary slip & last 2 years Form 16/ITR</li>\
                        <li>Bank Statement of the last 3 months</li>\
                    </ul>\
                    <span style="font-size: 12px; font-weight: 500; margin-bottom: 10px; float: left; width: 100%; color: #777777;">Self Employed</span>\
                    <ul>\
                        <li>Proof of Identity: Passport copy, PAN Card, Voters Id Card, Driving license, Aadhar Card (Any One)</li>\
                        <li>Income Proof: Latest 2 years ITR, Bank Statement & Audited Financials as applicable</li>\
                        <li>Address Proof: Driving license, Voters Card, Passport copy, Telephone bill, Electricity bill, Aadhaar, Establishment Certificate, Residence Ownership proof (Any One)</li>\
                        <li>Documents required may vary as per customer profile</li>\
                    </ul>\
                </div>\
            </div>\
            <div class="nfLoanDetailElement">\
                <div class="nfLoanDetailtitle">Fees & Penalties</div>\
                <div class="nfLoanDetailpointer">\
                    <ul>\
                        <li><span style="color: #444444;">Documentation Charges: Nil</span></li>\
                        <li><span style="color: #444444;">Foreclosure Charges: Nil</span></li>\
                        <li><span style="color: #444444;">Stamp Duty Charges (Non-Refundable): As per applicable State Guidelines</span></li>\
                        <li><span style="color: #444444;">Processing Fees: @ 0.25% of loan amount, Minimum - &#8377. 1,000/- Maximum- &#8377. 1,500/- + Taxes</span></li>\
                        <li><span style="color: #444444;">Late Payment Charges: 2% per month on default/irregular amount</span></li>\
                    </ul>\
                </div>\
            </div>\
        </div>',
        },
      ],
    };

    // Simulate data loading
    setLoanData(jsonData.preLoan[0]);
  }, []); // Empty dependency array to run once on mount

  // useffect hook for loan Offer data
  const [loanOfferData, setLoanOfferData] = useState(null);
  useEffect(() => {
  // Simulate fetching loan offer data
    const fetchedLoanOfferData = {
      status: 'success',
      message: 'loan detail fetched successfully',
      offer_response: {
        dealer_discount: 0,
        loan_type: 'CUSTOM',
        loan_amount: '13 90 942',
        tenure: '5',
        interest_rate: '11.74',
        down_payment: '2 40 009',
        current_emi: null,
        estimated_emi: '20 565',
        processing_fee: '1',
        processing_fee_display: '1 %',
        ltv: null,
        financier_id: '280006',
        bank_name: 'AU Bank',
        bank_other_info: {},
        scheme_detail: null,
      },
    };

    // Set the fetched data to state
    setLoanOfferData(fetchedLoanOfferData.offer_response);
  }, []); // You can modify the empty dependency array to re-fetch if necessary

  const showPopupListener = (elementId) => {
    const element = document.querySelector(elementId);
    if (element) {
      element.addEventListener('click', () => {
        const viewDetailsModal = document.querySelector('.loanOfferViewDetailPopupMain .loanOfferView2-popup');
        const FinalModal = document.querySelector('.modal.submit-loan-confirm-popup');
        if (elementId === '.openDetailsModal') {
          viewDetailsModal.style.display = 'block';
        } else if (elementId === '.closeIcon') {
          viewDetailsModal.style.display = 'none';
        } else if (elementId === '.final_loan') {
          FinalModal.style.display = 'block';
        } else if (elementId === '.finalCloseButton') {
          FinalModal.style.display = 'none';
        } else if (elementId === '.submit-loan-button') {
          FinalModal.style.display = 'none';
        } else if (elementId === '.cancel-button') {
          FinalModal.style.display = 'none';
        }
      });
    }
  };

  // Add click listeners for all relevant textareas
  useEffect(() => {
    showPopupListener('.openDetailsModal');
    showPopupListener('.closeIcon');
    showPopupListener('.final_loan');
    showPopupListener('.finalCloseButton');
    showPopupListener('.submit-loan-button');
    showPopupListener('.cancel-button');
  }, []);

  useEffect(() => {
    const loan = loanData?.LoanDetails;
    const viewDetailsContent = document.querySelector('.view-details-content');
    if (loan) {
      // Clear existing content
      viewDetailsContent.innerHTML = '';
      // Insert the details of the selected loan
      const detailsElement = document.createElement('div');
      detailsElement.innerHTML = loan;
      viewDetailsContent.appendChild(detailsElement);
    }
  }, [loanData]);

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
          <li class="active">
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
      <form action="" class="form_financeloan">
          <div class="employerFormBox" id="step4" style="display: block;">
              <div class="finalLoanSec">
                  <div class="title">
                      <h6>${finalizeLoanLabel}</h6>
                  </div>

                  <div class="finalLoanWrap">
                      <div class="bankLogo">
                          <img src=${loanData ? loanData.financier_logo : 'Loading...'} alt="financier_logo" />

                          <a href="javascript:void(0);" class="openDetailsModal">
                          ${formData?.viewDetail}
                          </a>
                      </div>
                      <ul>
                          <li>
                              <div>${formData?.loanAmount}</div>
                              <div>₹ ${loanOfferData ? loanOfferData.loan_amount : 'Loading...'}</div>

                          </li>
                          <li>
                              <div>${formData?.interestRate}</div>
                              <div>${loanOfferData ? loanOfferData.interest_rate : 'Loading...'} %</div>
                          </li>
                          <li>
                              <div>${formData?.minDownpayment}</div>
                              <div>₹ ${loanOfferData ? loanOfferData.down_payment : 'Loading...'}</div>
                          </li>
                          <li class="processing-fee" >
                              <div>${formData?.processingFee} </div>
                              <div>₹ ${loanOfferData ? loanOfferData.processing_fee : 'Loading...'}
                              <span>${formData?.processingFee}</span></div>
                          </li>
                          <li>
                              <div>${formData?.tenure}</div>
                              <div>${loanOfferData ? loanOfferData.tenure : 'Loading...'} Years</div>
                          </li>
                          <li>
                              <div>${formData?.estimatedEmi}</div>
                              <div>₹ ${loanOfferData ? loanOfferData.estimated_emi : 'Loading...'}</div>
                          </li>

                          <li style="display:none">
                              <div>${formData?.dealerDiscount}</div>
                              <div>
                                  <a class="addRemoveDis2" href="javascript:void(0)">
                                      <span class="add2 active">
                                      ${formData?.addDiscount}
                                      </span>
                                      <span class="remove2">
                                      ${formData?.removeDiscount}
                                      </span>
                                  </a>
                                  <text></text>
                              </div>
                          </li>
                      </ul>
                  </div>
                  <div class="psDiscTxtContainer">

                      <div class="employerBtn">
                          <div class="linkBtn">
                              <div class="blackButton">
                                  <a href="javascript:void(0);" class="btn1" onClick=${handleOnSubmit}>${formData?.back}</a>
                              </div>
                              <div class="blackButton">
                                  <a href="javascript:void(0);" class="btn1 final_loan">${formData?.submitLoanApplication}</a>
                              </div>
                          </div>
                      </div>
                      <div class="psDiscTxt">
                          <div class="disclaimerContainer">
                              <a href="#">
                                 ${discTitle.props.children[0]}
                                  <small class="active"></small>
                              </a>
                          </div>
                         ${disDescription}
                         ${disList}
                      </div>
                  </div>
              </div>
              <div class="loanOfferViewDetailPopupMain">
                  <div class="modal loanOfferView2-popup popUpmain fade-in fade" tabindex="-1"
                      aria-labelledby="myLargeModalLabel" style="display: none;" aria-hidden="true">
                      <div class="modal-content modal-dialog modal-lg modal-dialog-centered">
                          <div class="popupContainer_fmp" style="height:100%">
                              <div class="closeIcon" aria-label="Close">
                              </div>
                              <div class="nfLoanDetailGreyBox view-details-content">
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
              <div class="modal fade nexa_finance-modal userloginpopup popUpmain submit-loan-confirm-popup" tabindex="-1" role="dialog"
              aria-labelledby="myLargeModalLabel" aria-hidden="true" style="display: none;">
              <div class="modal-dialog modal-dialog-centered loginmodal">
                  <div class="modal-content">
                      <button type="button" class="close finalCloseButton" aria-label="Close">
                          <span aria-hidden="true">x</span>
                      </button>
                      <div class="loginBoxContainer">
                          <div class="loginSignUpBox">
                              <div class="loginLeftBox">
                                  <div class="clearfix"></div>
                                  <div class="row nf-mobile-box">
                                      <div class="title">
                                          <h2>${formData?.marutiSuzukiSmartFinance}</h2>
                                      </div>
                                      <p>${formData?.aboutToSubmit}</p>
                                      <div class="col-sm-12 form-group">
                                          <button type="button" class="sub-btn submit-loan-button">${formData?.yes}</button>
                                          <button onclick="" type="button"
                                              class="sub-btn cancel-button">${formData?.no}</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          </div>
      </form>
  </div>
</section>
<div class="nfSubmitAppPopupMain">
  <div class="modal fade nfSubmitApplicationPopup popUpmain" tabindex="-1"
      role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" id="submit-loan-application-modal">
      <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
              <button type="button" class="close closeIcon" data-dismiss="modal">
              </button>
              <div class="nfSubmitAppPopupContent">
                  <p>${formData?.thanksForSubmitting}</p>
                  <div class="nfSubAppLoader"><div class="progress-bar-img" ></div></div>
                  <p>${formData?.yourNextSteps}</p>
                  <div class="nfSubmitAppStatusMain">
                      <div class="nfSubmitAppStatusLine">
                          <ul class="nfstatusLevel">
                              <li class="active">
                                  <label>
                                      <div class="nfPopupStepIcon green-tick"></div>
                                      <div class="nfPopupStepIcon grey-cross"></div>
                                  </label>
                                  <span>${formData?.applied}</span>
                              </li>
                              <li class="active">
                                  <label>
                                      <div class="nfPopupStepIcon green-tick"></div>
                                      <div class="nfPopupStepIcon grey-cross"></div>
                                  </label>
                                  <span>${formData?.underProcess}</span>
                              </li>
                              <li class="">
                                  <label>
                                      <div class="nfPopupStepIcon green-tick"></div>
                                      <div class="nfPopupStepIcon grey-cross"></div>
                                  </label>
                                  <span>${formData?.sanctioned}</span>
                              </li>
                              <li class="">
                                  <label>
                                      <div class="nfPopupStepIcon green-tick"></div>
                                      <div class="nfPopupStepIcon grey-cross"></div>
                                  </label>
                                  <span>${formData?.disbursed}</span>
                              </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
    `;
}
FinalizeLoan.parse = (block) => {
  const innerDiv = block.children[0].children[0];
  const [
    finalizeLoanLabel,
    discTitle,
    disList,
  ] = innerDiv.children;

  const disDescription = block.children[1].children[0];

  return {
    finalizeLoanLabel,
    discTitle,
    disList,
    disDescription,
  };
};

FinalizeLoan.defaults = {
  finalizeLoanLabel: html`Loan Application`,
};

export default FinalizeLoan;
