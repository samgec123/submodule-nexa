import ctaUtils from '../../commons/utility/ctaUtils.js';
import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
    const [
        titleEl,
        imglogoEl,
        imglogoAltEl,
        descriptionEl,
        imgBannerEl,
        imgBannerAltEl,
        imgMobileBannerEl,
        ctaTextEl,
        ctaLinkEl,
        ctaTargetEl,
        disclaimerTextEl,
      ] = block.children;

      const title = titleEl || null;
      let isImageTag = true;
      let isImageBannerTag = true;
      const imgLogoAlt = imglogoAltEl?.textContent?.trim() || '';
      const imgLogo = await checkImageAvailablity(imglogoEl,'logo', imgLogoAlt);
      const description = descriptionEl?.textContent?.trim() || '';
      const imgBannerAlt = imgBannerAltEl?.textContent?.trim() || '';
      const imgBanner = await checkImageAvailablity(imgBannerEl,'banner', imgBannerAlt);
      const imgMobileBanner = await checkImageAvailablity(imgMobileBannerEl,'banner', imgBannerAlt);
      const primaryCta = ctaUtils.getLink(
        ctaLinkEl,
        ctaTextEl,
        ctaTargetEl,
      );
      primaryCta?.classList.add('banner-teaser-primary-btn', 'cta__new', 'cta__new-primary');
      const disclaimerText = disclaimerTextEl?.textContent?.trim() || '';

      if (utility.isEditorMode(block)) {
        block.classList.add('yy8-container-height-editor-mode');
      }
      
      let ctasHtml = '';
      if (primaryCta) {
        ctasHtml = `
          <div class="teaser-banner-actions">
            ${(primaryCta) ? `${primaryCta.outerHTML}` : ''}
          </div>
        `;
        primaryCta?.classList.add('car-hero-banner-primary-btn', 'cta__new', 'cta__new-primary');
      }
      async function checkImageAvailablity(element,type,alt) {
        const { publishDomain } = await fetchPlaceholders();
        if(element?.querySelector('img') || element?.querySelector('a')) {
          if(!element?.querySelector('img')) {
            if (type== 'logo') {
              isImageTag = false;
            } else {
              isImageBannerTag = false;
            }
            const anchor = element.querySelector('a')?.href || '';
            const url = new URL(anchor);
            return (anchor) ? publishDomain + url.pathname + url.search : '';
          } else {
            element?.querySelector('img').setAttribute('alt', alt);
          }
          const src = element?.querySelector('p')?.innerHTML;
          return src;
        }
        return '';
      }

      block.innerHTML = utility.sanitizeHtml(
       `
        <div class="banner-teaser-wrapper">
          <div class="banner-teaser-image">
           ${isImageBannerTag ? `<div class="imgBanner">${imgBanner}</div>` : `<div class="imgBanner"><picture><img src="${imgBanner}" alt="${imgBannerAlt}"/></picture></div>`}
           ${isImageBannerTag ? `<div class="mobileBanner">${imgMobileBanner || imgBanner}</div>` : `<div class="mobileBanner"><picture><img src="${(imgMobileBanner || imgBanner)}" alt="${imgBannerAlt}"/></picture></div>`}
          </div>
          <div class="container banner-teaser-data">
            <div class="banner-teaser-top-content">
              ${title ? `<div class="banner-teaser-title"> ${title?.outerHTML}</div>` : ''}
          <div class="logo-wrapper">${isImageTag ? imgLogo : `<picture><img src="${imgLogo}" alt="${imgLogoAlt}"/></picture>`}</div> 
              ${description ? `<div class="banner-slide-description">${description}</div>` : ''}
            </div>
            <div class="banner-teaser-bottom-content">
              <div class="banner-teaser-action-right">
                ${ctasHtml}
                <div class="banner-teaser-disclaimer">
                  ${disclaimerText}
                </div>
              </div>
            </div>
          </div>
        </div>
       `
      );
      
      const registerIntrestTeaserButton = block.querySelector('.banner-teaser-primary-btn');
      const btnUrl = registerIntrestTeaserButton?.href;
      const compId = btnUrl?.substr(btnUrl.lastIndexOf('#') + 1);

      registerIntrestTeaserButton?.addEventListener('click', (event) => {
        event.preventDefault(); 
        const registerInrestBlocks = document.querySelectorAll('.yy8-register-your-interest-teaser-container');
        registerInrestBlocks.forEach((registerInrestBlock) => {
          const popupId = registerInrestBlock?.querySelector('.yy8-register-your-interest-teaser-wrapper')?.querySelector('.modal')?.id || '';
          if (popupId === compId) {
            registerInrestBlock.querySelector('.yy8-register-your-interest-teaser-wrapper').style.display = 'block';
            const modalBlock = document.querySelector(".yy8-register-interest-modal");
            modalBlock.setAttribute("aria-hidden", false);
            modalBlock.focus();
            document.body.style.overflow = 'hidden';
          }
        });
      });

      block.querySelectorAll('a').forEach((link) => {
        const data = {};
        data.componentName = block.dataset.blockName;
        data.componentTitle = `${title.textContent.trim()}`;
        data.componentType = 'button';
        data.webName = link.textContent.trim() || '';
        data.linkType = link;
        link.addEventListener('click', () => {
          analytics.setButtonDetails(data);
        });
      });
}