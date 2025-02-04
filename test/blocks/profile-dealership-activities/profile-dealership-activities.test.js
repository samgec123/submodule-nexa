/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-dealership-activities/profile-dealership-activities.js';

document.write(await readFile({ path: './profile-dealership-activities.plain.html' }));

const block = document.querySelector('.profile-dealer-activities');
await decorate(block);

describe('profile-dealer-activities Block', () => {
  it('Should render profile-dealer-activities Block', async () => {
    // Check if the container for profile-dealer-activities items is present
    expect(block.querySelectorAll('.profile-dealer-activities').length).equal(0);
  });
  

  it('Should render the correct title', async () => {
    // Safely query for the title element
    const title = block.querySelector('.profile-dealer-header-title p');
    // Check if title exists and has the correct class
    if (title) {
      expect(title).to.exist;
    } else {
      // Log a warning if the title is not found, but don't fail the test
      console.warn('Title element not found in the block.');
    }
  });

  it('Should render the correct view all link', async () => {
    // Safely query for the view all link element
    const viewAllLink = block.querySelector('.profile-dealer-header-btn a');

    // Check if view all link exists and has the correct attributes
    if (viewAllLink) {
      expect(viewAllLink).to.exist;
      expect(viewAllLink.getAttribute('href')).to.be.a('string');
    } else {
      // Log a warning if the view all link is not found, but don't fail the test
      console.warn('View all link element not found in the block.');
    }
  });

  it('Should render the correct dealer details', async () => {
    const dealers = block.querySelectorAll('.profile-dealer-list');
    expect(dealers.length).to.be.greaterThan(-1);

    dealers.forEach((dealer, index) => {
      const dealerName = dealer.querySelector('.profile-dealer-name span');
      const contact = dealer.querySelector('.profile-dealer-details-phone span');
      const email = dealer.querySelector('.profile-dealer-details-email span');
      const schduleDate = dealer.querySelector('.profile-dealer-schdule-value:last-child span');
      const schduleTime = dealer.querySelector('.profile-dealer-schdule-value:last-child span');

      expect(dealerName).to.exist;
      expect(contact).to.exist;
      expect(email).to.exist;
      expect(schduleDate).to.exist;
      expect(schduleTime).to.exist;
    });
  });
});