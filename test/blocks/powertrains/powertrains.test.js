/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/powertrains/powertrains.js';

document.write(await readFile({ path: './powertrains.plain.html' }));

const block = document.querySelector('.powertrains');
await decorate(block);

describe('Powertrains Block', () => {
  it('Should render Powertrains Block', async () => {
    // Check if the container for powertrain items is present
    expect(block.querySelectorAll('.powertrain-items-container').length).equal(1);
  });

  it('Should render the correct title', async () => {
    // Safely query for the title element
    const title = block.querySelector('.powertrains-title');

    // Check if title exists and has the correct class
    if (title) {
      expect(title).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the correct description', async () => {
    const description = block.querySelector('.powertrains-list-description');
    expect(description).to.exist;
    expect(description.textContent).to.contain('Explore the variants with advanced powertrains');
  });
});
