import "../../commons/scripts/splide/splide.js";
import analytics from "../../utility/analytics.js";
import commonApiUtils from "../../commons/utility/apiUtils.js";
import authUtils from "../../commons/utility/authUtils.js";
import { fetchPlaceholders } from "../../commons/scripts/aem.js";
import { carImg } from "./profile-past-activities-mock.js";

export default async function decorate(block) {
  const [
    navigatorEl,
    blockNameEl,
    tab1NameEl,
    tab2NameEl,
    tab3NameEl,
    tab4NameEl,
    tab5NameEl,
    dateLabelEl,
    orderIdLabelEl,
    dealershipIdLabelEl,
  ] = block.children;

  const blockName = blockNameEl?.textContent?.trim() || "";
  const dateTitle = dateLabelEl?.textContent?.trim() || "";
  const oredrIdTitle = orderIdLabelEl?.textContent?.trim() || "";
  const dealershipTitle = dealershipIdLabelEl?.textContent?.trim() || "";
  const navigator = navigatorEl?.textContent?.trim() || "";

  const tab1Text = tab1NameEl?.textContent?.trim() || "";
  const tab2Text = tab2NameEl?.textContent?.trim() || "";
  const tab3Text = tab3NameEl?.textContent?.trim() || "";
  const tab4Text = tab4NameEl?.textContent?.trim() || "";
  const tab5Text = tab5NameEl?.textContent?.trim() || "";

  const tab1 = tab1Text
    ? `<button class="tab-btn active" data-tab="${tab1Text}">${tab1Text}</button>` : "";
  const tab2 = tab2Text
    ? `<button class="tab-btn " data-tab="${tab2Text}">${tab2Text}</button>` : "";
  const tab3 = tab3Text
    ? `<button class="tab-btn " data-tab="${tab3Text}">${tab3Text}</button>` : "";
  const tab4 = tab4Text
    ? `<button class="tab-btn " data-tab="${tab4Text}">${tab4Text}</button>` : "";
  const tab5 = tab5Text
    ? `<button class="tab-btn " data-tab="${tab5Text}">${tab5Text}</button>` : "";
  

  let splide = null;

  let orders;

  function createOrderCard(order) {
    return `
      <div class="order-card splide__slide" data-type="${order.dealerDetails.status
        .toLowerCase()}">

        <div class="card-header">

          <div class="card-title">
            <span>${order.dealerDetails.status}</span>
          </div>
          <div class="${navigator === 'navigation' ? 'no-card-status' : 'card-status'}">
            <span class="status ${order.dealerDetails.driveStatus.toLowerCase()}">${
      order.dealerDetails.driveStatus
    }</span>
          </div>
          <div class="menu-container">
            <button class="kebab-menu" aria-label="Menu" aria-expanded="false">
              <div class="dots">
              </div> 
            </button>
            <div class="menu-options" aria-hidden="true">
              <a class="call-btn" target="_blank">Call</a>
              <a class="email-btn" target="_blank" href="mailto:${order.dealerDetails.dealerEmail}">Email</a>
              <a class="direction-btn" target="_blank" href="https://www.google.com/maps?q=${order.dealerDetails.dealerLocationQueryParam}">Direction</a>
            </div>
          </div>
        </div>

        <div class="card-content">
          <div class="card-details">
            <span class="car-detail-order-date-titile">${dateTitle}</span>
            <span class="car-detail-order-date">${
              order.dealerDetails.testDriveDate
            }</span>
          </div>
          <div class="card-details-order">
            <span class="car-detail-order-id-title">${oredrIdTitle}</span>
            <span class="car-detail-order-id">${
              order.dealerDetails.enquiryNumber
            }</span>
          </div>
        </div>

        <div class="card-content-image">
          <div class="card-details-dealership">
            <span class="car-detail-dealership-title">${dealershipTitle}</span>
            <span class="car-detail-dealership-id">${
              order.dealerDetails.dealerName
            }</span>
          </div>
          <div class="card-image">
            <span>
              <img src="${order.image}" alt="${
      order.dealerDetails.dealerName
    } loading="lazy">
            </span>
          </div>
        </div>
      </div>
    `;
  }

  function createTabs() {
    return `
      <div class="tabs-container">
        <div class="tabs">
        ${tab1}
        ${tab2}
        ${tab3}
        ${tab4}
        ${tab5}
        </div>
      </div>
    `;
  }

  function finalMarkup() {
    return `
    <div class="activities-wrapper">
      <div class="block-name">
      ${
        navigator === "navigation"
          ? "<span></span>"
          : `<span>${blockName}</span>`
      }
      </div>
      <div class="tab-arrow">
      ${createTabs()}
      <div class="tab-arrow-svg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
           <path d="M4.17313 1.34625L9 6.17313L4.17312 11L3.4635 10.2904L7.58088 6.17313L3.4635 2.05588L4.17313 1.34625Z" fill="#18171A"/>
           </svg></div>
      </div>
      <div class="order-cards-wrapper">
       <div class="splide past-activities-splide-carousel">
         <div class="splide__track">
          <div class="splide__list past-activities-splide-list">
            ${orders?.map(createOrderCard).join("")}
          </div>
         </div>
         <div class="splide__arrows splide_arrows_past">
                 
         </div>
        </div>
      </div>
       ${
         navigator === "navigation"
           ? `<div class="black-patch-mobile">
           <svg xmlns="http://www.w3.org/2000/svg" width="274" height="16" viewBox="0 0 274 16" fill="none">
           <path d="M0 16L11.2209 0H274V16H0Z" fill="#18171A"/>
           </svg>
        </div>
        <div class="black-patch-desktop">
           <svg xmlns="http://www.w3.org/2000/svg" width="435" height="25" viewBox="0 0 435 25" fill="none">
           <path d="M435 25L419.92 0L0 0V25L435 25Z" fill="#18171A"/>
           </svg>
        </div>`
           : "<span></span>"
       }
    </div>
  `;
  }

  const formatDate = (dateText, includeYear = true) => {
    const date = new Date(dateText);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = includeYear ? `, ${date.getFullYear()}` : "";
    const day = date.getDate();
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
    } else if (day === 2 || day === 22) {
      suffix = "nd";
    } else if (day === 3 || day === 23) {
      suffix = "rd";
    }
    return `${day}${suffix} ${month}${year}`;
  };

  const { publishDomain,channelId } = await fetchPlaceholders();

  const getTestDriveCards = async (profile, cars) => {
    
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 14);
    const toDateFormatted = toDate.toISOString().split("T")[0];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 14);
    const pastDateFormatted = pastDate.toISOString().split("T")[0];

    //TODO: phone number should be picked form profile data, hardcoding right now for the demo purpose
    let response = await commonApiUtils.getTestDriveDetails(
      "8435771435" || profile.number  ,
      pastDateFormatted,
      toDateFormatted,
      channelId
    );

    response = response.filter((item) =>
      cars.find((car) => car.modelCd === item.modelCd) ? true : false
    );

    response = response.sort((a, b) => {
      const dateComparison =
        new Date(b.testDriveDate) - new Date(a.testDriveDate);
      if (dateComparison !== 0) {
        return dateComparison;
      }
      const [hourA, minuteA] = a.testDriveStartTime.split(":");
      const [hourB, minuteB] = b.testDriveStartTime.split(":");
      const timeA = new Date(`1970-01-01T${hourA}:${minuteA}:00Z`);
      const timeB = new Date(`1970-01-01T${hourB}:${minuteB}:00Z`);
      return timeB - timeA;
    });

    return response.map((item) => {
      const car = cars.find((car) => car.modelCd === item.modelCd);

      let dealerDetails = {
        dealerName: item.dealerName
          ? item.dealerName.substring(0, 21) + "."
          : "",
        dealerContact: item.dealerContact || "",
        dealerEmail: item.dealerEmail || 'NOT AVAILABLE',
        dealerLocationQueryParam:item.dealerLatitude +','+item.dealerLongitude,
        testDriveDate: formatDate(item.testDriveDate) || "",
        enquiryNumber: item.enquiryNumber || "",
        status: "Test Drive",
        driveStatus:
          item.testDriveStatus === "F"
            ? "Completed"
            : item.testDriveStatus === "C"
            ? "Cancelled"
            : "Upcoming",
      };

      return {
        dealerDetails,
        image:
          publishDomain +
          (car?.carImageDealershipActivities?._dynamicUrl ||
            car?.carImage?._dynamicUrl),
      };
    });
  };

  const getBookingsCards = async (profile, cars) => {
    //TODO: phone number should be picked form profile data, hardcoding right now for the demo purpose
    let response = await commonApiUtils.getBookingDetails("9972373497" || profile.number , channelId);
    
    

    return response.map((item) => {
      //TODO: modelCd picked from api response, hardcoding right now for the response is not correct
      const car = cars.find((car) => car.modelCd === item.modelCd);

      let dealerDetails = {
        dealerName: item.dealerName
          ? item.dealerName.substring(0, 21) + "."
          : "",
        dealerContact: item.dealerContact || "",
        dealerEmail: item.email || 'NOT AVAILABLE',
        dealerLocationQueryParam:item.latitude +','+item.longitude,
        testDriveDate: formatDate(item.orderDate) || "",
        enquiryNumber: item.orderNum || "",
        status:  "Booking",
        driveStatus:
          item.testDriveStatus === "F"
            ? "Completed"
            : item.testDriveStatus === "C"
            ? "Cancelled"
            : "Upcoming",
      };

      return {
        dealerDetails,
        image:
          car ? publishDomain +
          (car?.carImageDealershipActivities?._dynamicUrl ||
            car?.carImage?._dynamicUrl) : carImg,
      };
    });
  };

  async function init(profile) {

    block.innerHTML = `
   <div class="profile-past-activities-shimmer">
  <div class="profile-past-activities-shimmer-block">
      <div class="shimmer-banner"></div>
      <div class="shimmer-content">
        <div class="shimmer-text"></div>
        <div class="shimmer-text"></div>
        <div class="shimmer-text small"></div>
      </div>
    </div>
</div>
  `;

  try {  
    const cars = await commonApiUtils.getCarList(channelId);
    orders = navigator === 'navigation' ? await getBookingsCards(profile, cars) : await getTestDriveCards(profile, cars);
    block.innerHTML = finalMarkup();

    function handleKebabClick(e) {
      e.preventDefault();
      e.stopPropagation();

      const menuButton = e.currentTarget;
      const menuOptions = menuButton.nextElementSibling;

      document.querySelectorAll(".menu-options.active").forEach((menu) => {
        if (menu !== menuOptions) {
          menu.classList.remove("active");
        }
      });

      menuOptions.classList.toggle("active");
    }

    function attachMenuListeners() {
      document.querySelectorAll(".kebab-menu").forEach((button) => {
        button.addEventListener("click", handleKebabClick);
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest(".menu-container")) {
          document.querySelectorAll(".menu-options.active").forEach((menu) => {
            menu.classList.remove("active");
          });
        }
      });
    }

    function handleTabClick(e) {
      const tabType = e.target.dataset.tab.toLowerCase();

      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");

      let filteredOrders = orders;
      if (tabType !== "all") {
      
        filteredOrders = orders.filter((order) =>
          order.dealerDetails.status.toLowerCase().slice(0, 3) === tabType.slice(0, 3)
        );
      }

      const ordersList = document.querySelector(".past-activities-splide-list");
      if (ordersList) {
        ordersList.innerHTML = filteredOrders.map(createOrderCard).join("");
        attachMenuListeners();

        if (splide) {
          splide.refresh();
        }
      }
    }

    splide = new Splide(".past-activities-splide-carousel", {
      type: "slide",
      perPage: 3,
      gap: "24px",
      arrows: true,
      drag: false,
      pagination: false,

      breakpoints: {
        768: {
          perPage: 1,
          gap: "24px",
          pagination: false,
          arrows: true,
          drag: true,
          snap: true,
          speed: 400,
          lazyLoad: "nearby",
        },
      },
    }).mount();

    attachMenuListeners();
    const tabss = document.querySelectorAll(".tab-btn");
    tabss.forEach((tab) => tab.addEventListener("click", handleTabClick));

    const initDataLayerEvents = async () => {
      const navLinks = document.querySelectorAll(".menu-options a");

      navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          const pageDetails = {};

          pageDetails.componentName = "Past Activities Section";
          pageDetails.componentType = "Link";
          pageDetails.componentTitle = "Past Activities";
          pageDetails.webName = e.target.textContent.trim() || " ";
          pageDetails.linkType = "exit";

          analytics.setButtonDetails(pageDetails);
        });
      });
    };

    initDataLayerEvents();
  }catch (error) {
    block.innerHTML = `<p class="error-message">Failed to load order history. Please try again later.</p>`;
  }
  }

  authUtils.waitForAuth().then(async () => {
    const profile = await authUtils.getProfile();
    if (profile) {
      init(profile);
    }
  });
}
