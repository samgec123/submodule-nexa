import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const [titleEl, ...ctasEl] = block.children;

  const {
    ariaLabelContact,
  } = await fetchPlaceholders();

  const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList.add('user__contact-title');
  let hasIconText = false;
  let primaryTelephone;
  let secondaryTelephone;

  const ctaElements = ctasEl.map((element) => {
    const iconTypeEl = element?.querySelector('div > div > p:first-child');
    const iconType = iconTypeEl?.textContent?.trim();
    let innerHTML = '';
    if (iconType === 'iconText') {
      hasIconText = true;
      const [imageEl, altTextEl, fieldTypeEl, primaryTextEl, secondaryTextEl] = element.children[1].children;
      const imgSrc = imageEl?.querySelector('img')?.src;
      const altText = altTextEl?.textContent?.trim() || '';
      const fieldType = fieldTypeEl?.textContent?.trim() || '';
      const primaryText = primaryTextEl?.textContent?.trim() || '';
      const secondaryText = secondaryTextEl?.textContent?.trim() || '';

      switch (fieldType) {
        case 'phone': {
          primaryTelephone = primaryText;
          secondaryTelephone = secondaryText;
          innerHTML = `
                <button class="user__contact--icon-text phone" aria-label="${ariaLabelContact}">
                  <img src="${imgSrc}" alt="${altText}" loading="lazy">
                         <a href="tel:${primaryTelephone}" class="primary-telephone phone">${primaryTelephone}</a>
                </button> 
                   <button class="user__contact--icon-text phone secondary-telephone-icon" aria-label="${ariaLabelContact}">
                  <img src="${imgSrc}" alt="${altText}" loading="lazy">
                     <a href="tel:${secondaryTelephone}" class="secondary-telephone phone">${secondaryTelephone}</a>
                </button>
              `;
          break;
        }
        case 'email':
          innerHTML = `
                <a href="mailto:${primaryText}" class="user__contact--icon-text email">
                  <img src="${imgSrc}" alt="${altText}" loading="lazy">
                  <div class="primary-email">${primaryText}</div>
                </a>
              `;
          break;
        case 'whatsapp': {
          const encodedSecondaryText = encodeURIComponent(secondaryText);
          innerHTML = `
                <a href="https://wa.me/${primaryText}?text=${encodedSecondaryText}" target="_blank" class="user__contact--icon-text whatsapp">
                  <img src="${imgSrc}" alt="${altText}" loading="lazy">
                  <div class="primary-whatsappno">${primaryText}</div>
                </a>
              `;
          break;
        }
        default:
          innerHTML = `
                <a href="${primaryText}" target="_blank" class="user__contact--icon-text">
                  <img src="${imgSrc}" alt="${altText}" loading="lazy">
                </a>
              `;
      }
    } else {
      const [imageEl, altTextEl, ctaTextEl, linkEl, targetEl] = element.children[1].children;
      const imgSrc = imageEl?.querySelector('img')?.src;
      const altText = altTextEl?.textContent?.trim() || 'icon';
      const ctaText = ctaTextEl?.textContent?.trim() || '';
      const link = linkEl?.querySelector('a')?.href;
      const target = targetEl?.textContent?.trim() || '_self';

      innerHTML = `
         <a href="${link}" target="${target}" class="user__contact--icon" title="${ctaText}">
           <img src="${imgSrc}" alt="${altText}" loading="lazy">
          
         </a>
       `;
    }

    element.innerHTML = innerHTML;
    moveInstrumentation(element, element.firstElementChild);
    return element.innerHTML;
  }).join('');

 
  block.innerHTML = utility.sanitizeHtml(`
    <div class="user__contact">
      ${title ? `${title.outerHTML}` : ''}
      <div class="user__contact__icons">
        ${ctaElements}
      </div>
      
      ${hasIconText ? `<div class="user__contact__icon-call_container hidden">
        <a href="tel:${primaryTelephone}" class="primary-telephone">${primaryTelephone}</a>
        <p class="separator"></p>
        <a href="tel:${secondaryTelephone}" class="secondary-telephone">${secondaryTelephone}</a>
      </div>` : ''}
    </div>
  `);
}
