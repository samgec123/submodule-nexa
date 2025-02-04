import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const list = [];

function toggleMenu() {
  const x = document.getElementById('menu');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}

function toggleCarMenu() {
  const x = document.getElementById('carPanel');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}

function toggleUserDropdown() {
  const navRight = document.getElementById('nav-right');
  const x = navRight.querySelector('.sign-in-wrapper');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}

export default async function decorate(block) {
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
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  Array.from(nav.querySelectorAll('.nav-link')).forEach((el) => {
    const heading = el.querySelector('h2');
    const icon = el.querySelector('.icon');
    const iconClicked = el.querySelector('.iconClicked');
    const content = el.querySelector('.link-grid-wrapper');
    const teaser = el.querySelector('.teaser-wrapper');

    list.push({
      heading: heading?.textContent,
      icon: icon?.innerHTML,
      iconClicked: iconClicked?.innerHTML,
      content: content?.innerHTML,
      teaser: teaser?.innerHTML,
    });
  });
  const logo = nav.querySelector('.logo-wrapper');
  const carIcon = nav.querySelector('.nav-cars-container .icon').innerHTML;
  const userDropdownDiv = nav.querySelector('.sign-in-wrapper .user__dropdown');
  const contact = nav.querySelector('.contact-wrapper');
  userDropdownDiv.append(contact);
  const userDropdown = nav.querySelector('.sign-in-wrapper');
  const userAccountLinkItems = userDropdownDiv.querySelectorAll('.user__account>a');

  const desktopHeader = `
    <div class="navbar">
      <div class="nav-hamburger">
      <button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>
    </div>
      ${logo.outerHTML}
      <div class="links"></div>
      <div class="right" id="nav-right">
        <div class="location">Gurgaon &#9662;</div>
        <img id="user-img" src="" alt="user" />
        ${userDropdown.outerHTML}
      </div>
      <div class="car">${carIcon}</div>
      <div class="car-panel" id="carPanel">car</div>
    </div>
  `;

  const mobileHeader = `
    <div id="menu" class="menu">
      <div class="menu-header">
        <div class="back-arrow"><img src="" alt="back" /></div>
        <span class="menu-title">Menu</span>
        <span class="close-icon"><img src="" alt="close" /></span>
      </div>
      <ul class="menu-list"></ul>
    </div>
  `;
  const navWrapper = document.createElement('div');
  navWrapper.innerHTML = desktopHeader + mobileHeader;

  block.append(navWrapper);
  const navHamburger = document.querySelector('.nav-hamburger');
  const backArrow = document.querySelector('.back-arrow');
  const closeIcon = document.querySelector('.close-icon');
  const caricon = document.querySelector('.navbar .car');
  [navHamburger, backArrow, closeIcon].forEach((element) => {
    element.addEventListener('click', toggleMenu);
  });

  caricon.addEventListener('click', toggleCarMenu);

  document.querySelector('#user-img').addEventListener('click', () => toggleUserDropdown());

  const linkEl = document.querySelector('.links');
  const menuList = document.querySelector('.menu-list');

  list.forEach((el, i) => {
    linkEl.innerHTML += `<div class="link-title"><span>${el.heading}</span></div> ${el.content || el.teaser ? `<div class="desktop-panel panel ${el.heading.toLowerCase()}">${el.content || ''}${el.teaser || ''}</div>` : ''}`;
    if (i === 0) return;
    menuList.innerHTML += `<li id="menu-item-${i}" class="${el.content ? 'accordion nav-link' : ''} ${el.heading.toLowerCase()}" ><span class="icon">${el.icon}</span> <span class="menu-title">${el.heading}</span></li>
    ${el.content || el.teaser ? `<div class="panel">${el.content || ''}${el.teaser || ''}</div>` : ''}
    `;
  });

  userAccountLinkItems.forEach((el) => {
    menuList.innerHTML += `<li>${el.outerHTML}</li>`;
  });

  menuList.innerHTML += `<li>${contact.outerHTML}</li>`;

  const acc = document.getElementsByClassName('accordion');

  for (let i = 0; i < acc.length; i += 1) {
    acc[i].addEventListener('click', function accordionClicked(e) {
      this.classList.toggle('active');
      const index = parseInt(e.target.id.split('-')[2], 10);
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
  }
}
