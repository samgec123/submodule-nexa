import utility from './utility.js';
import ctaUtils from './ctaUtils.js';
import authUtils from '../commons/utility/authUtils.js';

const teaser = {
  setupImage: (imageEl, altTextEl) => {
    const image = imageEl?.querySelector('picture');
    const img = image?.querySelector('img');
    img?.removeAttribute('width');
    img?.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img?.setAttribute('alt', alt);
    return image;
  },

  setupTitle: (titleEl) => {
    const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    title?.classList?.add('teaser__title-text');
    return title;
  },

  setupDescription: (descriptionEl) => {
    if (descriptionEl?.children?.length === 1 && descriptionEl?.firstElementChild?.tagName === 'DIV') {
      return descriptionEl?.querySelector('div')?.innerHTML;
    }
    return descriptionEl?.innerHTML;
  },

  setupCtaHtml: (primaryCta, secondaryCta) => {
    if (!primaryCta && !secondaryCta) return '';

    return `
    <div class="teaser__actions">
      ${primaryCta ? primaryCta.outerHTML : ''}
      ${secondaryCta ? secondaryCta.outerHTML : ''}
    </div>
  `;
  },

  applyTheme: (block, theme, themeType) => {
    if (theme) {
      block.classList.add(theme);
    }
    if (themeType) {
      block.classList.add(themeType);
    }
  },

  generateHtmlTemplate: (themeType, CAR_TEASER_THEME_TYPE, title, image, description, pretitle, ctaHtml) => {
    if (themeType === CAR_TEASER_THEME_TYPE) {
      return `
      ${title ? `<div class="teaser__title">${title.outerHTML}</div>` : ''}
      <div class="teaser__card">
        ${image ? `<div class="teaser__image">${image.outerHTML}</div>` : ''}
        <div class="teaser__content">
          <div class="teaser__info">
            ${description ? `<div class="teaser__description">${description}</div>` : ''}
          </div>
          ${ctaHtml}
        </div>
      </div>
    `;
    }

    return `
    <div class="teaser__card">
      ${image ? `<div class="teaser__image">${image.outerHTML}</div>` : ''}
      <div class="teaser__content">
        <div class="teaser__info">
          ${pretitle ? `<div class="teaser__pretitle"><p>${pretitle}</p></div>` : ''}
          ${title ? `<div class="teaser__title">${title.outerHTML}</div>` : ''}
          ${description ? `<div class="teaser__description">${description}</div>` : ''}
        </div>
        ${ctaHtml}
      </div>
    </div>
  `;
  },

  setupZoomInImage: (block) => {
    const img = block.querySelector('.teaser__image img');
    img.addEventListener('click', () => img.classList.add('zoom-in'));
    document.addEventListener('click', (e) => {
      if (e.target !== img) {
        img.classList.remove('zoom-in');
      }
    });
  },

  getTeaser: (block, signInCallBack) => {
    const CAR_TEASER_THEME_TYPE = 'car-accessory-teaser';
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

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
      themeEl,
      themeTypeEl,
      signOutTitleEl,
      signOutDescriptionEl,
      signOutCtaTextEl,
    ] = block.children;

    const theme = themeEl?.textContent?.trim();
    const themeType = themeTypeEl?.textContent?.trim();

    const image = teaser.setupImage(imageEl, altTextEl);
    const pretitle = pretitleEl?.textContent?.trim();
    const title = teaser.setupTitle(titleEl);
    const titleText = title?.textContent?.trim();
    title.textContent = titleText?.replace('{name}', '');
    const signOutTitle = signOutTitleEl?.textContent?.trim();
    const signOutDescription = teaser.setupDescription(signOutDescriptionEl);
    const signOutCtaText = signOutCtaTextEl?.textContent?.trim();
    const description = teaser.setupDescription(descriptionEl);
    let primaryCta = ctaUtils.getLink(primaryCtaLinkEl, primaryCtaTextEl, primaryCtaTargetEl, 'primary__btn');
    const secondaryCta = ctaUtils.getLink(secondaryCtaLinkEl, secondaryCtaTextEl, secondaryCtaTargetEl, 'secondary__btn');
    if(themeType === 'sign-in-card-teaser' && primaryCtaTextEl?.textContent?.trim()) {
      primaryCta = document.createElement('button');
      primaryCta.setAttribute('type', 'button');
      primaryCta.classList.add('primary__btn', 'sign-in-btn');
      primaryCta.textContent = primaryCtaTextEl.textContent?.trim();
    }

    const ctaHtml = teaser.setupCtaHtml(primaryCta, secondaryCta);

    teaser.applyTheme(block, theme, themeType);
    block.innerHTML = '';

    const htmlTemplate = teaser.generateHtmlTemplate(themeType, CAR_TEASER_THEME_TYPE, title, image, description, pretitle, ctaHtml);
    block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(htmlTemplate));

    if (themeType === CAR_TEASER_THEME_TYPE && isMobile) {
      teaser.setupZoomInImage(block);
    }

    const attachAuthListeners = (isLoggedIn) => {
      const cta = block.querySelector('.sign-in-btn');
      if(isLoggedIn) {
        cta?.addEventListener('click', () => {
          authUtils.logout();
        }, false);
      } else {
        cta?.addEventListener('click', () => {
          authUtils.login();
        }, false);
      }
    };

    const updateSignInText = async () => {
      const profile = await authUtils.getProfile();
      const teaserTitle = block.querySelector('.teaser__title-text');
      if(teaserTitle) {
        teaserTitle.textContent = titleText.replace('{name}', (profile?.fname) ? ` ${profile.fname}` : '');
      }

      if(themeType !== 'sign-in-card-teaser') return;
      const signInBtn = block.querySelector('.primary__btn');
      if (profile) {
        if(teaserTitle && signOutTitle) {
          teaserTitle.textContent = signOutTitle.replace('{name}', ` ${profile.fname}`);
        }
        if(signOutDescription) {
          block.querySelector('.teaser__description').innerHTML = signOutDescription;
        }
        if (signInBtn && signOutCtaText) {
          signInBtn.textContent = signOutCtaText;
        }
      }
    }

    authUtils.waitForAuth().then(async () => {
      await updateSignInText();
      attachAuthListeners(await authUtils.getProfile());
    });

    const isSignInTeaser = themeType === 'sign-in-card-teaser';
    if(signInCallBack) {
      signInCallBack({titleText, signOutTitle, signOutDescription, signOutCtaText, isSignInTeaser });
    }
    return block;
  },
};

export default teaser;
