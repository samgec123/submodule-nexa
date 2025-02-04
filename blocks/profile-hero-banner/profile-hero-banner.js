import mockData from "./profile-hero-banner-mock.js";
import utility from "../../utility/utility.js";
import apiUtils from "../../commons/utility/apiUtils.js";
import analytics from "../../utility/analytics.js";

export default async function decorate(block) {
  const [
    variationEl,
    usernamePrefixEl,
    backgroundImageEl,
    bannerLink1TextEl,
    bannerLink1UrlEl,
    bannerLink2TextEl,
    bannerLink2UrlEl,
    bannerLink3TextEl,
    bannerLink3UrlEl,
    bannerLink4TextEl,
    bannerLink4UrlEl,
    bannerLink5TextEl,
    bannerLink5UrlEl,
  ] = block.children;

  const variation = variationEl?.textContent?.trim() || "default";
  const usernamePrefix = usernamePrefixEl?.textContent?.trim() || "Hi";
  const backgroundImage = backgroundImageEl?.querySelector("img")?.src || "";
  const bannerLink1Text = bannerLink1TextEl?.textContent?.trim() || "";
  const bannerLink1Url = bannerLink1UrlEl?.textContent?.trim();
  const bannerLink2Text = bannerLink2TextEl?.textContent?.trim() || "";
  const bannerLink2Url = bannerLink2UrlEl?.textContent?.trim();
  const bannerLink3Text = bannerLink3TextEl?.textContent?.trim() || "";
  const bannerLink3Url = bannerLink3UrlEl?.textContent?.trim();
  const bannerLink4Text = bannerLink4TextEl?.textContent?.trim() || "";
  const bannerLink4Url = bannerLink4UrlEl?.textContent?.trim();
  const bannerLink5Text = bannerLink5TextEl?.textContent?.trim() || "";
  const bannerLink5Url = bannerLink5UrlEl?.textContent?.trim();

  const bannerLink1 = bannerLink1Url
    ? `<li><a href="${bannerLink1Url}">${bannerLink1Text}</a></li>`
    : "";
  const bannerLink2 = bannerLink2Url
    ? `<li><a href="${bannerLink2Url}">${bannerLink2Text}</a></li>`
    : "";
  const bannerLink3 = bannerLink3Url
    ? `<li><a href="${bannerLink3Url}">${bannerLink3Text}</a></li>`
    : "";
  const bannerLink4 = bannerLink4Url
    ? `<li><a href="${bannerLink4Url}">${bannerLink4Text}</a></li>`
    : "";
  const bannerLink5 = bannerLink5Url
    ? `<li><a href="${bannerLink5Url}">${bannerLink5Text}</a></li>`
    : "";

  const pageTitle = document.title || "";
  const navigationBackUrl = window.location.pathname
    .split("/")
    .slice(0, -1)
    .join("/");

  const response = await apiUtils.fetchCustomerData();
  const username = response?.data?.[0]?.customer?.customerName || "";
  const city =
    response?.data?.[0]?.customer?.residentialAddressSale?.cityDesc || "";
  const state =
    response?.data?.[0]?.customer?.residentialAddressSale?.stateDesc || "";
  const mobile = response?.data?.[0]?.customer?.mobileNo || "";

  block.innerHTML = `
    <div class="profile-banner-wrapper ${variation}" style="background-image: url(${backgroundImage})">
      <div class="profile-banner-content">
        <div class="profile-page-navigation">
          <a class="nav-back" role="button" aria-label="Go back to landing page" href="${navigationBackUrl}"></a>
          <h4>${pageTitle}</h4>
        </div>

        <div class="user-content">
          <h2 class="profile-username">${usernamePrefix} ${username}!</h2>
          <h4 class="profile-location">${city}, ${state}</h4>
        </div>

        <div class="profile-banner-links">
          <ul>
            ${bannerLink1}
            ${bannerLink2}
            ${bannerLink3}
            ${bannerLink4}
            ${bannerLink5}
          </ul>
        </div>
      </div>
    </div>
  `;

  const initDataLayerEvents = async () => {
    const navLinks = document.querySelectorAll(".profile-banner-links a");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const pageDetails = {};
        pageDetails.componentName = "Introductory Banner";
        pageDetails.componentType = "CTA";
        pageDetails.componentTitle = "User Profile";
        pageDetails.webName = e.target.textContent.trim() || " ";
        pageDetails.linkType = "other";

        analytics.setButtonDetails(pageDetails);
      });
    });
  };

  initDataLayerEvents();
}
