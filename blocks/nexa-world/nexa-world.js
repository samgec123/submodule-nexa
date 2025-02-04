import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';

export default async function decorate(block) {
  const { ariaLabelLinks } = await fetchPlaceholders();
  function getNexaWorldContent() {
    const [
      pretitleEl,
      titleEl,
      descriptionEl,
      ctaTextEl,
      ctaLinkEl,
      ctaTargetEl,
      ...linkEls
    ] = block.children;

    const pretitle = pretitleEl?.textContent?.trim() || '';
    const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    title?.classList?.add('title');
    const description = Array.from(descriptionEl?.querySelectorAll('p')).map((p) => p.textContent.trim()).join('');

    const cta = (ctaLinkEl) ? {
      href: ctaLinkEl?.querySelector('a')?.href || '#',
      title: ctaLinkEl?.querySelector('a')?.title || '',
      target: ctaTargetEl?.textContent?.trim() || '_self',
      textContent: ctaTextEl?.textContent?.trim() || '',
    } : null;

    const links = Array.from(linkEls).map((linkEl) => {
      const [linkImageEl, linkAltTextEl, linkTextEl, linkAnchorEl, linkTargetEl] = linkEl.children;

      const image = linkImageEl?.querySelector('picture');
      const linkAltText = linkAltTextEl?.textContent?.trim() || '';
      const linkText = linkTextEl?.textContent?.trim() || '';
      const linkAnchor = linkAnchorEl?.querySelector('a')?.href || '#';
      const linkTarget = linkTargetEl?.querySelector('a')?.target || '_self';

      return {
        image,
        imgAlt: linkAltText,
        text: linkText,
        href: linkAnchor,
        target: linkTarget,
        linkEl,
      };
    });

    return {
      pretitle,
      title,
      description,
      cta,
      links,
    };
  }
  const nexaWorldContent = getNexaWorldContent();

  // Construct Nexa World HTML structure
  const nexaWorldHtml = `
    <div class="nexa-world__content">
      <div class="nexa-world__title">
        ${nexaWorldContent?.pretitle ? `<p class="pre-title">${nexaWorldContent.pretitle}</p>` : ''}
        ${nexaWorldContent?.title ? `${nexaWorldContent.title.outerHTML}` : ''}
      </div>
      ${nexaWorldContent?.description ? `<p class="description">${nexaWorldContent.description}</p>` : ''}
      <div class="nexa-world__action">
        <a href="${nexaWorldContent?.cta?.href || '#'}" title="${nexaWorldContent?.cta?.title || ''}" aria-label="${ariaLabelLinks}" class="cta__new cta__new-outlined" target="${nexaWorldContent?.cta?.target || '_self'}">
          ${nexaWorldContent?.cta?.textContent}
        </a>
      </div>
    </div>`;

  // Create the links HTML structure
  const ul = document.createElement('ul');
  ul.classList.add('list-container');
  nexaWorldContent?.links.forEach((link) => {
    const listItem = document.createElement('li');
    if (link.image) {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.text;
      anchor.target = link.target;
      listItem.appendChild(anchor);
    }

    moveInstrumentation(link.linkEl, listItem);
    ul.appendChild(listItem);
  });

  const nexaWorldTeaser = `
    <div class="nexa-world__teaser">
      <div class="nexa-world__links">
        ${ul?.outerHTML}
      </div>
      <div class="nexa-world__mobImage"></div>
    </div>`;

  // Replace the block's HTML with the constructed Nexa World HTML and teaser if present
  block.innerHTML = utility.sanitizeHtml(`
    <div class="nexa-world__container">
      <div class="nexa-world__content__container">
      ${nexaWorldHtml}
      ${nexaWorldTeaser}
      </div>
      <div class="nexa-world__image">
      </div>
    </div>`);

  // Function to handle hover effects and infinite loop
  function updateHoverEffects() {
    const links = document.querySelectorAll('.nexa-world__links a');
    const teaserImageContainer = document.querySelector('.nexa-world__mobImage');
    const container = document.querySelector('.nexa-world__image');

    let currentIndex = 0;
    let isHovered = false;
    let autoLoopInterval; // Variable to store the interval ID
    let isMobile = window.innerWidth < 768;

    function displayImage(pictureElement) {
      isMobile = window.innerWidth < 768;
      if (!pictureElement || !(pictureElement instanceof HTMLElement)) {
        console.error('Invalid picture element:', pictureElement);
        return;
      }
      if (isMobile) {
        teaserImageContainer.innerHTML = '';
        teaserImageContainer.appendChild(pictureElement);
      } else {
        container.innerHTML = '';
        container.appendChild(pictureElement);
      }
    }

    function activateLink(index) {
      links.forEach((link) => link.classList.remove('active'));
      const link = links[index];
      link.classList.add('active');
      const image = nexaWorldContent?.links[index]?.image;
      if (image) {
        displayImage(image);
      } else {
        console.error('Image not found for index:', index);
      }
    }

    // Infinite loop
    function startAutoLoop() {
      autoLoopInterval = setInterval(() => {
        if (!isHovered) {
          currentIndex = (currentIndex + 1) % links.length;
          activateLink(currentIndex);
        }
      }, 5000);
    }

    activateLink(currentIndex);
    startAutoLoop();

    // Add event listeners for hover on each link
    links.forEach((link, index) => {
      link.addEventListener('mouseover', () => {
        isHovered = true;
        clearInterval(autoLoopInterval); // Stop auto loop on hover
        activateLink(index);
      });

      link.addEventListener('mouseout', () => {
        isHovered = false;
        startAutoLoop(); // Restart auto loop when mouse leaves
      });
    });

    function handleResize() {
      clearInterval(autoLoopInterval); // Stop auto loop during resize
      const image = nexaWorldContent?.links[currentIndex]?.image;
      if (image) {
        displayImage(image);
      }
      activateLink(currentIndex); // Ensure the correct link is activated after resize
      startAutoLoop(); // Restart the auto loop
    }
    window.addEventListener('resize', handleResize);
  }

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};

    pageDetails.componentName = block.getAttribute('data-block-name');
    const firstTitle = e.target.closest('.nexa-world__content__container').querySelector('.pre-title')?.textContent;
    pageDetails.componentTitle = `${firstTitle} ${e.target.closest('.nexa-world__content__container').querySelector('#nexa-world')?.textContent}`;
    pageDetails.componentType = e.target.closest('.nexa-world__action') ? 'button' : 'link';
    pageDetails.webName = e.target?.textContent;
    pageDetails.linkType = e.target;

    analytics.setButtonDetails(pageDetails);
  };

  block.addEventListener('click', (e) => {
    if (e.target.closest('.nexa-world__action') || e.target.closest('a')) {
      setLinkDetails(e);
    }
  });

  // Initialize hover effects and auto-loop
  updateHoverEffects();
}
