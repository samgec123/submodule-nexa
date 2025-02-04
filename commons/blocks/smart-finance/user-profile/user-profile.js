import { fetchPlaceholders } from "../../../scripts/aem.js";

export default async function decorate(block) {
  const innerDiv = block.children[0].children[0];
  const [
    logoutTextEl,
    popupHeadingEl,
    popupDescEl,
    linkEl,
    yesEl,
    noEl,
    userImageEl,
    userimagealttxtEl,
  ] = innerDiv.children;

  const logoutText = logoutTextEl?.textContent?.trim() || '';
  const popupHeading = popupHeadingEl?.textContent?.trim() || '';
  const popupDesc = popupDescEl?.textContent?.trim() || '';
  const link = linkEl?.querySelector('a')?.href || '#';
  const yesText = yesEl?.textContent?.trim() || '';
  const noText = noEl?.textContent?.trim() || '';
  const userImageElement = userImageEl.querySelector('img');
  const userImage = userImageElement?.getAttribute('src')?.trim() || '';
  const userimagealttxt = userimagealttxtEl?.textContent?.trim() || '';

  const name = sessionStorage.getItem('name');
  const designation = sessionStorage.getItem('designation');
  const outletAddress = sessionStorage.getItem('outlet_address');

  const { apiDomain, } = await fetchPlaceholders();

  function createProfileCard() {
    return `
      <div class="container ">
          <div class="user-profile-block">
              <div class="user-information-box">
                  <div class="user-img">
                      <img src="${userImage}" alt="${userimagealttxt}">
                  </div>
                  <div class="user-details">
                      <div class="user_bx">
                          <h4 class="user_name" id="user_name">${name}</h4>
                          <p class="user_designation" id="user_designation">${designation}</p>
                          <p class="user_addr" id="user_addr">${outletAddress}</p>
                      </div>
                      <div class="user_logout">
                          <a href="javascript:void(0)" id="logoutButton" class="btn-black">${logoutText}</a>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
  }

  function createModal() {
    return `
      <div class="popUpmain" id="popup" style="display:none;">
        <div class="modal-content">
          <div class="close" id="close-popup">
          </div>
          <div class="popupContent blue">
          <div class="logo-wrapper">
          <div class="icon-img"></div>
            <h2> ${popupHeading}</h2>
            </div>
            <p>${popupDesc}</p>
            <div class="blackButton">
              <button type="button" class="logout_yes" id="yesButton">${yesText}</button>
            </div>
            <div class="blackButton">
              <button type="button" class="logout_no" id="noButton">${noText}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function logoutUser() {
    const url = `${apiDomain}/app-service/api/v1/dealer/invalidate`; // Replace with your actual logout API endpoint
    const headers = {
      'Content-Type': 'application/json',
      'X-dealer-Authorization': sessionStorage.getItem('mspin_token'),
      'X-mspin': sessionStorage.getItem('mspin')
    };
  
    try {
      // Call the logout API
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      if (response.ok) {
        // Remove the token from sessionStorage
        sessionStorage.removeItem('mspin_token');
        window.location.href = link;
      } else {
        alert('Logout failed. Please try again later.');
      }
    } catch (error) {
      alert('An error occurred while logging out. Please check your connection and try again.');
    }
  }

  function setupEventListeners(logoutButton, modal) {
    logoutButton.addEventListener('click', () => {
      modal.classList.add('fade-in');
      modal.style.display = 'flex';
    });

    modal.querySelector('#close-popup').addEventListener('click', () => {
      modal.classList.remove('fade-in');
      modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    const yesButton = modal.querySelector('#yesButton');
    yesButton.addEventListener('click', () => {
      logoutUser();
    });

    const noButton = modal.querySelector('#noButton');
    noButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Using mock data for demonstration purposes
  const profileCardHTML = createProfileCard();
  const modalHTML = createModal();
  block.innerHTML = profileCardHTML + modalHTML;
  const logoutButton = document.getElementById('logoutButton');
  const modal = document.getElementById('popup');
  setupEventListeners(logoutButton, modal);
}
