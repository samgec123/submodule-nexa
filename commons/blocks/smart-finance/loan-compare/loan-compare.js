import utility from '../../../utility/utility.js';
import { selectedLoanOffer } from '../../../utility/smart-finance/sfLoanUtils.js';

export default async function decorate(block) {
  const getFieldData = (element) => element?.textContent?.trim() || '';

  const innerDiv = block.children[0].children[0];
  const [
    titleEl,
    maximumEl,
    actualEl,
    interestEl,
    payableEl,
    emiEl,
    processingEl,
    prevEl,
    applyEl,
    backLinkEl,
    loanAppLinkEl,
  ] = innerDiv.children;

  const title = titleEl?.textContent?.trim();
  const maximum = getFieldData(maximumEl);
  const actual = getFieldData(actualEl);
  const interest = getFieldData(interestEl);
  const payable = getFieldData(payableEl);
  const emi = getFieldData(emiEl);
  const processing = getFieldData(processingEl);
  const prev = getFieldData(prevEl);
  const apply = getFieldData(applyEl);
  const backLink = backLinkEl?.querySelector('a')?.href || '#';
  const loanAppLink = loanAppLinkEl?.querySelector('a')?.href || '#';

  const htmlContent = `
<div class="container">
    <div class="nfLeftRightInner">
        <div class="row">

            <section class="compareLoanOfferPage">
                <div class="">
                    <div class="pageTitle">
                        <h2>${title}</h2>
                    </div>
                    <div class="compareLoanTable">
                        <ul>
                            <li class="compare_logo">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div class="hide-row"></div>
                            </li>
                            <li class="compare_Maximum_amount">
                                <div>${maximum}</div>
                                <div>₹ 6 48 095</div>
                                <div>₹ 6 33 369</div>
                                <div class="hide-row">₹ 6 33 369</div>
                            </li>
                            <li class="compare_Actual_amount">
                                <div>${actual}</div>
                                <div>₹ 6 48 095</div>
                                <div>₹ 6 33 369</div>
                                <div class="hide-row">₹ 6 33 369</div>
                            </li>
                            <li class="compare_Interest_Rate">
                                <div>${interest}</div>
                                <div>8.8% <small>Fixed</small></div>
                                <div>9.4% <small>Fixed</small></div>
                                <div class="hide-row">9.4% <small>Fixed</small></div>
                            </li>
                            <li class="compare_Interest_amount">
                                <div>${payable}</div>
                                <div>₹ 1 55 365</div>
                                <div>₹ 1 62 891</div>
                                <div class="hide-row">₹ 1 62 891</div>
                            </li>
                            <li class="compare_EMI_amount">
                                <div>${emi}</div>
                                <div>₹ 13 391</div>
                                <div>₹ 13 271</div>
                                <div class="hide-row">₹ 13 271</div>
                            </li>
                            <li class="compare_Processing_amount_title">
                                <strong>${processing}</strong>
                            </li>
                            <li class="compare_Processing_amount">
                                <div class="processFee"></div>
                                <div>₹ 0</div>
                                <div>₹ 4129</div>
                                <div class="hide-row">₹ 4129</div>
                            </li>
                            <li class="btns compare_select">
                                <div class="blackButton">
                                    <a id="loan_validation_btn">${prev}</a>
                                </div>
                                <div class="blackButton comp_apply_loan" id="info-btn"><a
                                        href="javascript:void(0)">${apply}</a></div>
                                <div class="blackButton comp_apply_loan" id="view-ballon-details"><a
                                        href="javascript:void(0)">${apply}</a></div>
                                <div class="blackButton comp_apply_loan hide-row" id="view-details-btn"><a
                                        href="javascript:void(0)">${apply}</a></div>
                            </li>
                        </ul>
                        <div class="mobileBtn">
                            <div class="whiteButton">
                                <a></a>
                            </div>
                            <div class="blackButton mobile_apply_loan" id="mobile-view-details"><a
                                    href="javascript:void(0)">Apply For
                                    Loan</a></div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    </div>
</div>
<div class="popUpmain" id="loan_validation_popup">
    <div class="modal-content">
        <div class="close" id="close-loan-popup">
        </div>
        <div class="popupContent blue">
            <h2><span class="info-icon"></span>Information</h2>
            <p>Loan amount can not be less than ₹100000 or greater than ₹ 671081</p>
            <div class="btn-container">
                <div class="blackButton"><button type="button">OK</button></div>
                <div>
                </div>
            </div>

        </div>
    </div>
</div>
    `;

  // Injecting the rendered HTML into the block element
  block.innerHTML = utility.sanitizeHtml(htmlContent);

  // -------- Load and Populate Offers from LocalStorage -----------------------

  // Retrieve stored offers from localStorage

  let storedOffers = localStorage.getItem('selectedOffers');

  if (storedOffers) {
    storedOffers = JSON.parse(storedOffers);

    if (storedOffers.length === 2) {
      document.querySelectorAll('.hide-row').forEach((ele, i) => { // eslint-disable-line no-unused-vars
        ele.style = 'display:none';
      });
    }

    const offersToCompare = storedOffers.slice(0, 3);

    offersToCompare.forEach((offer, index) => {
      // Populating the loan comparison table dynamically
      const logoEl = block.querySelectorAll(`.compare_logo div:nth-child(${index + 2})`)[0];
      const maxAmountEl = block.querySelectorAll(`.compare_Maximum_amount div:nth-child(${index + 2})`)[0];
      const actualAmountEl = block.querySelectorAll(`.compare_Actual_amount div:nth-child(${index + 2})`)[0];
      const interestRateEl = block.querySelectorAll(`.compare_Interest_Rate div:nth-child(${index + 2})`)[0];
      const interestAmountEl = block.querySelectorAll(`.compare_Interest_amount div:nth-child(${index + 2})`)[0];
      const emiEle = block.querySelectorAll(`.compare_EMI_amount div:nth-child(${index + 2})`)[0];
      const processingFeeEl = block.querySelectorAll(`.compare_Processing_amount div:nth-child(${index + 2})`)[0];

      if (logoEl) logoEl.innerHTML = `<img src="${offer.financier_logo}" alt="${offer.financier}">`;
      if (maxAmountEl) maxAmountEl.textContent = `₹ ${offer.max_loan}`;
      if (actualAmountEl) actualAmountEl.textContent = `₹ ${offer.bank_offer_amount}`;
      if (interestRateEl) interestRateEl.innerHTML = `${offer.interest_rate}% <small>${offer.interest_type}</small>`;
      if (interestAmountEl) interestAmountEl.textContent = `₹ ${offer.interest_amount_payable}`;
      if (emiEle) emiEle.textContent = `₹ ${offer.est_emi}`;
      if (processingFeeEl) processingFeeEl.textContent = offer.processing_fee;
    });
  } else {
    // Do nothing
  }

  // -------------------------back-button js functionality  -------------------

  const loanButtons = document.querySelectorAll('.comp_apply_loan');
  loanButtons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      const offersToCompare = storedOffers.slice(0, 3);
      const requestBody = {
        enquiry_id: sessionStorage.getItem('enquiryId'),
        mobile: sessionStorage.getItem('mobile'),
        financier_id: offersToCompare[index].financier_id,
        financier_name: offersToCompare[index].financier_name,
        loan_type: offersToCompare[index].loan_type,
        interest_rate: offersToCompare[index].interest_rate,
        tenure: offersToCompare[index].tenure,
        down_payment: offersToCompare[index].down_payment,
        interest_rate_type: offersToCompare[index].interest_type || '',
        loan_amount: offersToCompare[index].bank_offer_amount || '',
        max_loan_amount: offersToCompare[index].max_loan || '',
        emi: offersToCompare[index].est_emi || '',
        processing_fee: offersToCompare[index].processing_fee || '',
        ltv: offersToCompare[index].ltv || '',
        processing_fee_display: offersToCompare[index].processing_fee_display || '',
        ltv_based_on: offersToCompare[index].ltv_based_on || '',
        component_ltv_amount: offersToCompare[index].component_ltv_amount || '',
        employment_type: sessionStorage.getItem('employmentTypeId'),
        branch_code: offersToCompare[index].branch_code || '',
        branch_name: offersToCompare[index].branch_name || '',
        sales_promo_code: offersToCompare[index].sales_promo_code || '',
        credit_promo_code: offersToCompare[index].credit_promo_code || '',
      };
      const selectLoanResponse = await selectedLoanOffer(requestBody);
      sessionStorage.setItem('financier_id', offersToCompare[index].financier_id);
      if (selectLoanResponse.success) {
        window.location.href = loanAppLink;
      }
    });
  });

  document.getElementById('loan_validation_btn').addEventListener('click', () => {
    localStorage.removeItem('selectedOffers');
    window.location.href = backLink;
  });
}
