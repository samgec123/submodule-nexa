/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/car-cards/car-cards.js';


document.write(await readFile({ path: './car-cards.plain.html' }));

const block = document.querySelector('.car-cards');
await decorate(block);

describe('Car Cards Tests', () => {
  it('should have the correct title', async () => {
    const timeout = 5000; // Maximum wait time in milliseconds
    const title = await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const titleElement = block.querySelector('.card-wrapper .title');
            if (titleElement && titleElement.textContent) {
                clearInterval(interval);
                resolve(titleElement.textContent);
            }
        }, 100);
 
        setTimeout(() => {
            clearInterval(interval);
            reject(new Error('Title did not load within the expected time'));
        }, timeout);
    });
    expect(title).to.contain('Explore our Strong Hybrid Range');
  });


  it('should display car titles and taglines', async () => {
    const cards = block.querySelectorAll('.car-card');
    
    const carDetails = [...cards].map(card => ({
      title: card.querySelector('.car-title').textContent,
      tagline: card.querySelector('.car-tagline').textContent,
    }));

    expect(carDetails).to.deep.include.members([
      { title: 'Grand Vitara', tagline: 'Rule Every Road' },
      { title: 'Invicto', tagline: 'The league of ordinary' },
    ]);
  });


  it('should display "Starting At" labels', async () => {
    const labels = block.querySelectorAll('.car-price p');
    expect(labels).to.have.lengthOf(2); // Assuming there are 2 price labels
  });
});
