import utility from '../../utility/utility.js';
import ctaUtils from '../../commons/utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    idEl,
    subTitleEl,
    titleEl,
    descriptionEl,
    ctaTextFirstEl,
    ctaLinkFirstEl,
    ctaTargetFirstEl,
    ctaTextSecondEl,
    ctaLinkSecondEl,
    ctaTargetSecondEl,
    imgBannerCardEl,
    imgBannerCardAltEl,
  ] = children;

  const id = idEl?.textContent?.trim() || '';
  const subtitle = subTitleEl?.textContent?.trim() || '';
  const title = titleEl || null;
  const description = descriptionEl?.textContent?.trim() || '';
  const primaryCta = ctaUtils.getLink(
    ctaLinkFirstEl,
    ctaTextFirstEl,
    ctaTargetFirstEl,
  );

  if (id) {
    block.setAttribute('id', id);
  }
  primaryCta?.classList.add('banner-card-primary-btn');

  const secondaryCta = ctaUtils.getLink(
    ctaLinkSecondEl,
    ctaTextSecondEl,
    ctaTargetSecondEl,
  );
  const imgBanner = imgBannerCardEl?.querySelector('picture img')?.src || '';
  const imgAlt = imgBannerCardAltEl?.textContent?.trim() || '';

  block.innerHTML = utility.sanitizeHtml(`
    <div class="banner-card-wrapper">
        <div class="banner-card-image">
          <img src="${imgBanner}" alt="${imgAlt}">
         </div> 
         <div class="container banner-slide-data">
                ${subtitle ? `<div class="banner-slide-subtitle">${subtitle}</div>` : ''}
                ${title ? `<div class="banner-slide-title"> ${title?.outerHTML}</div>` : ''}
                ${description ? `<div class="banner-slide-description">${description}</div>` : ''}
                
                <div class="btn-wrapper">
                ${primaryCta
    ? `<button class="btn btn-primary">
                        <span>
                            ${primaryCta?.outerHTML ?? ''}
                        </span>

                    </button>`
    : ''}
                ${secondaryCta
    ? `<button class="btn btn-secondary">
                        ${secondaryCta?.outerHTML ?? ''}
                        </button>`
    : ''}
                </div>
            </div>
        </div>
    `);

  
    block.querySelectorAll('a').forEach((link) => {
      const data = {};
      data.componentName = block.dataset.blockName;
      data.componentTitle = link.textContent?.trim() || '';
      data.componentType = 'button';
      data.webName = link.textContent?.trim() || '';
      data.linkType = link;
      
      link.addEventListener('click', () => {
        analytics.setButtonDetails(data);
      });
    });

  const registerIntrestTeaserButton = block.querySelector('.banner-card-primary-btn');
  const btnUrl = registerIntrestTeaserButton?.href;
  const compId = btnUrl?.substr(btnUrl.lastIndexOf('#') + 1);
  
  registerIntrestTeaserButton?.addEventListener('click', () => {
    const registerInrestBlocks = document.querySelectorAll('.register-your-interest-container');
    registerInrestBlocks.forEach((registerInrestBlock) => {
      const popupId = registerInrestBlock?.querySelector('.register-your-interest-wrapper')?.querySelector('.modal')?.id || '';
      if (popupId === compId) {
        registerInrestBlock.querySelector('.register-your-interest-wrapper').style.display = 'block';
        const modalBlock = document.querySelector(".modal");
        modalBlock.setAttribute("aria-hidden", false);
        modalBlock.focus();
        document.body.style.overflow = 'hidden';
      }
    });
  });
}
