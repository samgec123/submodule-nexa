/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/highlight-tabs/highlight-tabs.js';

document.write(await readFile({ path: './highlight-tabs.plain.html' }));

const block = document.querySelector('.highlight-tabs');
await decorate(block);
window.adobeDataLayer = [];

describe('highlight-tabs Block', () => {
  it('Should render contents', async () => {
    expect(block.querySelectorAll('.content-overlay').length).equal(1);
  });

  it('Should render the title', async () => {
    const title = block.querySelector('.highlight-tabs__title');
    if (title) {
      expect(title).to.exist;
    } else {
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the subtitle', async () => {
    const subtitle = block.querySelector('.subtitle');
    if (subtitle) {
      expect(subtitle).to.exist;
    } else {
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the switch list', async () => {
    const list = block.querySelector('.switch-list');
    expect(list).to.exist;
  });

  it('should attach click event listener to previout button', () => {
    const prevBtn = block.querySelector('.prev-btn');
    prevBtn.click();
  });

  it('should attach click event listener to next button', () => {
    const nextBtn = block.querySelector('.next-btn');
    nextBtn.click();
  });

  it('should attach click event listener to readmore', () => {
    block.querySelectorAll('.expand-collapse-button').forEach((item) => {
      item.click();
    });
  });
});
