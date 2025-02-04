import utility from '../../utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import ctaUtils from '../../utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  function getImmersiveTeaser() {
    const [
      imageEl,
      altTextEl,
      titleEl,
      subtitleEl,
      descriptionEl,
      ctaTextEl,
      ctaLinkEl,
      ctaTargetEl,
    ] = block.children;
    const image = imageEl?.querySelector('picture');
    if (image) {
      const img = image.querySelector('img');
      img.setAttribute('width', '100%');
      img.removeAttribute('height');
      const alt = altTextEl?.textContent?.trim() || 'image';
      img.setAttribute('alt', alt);
    }
    const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    title?.classList?.add('immersive__title');
    const subtitle = subtitleEl?.textContent?.trim();
    const description = descriptionEl?.querySelector('div')?.innerHTML;
    const cta = (ctaLinkEl) ? ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl) : null;

    return {
      image,
      title,
      subtitle,
      description,
      cta,
    };
  }

  const immersiveTeaser = getImmersiveTeaser();
  const teaserEl = block.children[8];
  let teaserObj;
  if (teaserEl?.innerHTML) {
    teaserObj = teaser.getTeaser(teaserEl);
    teaserObj.classList.add('teaser-wrapper');
  }
  immersiveTeaser.cta?.classList.add('btn-title');
  const immersiveTeaserHtml = utility.sanitizeHtml(`
        ${(immersiveTeaser.image) ? `<div class="immersive__image">${immersiveTeaser.image.outerHTML}</div>` : ''}
         <div class="immersive__content">
         <div class="immersive_content_wrapper">
          <div class="immersive_content_textContainer">
           ${(immersiveTeaser.title) ? `${immersiveTeaser.title.outerHTML}` : ''}
           ${(immersiveTeaser.subtitle) ? `<p class="immersive__subtitle">${immersiveTeaser.subtitle}</p>` : ''}
           ${(immersiveTeaser.description) ? `<div class="immersive__description">${immersiveTeaser.description}</div>` : ''}
           </div>
           ${(immersiveTeaser.cta) ? `<div class="immersive__action">${immersiveTeaser.cta.outerHTML}</div>` : ''}
          </div>
          </div>
    `);

  block.innerHTML = utility.sanitizeHtml(`
    <div class="immersive__wrapper right-seperator">
        ${immersiveTeaserHtml}
        ${(teaserObj?.innerHTML) ? teaserObj.outerHTML : ''}
    </div>
  `);

  block.querySelector('.immersive__action a').classList.add('cta__new', 'cta__new-primary');

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};

    pageDetails.componentName = block.getAttribute('data-block-name');
    pageDetails.componentTitle = e.target.closest('.immersive__content').querySelector('#discover-your-perfect-car')?.textContent;
    pageDetails.componentType = 'button';
    pageDetails.webName = e.target?.textContent;
    pageDetails.linkType = e.target;

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.cta__new-primary')) {
      setLinkDetails(e);
    }
  });
}
