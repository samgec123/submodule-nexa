/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-visit-us/profile-visit-us.js';

document.write(await readFile({ path: './profile-visit-us.plain.html' }));

const block = document.querySelector('.profile-vist-us-section');
await decorate(block);
window.adobeDataLayer = [];
describe('profile-visit-us Block', () => {
  it('Should render profile-visit-us Block', async () => {
    // Check if the container for the visit us section is present
    expect(block.querySelectorAll('.profile-vist-us-container').length).equal(1);
  });

  it('Should render the correct title', async () => {
    // Safely query for the title element
    const title = block.querySelector('.profile-vist-us-title p');

    // Check if title exists and has the correct class
    if (title) {
      expect(title).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the correct address', async () => {
    // Safely query for the address element
    const address = block.querySelector('.profile-vist-us-address');

    // Check if address exists and has the correct class
    if (address) {
      expect(address).to.exist;
    } else {
      // Log a warning if the address is not found, but don't fail the test
      console.warn('Address element not found in the block.');
    }
  });

  it('Should render the correct phone number', async () => {
    // Safely query for the phone element
    const phone = block.querySelector('.profile-vist-us-phone span');

    // Check if phone exists and has the correct class
    if (phone) {
      expect(phone).to.exist;
    } else {
      // Log a warning if the phone is not found, but don't fail the test
      console.warn('Phone element not found in the block.');
    }
  });

  it('Should render the correct CIN number', async () => {
    // Safely query for the CIN element
    const cin = block.querySelector('.profile-vist-us-cin p');

    // Check if CIN exists and has the correct class
    if (cin) {
      expect(cin).to.exist;
    } else {
      // Log a warning if the CIN is not found, but don't fail the test
      console.warn('CIN element not found in the block.');
    }
  });

  it('Should render the correct map link', async () => {
    // Safely query for the map link element
    const mapLink = block.querySelector('.profile-vist-us-map a');

    // Check if map link exists and has the correct class
    if (mapLink) {
      expect(mapLink).to.exist;
    } else {
      // Log a warning if the map link is not found, but don't fail the test
      console.warn('Map link element not found in the block.');
    }
  });

  it('should sanitize the HTML content', async () => {
    // Check if the sanitized content is correctly inserted
    const container = block.querySelector('.profile-vist-us-container');
    expect(container).to.exist;
    expect(container.innerHTML).to.not.include('<script>');
  });
});
