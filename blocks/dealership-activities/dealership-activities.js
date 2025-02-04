import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import authUtils from '../../commons/utility/authUtils.js';
import commonApiUtils from '../../commons/utility/apiUtils.js';
import ctaUtils from '../../utility/ctaUtils.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();

  const [
    titleEl,
    subtitleEl,
    testDriveTabEl,
    testDriveUpcomingNotificationEl,
    testDriveCancelledNotificationEl,
    testDriveCompltedNotificationEl,
    testDriveDealerNameLabelEl,
    testDriveContactLabelEl,
    testDriveEmailIdLabelEl,
    testDriveScheduledDateLabelEl,
    testDriveScheduledTimeLabelEl,
    testDriveDirectionsCtaTextEl,
    testDriveDirectionsCtaLinkEl,
    testDriveDirectionsCtaTargetEl,
    testDriveBookNowCtaTextEl,
    testDriveBookNowCtaLinkEl,
    testDriveBookNowCtaTargetEl,
    testDriveRequestQuoteCtaTextEl,
    testDriveRequestQuoteCtaLinkEl,
    testDriveRequestQuoteCtaTargetEl,
    testDriveRescheduleCtaTextEl,
    testDriveRescheduleCtaLinkEl,
    testDriveRescheduleCtaTargetEl,
    bookedTabEl,
    bookedNotificationEl,
    bookedCancelledNotificationEl,
    bookedClosedNotificationEl,
    bookedCarModelLabelEl,
    bookedConfigurationCodeLabelEl,
    bookedCityLabelEl,
    bookedIdLabelEl,
    bookedDateLabelEl,
    bookedDealerNameLabelEl,
    bookedContactLabelEl,
    bookedEmailIdLabelEl,
    bookedSummaryCtaTextEl,
    bookedSummaryCtaLinkEl,
    bookedSummaryCtaTargetEl,
    bookedConnectDealerCtaTextEl,
    bookedConnectDealerCtaLinkEl,
    bookedConnectDealerCtaTargetEl,
  ] = block.children;

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || null;
  const [
    subtitle,
    testDriveTab,
    testDriveUpcomingNotification,
    testDriveCancelledNotification,
    testDriveCompltedNotification,
    testDriveDealerNameLabel,
    testDriveContactLabel,
    testDriveEmailIdLabel,
    testDriveScheduledDateLabel,
    testDriveScheduledTimeLabel,
    bookedTab,
    bookedNotification,
    bookedCancelledNotification,
    bookedClosedNotification,
    bookedCarModelLabel,
    bookedConfigurationCodeLabel,
    bookedCityLabel,
    bookedIdLabel,
    bookedDateLabel,
    bookedDealerNameLabel,
    bookedContactLabel,
    bookedEmailIdLabel,
  ] = [
    subtitleEl,
    testDriveTabEl,
    testDriveUpcomingNotificationEl,
    testDriveCancelledNotificationEl,
    testDriveCompltedNotificationEl,
    testDriveDealerNameLabelEl,
    testDriveContactLabelEl,
    testDriveEmailIdLabelEl,
    testDriveScheduledDateLabelEl,
    testDriveScheduledTimeLabelEl,
    bookedTabEl,
    bookedNotificationEl,
    bookedCancelledNotificationEl,
    bookedClosedNotificationEl,
    bookedCarModelLabelEl,
    bookedConfigurationCodeLabelEl,
    bookedCityLabelEl,
    bookedIdLabelEl,
    bookedDateLabelEl,
    bookedDealerNameLabelEl,
    bookedContactLabelEl,
    bookedEmailIdLabelEl,
  ].map((el) => el?.textContent || '');

  block.innerHTML = '';

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const createTestDriveCards = (details, notification, cta) => {
    const detailsHtml = details.details.map((detail, index) => {
      const infoHtml = detail.map((item, itemIndex) => {
        if(isMobile && (item.type === 'email' || item.type === 'contact') && !item.value) {
          return `<div></div>`;
        }
        return `
          <div class="item-col ${(itemIndex === detail.length - 1 && index === details.details.length - 1) ? 'last' : ''}">
            <div class="label-field titleHd">${item.label} </div>
            ${(item.span) ? `${item.span}${item.value}` : `<p class="comp-hd">${item.value}</p>`}
            ${(item.suffix) ? `${item.suffix}` : ''}
          </div>
        `;
      });
      
      return `
        <div class="inner-table-container ${((details.details.length > 1 && index > 0) || (details.details.length > 2 && index > 1)) ? 'Collapsible-data' : ''}">
          ${infoHtml.join('')}
        </div>
      `;
    });
    const card = `
    <div class="tab-container">
      ${notification}
      <div class="left">
        <img src="${details.image}" alt="${details.alt || details.modelDesc}" loading="lazy">
      </div>
      <div class="right">
          <div class="collapsible-icon">
            <span class="collapse show"></span>
          </div>
        ${detailsHtml.join('')}
        ${(cta) ? `<div class="cta-btns">${cta}</div>` : ''}
      </div>
    </div>
    `;
    return card;
  }

  const createBookingCards = (details, notification, cta) => {
    const detailsHtml = details.details.map((detail, index) => {
      const infoHtml = detail.map((item, itemIndex) => {
        return `
          <div class="item-col ${(itemIndex === detail.length - 1 && index === details.details.length - 1) ? 'last' : ''}">
            <div class="label-field titleHd">${item.label} </div>
            ${(item.span) ? `${item.span}${item.value}` : `<p class="comp-hd">${item.value}</p>`}
            ${(item.suffix) ? `${item.suffix}` : ''}
          </div>
        `;
      });
      
      return `
        <div class="inner-table-container ${(!isMobile && ((details.details.length > 1 && index > 0) || (details.details.length > 2 && index > 1))) ? 'Collapsible-data' : ''}">
          ${infoHtml.join('')}
        </div>
      `;
    });
    const dealerDetails = details.dealerDetails;
    let dealerContactHtml = ``;
    let dealerEmailHtml = ``;
    if(dealerDetails.contact) {
      dealerContactHtml = `
        <div class="item-col">
          <span class="phone-icon"></span> ${dealerDetails.contact}
        </div>
      `;
    }
    if(dealerDetails.email) {
      dealerEmailHtml = `
        <div class="item-col last">
          <span class="mail-icon"></span>${dealerDetails.email}<span class="copy-icon"></span>
        </div>
      `;
    }
    const dealerHTML = `
      <div class="formobile">
        <div class="collapsible-icon">
          <span class="collapse show"></span>
        </div>
        <div class="dealer-hd">Dealer Details</div>
        <div class="comp-hd  Collapsible-data">${dealerDetails.name}</div>
      </div>
      ${(dealerContactHtml || dealerEmailHtml) ? `<div class="inner-table-container Collapsible-data">${dealerContactHtml}${dealerEmailHtml}</div>` : ''}
    `;
    const card = `
      <div class="tab-container booked-container">
        ${notification}
        <div class="left">
          <img src="${details.image}" alt="${details.alt || details.modelDesc}" loading="lazy">
        </div>
        <div class="right">
            <div class="collapsible-icon webS">
              <span class="collapse show"></span>
            </div>
            <div class="inner-table-container">
              <div class="item-col bookingIdHd">
              <div class="titleHd">${bookedIdLabel}<span>${details.bookingId}</span></div>
              </div>
            </div>
          ${detailsHtml.join('')}
          ${(isMobile) ? `${dealerHTML}` : ''}
          ${(cta) ? `<div class="cta-btns">${cta}</div>` : ''}
        </div>
      </div>
    `;
    return card;
  }

  const createNotification = (text, className, icon) => {
    const notificationArr = text.trim().split('|');
    const notificationHeading = (notificationArr.length > 1) ? notificationArr[0].trim() : '';
    const notificationText = (notificationArr.length > 1) ? notificationArr.slice(1).join('|').trim() : text;
    return `
      <div class="notification-bar ${className}">
        ${(icon) ? `${icon}` : ''}
        <div class="car-booked-content">${(notificationHeading) ? `<b>${notificationHeading}</b> | ${notificationText}` : `${notificationText}`}</div>
      </div>
    `;
  };

  const createCta = (primary, secondary, teritiary) => {
    primary?.classList.add('btn');
    secondary?.classList.add('btn');
    teritiary?.classList.add('btn');
    return `
      ${(teritiary) ? teritiary.outerHTML : ''}
      ${(secondary) ? secondary.outerHTML : ''}
      ${(primary) ? primary.outerHTML : ''}
    `;
  };

  const createDealershipActivitiesHTML = async (testDriveCards, bookingCards) => {
    const totalActivities = testDriveCards.length + bookingCards.length;
    const titleText = `${title.textContent} (${totalActivities})`;
    title.textContent = titleText;
    const testDriveTitle = `${testDriveTab} (${testDriveCards.length})`;
    const bookedTitle = `${bookedTab} (${bookingCards.length})`;
    return `
      <div class="dealer-activities-container">
      <div class="upploy"></div>
        <div class="dealership-activities__content">
          <span class="dealership-activities__title">${title.outerHTML}</span>
            <p class="dealership-activities__subtitle">${subtitle}</p>
            <ul class="dealer__tabs">
              <li class="dealer__tab active test-drive-tab" id="tab1" data-target-card="test-drive">${testDriveTitle}</li>
              <li class="dealer__tab bookings-tab" id="tab2" data-target-card="booking-cards">${bookedTitle}</li>
            </ul>
        </div>
        <div class="tab-container-outer test-drive-cards-container">
          ${testDriveCards.join('')}
        </div>
        <div class="tab-container-outer booking-cards-container hidden">
          ${bookingCards.join('')}
        </div>
      </div>`;
  }

  function handleTabClick(event) {
    const tabs = block.querySelectorAll('.dealer__tab');
    tabs.forEach((t) => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    block.querySelector('.tab-container-outer.hidden').classList.remove('hidden');
    if(event.currentTarget.dataset.targetCard === 'test-drive') {
      block.querySelector('.booking-cards-container').classList.add('hidden');
    } else {
      block.querySelector('.test-drive-cards-container').classList.add('hidden');
    }
  }

  function setupTabListeners() {
    const tabs = block.querySelectorAll('.dealer__tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', handleTabClick);
    });
  }

  const reduce = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const formatDate = (dateText, includeYear = true) => {
    const date = new Date(dateText);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = (includeYear) ? `, ${date.getFullYear()}` : '';
    const day = date.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) {
      suffix = 'st';
    } else if (day === 2 || day === 22) {
      suffix = 'nd';
    } else if (day === 3 || day === 23) {
      suffix = 'rd';
    }
    return `${day}${suffix} ${month}${year}`;
  }

  const formatTime = (timeText) => {
    const [hour, minute] = timeText.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour}:${minute} ${ampm}`;
  }
  
  const getTestDriveCards = async (profile, cars) => {
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 14);
    const toDateFormatted = toDate.toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 14);
    const pastDateFormatted = pastDate.toISOString().split('T')[0];
    let response = await commonApiUtils.getTestDriveDetails(profile?.number, pastDateFormatted, toDateFormatted, 'EXC');
    response = response.filter((item) => (cars.find((car) => car.modelCd === item.modelCd)));
    response = response.sort((a,b) => {
        const dateComparison = new Date(b.testDriveDate) - new Date(a.testDriveDate);
        if (dateComparison !== 0) {
        return dateComparison;
        }
        const [hourA, minuteA] = a.testDriveStartTime.split(':');
        const [hourB, minuteB] = b.testDriveStartTime.split(':');
        const timeA = new Date(`1970-01-01T${hourA}:${minuteA}:00Z`);
        const timeB = new Date(`1970-01-01T${hourB}:${minuteB}:00Z`);
        return timeB - timeA;
      }
    );
    return response.map((item) => {
      const car = cars.find((car) => car.modelCd === item.modelCd);
      let info = []
      if (item.dealerName) {
        info.push({ label: testDriveDealerNameLabel, value: item.dealerName });
      }
      if (item.dealerContact || isMobile) {
        info.push({ label: testDriveContactLabel, value: item.dealerContact, span: `<span class="phone-icon"></span>`, type: 'contact'  });
      }
      if (item.dealerEmail || isMobile) {
        info.push({ label: testDriveEmailIdLabel, value: item.dealerEmail, span: `<span class="mail-icon"></span>`, suffix: `<span class="copy-icon"></span>`, type: 'email' });
      }
      if (item.testDriveDate) {
        info.push({ label: testDriveScheduledDateLabel, value: formatDate(item.testDriveDate) });
      }
      if (item.testDriveStartTime) {
        info.push({ label: testDriveScheduledTimeLabel, value: formatTime(item.testDriveStartTime) });
      }
      info = reduce(info, 3);
      let notification = '';
      let notificationClassName = '';
      let finalCta1;
      let finalCta2;
      if(item.testDriveStatus === 'F') {
        finalCta1 = ctaUtils.getLink(testDriveBookNowCtaLinkEl, testDriveBookNowCtaTextEl, testDriveBookNowCtaTargetEl, 'btn-primary');
        finalCta2 = ctaUtils.getLink(testDriveRequestQuoteCtaLinkEl, testDriveRequestQuoteCtaTextEl, testDriveRequestQuoteCtaTargetEl, 'btn-secondary');
        notification = testDriveCompltedNotification;
        notificationClassName = 'completed';
      } else if(item.testDriveStatus === 'C') {
        finalCta1 = ctaUtils.getLink(testDriveRescheduleCtaLinkEl, testDriveRescheduleCtaTextEl, testDriveRescheduleCtaTargetEl, 'btn-primary');
        notification = testDriveCancelledNotification;
        notificationClassName = 'cancelled';
      } else {
        const directionsCta = ctaUtils.getLink(testDriveDirectionsCtaLinkEl, testDriveDirectionsCtaTextEl, testDriveDirectionsCtaTargetEl, 'btn-primary');
        let href = directionsCta?.getAttribute('href') || '';
        href = decodeURI(href)
          .replace('{latitude}', item.dealerLatitude)
          .replace('{longitude}', item.dealerLongitude);
        directionsCta?.setAttribute('href', href);
        finalCta1 = directionsCta;
        notification = testDriveUpcomingNotification;
        notificationClassName = 'upcoming';
      }
      notification = createNotification(
        notification
          .replace('{date}', formatDate(item.testDriveDate, false))
          .replace('{carName}', car?.modelDesc || item.modelDesc),
        notificationClassName
      );
      const cta = createCta(finalCta1, null, finalCta2);
      return createTestDriveCards(
        {
          details: info,
          modelCd: item.modelCd,
          modelDesc: item.modelDesc,
          image: publishDomain + (car?.carImageDealershipActivities?._dynamicUrl || car?.carImage?._dynamicUrl),
        },
        notification,
        cta
      );
    });
  }

  const getBookingCards = async (profile, cars) => {
    let response = await commonApiUtils.getBookingDetails(profile?.number, 'EXC');
    response = response.filter((item) => cars.find((car) => car.modelCd === item.modelCd));
    response = response.sort((a,b) => {
      return new Date(b.orderDate) - new Date(a.orderDate);
    });
    return response.map((item) => {
      const car = cars.find((car) => car.modelCd === item.modelCd);
      let info = [];
      let dealerDetails = {};
      let bookingId;
      if (item.modelDesc) {
        info.push({ label: bookedCarModelLabel, value: car?.modelDesc || item.modelDesc });
      }
      if (item.orderNum) {
        bookingId = item.orderNum;
        if(!isMobile) {
          info.push({ label: bookedIdLabel, value: item.orderNum, className: 'bookingIdRow' });
        }
      }
      if (item.orderDate) {
        info.push({ label: bookedDateLabel, value: formatDate(item.orderDate) });
      }
      if (item.dealerName) {
        dealerDetails.name = item.dealerName;
        info.push({ label: bookedDealerNameLabel, value: item.dealerName });
      }
      if (item.dealerContact || item.dealerPhoneNumber) {
        const contact = item.dealerContact || '';
        const phoneNumber = item.dealerPhoneNumber || '';
        const contactInfo = contact && phoneNumber ? `${contact} | ${phoneNumber}` : contact || phoneNumber;
        dealerDetails.contact = contactInfo;
        if(!isMobile) {
          info.push({ label: bookedContactLabel, value: contactInfo });
        }
      }
      if (item.email) {
        dealerDetails.email = item.email;
        if(!isMobile) {
          info.push({ label: bookedEmailIdLabel, value: item.email });
        }
      }
      info = reduce(info, 3);
      let notification = bookedNotification;
      if(item.status === 'C') {
        notification = bookedCancelledNotification;
      } else if(item.status === 'L') {
        notification = bookedClosedNotification;
      }
      notification = createNotification(notification, 'booked', '<div class="car-booked-icon"></div>');
      const summaryCta = ctaUtils.getLink(bookedSummaryCtaLinkEl, bookedSummaryCtaTextEl, bookedSummaryCtaTargetEl, 'btn-primary');
      const connectDealerCta = ctaUtils.getLink(bookedConnectDealerCtaLinkEl, bookedConnectDealerCtaTextEl, bookedConnectDealerCtaTargetEl, 'btn-secondary');
      const cta = createCta(summaryCta, connectDealerCta);
      return createBookingCards(
        {
          details: info,
          modelCd: item.modelCd,
          modelDesc: item.modelDesc,
          image: publishDomain + (car?.carImageDealershipActivities?._dynamicUrl || car?.carImage?._dynamicUrl),
          alt: car?.altText,
          dealerDetails,
          bookingId
        },
        notification,
        cta
      );
    });
  }

  async function init(profile) {
    const cars = await commonApiUtils.getCarList('EXC');
    const testDriveCards = await getTestDriveCards(profile, cars);
    const bookingCards = await getBookingCards(profile, cars);
    if(testDriveCards.length > 0 || bookingCards.length > 0) {
      block.innerHTML = await createDealershipActivitiesHTML(testDriveCards, bookingCards);
      block.querySelectorAll('.collapsible-icon .collapse').forEach((item) => {
        item.addEventListener('click', (e) => {
          const el = e.target;
          const collapsibleItems = el.closest('.right')?.querySelectorAll('.Collapsible-data');
          if(el.classList.contains('show')) {
            el.classList.remove('show');
            el.classList.add('hide');
            collapsibleItems.forEach((item) => item.classList.add('hidden'));
          } else {
            el.classList.remove('hide');
            el.classList.add('show');
            collapsibleItems.forEach((item) => item.classList.remove('hidden'));
          }
        });
      });
      block.querySelectorAll('.copy-icon').forEach((item) => {
        const emailEl = item.closest('.item-col')
        const email = emailEl?.textContent?.replace(emailEl?.querySelector('.label-field')?.textContent || '', '')?.trim();
        item.addEventListener('click', () => {
          navigator.clipboard.writeText(email);
        });
      });
      setupTabListeners();
    }
  }

  authUtils.waitForAuth().then(async () => {
    const profile = await authUtils.getProfile();
    if(profile) {
      init(profile);
    }
  });
}
