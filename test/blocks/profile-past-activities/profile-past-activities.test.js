/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-past-activities/profile-past-activities.js';

document.write(await readFile({ path: './profile-past-activities.plain.html' }));

const block = document.querySelector('.activities-wrapper');
await decorate(block);

describe('Activity Block', () => {
  it('Should render Activity Block wrapper', async () => {
    expect(block).to.exist;
    expect(block.classList.contains('activities-wrapper')).to.be.true;
  });

  it('Should render the block name correctly', async () => {
    const blockName = block.querySelector('.block-name span');
    expect(blockName).to.exist;
    expect(blockName.textContent).to.not.be.empty;
  });

  it('Should render tabs container', async () => {
    const tabsContainer = block.querySelector('.tabs-container');
    expect(tabsContainer).to.exist;
    const tabs = tabsContainer.querySelectorAll('.tab-btn');
    expect(tabs.length).to.be.greaterThan(0);
  });

  it('Should render order cards wrapper', async () => {
    const orderCardsWrapper = block.querySelector('.order-cards-wrapper');
    expect(orderCardsWrapper).to.exist;
  });

  it('Should render correct number of order cards initially', async () => {
    const orderCards = block.querySelectorAll('.order-card');
    expect(orderCards.length).to.be.greaterThan(0); // Ensure there are order cards
  });

  it('Should render each order card with necessary details', async () => {
    const orderCards = block.querySelectorAll('.order-card');
    orderCards.forEach((card) => {
      const title = card.querySelector('.card-title span');
      const status = card.querySelector('.card-status .status');
      const orderDate = card.querySelector('.car-detail-order-date');
      const orderId = card.querySelector('.car-detail-order-id');
      const dealership = card.querySelector('.car-detail-dealership-id');

      expect(title).to.exist;
      expect(status).to.exist;
      expect(orderDate).to.exist;
      expect(orderId).to.exist;
      expect(dealership).to.exist;
    });
  });

  it('Should render carousel navigation buttons', async () => {
    const prevButton = block.querySelector('.splide__arrow--prev');
    const nextButton = block.querySelector('.splide__arrow--next');

    expect(prevButton).to.exist;
    expect(nextButton).to.exist;

    
    prevButton.click();
    nextButton.click();
  });

  it('Should not crash when clicking on a tab without associated orders', async () => {
    const tabs = block.querySelectorAll('.tab-btn');
    const lastTab = tabs[tabs.length - 1];

    lastTab.click();
    const filteredOrderCards = block.querySelectorAll('.order-card');
    expect(filteredOrderCards).to.exist;
  });

  it('Should respect accessibility for carousel buttons', async () => {
    const prevButton = block.querySelector('.splide__arrow--prev');
    const nextButton = block.querySelector('.splide__arrow--next');

    expect(prevButton.getAttribute('aria-label')).to.not.be.empty;
    expect(nextButton.getAttribute('aria-label')).to.not.be.empty;
  });

  it('Should render black patches for navigation', async () => {
    const blackPatchMobile = block.querySelector('.black-patch-mobile');
    const blackPatchDesktop = block.querySelector('.black-patch-desktop');

    if (block.querySelector('.navigation')) {
      expect(blackPatchMobile).to.exist;
      expect(blackPatchDesktop).to.exist;
    } else {
      expect(blackPatchMobile).to.not.exist;
      expect(blackPatchDesktop).to.not.exist;
    }
  });

  it('Should handle resizing without errors', async () => {
    window.dispatchEvent(new Event('resize'));
    const tabsContainer = block.querySelector('.tabs-container');
    expect(tabsContainer).to.exist;
  });
});
