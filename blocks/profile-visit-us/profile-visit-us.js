import utility from '../../commons/utility/utility.js';

export default function decorate(block) {
  const [
    backgroundImageEl,
    backgroundImageMobileEl,
    titleEl,
    addressEl,
    phoneEl,
    cinEl,
    mapTextEL,
    mapUrlEl,
  ] = block.children;

  const backgroundImg = backgroundImageEl?.querySelector('img')?.src || '';
  const backgroundImageMobile = backgroundImageMobileEl?.querySelector('img')?.src || '';
  let bgImage = backgroundImg;

  if (utility.isMobileDevice()) {
    bgImage = backgroundImageMobile;
  }

  const title = titleEl?.textContent?.trim() || '';
  const address = addressEl?.querySelector('div').innerHTML || '';
  const phone = phoneEl?.textContent?.trim() || '';
  const cin = cinEl?.textContent?.trim() || '';
  const mapText = mapTextEL?.textContent?.trim() || '';
  const mapUrl = mapUrlEl?.textContent?.trim() || '';

  const newHtml = `
  <div class="profile-vist-us-section">   
      <div class="profile-vist-us-bg-img visit-us-desktop" style="background-image: url(${bgImage}">        
          <div class="profile-vist-us-bg-gradient-top"></div>
          <div class="profile-vist-us-bg-gradient-mid"></div>
          <div class="profile-vist-us-bg-gradient-bottom"></div>         
      </div>  
     <div class="profile-vist-us-container">
          <div class="profile-vist-us-title">
            <p>${title}</p>
          </div>
          <div class="profile-vist-us-address">
            ${address}
          </div>
          <div class="profile-vist-us-phone profile-vist-us-font-style">            
            <img src="../../icons/call_v2.svg">
            <span>${phone}</span>
          </div>
          <div class="profile-vist-us-cin profile-vist-us-font-style">
            <p>${cin}</p>
          </div>
          <div class="profile-vist-us-map profile-vist-us-font-style">
            <a href="${mapUrl}">${mapText}</a>
            <img src="../../icons/north_east_v2.svg">
          </div>
      </div>
  </div>
  
  `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));
}
