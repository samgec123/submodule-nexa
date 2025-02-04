const headerHTML = `
<div>
   <div class="navbar navbar-nexa">
      <div class="overlay" style="display: block;"></div>
      <div class="links">
         <div class="link-title overlay_hover no-overlay"><span>Explore</span></div>
         <div class="link-title overlay_hover no-overlay"><span>Customise</span></div>
         <div class="link-title overlay_hover no-overlay"><span>Save & Share</span></div>
      </div>
      <div class="right" id="nav-right">
         <div id="user-img" class="overlay_click no-overlay"></div>
         <div class="sign-in-wrapper">
            <div class="sign-in block" data-block-name="sign-in" data-block-status="loaded">
               <div class="user__dropdown">
                  <div class="sign-in-teaser">
                     <div class="sign-in-teaser__desc">
                        <div class="sign-in-teaser__desc-content">
                           <h4 id="get-personalised-recommendations">Get personalised recommendations</h4>
                           <p>Sign in to save your preferences and more</p>
                        </div>
                        <a href="https://author-p71852-e1137339.adobeaemcloud.com/content/eds-universal-editor/us/en/nexa-header-test.html" class="sign-in-teaser--link" target="_self">
                        Sign in <span class="sign-in-teaser--arrow"></span>
                        </a>
                     </div>
                     <div class="sign-in-teaser__image">
                        <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:193d360f-23e2-4836-b5bd-d5aa607015b4/as/nexa-teaser-signin-right-img.jpg?height=157&amp;width=750" loading="lazy" alt="Mobile">
                     </div>
                  </div>
                  <div class="user__account">
                     <a href="https://author-p71852-e1137339.adobeaemcloud.com/content/eds-universal-editor/us/en/nexa-header-test.html" class="user__account--link hide-sm" target="_self">
                     <span class="user__account__list-icon">
                     <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:55f3d7a5-78e3-4156-ae1c-f51275222dc3/as/account_circle.svg?width=750" loading="lazy" alt="Desktop">
                     </span>
                     Sign in
                     </a>
                     <a href="https://dev-nexa.marutisuzuki.com/com/in/en/nexa-demo#" class="user__account--link" target="_self">
                     <span class="user__account__list-icon">
                     <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:c56e8f49-7995-42b2-91f3-c63190308d3e/as/call_24dp_FILL0_wght300_GRAD0_opsz24-1.svg?width=750" loading="lazy" alt="icon">
                     </span>
                     Reach Us
                     </a>
                  </div>
                  <div class="contact-wrapper">
                     <div class="contact block" data-block-name="contact" data-block-status="loaded">
                        <div class="user__contact">
                           <h4 id="contact-us" class="user__contact-title">Contact Us</h4>
                           <div class="user__contact__icons">
                              <button class="user__contact--icon-text phone" aria-label="Contact Us">
                              <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:c56e8f49-7995-42b2-91f3-c63190308d3e/as/call_24dp_FILL0_wght300_GRAD0_opsz24-1.svg?width=750" alt="Phone" loading="lazy">
                              </button>
                              <a href="https://wa.me/5555555555554343?text=hi" target="_blank" class="user__contact--icon-text whatsapp" rel="noopener noreferrer">
                              <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:4e34cfe1-472c-4e40-96f7-1398fbf926f7/as/ic_baseline-whatsapp.svg?width=750" alt="whatsapp" loading="lazy">
                              </a>
                              <a href="mailto:xyz@email.com" class="user__contact--icon-text email">
                              <img src="https://assets-dev-nexa.marutisuzuki.com/adobe/assets/urn:aaid:aem:6f085c25-01b7-4ed2-b260-63edff19f024/as/outgoing_mail.svg?width=750" alt="email" loading="lazy">
                              </a>
                           </div>
                           <div class="user__contact__icon-call_container hidden">
                              <a href="tel:1800-102-6392" class="primary-telephone">1800-102-6392</a>
                              <p class="separator"></p>
                              <a href="tel:1800-200-6392" class="secondary-telephone">1800-200-6392</a>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>

`;
const getHeaderHTML = () => headerHTML;
export { getHeaderHTML };
