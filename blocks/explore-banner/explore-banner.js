import utility from '../../utility/utility.js';
import ctaUtils from '../../utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [
    idEl,
    desktopImageEl,
    mobileImageEl,
    titleEl,
    descriptionEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
  ] = block.children;

  const id = idEl?.textContent?.trim() || '';
  const desktopImgSrc = desktopImageEl?.querySelector('img')?.src || '';
  const desktopImgAlt = desktopImageEl?.querySelector('img')?.alt || 'Explore Banner Image';
  const mobileImgSrc = mobileImageEl?.querySelector('img')?.src || '';
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || null;
  title?.classList?.add('component-title');
  const description = descriptionEl?.querySelector('div p')?.innerHTML;
  const cta = (ctaLinkEl) ? ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl) : null;
const elementSpan = document.createElement('span');
cta.appendChild(elementSpan).classList.add('download-icon');
  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="component-container">
      <div class="text_container">
        ${title ? title.outerHTML : ''}
        <div id="descriptionEl" class="component-description">${description}</div>
        <div class="cta-action">
          <div class="cta-btn">
            ${cta ? cta.outerHTML : ''}
          </div>
        </div>
      </div>
      <div class="image-container">
        <picture>
          <source srcset="${desktopImgSrc}" media="(min-width: 999px)">
          <source srcset="${mobileImgSrc}" media="(max-width: 999px)">
          <img src="${desktopImgSrc}" alt="${desktopImgAlt}" />
        </picture>
      </div>
    </div>
  `);

  block.querySelector('.cta-btn a')?.addEventListener('click', (e) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = block.querySelector('.component-title')?.textContent?.trim() || '';
    data.componentType = 'button';
    data.webName = e.target?.textContent?.trim() || '';
    data.linkType = e.target;
    analytics.setButtonDetails(data);
  });
}
