/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/accordion-banner/accordion-banner.js';

document.write(await readFile({ path: './accordion-banner.plain.html' }));

const block = document.querySelector('.accordion-banner');
await decorate(block);

describe('Accordion Banner - Toggle Accordion Tests', () => {
    it('should collapse an already open accordion item when clicked again', async () => {
        const firstItemTitle = block.querySelector('.accordion-banner-item-title');
        const firstItemDescription = block.querySelector('.accordion-banner-item-description');
        // Expand the item
        firstItemTitle.click();
        await expect(firstItemDescription.classList.contains('active')).to.be.true;
        await expect(parseInt(firstItemDescription.style.height, 10)).to.be.greaterThan(0);

        // Collapse the item
        firstItemTitle.click();
        await expect(firstItemDescription.classList.contains('active')).to.be.false;
        await expect(firstItemDescription.style.height).to.equal('0px');
    });

    it('should close all other items when a new one is opened', async () => {
        const itemTitles = block.querySelectorAll('.accordion-banner-item-title');
        const itemDescriptions = block.querySelectorAll('.accordion-banner-item-description');

        // Expand the first item
        itemTitles[0].click();
        await expect(itemDescriptions[0].classList.contains('active')).to.be.true;
        await expect(parseInt(itemDescriptions[0].style.height, 10)).to.be.greaterThan(0);

        // Expand the second item
        itemTitles[1].click();
        await expect(itemDescriptions[1].classList.contains('active')).to.be.true;
        await expect(parseInt(itemDescriptions[1].style.height, 10)).to.be.greaterThan(0);

        // Verify the first item is collapsed
        await expect(itemDescriptions[0].classList.contains('active')).to.be.false;
        await expect(itemDescriptions[0].style.height).to.equal('0px');
    });
    it('should not allow toggling in mobile view (<=768px)', async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const firstItemTitle = block.querySelector('.accordion-banner-item-title');
            const firstItemDescription = block.querySelector('.accordion-banner-item-description');

            firstItemTitle.click(); // Attempt to toggle in mobile view

            await expect(firstItemDescription.style.display).to.equal('block'); // Always visible
            await expect(firstItemDescription.style.height).to.be.empty; // No toggling effect
        }
    });
    it('should toggle accordion item on title click', async () => {
        const firstItemTitle = block.querySelector('.accordion-banner-item-title');
        firstItemTitle.click();
        const firstItemDescription = block.querySelector('.accordion-banner-item-description');
        await expect(firstItemDescription.style.height).to.not.equal('0');
    });

    it('should initialize carousel in mobile view', async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const carouselContainer = block.querySelector('.accordion-carousel');
            await expect(carouselContainer).to.exist;
            const items = carouselContainer.querySelectorAll('.accordion-banner-item');
            await expect(items.length).to.equal(4);
        }
    });
    it('should display all items and disable toggles in mobile view', () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const items = block.querySelectorAll('.accordion-banner-item');
            const toggleIcons = block.querySelectorAll('.toggle_icon');

            items.forEach((item) => {
                const description = item.querySelector('.accordion-banner-item-description');
                expect(description.style.display).toBe('block');
            });

            toggleIcons.forEach((icon) => {
                expect(icon.style.display).toBe('none');
            });
        }
    });
    it('should create a carousel container with navigation buttons in mobile view', async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const carouselContainer = block.querySelector('.accordion-carousel');
            expect(carouselContainer).to.exist;

            const prevButton = carouselContainer.querySelector('.carousel-prev');
            const nextButton = carouselContainer.querySelector('.carousel-next');
            expect(prevButton).to.exist;
            expect(nextButton).to.exist;
        }
    });
    it('should show only one item at a time in the carousel', async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const carouselContainer = block.querySelector('.accordion-carousel');
            const items = carouselContainer.querySelectorAll('.accordion-banner-item');
            const visibleItems = Array.from(items).filter((item) => item.style.display === 'block');
            expect(visibleItems.length).to.equal(1);
        }
    });
    it('should show all descriptions and hide toggle icons in mobile view', async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery.matches) {
            const items = block.querySelectorAll('.accordion-banner-item');
            const toggleIcons = block.querySelectorAll('.toggle_icon');

            items.forEach((item) => {
                const description = item.querySelector('.accordion-banner-item-description');
                expect(description).to.exist; // Check if the description exists
                expect(description.style.display).to.equal('block'); // Ensure descriptions are visible
            });

            toggleIcons.forEach((icon) => {
                expect(icon).to.exist;
                expect(icon.style.display).to.equal('none'); // Ensure toggle icons are hidden
            });
        }
    });
});
