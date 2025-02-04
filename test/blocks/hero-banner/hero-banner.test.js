/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/hero-banner/hero-banner.js';

document.write(await readFile({ path: './hero-banner.plain.html' }));

const block = document.querySelector('.hero-banner');
await decorate(block);

describe('Hero Banner Block', () => {
  it('Should render hero banner', async () => {
    expect(block.querySelectorAll('.carousel-container').length).equal(1);
  });
  it('should attach click event listener to prevBtn', () => {
    const prevBtn = block.querySelector('.prev_arrow');
    prevBtn.click();
  });
  it('should attach click event listener to nextBtn', () => {
    const nextBtn = block.querySelector('.next_arrow');
    nextBtn.click();
  });
});
