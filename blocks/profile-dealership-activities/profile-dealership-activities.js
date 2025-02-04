import "../../commons/scripts/splide/splide.js";
import authUtils from "../../commons/utility/authUtils.js";
import commonApiUtils from "../../commons/utility/apiUtils.js";
import { fetchPlaceholders } from "../../commons/scripts/aem.js";
import analytics from "../../utility/analytics.js";

export default async function decorate(block) {
    const [titleEl, viewAllTextEl, viewAllURLEl, dealerLabelEl, emailLabelEl, schduleDateEl, schduleTimeEl, contactEl, viewDetailsEl,viewDetailsURLEl, testDriveReserveEl, testDriveCompleteEl, testDriveConfirmEl, testDriveCancelEl] = block.children;

    const title = titleEl?.textContent?.trim() || "";
    const viewAllText = viewAllTextEl?.textContent?.trim() || "";
    const viewAllURL = viewAllURLEl?.textContent?.trim() || "";
    const dealerLabel = dealerLabelEl?.textContent?.trim() || "";
    const emailLabel = emailLabelEl?.textContent?.trim() || "";
    const schduleDate = schduleDateEl?.textContent?.trim() || "";
    const schduleTime = schduleTimeEl?.textContent?.trim() || "";
    const contact = contactEl?.textContent?.trim() || "";
    const viewDetails = viewDetailsEl?.textContent?.trim() || "";
    const viewDetailsURL = viewDetailsURLEl?.textContent?.trim() || "";
    const testDriveReserve = testDriveReserveEl?.textContent?.trim() || "";
    const testDriveComplete = testDriveCompleteEl?.textContent?.trim() || "";
    const testDriveConfirm = testDriveConfirmEl?.textContent?.trim() || "";
    const testDriveCancel = testDriveCancelEl?.textContent?.trim() || "";
    if (title !== "") {
      block.classList.add('separator', 'separator-grey', 'separator-sm');
    }

    function initSingleCard() {
        new Splide(".dealer-splide-carousel", {
          focus: 'right',
            perPage: 1,
        }).mount();
    }

    function initCarousel() {
      new Splide(".dealer-splide-carousel", {
          focus: 'center',
          perPage: 1.1,
          perMove: 1,
          gap: '2rem',
          pagination: false,
          autoplay: 0.2,
          breakpoints: {
            768: {
              perPage: 1,
            },
          },
      }).mount();
  }

    let respDealers ;    

  function createDealerDetailsCard(respDealer) {
    return `
                  <div class="profile-dealer-list splide__slide">
                      <div class="profile-dealer-list-img">
                        <img src="${respDealer.image}" alt="${respDealer.imageAltTxt}">
                      </div>

                      <div class="profile-dealier-list-details">
                          <div class="profile-dealer-toast">
                            <span class="profile-dealer-status">
                              ${respDealer?.dealerDetails?.driveStatus || ''}
                            </span>
                            <span class="profile-dealer-msg">
                              | ${respDealer?.dealerDetails?.driveStatusMsg  || ''}
                            </span>                           
                          </div>                          

                          <div class="profile-dealer-section">

                              <div class="profile-dealer-section-wrapper">
                                <div class="profile-dealer-fields-label">
                                  <span>${dealerLabel}</span>
                                </div>
                                <div class="profile-dealer-name">
                                  <span>${respDealer?.dealerDetails?.dealerName  || ''}</span>
                                </div>


                            </div>                            

                             <div class="profile-dealer-section-wrapper">
                              <div class="profile-dealer-fields-label">
                                <span>${contact}</span>
                              </div>
                              <div class="profile-dealer-details-phone">
                                <span>${respDealer?.dealerDetails?.dealerContact  || ''}</span>                                
                              </div>
                              </div>

                            <div class="profile-dealer-section-wrapper">
                                <div class="profile-dealer-fields-label">
                                  <span>${emailLabel}</span>
                                </div>
                                <div class="profile-dealer-details-email">                                
                                  <span>${respDealer?.dealerDetails?.dealerEmail  || ''}</span>
                                  <img class="profile-dealer-email-copy" src="../../icons/copy_icon.svg"/>                             
                                </div>
                            </div>
                        </div>
                        <div class="profile-dealer-saparator"></div>
                        <div class="profile-dealer-schdule-block">
                          <div class="profile-dealer-schdule-section">
                            <div class="profile-dealer-schdule-label">
                              <span>${schduleDate}</span>
                            </div>
                            <div class="profile-dealer-schdule-value">
                              <span>${respDealer?.dealerDetails?.testDriveDate || ''}<span>
                            </div>
                          </div>
                          <div class="profile-dealer-schdule-section">
                            <div class="profile-dealer-schdule-label">
                              <span>${schduleTime}</span>
                            </div>
                            <div class="profile-dealer-schdule-value">
                              <span>${respDealer?.dealerDetails?.testDriveStartTime  || ''}<span>
                            </div>
                          </div>
                        </div>
                         <div  class="profile-dealer-details-btn">
                           <a class="profile-dealer-details-a-tag" target="_blank" href="${viewDetailsURL}">${viewDetails}</a>
                        </div>
                    </div>
                  </div>`;
    }
       
    function finalMarkup (){
      return `
      <div class="profile-dealer-activities">                    
        <div class ="profile-dealer-header">
          <div class="profile-dealer-header-title">
            <p>${title}</p>
          </div>
          <div class="profile-dealer-header-btn">
              <a class="profile-dealer-header-a-tag" href="${viewAllURL}">${viewAllText}</a>
          </div>
        </div>                  
        <div class="card-list-teaser dealer-splide-carousel splide">          
            <div class="splide__track">              
              <div class= "card-list splide__list">
                  ${respDealers?.map(createDealerDetailsCard).join("")}        
              </div>          
            </div>              
            <div class="splide__arrows cust-dealer-activities-arrow"></div>
          </div> 
    </div>
    `;
    }
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
  
    const { publishDomain, channelId } = await fetchPlaceholders();
    
    const getTestDriveCards = async (profile, cars) => {
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 14);
      const toDateFormatted = toDate.toISOString().split('T')[0];
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 14);
      const pastDateFormatted = pastDate.toISOString().split('T')[0];
      //TODO: phone number should be picked form profile data, hardcoding right now for the demo purpose 
      let response = await commonApiUtils.getTestDriveDetails("8435771435" || profile.number, pastDateFormatted, toDateFormatted, channelId);
      
      return response.map((item) => {
        const car = cars.find((car) => car.modelCd === item.modelCd);
  
        let dealerDetails = {
          dealerName: item.dealerName ? item.dealerName.substring(0, 21) + '.' : '',
          dealerContact: item.dealerContact || '',
          dealerEmail: item.dealerEmail || 'NOT AVAILABLE',
          dealerLocationQueryParam:item.dealerLatitude +','+item.dealerLongitude,
          testDriveDate: formatDate(item.testDriveDate) || '',
          testDriveStatus : item.testDriveStatusDescription || '',
          testDriveStartTime : formatTime(item.testDriveStartTime) || '',
          modelDesc:item.modelDesc || '',
          driveStatus: item.testDriveStatus === 'F' 
            ? 'Test Drive Completed' 
            : item.testDriveStatus === 'C' 
            ? 'Test Drive Cancelled' 
            : item.testDriveStatus === 'D' 
            ? 'Test Drive Confirmed' 
            : 'Reserved',
          driveStatusMsg: item.testDriveStatus === 'F' 
            ? testDriveComplete
            : item.testDriveStatus === 'C' 
            ? testDriveCancel 
            : item.testDriveStatus === 'D' 
            ? testDriveConfirm
            : testDriveReserve
        };
      
        return {
          dealerDetails,
          image: publishDomain + (car?.carImageDealershipActivities?._dynamicUrl || car?.carImage?._dynamicUrl),
          imageAltTxt: car?.altText || car?.logoImageAltText,
        };
      });
    }
  
    async function init(profile) {
      block.innerHTML = `
   <div class="profile-dealer-activities-shimmer">
  <div class="profile-dealer-activities-shimmer-block">
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
      const cars = await commonApiUtils.getCarList('EXC');
      const testDriveInfo = await getTestDriveCards(profile, cars);
      respDealers = await testDriveInfo;
      block.innerHTML = finalMarkup() 
      if(respDealers.length < 2) {
       initSingleCard();
       //const eleArrow = document.querySelector('.cust-dealer-activities-arrow');
       //eleArrow.style.display ='none'
      } else {
        initCarousel();
      }  
      copyEvent();
    }catch (error) {
      block.innerHTML = `<p class="error-message">Failed to load order history. Please try again later.</p>`;
    }
    }
    
    authUtils.waitForAuth().then(async () => {
      const profile = await authUtils.getProfile();
      if(profile) {
        init(profile);
      }
    });

    block.addEventListener("click", (e) => {
      const viewAllLink = e.target.closest(".profile-dealer-header-a-tag");
      const viewDetailsLink = e.target.closest(".profile-dealer-details-a-tag");
  
      if (viewAllLink) {
        setAnalyticsDetails(e);
      }
  
      if (viewDetailsLink) {
        setAnalyticsDetails(e);
      }
    });
  
    const setAnalyticsDetails = (e) => {
      const pageDetails = {};
  
      pageDetails.componentName = "Dealership Activities Section";
      pageDetails.componentTitle = "Dealership Activities";
      pageDetails.componentType = "Link";
      pageDetails.webName = e.target.textContent.trim() || " ";
      pageDetails.linkType = "other";
  
      analytics.setButtonDetails(pageDetails);
    };

    function copyEvent(){
      const emailContainers = document.querySelectorAll('.profile-dealer-details-email');
      emailContainers.forEach(container => {
      const emailSpan = container.querySelector('span:first-child');
      const emailCopyButton = container.querySelector('.profile-dealer-email-copy');

      if (emailSpan && emailCopyButton) {
        emailCopyButton.addEventListener('click', () => {
          const email = emailSpan.textContent.trim();
            if(email !== 'NOT AVAILABLE'){
              navigator.clipboard.writeText(email)
              .then(() => {
              })
              .catch(err => {
                console.error('Failed to copy email: ', err);
              });
            }          
        });
      } else {
        console.warn('Missing email span or copy button for a container.');
      }
      });
    }
    
}
