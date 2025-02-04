import utility from './utility.js';
import ctaUtils from './ctaUtils.js';

const teaser = {
  getTeaser(block) {
    function initImage(image, altTextEl) {
      const img = image.querySelector('img');
      img.removeAttribute('width');
      img.removeAttribute('height');
      const alt = altTextEl?.textContent?.trim() || 'image';
      img.setAttribute('alt', alt);
    }
    const [
      imageEl,
      altTextEl,
      pretitleEl,
      titleEl,
      descriptionEl,
      primaryCtaTextEl,
      primaryCtaLinkEl,
      primaryCtaTargetEl,
      secondaryCtaTextEl,
      secondaryCtaLinkEl,
      secondaryCtaTargetEl,
      styleEl,
    ] = block.children;
    const image = imageEl?.querySelector('picture');
    if (image) {
      initImage(image, altTextEl);
    }

    const pretitle = pretitleEl?.textContent?.trim();
    const title = titleEl?.textContent?.trim();
    const description = Array.from(descriptionEl.querySelectorAll('p')).map((p) => p.outerHTML).join('');
    const styleText = styleEl?.textContent?.trim();
    let style = [];
    if (styleText) {
      style = styleText.split(',');
    } else {
      style = ['light-teaser', 'buyers-guide-teaser'];
    }

    const primaryCta = ctaUtils.getLink(primaryCtaLinkEl, primaryCtaTextEl, primaryCtaTargetEl, 'primary__btn');
    const secondaryCta = ctaUtils.getLink(secondaryCtaLinkEl, secondaryCtaTextEl, secondaryCtaTargetEl, 'secondary__btn');

    let ctaHtml = '';
    if (primaryCta || secondaryCta) {
      ctaHtml = `
                     <div class="teaser__actions">
                       ${(primaryCta) ? primaryCta.outerHTML : ''}
                       ${(secondaryCta) ? secondaryCta.outerHTML : ''}
                     </div>
                   `;
    }
    block.classList.add(...style);
    block.innerHTML = '';
    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
                       <div class="teaser__card">
                           ${(image) ? `<div class="teaser__image">${image.outerHTML}</div>` : ''}
                           <div class="teaser__content">
                               <div class="teaser__info">
                                   ${(pretitle) ? `<div class="teaser__pretitle"><p>${pretitle}</p></div>` : ''}
                                   ${(title) ? `<div class="teaser__title"><h3>${title}</h3></div>` : ''}
                                   ${(description) ? `<div class="teaser__description">${description}</div>` : ''}
                               </div>
                               ${ctaHtml}
                           </div>
                       </div>
                 `),
    );
    return block;
  },
};

export default teaser;
