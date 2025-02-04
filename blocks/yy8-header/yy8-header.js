import { getMetadata, fetchPlaceholders } from '../../commons/scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { analytics } from '../../utility/masterUtil.js';

export default async function decorate(block) {
  const header = document.querySelector('header');
  header?.classList?.add('header-scroll', 'header-scroll-threshold','yy8-header-block', 'header-wrapper');
  block.classList.add('header');

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

  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/common/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  block.classList.add('yy8-header-wrapper');
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment?.firstElementChild) nav.append(fragment.firstElementChild);
  const list = Array.from(nav.children).slice(1, nav.children.length - 1);
  const logo = nav.querySelectorAll('.logo-wrapper');
  const locationHtml = nav.querySelector('.location-wrapper');
  const desktopHeader = `
    <div class="top-logo">
      ${logo[1]?.outerHTML ?? ''}
    </div>
    <div class="navbar navbar-nexa">
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
        </div>
    </div>
  `;

  const mobileHeader = `
    <div id="menu" class="menu hidden menu-nexa">
      <div class="menu-header menu-header-nexa">
        <div class="back-arrow"></div>
        <span class="menu-title">Menu</span>
        <span class="close-icon"></span>
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
  const linkWrapper = block.querySelector('.links');
  const menuLinksList = block.querySelector('.menu-list');
  const isMobile = window.matchMedia('(width < 768px)').matches;
  list.forEach((el) => {
    if(isMobile) {
      menuLinksList.append(el);
    } else {
      linkWrapper.append(el);
    }
  });
  document.documentElement.classList.remove('no-scroll');
  const navHamburger = document.querySelector('.nav-hamburger');
  const backArrow = document.querySelector('.back-arrow');
  const closeIcon = document.querySelector('.close-icon');
  [navHamburger, backArrow, closeIcon].forEach((element) => {
    element?.addEventListener('click', toggleMenu);
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
  document.body.classList.remove('yy8-body');
  const firstSection = document.querySelector('main').firstElementChild;
  const secondSection = firstSection ? firstSection.nextElementSibling : null;
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
  if (currentScroll < lastScrollTop && secondSection && secondSectionTop <= 0) {
    header.classList.add('second-scroll');
  }
    lastScrollTop = currentScroll;
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
  
  block.addEventListener('click', (e) => {
    if (e.target.closest('.link-column__list') || e.target.closest('.card') || e.target.closest('.link-column__heading')?.querySelector('a') || e.target.closest('.primary__btn') || e.target.closest('.logo__picture')) {
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
}
