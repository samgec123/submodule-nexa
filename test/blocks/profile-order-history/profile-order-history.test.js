/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-order-history/profile-order-history.js';

document.write(await readFile({ path: './profile-order-history.plain.html' }));

const block = document.querySelector('.card-wrapper');
await decorate(block);
window.adobeDataLayer = [];

describe('profile-order-history Block', () => {
  it('Should render profile-order-history Block', async () => {
    // Check if the container for order cards is present
    expect(block.querySelectorAll('.order-card').length).to.equal(3);
  });

  it('Should attach click event listener to kebab menu buttons', () => {
    const kebabButtons = block.querySelectorAll('.kebab-menu');
    kebabButtons.forEach((btn) => {
      btn.click();
    });
  });

  it('Should close kebab menu on outside click', async () => {
    const kebabButton = block.querySelector('.kebab-menu');
    const menuOptions = kebabButton.nextElementSibling;


    // Simulate outside click
    document.body.click();
    expect(menuOptions.classList.contains('active')).to.be.false;
  });
});