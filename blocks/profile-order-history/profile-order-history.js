// Using modern ES modules for better tree-shaking
import "../../commons/scripts/splide/splide.js";
import analytics from "../../utility/analytics.js";
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import authUtils from '../../commons/utility/authUtils.js';
import commonApiUtils from '../../commons/utility/apiUtils.js';
import { carImg } from "./profile-order-history-mock.js";

export default async function decorate(block) {
  let activeMenu = null;

  const [blockNameEl, viewAllEl, viewAllURLEl, dateLabelEl, orderIdLabelEl] =
    block.children;

  const blockName = blockNameEl?.textContent?.trim() || "";
  const viewAll = viewAllEl?.textContent?.trim() || "";
  const viewAllURL = viewAllURLEl?.textContent?.trim() || "";
  const dateLabel = dateLabelEl?.textContent?.trim() || "";
  const orderIdLabel = orderIdLabelEl?.textContent?.trim() || "";

  let orders;

  function createOrderCard(order) {
    return `
      <div class="order-card splide__slide" data-order-id="${order.bookingDetails.orderNum}">
        <div class="card-header">
          <span>${order.bookingDetails.variantDesc}</span>
          <div class="menu-container">
            <button class="kebab-menu" aria-label="Menu" aria-expanded="false">
              <div class="dots">
              </div>
            </button>
            <div class="menu-options" aria-hidden="true">
              <button class="download-btn" data-id="${order.bookingDetails.orderNum}">Download Invoice</button>
            <button class="care-btn" data-id="${order.bookingDetails.orderNum}">Customer Care</button>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="card-details">
            <span>${dateLabel}</span>
            <span class="car-detail-order-date">${order.bookingDetails.orderDate}</span>
          </div>
          <div class="card-details-order">
            <span>${orderIdLabel}</span>
            <span class="car-detail-order-id">${order.bookingDetails.orderNum}</span>
          </div>
          <div class="card-image">
              <img src="${order.image}" alt="${order.imageAltTxt}" loading="lazy">
          </div>
        </div>
      </div>
    `;
  }

  function finalMarkup() {
    return `
        <div class="card-wrapper">
          <div class="white-patch-mobile"><svg xmlns="http://www.w3.org/2000/svg" width="98" height="16" viewBox="0 0 98 16"><path d="M97.228 0L85.9998 16H-0.000160217V0H97.228Z" fill="#F2F2F2"/></svg></div>
          <div class="white-patch-desk"><svg xmlns="http://www.w3.org/2000/svg" width="401" height="25" viewBox="0 0 401 25"><path d="M400.914 0L383.406 25L0 25V0L400.914 0Z" fill="#F2F2F2"/></svg></div>
          <div class="card-clip">
            <div class="header">
              <span>${blockName}</span>
              <a href="${viewAllURL}" class="view-all" data-view-all>${viewAll}</a>
            </div>
            <div class="order-cards-wrapper">
              <div class="splide" id="splide-order-history">
                <div class="splide__track splide__track_block">
                  <div class="splide__list">
                    ${orders
                      .map((order) => createOrderCard(order, true))
                      .join("")}
                  </div>
                </div>
                <div class="splide__arrows">
                </div>
              </div>
            </div>
          </div>
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
  

  const { publishDomain, channelId } = await fetchPlaceholders();

  const getBookingsCards = async (profile, cars) => {
    
    //TODO: phone number should be picked form profile data, hardcoding right now for the demo purpose
    let response = await commonApiUtils.getBookingDetails("9972373497" || profile.number, channelId);
    

    return response.map((item) => {
      //TODO: modelCd picked from api response, hardcoding right now for the response is not correct
      const car = cars.find((car) => car.modelCd === item.modelCd );
      

      let bookingDetails = {
        variantDesc: item.variantDesc
          ? "Car Booking - " + item.variantDesc.slice(0, 15) + "..."
          : "",
          mobile: item.mobile || "",
          email: item.email || "NOT AVAILABLE",
          orderDate: formatDate(item.orderDate) || "",
        orderNum: item.orderNum || "",
      };

      return {
        bookingDetails,
        image:
         car ? publishDomain +
          (car?.carImageDealershipActivities?._dynamicUrl ||
            car?.carImage?._dynamicUrl) : carImg,
        imageAltTxt: car?.altText || car?.logoImageAltText,
      };
    });
  };

  async function init(profile) {
    block.innerHTML = `
   <div class="profile-order-history-shimmer">
  <div class="profile-order-history-shimmer-block">
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
      const cars = await commonApiUtils.getCarList("EXC");
    const bookingInfo = await getBookingsCards(profile, cars);
    orders = await bookingInfo;
    block.innerHTML = finalMarkup();
    

    new Splide("#splide-order-history", {
      perPage: 3,
      perMove: 1,
      gap: "24px",
      pagination: false,
      autoplay: 0.2,
      breakpoints: {
        768: {
          perPage: 1,
          perMove: 1,
          gap: "24px",
          pagination: false,
          autoplay: 0.2,
        },
      },
    }).mount();

    const handlers = {
      kebabClick(e) {
        const kebabButton = e.currentTarget;
        const menuOptions = kebabButton.nextElementSibling;

        if (activeMenu && activeMenu !== menuOptions) {
          handlers.closeMenu(activeMenu);
        }

        const isExpanded = menuOptions.classList.contains("active");
        menuOptions.classList.toggle("active");
        kebabButton.setAttribute("aria-expanded", !isExpanded);
        menuOptions.setAttribute("aria-hidden", isExpanded);

        activeMenu = isExpanded ? null : menuOptions;
        e.stopPropagation();
      },

      closeMenu(menu) {
        menu.classList.remove("active");
        menu.setAttribute("aria-hidden", "true");
        menu.previousElementSibling.setAttribute("aria-expanded", "false");
      },

      outsideClick(e) {
        if (activeMenu && !e.target.closest(".menu-container")) {
          handlers.closeMenu(activeMenu);
          activeMenu = null;
        }
      },
    };

    const kebabButtons = block.querySelectorAll(".kebab-menu");
    kebabButtons.forEach((btn) =>
      btn.addEventListener("click", handlers.kebabClick)
    );

    document.addEventListener("click", handlers.outsideClick);

    window.handlers = handlers;

    block.addEventListener("click", (e) => {
      const downloadBtn = e.target.closest(".download-btn");
      const careBtn = e.target.closest(".care-btn");
      const viewAllLink = e.target.closest(".view-all");

      if (downloadBtn) {
        setAnalyticsDetails(e, "link", "download");
      }

      if (careBtn) {
        setAnalyticsDetails(e, "CTA", "other");
      }

      if (viewAllLink) {
        setAnalyticsDetails(e, "CTA", "other");
      }
    });

    const setAnalyticsDetails = (e, componentType, linkType) => {
      const pageDetails = {};

      pageDetails.componentName = "Order History Section";
      pageDetails.componentType = componentType;
      pageDetails.componentTitle = "Order History";
      pageDetails.webName = e.target.textContent.trim() || " ";
      pageDetails.linkType = linkType;

      analytics.setButtonDetails(pageDetails);
    };
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
