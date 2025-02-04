/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import decorate from '../../../blocks/profile-hero-banner/profile-hero-banner.js';

document.write(await readFile({ path: './profile-hero-banner.plain.html' }));

const block = document.querySelector('.profile-hero-banner');
await decorate(block);

describe('Profile Hero Banner Block', () => {
  it('Should render profile hero banner', async () => {
    expect(block.querySelector('.profile-banner-wrapper')).to.exist;
  });

  it('Should render username with prefix', async () => {
    const usernameElement = block.querySelector('.profile-username');
    expect(usernameElement).to.exist;
  });

  it('Should render background image', async () => {
    const backgroundElement = block.querySelector('.profile-banner-wrapper');
    expect(backgroundElement.style.backgroundImage).to.contain('maruti-suzuki-nexa-2-million-sales-f92a-1.png');
  });

  it('Should render profile banner links', async () => {
    const links = block.querySelectorAll('.profile-banner-links ul li a');
    expect(links.length).to.equal(5);
    expect(links[0].textContent).to.equal('My Rewards');
    expect(links[1].textContent).to.equal('My Profile');
    expect(links[2].textContent).to.equal('Smart Finance');
    expect(links[3].textContent).to.equal('Assistance & Support');
    expect(links[4].textContent).to.equal('Contact Us');
  });
});
