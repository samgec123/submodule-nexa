/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/brand-film-carousel/brand-film-carousel.js';

document.write(await readFile({ path: './brand-film-carousel.plain.html' }));

const block = document.querySelector('.brand-film-carousel');
await decorate(block);

describe('brand-film-carousel Block', () => {
  it('Should render brand-film-carousel', async () => {
    expect(block.querySelectorAll('.brand-film__container').length).equal(1);
  });
  it('should attach click event listener to video', () => {
    block.querySelectorAll('.brand-film__video-container')?.forEach((el) => {
      const video = el.querySelector('video');
      if (video) {
        el.click();
      }
    });
  });
  it('should attach click event listener to playBtn', () => {
    const playBtn = block.querySelector('.video-controls-overlay .play-pause-button');
    playBtn.click();
  });
  it('should attach click event listener to soundBtn', () => {
    const soundBtn = block.querySelector('.video-controls-overlay .sound-button');
    soundBtn.click();
  });
  it('should attach click event listener to fullscreenBtn', () => {
    const fullscreenBtn = block.querySelector('.video-controls-overlay .fullscreen-button');
    fullscreenBtn.click();
  });
  it('should attach click event listener to pipBtn', () => {
    const pipBtn = block.querySelector('.video-controls-overlay .pip-button');
    pipBtn.click();
  });
  it('should attach click event listener to closeBtn', () => {
    const closeBtn = block.querySelector('.video-controls-overlay .close-button');
    closeBtn.click();
  });
});
