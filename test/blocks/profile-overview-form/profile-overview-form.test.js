/* eslint-disable no-unused-expressions */
/* global describe, it */

// Import necessary libraries
import { expect } from '@esm-bundle/chai';
import { readFile } from '@web/test-runner-commands';

// Import the `decorate` function from `profile-overview-form.js`
import decorate from '../../../blocks/profile-overview-form/profile-overview-form.js';

async function loadHTML() {
  const html = await readFile({ path: './profile-overview-form.plain.html' });
  document.body.innerHTML = html;
}

await loadHTML();

const block = document.querySelector('.profile-overview-form');
if (block) {
  try {
    await decorate(block);
  } catch (error) {
    console.error('Error during decoration:', error);
  }
} else {
  console.error('The profile-overview-form block was not found.');
}

// Define the test suite
describe('profile-overview-form Block', () => {
  it('Should render profile-overview-form Block', async () => {
    expect(block.querySelectorAll('.profile-form-overview-container').length).to.equal(1);
  });

  it('Should render the correct About You section', async () => {
    const aboutSection = block.querySelector('.profile-form-overview-section-header p');
    expect(aboutSection.textContent).to.contain('About You');
  });

  it('Should render the correct Address section', async () => {
    const addressSection = block.querySelector('.profile-form-overview-section:nth-child(2) .profile-form-overview-section-header p');
    expect(addressSection.textContent).to.contain('Address');
  });

  it('Should render the correct Events section', async () => {
    const eventsSection = block.querySelector('.profile-form-overview-section:nth-child(3) .profile-form-overview-section-header p');
    expect(eventsSection.textContent).to.contain('Events');
  });

  it('Should render the correct input values', async () => {
    expect(block.querySelector('input[name="name"]').value).to.equal('Mr. Lakshman Sharma');
    expect(block.querySelector('input[name="phone"]').value).to.equal('9576444568');
    expect(block.querySelector('input[name="email"]').value).to.equal('lakshman.sharma@gmail.com');
    expect(block.querySelector('input[name="address_line1"]').value).to.equal('3rd Floor, C40/C, Ardee City');
    expect(block.querySelector('input[name="state"]').value).to.equal('Haryana');
    expect(block.querySelector('input[name="address_line2"]').value).to.equal('Sector 52');
    expect(block.querySelector('input[name="city"]').value).to.equal('Gurugram');
    expect(block.querySelector('input[name="landmark"]').value).to.equal('Near Mother Dairy Chowk');
    expect(block.querySelector('input[name="postal_code"]').value).to.equal('122003');
    expect(block.querySelector('input[name="dob"]').value).to.equal('1992-09-12');
    expect(block.querySelector('input[name="event"]').value).to.equal('Anniversary');
  });

  it('Should attach click event listener to edit buttons', async () => {
    block.querySelectorAll('button.edit-icon').forEach((btn) => {
      btn.click();
    });
  });
});