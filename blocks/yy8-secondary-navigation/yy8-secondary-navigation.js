import { moveInstrumentation } from '../../commons/scripts/scripts.js';
import utility from '../../utility/utility.js';
import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';

let TAB_INDEX = 0;

const NAV_VARIATIONS = {
  variation1: 'variation1',
  variation2: 'variation2',
};

export default async function decorate(block) {
  const [imageEl, altTextEl, logoLinkEl, variationTypeEL, , , , logoTxtEl, ...ctasEl] = block.children;
  const { ariaLabelLogo, ariaLabelHamburger } = await fetchPlaceholders();

  const variationType = variationTypeEL?.textContent?.trim() || '';
  const carModelName = logoTxtEl?.textContent?.trim() || '';

  const picture = imageEl?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img.setAttribute('alt', alt);
  }
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const logoLink = logoLinkEl?.querySelector('a')?.href || '';

  const ctaElements = ctasEl
    .map((element, index) => {
      const [ctaTextEl, linkEl, targetEl] = element.children;
      const ctaText = ctaTextEl?.textContent?.trim() || '';
      const target = targetEl?.textContent?.trim() || '';
      const link = linkEl?.querySelector('.button-container a')?.href;
      const newButton = document.createElement('a');
      newButton.href = link;
      newButton.target = target;
      newButton.innerHTML = `<p>${ctaText}</p>`;
      newButton.classList.add('nav-button');
      if (index === 0) {
        newButton.classList.add('nav-button', 'active');
      }

      element.innerHTML = '';
      element.appendChild(newButton);

      moveInstrumentation(element, newButton);

      return element.innerHTML;
    })
    .join('');

  const removeActive = (btn) => {
    btn.classList.remove('active');
  };
  function setActiveButton(navButtons) {
    let activeFound = false;

    navButtons.forEach((button) => {
      const buttonPath = new URL(button.href).pathname;
      const cleanButtonPath = buttonPath.split('#')[0];

      if (cleanButtonPath === window.location.pathname) {
        button.classList.add('active');
        activeFound = true;
      } else {
        button.classList.remove('active');
      }
    });

    if (!activeFound && navButtons.length > 0) {
      navButtons[0].classList.add('active');
    }
  }

  function setupNavButtons(navButtons) {
    navButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        if (button.href.includes('#')) {
          event.preventDefault();
          const targetId = button.href.split('#')[1];
          if (targetId === '') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
              targetSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
          return;
        }
        if (variationType === NAV_VARIATIONS.variation1) {
          if (button.href.slice(-1) !== '#') {
            return;
          }

          if (button.classList.contains('active')) {
            return;
          }

          event.preventDefault();

          navButtons.forEach(removeActive);
          button.classList.add('active');

          const tabItems = document.querySelectorAll('.tab-item');
          const newActiveTab = tabItems[button.dataset.index];

          if (!newActiveTab) return;

          const currentActiveTab = document.querySelector(
            '.tab-item.tab-item-active',
          );
          currentActiveTab?.classList.remove('tab-item-active');
          newActiveTab?.classList.add('tab-item-active');
        }

        if (variationType === NAV_VARIATIONS.variation2) {
          navButtons.forEach(removeActive);
          button.classList.add('active');

          const hamburgerMenu = block.querySelector(
            '.secondary-navbar-container.variation2',
          );
          const subContainer = hamburgerMenu.querySelector('.secondary-navbar');
          hamburgerMenu.style.visibility = 'hidden';
          if (window.innerWidth < 768) {
            subContainer.classList.remove('scroll-active');
          }
        }
      });
    });
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="secondary-navbar-container ${variationType}">
        <nav class="secondary-navbar">
            <a href="${logoLink}" aria-label="${ariaLabelLogo}" class="logo-container ${variationType === NAV_VARIATIONS.variation2 ? 'back-button' : ''
    }">
              ${carModelName !== '' ? carModelName : imageEl.innerHTML}
            </a>
            ${variationType === NAV_VARIATIONS.variation1
      ? `<button class="hamburger-icon" aria-label="${ariaLabelHamburger}" type="button"></button>`
      : ''
    }
            <div class="buttons-container">
              <div class="buttons-list">
                ${ctaElements}
              </div>
            </div>
        </nav>
    </div>
    `);

  const navbarbuttons = block.querySelectorAll('.nav-button');
  setupNavButtons(navbarbuttons);

  const primaryNavButtons = block.querySelectorAll(
    '.secondary-navbar-container.variation1 .nav-button',
  );
  setActiveButton(primaryNavButtons);

  if (variationType === NAV_VARIATIONS.variation2) {
    const backButton = block.querySelector('.secondary-navbar .back-button');
    const section = document.querySelector('.yy8-secondary-navigation')?.closest('.section');
    const navbar = document.querySelector(
      '.secondary-navbar-container.variation1',
    );
    const subnavbar = document.querySelector(
      '.secondary-navbar-container.variation2',
    );
    const activeSection = section?.children[2];
    let lastScrollTop = section?.offsetTop;

    // eslint-disable-next-line no-inner-declarations
    function resetNavbarStates() {
      if (navbar) {
        navbar?.classList?.remove('fade-in');
        navbar?.classList?.remove('fade-out');
        navbar?.classList?.add('fade-out');
        if (window.innerWidth < 768) {
          navbar.style.top = `-2px`;
        } else {
          navbar.style.top = `0px`;
        }
      }
    }
    // eslint-disable-next-line no-inner-declarations
    function resetSubNavbarStates() {
      if (subnavbar) {
        if (window.innerWidth >= 768) {
          subnavbar.classList.remove('fade-in', 'fade-out');
          subnavbar?.classList?.add('fade-out');
        } else {
          subnavbar.style.visibility = 'hidden';
          const subContainer = subnavbar.querySelector('.secondary-navbar');
          subContainer.classList.remove('scroll-active');
        }
      }
    }

    // eslint-disable-next-line no-inner-declarations
    function handleScrollDown(currentScroll, sectionTop, activeSectionHeight) {
      if (currentScroll >= sectionTop && currentScroll < sectionTop + activeSectionHeight) {
        if (navbar) {
          navbar.style.visibility = 'visible';
          navbar.style.position = 'fixed';
          navbar.style.top = '0';
          navbar.classList.add('bg-black');
          navbar.classList.remove('fade-out');
          navbar.classList.add('fade-in');
        }
        if (subnavbar && window.innerWidth >= 768) {
          subnavbar.classList.add('fade-out');
          subnavbar.classList.remove('fade-in');
        }
      } else if (currentScroll >= sectionTop + activeSectionHeight) {
        resetNavbarStates();
        resetSubNavbarStates();
      }
    }
    const firstSection = document.querySelector('main').firstElementChild;
    const secondSection = firstSection ? firstSection.nextElementSibling : null;

    const firstSectionTop = firstSection ? firstSection.getBoundingClientRect().top : 0;
    const secondSectionTop = secondSection ? secondSection.getBoundingClientRect().top : 0;
    // eslint-disable-next-line no-inner-declarations
    function handleScrollUp(currentScroll, sectionTop, sectionHeight) {
      if (currentScroll < lastScrollTop && secondSection && secondSectionTop <= 0) {
        if (navbar) {
          navbar.style.visibility = 'visible';
          navbar.style.position = 'fixed';
          navbar.style.top = `${navbar.offsetHeight}px`;
          navbar.classList.remove('fade-out');
          navbar.classList.add('fade-in');
          navbar.style.top = `0px`;
        }

        if (subnavbar) {
          if (window.innerWidth >= 768) {
            subnavbar.style.visibility = 'visible';
            subnavbar.style.position = 'fixed';
            subnavbar.style.top = `${navbar.offsetHeight}px`;
            subnavbar.style.marginTop = `0`;
            subnavbar.classList.remove('fade-out');
            subnavbar.classList.add('fade-in');
          } else {
            resetSubNavbarStates();
          }
        }
      } else {
        resetSubNavbarStates();
      }
    }

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const sectionTop = section?.offsetTop;
      const sectionHeight = section?.offsetHeight;
      const activeSectionHeight = activeSection?.offsetHeight;
      // Before section
      if (currentScroll < sectionTop) {
        resetNavbarStates();
        resetSubNavbarStates();
        navbar.style.position = 'relative';
        navbar.classList.remove('fade-out');

        subnavbar.style.position = 'relative';
        subnavbar.classList.remove('fade-out');
        subnavbar.style.top = 0;
        subnavbar.style.marginTop = `68px`;
      } else if (currentScroll < lastScrollTop && secondSection && secondSectionTop <= 0) {
        // Scrolling down
        if (currentScroll > lastScrollTop) {
          handleScrollDown(currentScroll, sectionTop, activeSectionHeight);
        } else {
          handleScrollUp(currentScroll, sectionTop, sectionHeight);
        }
      } else {
        resetNavbarStates();
        resetSubNavbarStates();
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    subnavbar.dataset.index = TAB_INDEX;

    backButton?.addEventListener('click', (e) => {
      e.preventDefault();
      subnavbar.style.visibility = 'hidden';
    });

    document.addEventListener('click', (event) => {
      const primarysubNavWrapper = document.querySelector('.secondary-navbar-container.variation2');
      const open = window.getComputedStyle(primarysubNavWrapper).visibility === 'visible';
      const subnavbar = primarysubNavWrapper.querySelector('.secondary-navbar');
      const hamburgerDiv = document.querySelector('.secondary-navbar-container.variation1 .hamburger-icon');

      // Check if the click is outside the secondary-navbar
      if (open && !subnavbar.contains(event.target) && !hamburgerDiv.contains(event.target) && isMobile) {
        primarysubNavWrapper.style.visibility = 'hidden';
      }
    });

    const parentSection = block.closest('.section');
    // only show the first tab by default
    if (TAB_INDEX === 0) {
      parentSection.classList.add('tab-item-active');
    }
    TAB_INDEX += 1;
  }
  const nextBtn = block.querySelector('.switchList-next-arrow');
  const prevBtn = block.querySelector('.switchList-prev-arrow');
  const switchListContainer = block.querySelector('.variation1 .secondary-navbar .buttons-container .buttons-list');

  function nextSlide(event) {
    event.stopPropagation();
    switchListContainer.scrollBy({
      left: switchListContainer.clientWidth,
      behavior: 'smooth',
    });
    prevBtn.style.display = 'block';
    prevBtn.classList.remove('hidden');
    if (Math.round(switchListContainer.scrollLeft) + Math.round(switchListContainer.clientWidth) >= switchListContainer.scrollWidth - Math.round(switchListContainer.clientWidth)) {
      nextBtn.classList.add('hidden');
    } else {
      nextBtn.classList.remove('hidden');
    }
  }

  function prevSlide(event) {
    event.stopPropagation();
    switchListContainer.scrollBy({
      left: -switchListContainer.clientWidth,
      behavior: 'smooth',
    });
    nextBtn.classList.remove('hidden');
    if (Math.round(switchListContainer.scrollLeft) - Math.round(switchListContainer.clientWidth) <= 0) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }
  function updateButtonVisibility() {
    // Show/hide previous button
    if (switchListContainer.scrollLeft > 0) {
      prevBtn.style.display = 'block';
    } else {
      prevBtn.style.display = 'none';
    }

    // Show/hide next button
    if (switchListContainer.clientWidth < switchListContainer.scrollWidth) {
      nextBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'none';
    }
  }
  if (variationType === NAV_VARIATIONS.variation1) {
    const hamburgerIcon = block.querySelector(
      '.secondary-navbar .hamburger-icon',
    );
    hamburgerIcon.addEventListener('click', () => {
      const hamburgerMenus = document.querySelector(
        '.secondary-navbar-container.variation2',
      );
      const subContainer = hamburgerMenus.querySelector('.secondary-navbar');
      hamburgerMenus.style.visibility = 'visible';
      hamburgerMenus.style.position = 'relative';
      if (window.innerWidth < 768) {
        subContainer.classList.add('scroll-active');
      }
    });
    nextBtn.addEventListener('click', (event) => nextSlide(event));
    prevBtn.addEventListener('click', (event) => prevSlide(event));

    if (isMobile) {
      prevBtn.style.display = 'none';
      // Add scroll event listener
      switchListContainer.addEventListener('scroll', updateButtonVisibility);
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  block.querySelectorAll('.secondary-navbar-container.variation1 .nav-button').forEach((item) => {
    const data = {};
    data.componentTitle = `SubNav|e VITARA`;
    data.componentName = block.dataset.blockName;
    data.componentType = 'link';
    data.webName = item.textContent.trim();
    data.linkType = item;
    item.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });

  block.querySelectorAll('.secondary-navbar-container.variation2 .nav-button').forEach((item) => {
    const data = {};
    data.componentTitle = `SubNav|e VITARA`;
    data.componentName = block.dataset.blockName;
    data.componentType = 'link';
    data.webName = item.textContent.trim();
    data.linkType = item;
    item.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });
}
