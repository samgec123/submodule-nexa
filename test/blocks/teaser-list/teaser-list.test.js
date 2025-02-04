/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/teaser-list/teaser-list.js';

document.write(await readFile({ path: './teaser-list.plain.html' }));

const block = document.querySelector('.teaser-list');
await decorate(block);
window.adobeDataLayer = [];

describe('teaser-list Block', () => {
  it('Should render teaser-list Block', async () => {
    // Check if the container for teaser-list items is present
    expect(block.querySelectorAll('.teaser__cards-container').length).equal(1);
  });
  it('should attach click event listener to registerInrestBtn', () => {
    const registerInrestBtn = block.querySelector('.register__card--secondary .primary__btn');
    registerInrestBtn.click();
  });
});
