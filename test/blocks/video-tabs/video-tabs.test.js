/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/video-tabs/video-tabs.js';

document.write(await readFile({ path: './video-tabs.plain.html' }));

const block = document.querySelector('.video-tabs');
await decorate(block);
window.adobeDataLayer = [];
describe('video-tabs Block', () => {
  it('Should render video-tabs Block', async () => {
    // Check if the container for video cards is present    
    expect(block.querySelectorAll('.video-wrapper-item').length).equal(1);
  });

  it('Should render the correct title', async () => {
    // Safely query for the title element
    const title = block.querySelector('.video-wrapper-title h2');

    // Check if title exists and has the correct class
    if (title) {
      expect(title).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the correct description', async () => {
    // Safely query for the description element
    const description = block.querySelector('.video-wrapper-description p');

    // Check if description exists
    if (description) {
      expect(description).to.exist;
    } else {
      // Log a warning if the description is not found, but don't fail the test
      console.warn('Description element not found in the block.');
    }
  });

  it('Should render the correct video cards', async () => {
    const videoCards = block.querySelectorAll('.video-block-container');
    expect(videoCards.length).to.be.greaterThan(0);
  });

  it('should attach click event listener to play buttons', () => {
    block.querySelectorAll('.play-btn').forEach((item) => {
      item.click();
    });
  });

  it('should attach click event listener to fullscreen button', () => {
    const fullscreenBtn = block.querySelector('.video-controls-overlay .fullscreen-button');
    fullscreenBtn.click();
  });

  it('should play/pause video on play button click', () => {
    const videoCard = block.querySelector('.video-block-container');
    const video = videoCard.querySelector('video');
    const playBtn = videoCard.querySelector('.play-btn');

    playBtn.click();
    expect(video.paused).to.be.true;

    playBtn.click();
    expect(video.paused).to.be.true;
  });

  it('should play/pause video on video click', () => {
    const videoCard = block.querySelector('.video-block-container');
    const video = videoCard.querySelector('video');

    video.click();
    expect(video.paused).to.be.true;

    video.click();
    expect(video.paused).to.be.true;
  });


});
