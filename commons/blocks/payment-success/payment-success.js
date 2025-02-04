import {
  getEbookUserSession,
  getBookingDataFromId,
  formatRupeesWithSymbol,
} from '../../utility/apiUtils.js';
import { getLocalStorage } from '../../utility/localStorage.js';
import environmentSelection from '../../utility/domainUtils.js';
import utility from '../../../utility/utility.js';
import analytics from '../../../utility/analytics.js';

export default function decorate(block) {
  // Filter out columns that contain paragraphs
  // eslint-disable-next-line max-len
  const [bookingHeadingWrapper,
    vehicleHeadingWrapper,
    dealerShipHeadingWrapper,
    navigateWrapper,
    billingContainer,
    congratsContainer,
    requestRecievedContainer,
    bookingConfirmedContainer,
    cancelBookingContainer,
    bookingRecieptContainer,
    orderDetailsContainer,
    paymentContainer,
    bookingAmountContainer,
    cancellationContainer,
    unlockContainer,
    exshowRoomContainer,
    downloadContainer,
    cancelBookingImageContainer,
    cancelBookingStepOneContainer,
    cancelBookingStepOneDescription,
    stepTwoContainer,
    stepThreeContainer,
    stepFourContainer,
    cancellationChargeContainer,
  ] = [...block.children];
  const [billingHeadingWrapper] = [...billingContainer.children];
  const [congratsWrapper] = [...congratsContainer.children];
  const [requestRecievedWrapper] = [...requestRecievedContainer.children];
  const [bookingConfirmedWrapper] = [...bookingConfirmedContainer.children];
  const [unlockWrapper] = [...unlockContainer.children];
  const [orderDetailsWrapper] = [...orderDetailsContainer.children];
  const [paymentWrapper] = [...paymentContainer.children];
  const [cancelBookingWrapper] = [...cancelBookingStepOneContainer.children];
  const [stepTwoWrapper] = [...stepTwoContainer.children];
  const [stepThreeWrapper] = [...stepThreeContainer.children];
  const [stepFourWrapper] = [...stepFourContainer.children];
  // eslint-disable-next-line max-len
  const [billingHeading, billingName, billingPhone, billingEmail, billingAddress] = billingHeadingWrapper.children;
  const [congratsHeading, congratsDescription] = congratsWrapper.children;
  const bookingLabel = bookingHeadingWrapper?.firstElementChild?.textContent;
  const vehicleLabel = vehicleHeadingWrapper?.firstElementChild?.textContent;
  const dealerShipLabel = dealerShipHeadingWrapper?.firstElementChild?.textContent;
  const navigateText = navigateWrapper?.firstElementChild?.textContent;
  const cancelBookingLabel = cancelBookingContainer?.firstElementChild?.textContent;
  const bookingRecieptLabel = bookingRecieptContainer?.firstElementChild?.textContent;
  const bookingAmountLabel = bookingAmountContainer?.firstElementChild?.textContent;
  const cancellationLabel = cancellationContainer?.firstElementChild?.textContent;
  const exshowroomLabel = exshowRoomContainer?.firstElementChild?.textContent;
  const downloadLabel = downloadContainer?.firstElementChild?.textContent;
  const stepOneDescription = cancelBookingStepOneDescription?.innerHTML;
  const [requestRecievedHeading, requestRecievedDescription] = requestRecievedWrapper.children;
  const [bookingConfirmedHeading, bookingConfirmedDescription] = bookingConfirmedWrapper.children;
  const cancelImageBooking = cancelBookingImageContainer.firstElementChild;
  const cancellationCharge = cancellationChargeContainer.firstElementChild;
  // eslint-disable-next-line max-len
  const [stepOneCounter, stepOneHeading, stepOneCancel, stepOneKeep, stepOneInformation, stepOnePhone, stepOneWhatsapp] = cancelBookingWrapper.children;
  const [stepTwoCounter, stepTwoHeading, stepTwoSkip, stepTwoSubmit] = stepTwoWrapper.children;
  // eslint-disable-next-line max-len
  const [stepThreeCounter, stepThreeHeading, stepThreeDescription, stepThreeCancel, stepThreeSubmit] = stepThreeWrapper.children;
  // eslint-disable-next-line max-len
  const [stepFourHeading, stepFourSubHeading, stepFourDescription, stepFourManage, stepFourManageLink, stepFourHome, stepFourHomeLink] = stepFourWrapper.children;
  const [orderHeading, orderId, orderDate] = orderDetailsWrapper.children;
  const [paymentHeading, paymentId] = paymentWrapper.children;
  const [unlockHeading, unlockDescription, unlockUrl] = unlockWrapper.children;
  const urlParams = new URL(window.location).searchParams;
  const step = urlParams.get('webRefId');
  const ebookVehicleDetils = JSON.parse(getLocalStorage('ebookVehicleDetils'));
  const selectedVariantName = ebookVehicleDetils?.variantName || '';
  const selectedTransmission = ebookVehicleDetils?.transmission || '';
  function formatDate(inputDate) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Parse the input date string
    const date = new Date(inputDate);

    // Get day, month, and year
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add suffix for day
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    if (day === 2 || day === 22) suffix = 'nd';
    if (day === 3 || day === 23) suffix = 'rd';

    // Return the formatted date
    return `${day}${suffix} ${month} ${year}`;
  }
  async function analyticsFormStepSubmit(sessionResponse) {
    const details = {};
    details.customerDetails = {
      email: sessionResponse?.sessionInfo?.userProfile?.email,
    };
    details.formName = 'E-Book';
    details.webName = 'Payment Success';
    details.linkType = 'other';
    details.userInfo = {
      authenticatedState: 'authenticated',
    };
    if (sessionResponse?.SESSION_INFO?.userProfile?.phoneNumber) {
      details.identities = {
        // eslint-disable-next-line max-len
        hashedphoneSHA256: await utility.getSHA256Hash(sessionResponse?.SESSION_INFO?.userProfile?.phoneNumber),
      };
    }
    const dataLayerObj = {
      enquiryStepName: 'Booking Summary',
      custName: sessionResponse?.sessionInfo?.userProfile?.name || '',
      model: sessionResponse?.sessionInfo?.selectedCar.modelDesc || '',
      variant: sessionResponse?.sessionInfo?.selectedCar.variantDesc || '',
      color: sessionResponse?.sessionInfo?.selectedCar.cmsColorDesc || '',
      dealer: sessionResponse?.sessionInfo?.selectedDealer.name || '',
      radius: sessionResponse?.sessionInfo?.userDealerPreference.radius || '',
      fuelType: sessionResponse?.sessionInfo?.selectedCar?.fuelType || '',
      bookingAmount: sessionResponse?.sessionInfo?.selectedCar.bookingAmount,
      bookingId: sessionResponse?.sessionInfo?.webReferenceId || '',
    };
    analytics.setEnquirySubmitDetails(details, dataLayerObj, false);
  }
  getEbookUserSession().then(async (sessionResponse) => {
    const sessionData = sessionResponse.data || {};
    const sessionInfo = JSON.parse(sessionData.SESSION_INFO || '{}');
    const selectedCar = sessionInfo.selectedCar || {};
    const selectedDealer = sessionInfo.selectedDealer || {};
    const buyerProfile = sessionInfo.buyerProfile || {};
    await analyticsFormStepSubmit(sessionResponse);
    const handleAccordianMobile = (e) => {
      const header = e.currentTarget;
      const accordianContent = header.nextElementSibling;
      const accordionIcon = header.querySelector('.accordian-icon');
      if (window.innerWidth <= 768) {
        if (accordianContent.classList.contains('open')) {
          accordianContent.classList.remove('open');
          accordionIcon.innerHTML = `<img src="${window.hlx.codeBasePath}/icons/add.svg">`;
        } else {
          accordianContent.classList.add('open');
          accordionIcon.innerHTML = `<img src="${window.hlx.codeBasePath}/icons/nil.svg">`;
        }
      }
    };

    getBookingDataFromId(step).then((response) => {
      if (response && response.data) {
        const bookingData = response.data;
        const paymentInfo = bookingData.PAYMENT[step] || {};
        const bookingAmount = paymentInfo.amountDeducted
          ? paymentInfo.amountDeducted
          : paymentInfo.amount;
        // Vehicle Details
        const vehicleDetails = document.createElement('div');
        vehicleDetails.className = 'vehicle-details section-heading';
        vehicleDetails.innerHTML = `
        <div class="success-vehicle-details">
          <div class="details-top accordian-head">
            <div class="details-title">
              <h4>${vehicleLabel}</h4>
            </div>
            <div class="accordian">
              <div class="accordian-icon">
                <img src="${window.hlx.codeBasePath}/icons/add.svg">
              </div>
            </div>
          </div>
          <div id="car-info-section" class="accordian-content">
              <div class="success-vehicle-info m-top-40">
                <div class="car-info info-item">
                    <p class="model-name">
                    ${selectedCar.modelDesc || 'N/A'}
                    <span class="variant-name">( ${selectedVariantName || 'N/A'} )</span>
                    </p>
                    <span class="transmission-fuel">
                      <span class="fueltype">${selectedTransmission || 'N/A'}</span>
                      <span class="fueltype">${selectedCar.fuelType || 'N/A'}</span>
                    </span>
                </div>
                <div class="showroom-price info-item price-align">
                    <p>
                    ${formatRupeesWithSymbol(selectedCar?.exShowroomPrice)}/-
                    </p>
                    <span>${exshowroomLabel}</span>
                </div>
              </div>
              <div class="success-vehicle-color-top">
                <div class="success-color-info success-mobile-only">
                    <p class="color-name">${selectedCar.cmsColorDesc || 'N/A'}</p>
                    <p class="color-label">Color</p>
                </div>
              </div>
              <div class="vehicle-img">
                  <img src="https://dev-nexa.marutisuzuki.com${selectedCar.imageUrl}" alt="car-image" width="100%" height="100%">
              </div>
              <div class="success-vehicle-color">
                <div class="success-color-info success-desktop-only">
                    <p class="color-name">${selectedCar.cmsColorDesc || 'N/A'}</p>
                    <p class="color-label">Color</p>
                </div>
              </div>
          </div>
        </div>
      `;

        // Dealership Details
        const dealershipDetails = document.createElement('div');
        dealershipDetails.className = 'dealership-details section-heading';
        dealershipDetails.innerHTML = `
        <div class="dealer-details">
          <div class="details-top accordian-head">
          <div class="details-title">
            <h4>${dealerShipLabel}</h4>
          </div>
          <div class="top-navigate-link success-desktop-only">
            <a href="https://www.google.com/maps?q=28.695327, 77.110079" target="_blank" rel="noopener noreferrer">
              ${navigateText}
            </a>
            <span class="arrow-icon-success"></span>
          </div>

          <div class="accordian">
            <div class="accordian-icon">
              <img src="${window.hlx.codeBasePath}/icons/add.svg">
            </div>
          </div>
        </div>
    <div id="dealer-info-section" class="accordian-content">
      <div class="success-dealer-info">
         <div class="dealer-info-content m-top-40">
            <div class="dealer-name">
               <p>${selectedDealer.name || 'N/A'}</p>
            </div>
            <div class="dealer-address m-top-16">
               <p>${selectedDealer.address?.completeAddress || 'N/A'}</p>
            </div>
         </div>
         <div class="dealer-contact">
            <div class="phone-success" style="">
               <div class="circle"><span class="phone-icon-success"></span></div>
               <a href="tel:${selectedDealer.phone || 'N/A'}" aria-label="phone">
               ${selectedDealer.phone || 'N/A'}
               </a>
            </div>
            <div class="email-success" style="${!selectedDealer.email ? 'display:none' : ''}">
               <div class="circle">
                <span class="email-icon-success"></span>
               </div>
               <a href="mailto:${selectedDealer.email || 'N/A'}" target="" rel="noopener noreferrer" aria-label="email" class="dealerEmail">
                  ${selectedDealer.email || 'N/A'}
               </a>
               <span class="copy-icon-success"></span>
            </div>
            <div class="bottom-navigate-link success-mobile-only">
              <a href="https://www.google.com/maps?q=28.695327, 77.110079" target="_blank" rel="noopener noreferrer">
                Navigate
              </a>
              <span class="arrow-icon-success"></span>
            </div>
         </div>
      </div>
   </div>
</div>
        `;
        const billingDetails = document.createElement('div');
        billingDetails.className = 'billing-details section-heading';
        billingDetails.innerHTML = `
         <div class="billing-section">
          <div class="details-top accordian-head">
          <div class="details-title">
            <h4>${billingHeading.textContent}</h4>
          </div>
          <div class="accordian">
            <div class="accordian-icon">
              <img src="${window.hlx.codeBasePath}/icons/add.svg">
            </div>
          </div>
        </div>
  <div class="billing-details-content accordian-content">
          <div class="details">
            <div class="details-item m-top-40">
              <div class="detail-label">${billingName.textContent}</div>
              <div class="detail-value">${buyerProfile.name || 'N/A'}</div>
            </div>
            <div class="details-item m-top-12">
              <div class="detail-label">${billingPhone.textContent}</div>
              <div class="detail-value">
              ${String(buyerProfile.phoneNumber).substring(0, 2)}${'xxxxxx'}${String(buyerProfile.phoneNumber).slice(-2)}
              </div>
            </div>
             <div class="details-item m-top-12">
              <div class="detail-label">${billingEmail.textContent}</div>
              <div class="detail-value">${buyerProfile.email || 'N/A'}</div>
            </div>
             <div class="details-item m-top-12">
              <div class="detail-label">${billingAddress.textContent}</div>
              <div class="detail-value">${buyerProfile.address || 'N/A'}</div>
            </div>
          </div>
</div>
</div>
        `;

        // Payment Details Section
        const paymentDetailsSection = document.createElement('div');
        paymentDetailsSection.className = 'payment-details section-heading';
        paymentDetailsSection.innerHTML = `
        <div class="details-top accordian-head">
          <div class="details-title">
            <h4>${paymentHeading?.textContent}</h4>
          </div>
          <div class="accordian">
            <div class="accordian-icon">
              <img src="${window.hlx.codeBasePath}/icons/add.svg">
            </div>
          </div>
        </div>
    <!-- Content that will be toggled -->
        <div class="payment-details-content accordian-content">
          <div class="details">
            <div class="payment-details-item m-top-40">
              <span class="detail-label">${paymentId?.textContent}</span>
              <span class="detail-value">${paymentInfo.transactionId || 'N/A'}</span>
            </div>
            <div class="payment-details-item m-top-12">
              <span class="detail-label">${bookingAmountLabel}</span>
              <span class="detail-value">
              ${formatRupeesWithSymbol(bookingAmount)}/-
              </span>
            </div>
            <div class="payment-details-item">
              <span class="detail-label">${cancellationLabel}</span>
            </div>
          </div>
        </div>
        `;
        const statusOrderDetailBlock = document.createElement('div');
        statusOrderDetailBlock.className = 'status-order-detail-block';

        // Booking Status Section
        const bookingStatus = document.createElement('div');
        bookingStatus.className = 'booking-status';
        bookingStatus.innerHTML = `
          <div class="booking-container">
  <h3 class="success-message">
    <span class="icon"><img src="${window.hlx.codeBasePath}/icons/verified.svg"></span>
    ${congratsHeading.textContent}
  </h3>
  <p class="sub-message">
    ${congratsDescription.innerHTML}
  </p>
  <div class="timeline">
    <div class="timeline-item first-item">
      <div class="status">
        <div class="status-left">
          <div class="status-icon"><img src="${window.hlx.codeBasePath}/icons/check-white.svg"></div>
        </div>
        <div class="status-right">
          <div class="status-name">
            <p>${requestRecievedHeading.textContent}</p>
          </div>
          <p class="status-text">
            ${requestRecievedDescription.innerHTML}
          </p>
        </div>
      </div>
    </div>
    <div class="timeline-item item-top">
      <div class="status">
        <div class="status-left">
          <div class="status-icon"><img src="${window.hlx.codeBasePath}/icons/check-white.svg"></div>
        </div>
        <div class="status-right">
          <div class="status-name">
            <p>${bookingConfirmedHeading?.textContent}</p>
          </div>
          <p class="status-text">
            ${bookingConfirmedDescription?.innerHTML}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="actions">
    <button class="cancel-button">${cancelBookingLabel}</button>
    <button class="receipt-button" onclick="window.print()">${bookingRecieptLabel}</button>
  </div>
  </div>
</div>
        `;
        statusOrderDetailBlock.appendChild(bookingStatus);
        statusOrderDetailBlock
          .querySelector('.cancel-button')
          ?.addEventListener('click', () => {
            document
              .querySelector('.cmp-cancel-ebooking')
              .classList.add('active');
            window.scrollTo(0, 0);
            document.querySelector('body').classList.add('overflow-hidden');
          });
        const orderDetailsSection = document.createElement('div');
        orderDetailsSection.className = 'order-details';
        orderDetailsSection.innerHTML = `
          <div class="details-top">
            <h4>${orderHeading?.textContent}</h4>
          </div>
          <div class="details">
            <div class="details-item m-top-40">
              <div class="detail-label">${orderId?.textContent}</div>
              <div class="detail-value">${bookingData.WEB_REF_ID || 'N/A'}</div>
            </div>
            <div class="details-item m-top-12">
              <div class="detail-label">${orderDate?.textContent}</div>
              <div class="detail-value">${formatDate(bookingData.CREATED_DATE)}</div>
            </div>
          </div>

        `;

        statusOrderDetailBlock.appendChild(orderDetailsSection);

        const unlockoffers = document.createElement('div');
        unlockoffers.className = 'unlock-offers';
        unlockoffers.innerHTML = `<div class="unlock-section">
      <div class="unlock-left">
        <h3>${unlockHeading?.textContent}</h3>
        <h6>${unlockDescription?.textContent}</h6>
      </div>
      <div class="unlock-right">
        <a href="${unlockUrl?.textContent}" class="navigate-link">
          <span class="arrow-icon"></span>
        </a>
      </div>
    </div>`;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.innerHTML = `<div class="cmp-ebook-journey__cta-buttons">
              <div class="cmp-ebook-journey__previous-button-wrapper">
                <button class="cmp-ebook-journey__previous cta__new cta__new-primary" type="button">
                  Explore Accessories
                </button>
              </div>
              <div class="cmp-ebook-journey__continue-button-wrapper">
                <button class="cmp-ebook-journey__continue cta__new cta__new-primary" type="button">
                  Manage Bookings
                </button>
              </div>
            </div>`;
        // eslint-disable-next-line no-inner-declarations
        function setActiveStep(stepIndex) {
          const timelineItems = document.querySelectorAll('.timeline-item');
          timelineItems.forEach((item, index) => {
            if (index <= stepIndex) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }

        // Set the third step as active
        setActiveStep(2);
        const container = document.createElement('div');
        container.className = 'cmp-payment-success';
        const section = document.createElement('div');
        section.className = 'payment-success-section';
        const cancelBookingSection = document.createElement('div');
        cancelBookingSection.className = 'cmp-cancel-ebooking';
        const cancelBooking = `
            <div>
            ${cancelImageBooking.innerHTML}
            </div>
            <a href="#" class="close"></a>
            <div class="cmp-cancel-ebooking--step-one active">
              <div>
                <h3><span>${stepOneCounter.innerHTML}</span>${stepOneHeading?.textContent}</h3>
                <div class="description">
                <p>
                  ${stepOneDescription}
                </p>
                </div>
              </div>
              <div>
                <div class="button-container">
                  <button type="button" class="confirm-cancel step-1">${stepOneCancel?.textContent}</button>
                  <button type="button" class="close">${stepOneKeep?.textContent}</button>
                </div>
                <div class="contact-container">
                  <span>${stepOneInformation?.textContent}</span>
                  <div class="phone-container">
                  <a href="tel:${stepOnePhone?.textContent}">${stepOnePhone?.textContent}</a>
                  <a href="#">${stepOneWhatsapp?.textContent}</a>
                  </div>
                </div>
              </div>
            </div>

            <div class="cmp-cancel-ebooking--step-two ">
              <h3><span>${stepTwoCounter.textContent}</span>${stepTwoHeading.textContent}</h3>
              <div class="description">
                <label>
                  <input type="radio" name="cancel-reason" value="1"  />
                  Found a different model from another brand that suits my needs better
                </label>
                <label>
                  <input type="radio" name="cancel-reason" value="2"  />
                  Need to reconsider my budget or finance options
                </label>
                <label>
                  <input type="radio" name="cancel-reason" value="3"  />
                  The car did not meet my expectations
                </label>
                <label>
                  <input type="radio" name="cancel-reason" value="4"  />
                  Personal circumstances or changes in plan
                </label>
                <label>
                  <input type="radio" name="cancel-reason" value="5"  />
                  Other(s)
                </label>
              </div>
              <div class="button-container">
                <button type="button" class="skip">${stepTwoSkip.textContent}</button>
                <button type="button" class="submit">${stepTwoSubmit.textContent}</button>
              </div>
            </div>
            <div class="cmp-cancel-ebooking--step-three ">
              <h3><span>${stepThreeCounter?.textContent}</span>${stepThreeHeading?.textContent}</h3>
              <p>${stepThreeDescription?.textContent}</p>
              <div class="description">
                <textarea name="reason"></textarea>
              </div>
              <div class="button-container">
                <button type="button" class="confirm-cancel step-3">${stepThreeCancel?.textContent}</button>
                <button type="button" class="close">${stepThreeSubmit?.textContent}</button>
              </div>
            </div>
            <div class="cmp-cancel-ebooking--step-four">
              <h3><span></span><label>${stepFourHeading?.textContent}</label></h3>
              <p>${stepFourSubHeading?.textContent}</p>
              <div class="description">
                ${stepFourDescription?.outerHTML}
              </div>
              <div class="button-container">
                <a type="button" href="${stepFourManageLink?.textContent}" class="manage-booking">${stepFourManage?.textContent}</a>
                <a type="button" href="${stepFourHomeLink?.textContent}" class="home-page">${stepFourHome?.textContent}</a>
              </div>
            `;
        cancelBookingSection.innerHTML = cancelBooking;
        container.appendChild(section);
        container.appendChild(cancelBookingSection);
        cancelBookingSection.querySelector('.close')?.addEventListener('click', () => {
          document.querySelector('.cmp-cancel-ebooking').classList.remove('active');
          document.querySelector('body').classList.remove('overflow-hidden');
          document.querySelectorAll('.cmp-cancel-ebooking > div').forEach((value) => {
            value.classList.remove('active');
          });
          document.querySelector('.cmp-cancel-ebooking > .cmp-cancel-ebooking--step-one').classList.add('active');
        });

        const cancelBookingFunction = async (parameter) => {
          const token = localStorage.getItem('ebookToken');
          const headers = {
            'Content-Type': 'application/json',
            Authorization: token,
          };
          const URL = `${environmentSelection.getConfiguration(
            'apiUrl',
          )}enquiry/v1/booking/cancel/webRefId/${step}`;
          const param = parameter || {
            webRefId: step,
            cancellationCharges: Number(cancellationCharge?.textContent),
          };
          // If coming from step 3 (Other reason), get textarea value
          if (!parameter) {
            const textarea = document.querySelector('.cmp-cancel-ebooking--step-three textarea[name="reason"]');
            if (textarea && textarea.value) {
              param.reason = textarea.value;
            }
          }
          const params = {
            method: 'PUT',
            headers,
            body: JSON.stringify(param),
          };
          const cancelResponse = await fetch(URL, params);
          try {
            if (!cancelResponse.error) {
              // eslint-disable-next-line max-len
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-two').classList.remove('active');
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-four').classList.add('active');
            }
          } catch (error) {
            document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-two').classList.add('active');
            document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-four').classList.remove('active');
          }
        };
        cancelBookingSection.querySelectorAll('.confirm-cancel').forEach((value) => {
          value?.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target?.classList.contains('step-1')) {
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-one').classList.remove('active');
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-two').classList.add('active');
            } else {
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-three').classList.remove('active');
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-four').classList.add('active');
              cancelBookingFunction(null);
            }
          });
        });
        cancelBookingSection.querySelector('.cmp-cancel-ebooking--step-two .skip')?.addEventListener('click', () => {
          cancelBookingFunction(null);
        });

        cancelBookingSection.querySelector('.cmp-cancel-ebooking--step-two .submit')?.addEventListener('click', () => {
          const selectedRadio = document.querySelector('input[name="cancel-reason"]:checked');
          if (selectedRadio) {
            const selectedValue = selectedRadio.value;
            const selectedText = selectedRadio.parentElement.textContent.trim();
            if (selectedValue === '5') { // If "Other(s)" is selected
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-two').classList.remove('active');
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-three').classList.add('active');
            } else {
              // Add the selected reason text and call API immediately
              const param = {
                webRefId: step,
                cancellationCharges: Number(cancellationCharge?.textContent),
                reason: selectedText, // Add the reason here
              };
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-two').classList.remove('active');
              document.querySelector('.cmp-cancel-ebooking .cmp-cancel-ebooking--step-four').classList.add('active');
              cancelBookingFunction(param);
            }
          }
        });
        const innersection = document.createElement('div');
        innersection.className = 'inner-section';

        const downloadPdf = document.createElement('div');
        downloadPdf.className = 'download-pdf';
        downloadPdf.innerHTML = `<p onclick="window.print()">${downloadLabel}<img src="${window.hlx.codeBasePath}/icons/download.svg" alt="close" /></p>`;
        const bookingDetailsHeading = document.createElement('div');
        bookingDetailsHeading.className = 'booking-details-heading';
        bookingDetailsHeading.innerHTML = `<h2>${bookingLabel}<h2>`;
        // Left Panel
        const leftPanel = document.createElement('div');
        leftPanel.className = 'left-panel';
        leftPanel.appendChild(bookingDetailsHeading);
        leftPanel.appendChild(vehicleDetails);
        leftPanel.appendChild(dealershipDetails);
        leftPanel.appendChild(billingDetails);
        innersection.appendChild(leftPanel);

        const bookingStatusHeading = document.createElement('div');
        bookingStatusHeading.className = 'booking-status-heading';
        bookingStatusHeading.innerHTML = '<h2>Booking Status<h2>';
        const rightPanel = document.createElement('div');
        rightPanel.className = 'right-panel';
        rightPanel.appendChild(bookingStatusHeading);
        rightPanel.appendChild(statusOrderDetailBlock);
        rightPanel.appendChild(paymentDetailsSection);
        rightPanel.appendChild(unlockoffers);
        innersection.appendChild(rightPanel);
        section.appendChild(innersection);
        section.appendChild(buttonContainer);
        // container.appendChild(downloadPdf);

        block.innerHTML = '';

        if (window.innerWidth <= 768) {
          const mobileContainer = document.createElement('div');
          mobileContainer.className = 'cmp-payment-success';
          const mobileSection = document.createElement('div');
          mobileSection.className = 'payment-success-section';
          mobileContainer.appendChild(mobileSection);
          mobileSection.appendChild(bookingDetailsHeading);
          mobileSection.appendChild(orderDetailsSection);
          mobileSection.appendChild(bookingStatus);
          mobileSection.appendChild(vehicleDetails);
          mobileSection.appendChild(paymentDetailsSection);
          mobileSection.appendChild(dealershipDetails);
          mobileSection.appendChild(billingDetails);
          // mobileContainer.appendChild(downloadPdf);
          mobileContainer.appendChild(unlockoffers);
          mobileContainer.appendChild(buttonContainer);
          block.appendChild(mobileContainer);
        }

        if (window.innerWidth > 768) {
          block.appendChild(container);
        }

        const accordions = document.querySelectorAll('.accordian-head');

        const copyEmail = async () => {
          // Find the first element with the dealerEmail class
          const textToCopyElement = document.querySelector('.dealerEmail');

          const textToCopy = textToCopyElement.innerHTML;

          // Copy the text to clipboard
          try {
            await navigator.clipboard.writeText(textToCopy);
          } catch (err) {
            // console.error('Failed to copy: ', err);
          }
        };
        const copyEmailElements = document.querySelectorAll('.copy-icon-success');

        // Add event listeners to each copy-icon element
        copyEmailElements.forEach((icon) => {
          icon.addEventListener('click', copyEmail);
        });
        accordions.forEach((accordian) => {
          accordian.addEventListener('click', handleAccordianMobile);
        });
      }
    });
  });
}
