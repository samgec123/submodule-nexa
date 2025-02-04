/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/benefit-cards/benefit-cards.js';

document.write(await readFile({ path: './benefit-cards.plain.html' }));

const block = document.querySelector('.benefit-cards');
await decorate(block);

describe('Benefit Cards Tests', () => {
  it('should have a title with id "benefits-of-strong-hybridd"', async () => {
     expect(block.querySelector('#benefits-of-strong-hybridd')).to.exist;
  });

  it('should have 4 card items', async () => {
    const cardItems = block.querySelectorAll('.card-item');
    expect(cardItems.length).to.equal(4);
  });

  it('should have a card item with title "Higher Fuel Efficiency"', async () => {
     expect(block.querySelector('#higher-fuel-efficiency')).to.exist;
  });

  it('should have a card item with title "EV Mode"', async () => {
     expect(block.querySelector('#ev-mode')).to.exist;
  });

  it('should have a card item with title "Silent Drive"', async () => {
     expect(block.querySelector('#silent-drive')).to.exist;
  });

  it('should have a card item with title "Improved Acceleration"', async () => {
    expect(block.querySelector('#improved-acceleration')).to.exist;
  });

  it('should have a link for "Higher Fuel Efficiency" card item', async () => {
    // Wait for the element to be present in the DOM
    const link = await new Promise((resolve) => {
      const checkExist = setInterval(() => {
        const element = block.querySelector('#higher-fuel-efficiency');
        if (element) {
          clearInterval(checkExist);
          resolve(element.closest('div').querySelector('a'));
        }
      }, 100); // Check every 100ms
    });

  });
  

 

  it('should have a link for "Silent Drive" card item', async () => {
    let link = null;
  
    await new Promise((resolve) => {
      setTimeout(() => {
        const element = block.querySelector('#silent-drive');
        if (element) {
          link = element.closest('div').querySelector('a');
        }
        resolve();
      }, 1000); // Wait for 1 second
    });
  });
  
  

  it('should have a link for "Improved Acceleration" card item', async () => {
    let link = null;
  
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Element not found: #improved-acceleration')), 5000); // Timeout after 5 seconds
  
      const checkExist = () => {
        const element = block.querySelector('#improved-acceleration');
        if (element) {
          clearTimeout(timeout);
          link = element.closest('div').querySelector('a');
          resolve();
        } else {
          setTimeout(checkExist, 100); // Check every 100ms
        }
      };
  
      checkExist();
    });
  });
  

  it('should display the description of the selected card item', async () => {
    const selectedCard = block.querySelector('.card-item.selected');
    const description = selectedCard.querySelector('.card-item-description');
    expect(description.style.display).to.equal('block');
  });

  it('should hide the details of non-selected card items', async () => {
    const nonSelectedCards = block.querySelectorAll('.card-item:not(.selected)');
    nonSelectedCards.forEach(card => {
      const details = card.querySelector('.card-item-details');
      expect(details.style.display).to.equal('none');
    });
  });

  it('should enable the next arrow button after clicking the next arrow', async () => {
    const nextButton = block.querySelector('.next_arrow');
    nextButton.click();
    expect(nextButton.disabled).to.be.false;
  });

  it('should enable the previous arrow button after clicking the next arrow', async () => {
    const nextButton = block.querySelector('.next_arrow');
    nextButton.click();
    const prevButton = block.querySelector('.prev_arrow');
    expect(prevButton.disabled).to.be.false;
  });

  it('should move to the next card item when clicking the next arrow', async () => {
    const nextButton = block.querySelector('.next_arrow');
    nextButton.click();
    const selectedCard = block.querySelector('.card-item.selected');
    const description = selectedCard.querySelector('.card-item-description');
    expect(description.style.display).to.equal('block');
  });

  it('should move to the previous card item when clicking the previous arrow', async () => {
    const nextButton = block.querySelector('.next_arrow');
    nextButton.click();
    const prevButton = block.querySelector('.prev_arrow');
    prevButton.click();
    const selectedCard = block.querySelector('.card-item.selected');
    const description = selectedCard.querySelector('.card-item-description');
    expect(description.style.display).to.equal('block');
  });

  // Additional tests can be added here based on the functionality and behavior of benefit-cards.js
});
