import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [titleEl, titleLinkEl, titleTargetEl, orientationEl, ...ctasEl] = block.children;

  let titleHtml = '';
  const heading = titleEl?.querySelector('h1, h2, h3, h4, h5, h6') || '';
  if (heading) {
    heading.classList.add('accordian-item', 'link-column__heading');
    const titleLink = titleLinkEl?.querySelector('a')?.href || '';
    const titleTarget = titleTargetEl?.textContent?.trim() || '_self';

    if (titleLinkEl?.querySelector('a')?.href) {
      const headingLink = document.createElement('a');
      headingLink.href = titleLink;
      headingLink.classList.add('link-column__link');
      headingLink.target = titleTarget;
      headingLink.ariaLabel = heading.textContent || '';
      headingLink.textContent = heading.textContent || '';
      heading.innerHTML = '';
      heading.appendChild(headingLink);
    }
    titleHtml = heading.outerHTML;
  } else {
    const titleText = titleEl?.textContent?.trim() || '';
    const titleLink = titleLinkEl?.querySelector('a')?.href || '';
    const titleTarget = titleTargetEl?.textContent?.trim() || '_self';
    if (titleText) {
      titleHtml = `
       <p class="accordiant-item link-column__heading">
         ${titleLink ? `<a class = "link-column__link" href="${titleLink}" target="${titleTarget}" aria-label="${titleText}">${titleText}</a>` : titleText}
       </p>
     `;
    }
  }

  const orientation = orientationEl?.textContent?.trim() || 'link-column-vertical';
  let ctaElementsHTML = '';
  if (ctasEl.length > 0) {
    ctaElementsHTML = ctasEl.map((element) => {
      const [ctaTextEl, linkEl, targetEL] = element.children;
      const ctaText = ctaTextEl?.textContent?.trim() || '';
      const link = linkEl?.querySelector('a')?.href || '';
      const target = targetEL?.textContent?.trim() || '_self';
      const li = document.createElement('li');
      moveInstrumentation(element, li);
      li.innerHTML = `<a class = "link-column__list" href="${link}" target="${target}" aria-label="${ctaText}">${ctaText}</a>`;
      return li.outerHTML;
    }).join('');
  }

  block.innerHTML = utility.sanitizeHtml(
    `<div class="link-grid-column ${orientation}">
      ${titleHtml}
      <ul class="content links-container accordian-content">
        ${ctaElementsHTML || ''}
      </ul>
    </div>`,
  );

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};
    if (e.target.closest('.link-column__list')) {
      pageDetails.webName = `${e.target.closest('.link-grid-column').querySelector('.column__heading-link, .link-column__heading')?.textContent.trim()}:${e.target?.textContent.trim()}`;
    } else {
      pageDetails.webName = e.target?.textContent.trim();
    }
    pageDetails.componentName = 'footer navigation';
    pageDetails.componentType = 'link';

    pageDetails.linkType = e.target;

    analytics.setFooterNavigation(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.link-column__list') || e.target.closest('.card') || e.target.closest('.link-column__heading')?.querySelector('a')) {
      setLinkDetails(e);
    }
  });
}
