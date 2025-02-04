import utility from '../../utility/utility.js';
import ctaUtils from '../../utility/ctaUtils.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [
    logoImageEl,
    idEl,
    desktopImageEl,
    mobileImageEl,
    titleEl,
    subTitleEl,
    descriptionEl,
    ctaTextEl,
    ctaLinkEl,
    ctaTargetEl,
    ctaText2El,
    ctaLink2El,
    ctaTarget2El,
  ] = block.children;
  const logoImgSrc = logoImageEl?.querySelector('img')?.src || '';
  const id = idEl?.textContent?.trim() || '';
  const desktopImgSrc = desktopImageEl?.querySelector('img')?.src || '';
  const desktopImgAlt = desktopImageEl?.querySelector('img')?.alt || 'Explore Banner Image';
  const mobileImgSrc = mobileImageEl?.querySelector('img')?.src || '';
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || null;
  title?.classList?.add('component-title');
  const subtitle = subTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)') || null;
  subtitle?.classList?.add('component-subtitle');
  const description = descriptionEl?.querySelector('div p')?.innerHTML;
  const cta = ctaLinkEl
    ? ctaUtils.getLink(ctaLinkEl, ctaTextEl, ctaTargetEl)
    : null;
  cta?.setAttribute('download', true);
  const cta2 = ctaLink2El
    ? ctaUtils.getLink(ctaLink2El, ctaText2El, ctaTarget2El)
    : null;

  cta2?.setAttribute('download', true);
  const CtaText = utility.textContentChecker(ctaTextEl);
  const Target = ctaTargetEl?.textContent?.trim() || '_self';
  const link = ctaLinkEl?.querySelector('a');

  const CtaText2 = utility.textContentChecker(ctaText2El);
  const Target2 = ctaTarget2El?.textContent?.trim() || '_self';
  const link2 = ctaLink2El?.querySelector('a');

  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class='component-container'>
    <div class='image-container'>
        <picture>
          <source srcset='${desktopImgSrc}' media='(min-width: 999px)'>
          <source srcset='${mobileImgSrc}' media='(max-width: 999px)'>
          <img src='${desktopImgSrc}' alt='${desktopImgAlt}' class='' />
     </picture>
      </div>
      <div class='text_container'>
         <div class='logo-container'>
        <picture>
          <source srcset='${logoImgSrc}' media='(min-width: 999px)'>
          <img src='${logoImgSrc}' alt='' />
        </picture>
      </div>
        ${title ? title.outerHTML : ''}
        ${subtitle ? subtitle.outerHTML : ''}
        <div id='descriptionEl' class='component-description'>${description}</div>
              <div class='cta-action'>
              <div class='cta-btn'>
                      <a href='${link}' target='${Target}' class='cta__new cta__new-primary'>${CtaText}</a>
                      <a href='${link2}' target='${Target2}' class='cta__new cta__new-outlined'>${CtaText2}</a>
                    </div>
              </div>
        </div>

      </div>
    </div>
  `);

  const getEventDetails = (e) => {
    const pageDetails = {};
    const { blockName } = block.dataset;
    const getText = (selector) => block.querySelector(selector)?.textContent?.trim() || '';
    const mainTitle = getText('.component-title');
    const subTitle = getText('.component-subtitle');
    const componentTitle = subTitle ? `${mainTitle} ${subTitle}` : mainTitle;

    pageDetails.componentName = blockName;
    pageDetails.componentTitle = componentTitle || '';
    pageDetails.componentType = 'Link';
    pageDetails.webName = e.target.textContent.trim();
    pageDetails.linkType = 'other';

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    const bannerBtnClick = e.target.closest('.cta-btn a');

    if (bannerBtnClick) {
      getEventDetails(e);
    }
  });
}
