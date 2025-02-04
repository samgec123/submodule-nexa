import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import authUtils from '../../commons/utility/authUtils.js';

export default function decorate(block) {
  const [
    signInTitleEl,
    signInDescriptionEl,
    signInCtaTextEl,
    signOutTitleEl,
    signOutDescriptionEl,
    signOutCtaTextEl,
    desktopImageEl,
    mobileImageEl,
    desktopAltTextEl,
    mobileAltTextEl,
    ...ctasEl
  ] = block.children;
  const signInTitle = signInTitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  signInTitle?.classList?.add('sign-in-teaser__title-text');
  const signInDescription = signInDescriptionEl?.firstElementChild;
  signInDescription?.classList?.add('sign-in-teaser__desc-content');
  const signInCtaText = signInCtaTextEl?.textContent?.trim() || '';
  const signOutTitle = signOutTitleEl?.textContent?.trim() || '';
  const signOutDescription = signOutDescriptionEl?.firstElementChild;
  signOutDescription?.classList?.add('sign-in-teaser__desc-content');
  const signOutCtaText = signOutCtaTextEl?.textContent?.trim() || '';

  const desktopSrc = desktopImageEl.querySelector('img')?.src;
  const desktopAltText = desktopAltTextEl?.textContent?.trim() || 'desktopImage';
  const mobileSrc = mobileImageEl.querySelector('img')?.src;
  const mobileAltText = mobileAltTextEl?.textContent?.trim() || 'mobileImage';

  const mobileSignInHtml = `
        <div class="sign-in-teaser">
            <div class="sign-in-teaser__desc">
                ${(signInTitle) ? `${signInTitle.outerHTML}` : ''}
                ${signInDescription.outerHTML}
                ${(signInCtaText) ? `<div class="sign-in-teaser--link sign-in-btn">
                    <button type="button">${signInCtaText}</button> <span class="sign-in-teaser--arrow"></span>
                </div>` : ''}
            </div>
            <div class="sign-in-teaser__image">
                <img src="${mobileSrc}" loading="lazy" alt="${mobileAltText}"/>
            </div>
        </div>
    `;

  const ctaElements = ctasEl.map((element) => {
    const [imageEl, altTextEl, ctaTextEl, linkEl, targetEl] = element.children;
    const imgSrc = imageEl?.querySelector('img')?.src;
    const altText = altTextEl?.textContent?.trim() || 'icon';
    const text = ctaTextEl?.textContent?.trim() || '';
    const ctaLink = linkEl?.querySelector('.button-container a')?.href;
    const target = targetEl?.textContent?.trim() || '_self';

    element.innerHTML = `
            <a href="${ctaLink}" class="user__account--link" target="${target}">
                <span class="user__account__list-icon">
                    <img src="${imgSrc}" loading="lazy" alt="${altText}"/>
                </span>
                ${text}
            </a>
        `;
    moveInstrumentation(element, element.firstElementChild);
    return element.innerHTML;
  }).join('');

  const desktopSignInHtml = `
        <div class="user__account">
            ${(signInCtaText) ? `<div class="user__account--link hide-sm sign-in-btn">
                <span class="user__account__list-icon">
                    <img src="${desktopSrc}" loading="lazy" alt="${desktopAltText}"/>
                </span>
                <button type="button">${signInCtaText}</button>
            </div>` : ''}
            ${ctaElements}
        </div>
    `;

  block.innerHTML = `
        <div class="user__dropdown">
            ${mobileSignInHtml}
            ${desktopSignInHtml}
        </div>
    `;

    authUtils.waitForAuth().then(async () => {
        const profile = await authUtils.getProfile();
        const cardTitle = block.querySelector('.sign-in-teaser__title-text');
        const description = block.querySelector('.sign-in-teaser__desc-content');
        if(profile && cardTitle) {
            cardTitle.textContent = signOutTitle.replace('{name}', ` ${profile.fname}`);
        }
        if(profile && description) {
            description.innerHTML = signOutDescription.innerHTML;
        }
        block.querySelectorAll('.sign-in-btn button').forEach((link) => {
            if(profile) {
                link.textContent = signOutCtaText;
            }
            link.addEventListener('click', async () => {
                if (profile) {
                    await authUtils.logout();
                } else {
                    await authUtils.login();
                }
            });
        });
    });
}
