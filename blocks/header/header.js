import { getMetadata, fetchPlaceholders } from '../../commons/scripts/aem.js';
import { dispatchCarIconClickEvent } from '../../scripts/customEvents.js';
import utility from '../../utility/utility.js';
import { loadFragment } from '../fragment/fragment.js';
import analytics from '../../utility/analytics.js';
import authUtils from '../../commons/utility/authUtils.js';

export default async function decorate(block) {
  const list = [];
  const header = document.querySelector('header');
  header?.classList?.add('header-scroll', 'header-scroll-threshold');

  const {
    ariaLabelNav,
  } = await fetchPlaceholders();

  function toggleMenu() {
    document.getElementById('menu')?.classList.toggle('hidden');
    document.querySelector('header')?.classList.toggle('lift-up');
    document.documentElement.classList.toggle('no-scroll');
    const callContainer = document.querySelector('.menu .user__contact__icon-call_container');
    callContainer.classList.add('hidden');
  }

  function toggleCarMenu() {
    document.getElementById('carFilterMenu')?.classList.toggle('hidden');
    document.querySelector('header')?.classList.toggle('lift-up');
    document.documentElement.classList.toggle('no-scroll');
    dispatchCarIconClickEvent();
  }

  function toggleUserDropdown() {
    const navRight = document.getElementById('nav-right');
    navRight?.querySelector('.sign-in-wrapper')?.classList.toggle('hidden');
    const callContainer = document.querySelector('.user__contact__icon-call_container');
    callContainer?.classList.add('hidden');
    if (!navRight?.querySelector('.geo-location').className.includes('hidden')) {
      navRight?.querySelector('.geo-location')?.classList.toggle('hidden');
    }
  }

  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta
      ? new URL(navMeta, window.location).pathname
      : '/common/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment?.firstElementChild) nav.append(fragment.firstElementChild);
  Array
      .from(nav.children)
      .slice(1, nav.children.length - 1)
      .forEach((el) => {
        const heading = el.querySelector('.icontitle :is(h1,h2,h3,h4,h5,h6)');
        const icon = el.querySelector('.icon');
        const iconClicked = el.querySelector('.iconClicked');
        let content;
        if (el.querySelector('.link-column-wrapper')) {
          const gridContainer = document.createElement('div');
          const grid = document.createElement('div');
          grid.className = 'link-grid block';
          const contentSection = document.createElement('div');
          contentSection.className = 'link-container-section';
          Array.from(el.querySelectorAll('.link-column-wrapper .link-grid-column')).forEach((item) => contentSection.insertAdjacentElement('beforeend', item));
          grid.append(contentSection);
          gridContainer.append(grid);
          content = gridContainer;
        } else {
          [content] = Array.from(el.children).slice(1);
        }
        let teaserWrappers;
        let combinedTeaserHTML = '';
        let teaser;
        if (content?.classList.contains('car-filter-wrapper')) {
          teaserWrappers = el.querySelectorAll('.teaser-wrapper');
          teaserWrappers.forEach((teaserWrapper) => {
            combinedTeaserHTML += teaserWrapper.innerHTML;
          });

          el.querySelector('.card-list-teaser')?.insertAdjacentHTML(
              'beforeend',
              utility.sanitizeHtml(
                  `<div class="teaser-list">${combinedTeaserHTML}</div>`,
              ),
          );
        } else {
          teaser = el.querySelector('.teaser-wrapper');
        }

        list.push({
          heading: heading?.textContent,
          icon: icon?.innerHTML,
          iconClicked: iconClicked?.innerHTML,
          content: content?.firstChild,
          teaser: teaser?.firstChild ?? '',

        });
      });
  const logo = nav.querySelectorAll('.logo-wrapper');
  const carIcon = nav.children[3]?.querySelector('.icon')?.innerHTML;
  const searchIcon = nav.children[2]?.querySelector('.icon')?.innerHTML;
  const carFilter = nav.querySelector('.car-filter');
  const userDropDownDiv = nav.querySelector(
      '.sign-in-wrapper .user__dropdown',
  );
  const contact = nav.querySelector('.contact-wrapper');
  userDropDownDiv?.append(contact);
  const userDropdown = nav.querySelector('.sign-in-wrapper');
  userDropdown?.classList.add('hidden');
  const userAccountLinkItems = userDropDownDiv?.querySelectorAll('.user__account>a');
  const signInTeaser = nav.querySelector('.sign-in-teaser');
  const locationHtml = nav.querySelector('.location-wrapper');

  const desktopHeader = `
      <div class="top-logo">
      ${logo[1]?.outerHTML ?? ''}
    </div>
    <div class="navbar navbar-nexa">

    <div class="overlay" style='display:none;'></div>
      <div class="nav-hamburger nav-hamburger-nexa">
      <button type="button" aria-controls="menu" aria-label="${ariaLabelNav}">
        <span class="nav-hamburger-icon"></span>
      </button>
    </div>
      <div class="left" id="nav-left">
      ${logo[0]?.outerHTML ?? ''}
      </div>
      <div class="links"></div>
      <div class="right" id="nav-right">
      ${logo[1]?.outerHTML ?? ''}
      </div>
      <div class="car-icon">${searchIcon ?? ''}</div>
    </div>
    <div class="car-filter-menu hidden car-filter-nexa" id="carFilterMenu">
    <div class="car-panel-header">
          <span class="car-filter-close"><img src="${window.hlx.codeBasePath}/icons/arrow_backword.svg" alt="close" /></span>
      <div class="search"><input placeholder="Search Cars or Pages" /></div>
       <div class="search-icon close-icon"></div>
    </div>
      </div>
  `;

  const mobileHeader = `
    <div id="menu" class="menu hidden menu-nexa">
      <div class="menu-header menu-header-nexa">
        <div class="back-arrow"></div>
        <span class="menu-title">Menu</span>
        <div class="close-icon"></div>
      </div>
      <ul class="menu-list"></ul>
    </div>
  `;
  const navWrapper = document.createElement('div');
  navWrapper.innerHTML = desktopHeader + mobileHeader;

  if (window.innerWidth >= 768) {
    const leftElement = navWrapper.querySelector('.left');
    if (leftElement && locationHtml) {
      leftElement.insertAdjacentElement('afterbegin', locationHtml);
    }
  } else {
    const menuElement = navWrapper.querySelector('.menu');
    if ( locationHtml) {
      menuElement.insertAdjacentElement('afterend', locationHtml);
    }
  }
  block.append(navWrapper);
  document.documentElement.classList.remove('no-scroll');
  const navHamburger = document.querySelector('.nav-hamburger');
  const backArrow = document.querySelector('.back-arrow');
  const closeIcon = document.querySelectorAll('.close-icon');
  const caricon = document.querySelector('.navbar .car-icon');
  const carFilterClose = document.querySelector('.car-filter-close');
  [navHamburger, backArrow, ...closeIcon].forEach((element) => {
    element?.addEventListener('click', toggleMenu);
  });

  caricon?.addEventListener('click', toggleCarMenu);
  carFilterClose?.addEventListener('click', toggleCarMenu);

  document
      .querySelector('#user-img')
      ?.addEventListener('click', () => toggleUserDropdown());


  const linkEl = document.querySelector('.links');
  const menuList = document.querySelector('.menu-list');

  menuList.innerHTML += `<li>${signInTeaser?.outerHTML ?? ''}</li>`;

  const appendMenuHtml = (el, i) => {
    if (i === 0 || i === 6) return; // Skip elements with index 0, 1, and 6, removed index 2 to add search option in header
    if (el.content?.innerHTML || el.teaser?.innerHTML) {
      menuList.innerHTML += `<li id="menu-item-${i}" class="accordion nav-link ${el.heading?.toLowerCase()}">
      <span class="icon">${el.icon ?? ''}</span>
      <span class="menu-title">${el.heading ?? ''}</span>
    </li>
    <div class="panel">${el.content?.innerHTML ?? ''}${el.teaser?.innerHTML ?? ''}</div>`;
    } else {
      menuList.innerHTML += `<li id="menu-item-${i}" class="nav-link ${el.heading?.toLowerCase()}">
      <span class="icon">${el.icon ?? ''}</span>
      <span class="menu-title">${el.heading ?? ''}</span>
    </li>`;
    }
  };
  // Check if menu-list <li> is empty, then remove the nav-hamburger
  const navbar = navWrapper.querySelector('.navbar');
  if (menuList && Array.from(menuList.children).every(item => item.innerHTML.trim() === '')) {
    navHamburger?.remove();
    navbar.style.justifyContent ="center"
  }
  list.forEach((el, i) => {
    const linkTitle = document.createElement('div');
    const desktopPanel = document.createElement('div');
    const heading = document.createElement('span');
    linkTitle.classList.add('link-title', 'overlay_hover', 'no-overlay');
    heading.textContent = el.heading;
    linkTitle.append(heading);
    desktopPanel.classList.add(
        'desktop-panel',
        'panel',
        el.heading?.split(' ')[0]?.toLowerCase(),
    );

    if (el.content || el.teaser || contact) {
      if (el.content) desktopPanel.append(el.content);
      if (el.teaser) desktopPanel.append(el.teaser);
      if (contact) desktopPanel.append(contact);
      linkEl?.append(linkTitle, desktopPanel);
    } else {
      linkEl?.append(linkTitle);
    }
    appendMenuHtml(el, i);
  });

  if (!window.matchMedia('(min-width: 768px)').matches) {
    block.querySelector('.car-filter-menu')?.append(carFilter);
  }

  if (userAccountLinkItems) {
    Array.from(userAccountLinkItems).slice(1).forEach((el) => {
      menuList.innerHTML += `<li>${el.outerHTML ?? ''}</li>`;
    });
  }

  menuList.innerHTML += `<li>${contact?.outerHTML ?? ''}</li>`;

  const acc = document.getElementsByClassName('accordion');

  Array.from(acc).forEach((el) => {
    el.addEventListener('click', function accordionClicked(e) {
      // Close all other accordions
      Array.from(acc).forEach((otherEl) => {
        if (otherEl !== this) {
          const otherPanel = otherEl.nextElementSibling;
          const otherIndex = parseInt(otherEl.id.split('-')[2], 10);
          const otherMenuListIconWrapper = otherEl.querySelector('.icon');
          const otherMenuListTitle = otherEl.querySelector('.menu-title');
          const { icon: otherIcon } = list[otherIndex];

          if (otherPanel.style.maxHeight) {
            otherMenuListIconWrapper.innerHTML = otherIcon;
            otherMenuListTitle.classList.remove('menu-title-clicked');
            otherPanel.style.maxHeight = null;
          }
        }
      });

      // Toggle the current accordion
      const index = parseInt(e.currentTarget.id.split('-')[2], 10);
      const menuListIconWrapper = this.querySelector('.icon');
      const menuListTitle = this.querySelector('.menu-title');
      const { icon, iconClicked } = list[index];
      const panel = this.nextElementSibling;

      if (panel.style.maxHeight) {
        menuListIconWrapper.innerHTML = icon;
        menuListTitle.classList.remove('menu-title-clicked');
        panel.style.maxHeight = null;
      } else {
        menuListIconWrapper.innerHTML = iconClicked;
        menuListTitle.classList.add('menu-title-clicked');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  let lastScrollTop = 0;
  let isHeaderVisible = true;
  window.addEventListener('scroll', () => {
    if (document.documentElement.classList.contains('no-scroll')) {
      return;
    }
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    const header = document.querySelector('header');

    // Assuming the first and second sections are direct children of a container (e.g., <main>)
    const firstSection = document.querySelector('main').firstElementChild;
    const secondSection = firstSection ? firstSection.nextElementSibling : null;

    const firstSectionTop = firstSection ? firstSection.getBoundingClientRect().top : 0;
    const secondSectionTop = secondSection ? secondSection.getBoundingClientRect().top : 0;

    if (currentScroll < header.offsetHeight) {
      header.classList.add('header-scroll-threshold');
      header.style.top = `-${Math.abs(currentScroll)}px`;
      return;
    }
    header.classList.remove('header-scroll-threshold', 'second-scroll');
    header.style.top = '0';

    if (currentScroll > (lastScrollTop + 2) && isHeaderVisible) {

      header.classList.add('header-hidden');
      isHeaderVisible = false;
    } else if (currentScroll < lastScrollTop && !isHeaderVisible) {
      header.classList.remove('header-hidden');
      isHeaderVisible = true;
    }
    // Add `second-scroll` class when scrolling up and reaching the second section
    if (currentScroll < lastScrollTop && secondSection && secondSectionTop <= 0) {
      header.classList.add('second-scroll');
    }
    lastScrollTop = currentScroll;
  });

  const linksContainer = block.querySelectorAll('.no-overlay');
  const overlayContainer = block.querySelector('.overlay');

  function hideOverlay() {
    overlayContainer.style.display = 'none';
    header?.classList.remove('lift-up');
    document.documentElement.classList.remove('no-scroll');
  }

  function showOverlay() {
    overlayContainer.style.display = 'block';
    header?.classList.add('lift-up');
    document.documentElement.classList.add('no-scroll');
  }

  linksContainer.forEach((el) => {
    if (el.classList.contains('overlay_hover')) {
      el.addEventListener('mouseenter', () => {
        const locationPanel = document.querySelector('#nav-right .geo-location');
        if (!locationPanel?.classList.contains('hidden')) {
          locationPanel?.classList.add('hidden');
        }
        const profilePanel = document.querySelector('#nav-right .sign-in-wrapper');
        if (!profilePanel?.classList.contains('hidden')) {
          profilePanel?.classList.add('hidden');
        }
        showOverlay();
      });

      const nextSibling = el.nextElementSibling;

      el.addEventListener('mouseleave', () => {
        if (!nextSibling?.matches(':hover')) {
          hideOverlay();
        }
      });

      if (nextSibling) {
        nextSibling.addEventListener('mouseenter', showOverlay);

        nextSibling.addEventListener('mouseleave', () => {
          if (!el.matches(':hover')) {
            hideOverlay();
          }
        });
      }
    } else if (el.classList.contains('overlay_click')) {
      el.addEventListener('click', () => {
        const nextSibling = el.nextElementSibling;
        if (nextSibling?.classList.contains('hidden')) {
          hideOverlay();
        } else {
          showOverlay();
        }
      });
    }
  });

  overlayContainer.addEventListener('click', () => {
    Array.from(acc).forEach((el) => {
      const panel = el.nextElementSibling;
      const menuListIconWrapper = el.querySelector('.icon');
      const menuListTitle = el.querySelector('.menu-title');
      const index = parseInt(el.id.split('-')[2], 10);
      const { icon } = list[index];

      if (panel.style.maxHeight) {
        menuListIconWrapper.innerHTML = icon;
        menuListTitle.classList.remove('menu-title-clicked');
        panel.style.maxHeight = null;
      }
    });

    // hide sign in popup when clicking outside
    const signInDiv = block.querySelector('.sign-in-wrapper');
    signInDiv.classList.add('hidden');
    const callContainer = document.querySelector('.user__contact__icon-call_container');
    callContainer.classList.add('hidden');
    hideOverlay();
  });

  const userContactBlocks = document.querySelectorAll('.user__contact');

  userContactBlocks.forEach((contactBlock) => {
    const phoneIcon = contactBlock.querySelector('.user__contact--icon-text.phone');
    const callContainer = contactBlock.querySelector('.user__contact__icon-call_container');

    if (phoneIcon && callContainer) {
      phoneIcon.addEventListener('click', () => {
        callContainer.classList.toggle('hidden');
      });
    }
  });

  // Analytics call
  const setLinkDetails = (e) => {
    const pageDetails = {};

    const headerText = e.target.closest('.panel') ? e.target.closest('.panel').previousElementSibling.textContent.trim() : '';
    if (e.target.closest('.link-column__list')) {
      if (e.target.closest('.link-grid-column').querySelector('.column__heading-link, .link-column__heading') !== null) {
        pageDetails.webName = `${headerText}:${e.target.closest('.link-grid-column').querySelector('.column__heading-link, .link-column__heading')?.textContent.trim()}:${e.target?.textContent.trim()}`;
      } else {
        pageDetails.webName = `${headerText}:${e.target?.textContent.trim()}`;
      }
      pageDetails.componentName = 'header sub-navigation';
    } else if (e.target.closest('.card') || headerText === 'Cars') {
      const carFilters = e.target.closest('.filter-cars').querySelectorAll('.filter');
      let selectedFilter = '';
      carFilters.forEach((span) => {
        if (span.className.includes('selected')) { selectedFilter = span.textContent; }
      });
      if (e.target.closest('.primary__btn')) {
        pageDetails.webName = `${headerText}:${selectedFilter}:${e.target?.textContent.trim()}`;
      } else {
        pageDetails.webName = `${headerText}:${selectedFilter}:${e.target.closest('.card').querySelector('.card-title')?.textContent.trim()}`;
      }
      pageDetails.componentName = 'header sub-navigation';
    } else if (e.target.closest('.logo__picture')) {
      const logoName = e.target.closest('.logo__picture').getAttribute('data-logo-name') || 'Logo';
      pageDetails.webName = `Logo:${logoName}`;
      pageDetails.componentName = 'header navigation';
    } else {
      pageDetails.webName = `${headerText}:${e.target?.textContent.trim()}`;
      pageDetails.componentName = 'header navigation';
    }

    pageDetails.componentTitle = e.target?.textContent.trim();
    pageDetails.componentType = 'link';
    if (e.target.closest('.card')) {
      pageDetails.linkType = e.target.closest('.card');
    } else {
      pageDetails.linkType = e.target;
    }

    analytics.setHeaderNavigation(pageDetails);
  };



  const setMobilCarDetails = (e) => {
    const pageDetails = {};

    const headerText = e.target.closest('.car-filter-nexa').querySelector('.car-text')?.textContent.trim();
    if (e.target.closest('.card') || headerText === 'Cars') {
      const carFilters = e.target.closest('.filter-cars').querySelectorAll('.filter');
      let selectedFilter = '';
      carFilters.forEach((span) => {
        if (span.className.includes('selected')) { selectedFilter = span.textContent; }
      });
      if (e.target.closest('.primary__btn')) {
        pageDetails.webName = `${headerText}:${selectedFilter}:${e.target?.textContent.trim()}`;
      } else {
        pageDetails.webName = `${headerText}:${selectedFilter}:${e.target.closest('.card').querySelector('.card-title')?.textContent.trim()}`;
      }
      pageDetails.componentName = 'header sub-navigation';
    } else {
      pageDetails.webName = `${headerText}:${e.target?.textContent.trim()}`;
      pageDetails.componentName = 'header navigation';
    }

    pageDetails.componentTitle = e.target?.textContent.trim();
    pageDetails.componentType = 'link';
    pageDetails.linkType = e.target.closest('.card');

    analytics.setHeaderNavigation(pageDetails);
  };

  block.addEventListener('click', (e) => {
    const isMobile = window.matchMedia('(width < 768px)').matches;
    if (isMobile && (e.target.closest('.card') || e.target.closest('.primary__btn'))) {
      setMobilCarDetails(e);
    } else if (e.target.closest('.link-column__list') || e.target.closest('.card') || e.target.closest('.link-column__heading')?.querySelector('a') || e.target.closest('.primary__btn') || e.target.closest('.logo__picture')) {
      setLinkDetails(e);
    } else if (e.target.closest('.user__account--link') || e.target.closest('.user__contact--icon-text:not(button)') || e.target.closest('.primary-telephone') || e.target.closest('.secondary-telephone')) {
      const pageDetails = {};
      const currentLink = e.target.closest('a');
      if (!currentLink) {
        return;
      }
      let webName = '';
      if (currentLink.classList.contains('primary-telephone') || currentLink.classList.contains('secondary-telephone')) {
        webName = e.target.closest('.user__contact')?.querySelector('.user__contact--icon-text.phone img')?.alt?.trim();
      } else {
        webName = currentLink.textContent?.trim() || currentLink.title?.trim() || e.target.alt || '';
      }
      const middleWebName = e.target.closest('.user__contact')?.querySelector('.user__contact-title')?.textContent?.trim() || '';
      pageDetails.webName = `Profile:${middleWebName ? `${middleWebName}:` : ''}${webName}`.replace('::', ':');
      pageDetails.componentName = 'header navigation';
      pageDetails.componentTitle = e.target?.textContent.trim();
      pageDetails.componentType = 'link';
      if (e.target.closest('.user__contact--icon-text')) {
        pageDetails.linkType = e.target.closest('.user__contact--icon-text');
      } else {
        pageDetails.linkType = e.target;
      }
      analytics.setHeaderNavigation(pageDetails);
    }
  });
  const signInWrapper = block.querySelector('.sign-in-wrapper');
  const userIcon = block.querySelector('#user-img');
  document.addEventListener('click', (e) => {
    if (!signInWrapper?.classList.contains('hidden') && e.target !== userIcon && !e.target.closest('.user__dropdown')) {
      signInWrapper?.classList.add('hidden');
      hideOverlay();
    }
  });

  authUtils.waitForAuth().then(async () => {
    const profile = await authUtils.getProfile();
    block.querySelectorAll('.sign-in-card-teaser button.sign-in-btn, .sign-in-teaser .sign-in-btn button').forEach((el) => {
      el.addEventListener('click', async () => {
        if(profile) {
          await authUtils.logout();
        } else {
          await authUtils.login();
        }
      }, false);
    });
  });

}
