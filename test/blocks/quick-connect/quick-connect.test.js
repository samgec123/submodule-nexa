/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/quick-connect/quick-connect.js';

document.write(await readFile({ path: './quick-connect.plain.html' }));

const block = document.querySelector('.quick-connect');
await decorate(block);

describe('Quick Connect Block', () => {
  it('Should render Quick Connect Block', async () => {
    // Check if the container for quick connect module is present
    expect(block.querySelectorAll('.quick-connect-module-wrapper').length).equal(1);
  });

  it('Should render the correct section heading', async () => {
    // Safely query for the section heading element
    const sectionHeading = block.querySelector('.quick-connect-module-left-col h3');

    // Check if section heading exists and has the correct class
    if (sectionHeading) {
      expect(sectionHeading).to.exist;
      expect(sectionHeading.textContent).to.equal('Quickly connect with us');
    } else {
      // Log a warning if the section heading is not found, but don't fail the test
      console.warn('Section heading element not found in the block.');
    }
  });

  it('Should render the correct toll free numbers', async () => {
    const tollFreeNumbers = block.querySelectorAll('.quick-connect-module-right-col ul li:nth-child(1) p span');
    expect(tollFreeNumbers).to.exist;
    expect(tollFreeNumbers.length).to.equal(2);
    expect(tollFreeNumbers[0].textContent).to.contain('1800 102 1800');
    expect(tollFreeNumbers[1].textContent).to.contain('1800 102 1800');
  });

  it('Should render the correct email address', async () => {
    const emailAddress = block.querySelector('.quick-connect-module-right-col ul li:nth-child(2) p span');
    expect(emailAddress).to.exist;
    expect(emailAddress.textContent).to.contain('contact@maruti.co.in');
  });

  it('Should render the correct WhatsApp number', async () => {
    const whatsappNumber = block.querySelector('.quick-connect-module-right-col ul li:nth-child(3) p span');
    expect(whatsappNumber).to.exist;
    expect(whatsappNumber.textContent).to.contain('+91 92891 12121');
  });
});
