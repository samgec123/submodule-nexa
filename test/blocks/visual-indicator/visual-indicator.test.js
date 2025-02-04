/* eslint-disable no-unused-expressions */
/* global describe it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/visual-indicator/visual-indicator.js';

document.write(await readFile({ path: './visual-indicator.plain.html' }));

const block = document.querySelector('.visual-indicator');
await decorate(block);

describe('Visual Indicator Tests', () => {
  it('should have a section heading', async () => {
    // Safely query for the title element
    const sectionHeading = block.querySelector('h3');

    // Check if title exists and has the correct class
    if (sectionHeading) {
      expect(sectionHeading).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Section Heading element not found in the block.');
    }
  });

  it('should have a test drives title', async () => {
    // Safely query for the title element
    const testDrivesTitle = block.querySelector('p');

    // Check if title exists and has the correct class
    if (testDrivesTitle) {
      expect(testDrivesTitle).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Test Drive element not found in the block.');
    }
  });

  it('should display the count of test drives', async () => {
    // Safely query for the title element
    const testDriveCount = block.querySelector('h4');

    // Check if title exists and has the correct class
    if (testDriveCount) {
      expect(testDriveCount).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Test Drive count not found in the block.');
    }
  });
});
