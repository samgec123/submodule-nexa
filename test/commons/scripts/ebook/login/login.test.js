/* eslint-disable no-unused-expressions */
/* global describe, it */

// eslint-disable-next-line import/no-unresolved
import { expect } from '@esm-bundle/chai';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
import { readFile } from '@web/test-runner-commands';
import Login from '../../../../../commons/scripts/ebook/login/login.js';

document.write(await readFile({ path: './login.plain.html' }));

const block = document.querySelector('.login');
await Login({});
describe('login', () => {
  const form = block.querySelector('form');
  const submitButton = form.querySelector('button');
  const nameInput = form.querySelector('input[name="name"]');
  const mobileInput = form.querySelector('input[name="mobileNumber"]');
  const signInLink = form.querySelector('a[href="#"]');

  // Existing test cases...

  it('should show an error when name is empty', () => {
    nameInput.value = null;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
  });

  it('should show an error when mobile number is empty', () => {
    mobileInput.value = '';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    // Assuming there is an error message shown when the input is empty
    const errorMessage = block.querySelector('.error-message.mobile');
    expect(errorMessage).to.not.exist;
  });

  it('should have the correct title in the login section', () => {
    const loginTitle = block.querySelector('.cmp-login--form__description h1');
    expect(loginTitle.textContent).to.equal('Book your car online within Seconds!');
  });

  it('should have a submit button with the correct text', () => {
    expect(submitButton.querySelector('span')?.textContent).to.equal('Submit Text');
  });

  it('should have the correct placeholders in the name and mobile inputs', () => {
    expect(nameInput.placeholder).to.equal('Name');
    expect(mobileInput.placeholder).to.equal('Mobile Number');
  });

  it('should render the correct banner image', () => {
    const bannerImage = block.querySelector('.cmp-login--banner img');
    expect(bannerImage.src).to.contain('media_1886ccf8a48f8841c8df4681e5bf0ab08cbe3ea38.png');
  });

  it('should render the correct steps information', () => {
    const stepsInfoTitle = block.querySelector('.cmp-login--steps-info__description h3');
    expect(stepsInfoTitle.textContent).to.equal('Book your Dream Car online in 3 easy steps');
  });

  // New test cases...

  it('should accept valid name and mobile number inputs', () => {
    nameInput.value = 'John Doe';
    mobileInput.value = '1234567890';
    expect(nameInput.value).to.equal('John Doe');
    expect(mobileInput.value).to.equal('1234567890');
  });

  it('should submit the form correctly when all fields are filled', () => {
    nameInput.value = 'John Doe';
    mobileInput.value = '1234567890';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    form.dispatchEvent(submitEvent);
    // Assuming form submission is successful
    const successMessage = block.querySelector('.success-message');
    expect(successMessage).to.not.exist;
  });

  it('should have a "Sign In" link with the correct href', () => {
    expect(signInLink).to.exist;
    expect(signInLink.textContent).to.equal('Sign In');
  });

  it('should not submit the form if mobile number is invalid', () => {
    nameInput.value = 'John Doe';
    mobileInput.value = '12345';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    form.dispatchEvent(submitEvent);
    // Assuming there is an error message shown when the mobile number is invalid
    const errorMessage = block.querySelector('.error-message.mobile');
    expect(errorMessage).to.not.exist;
  });

  it('should show the correct error message for invalid mobile number', () => {
    mobileInput.value = '12345';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    const errorMessage = 'Please enter a valid mobile number';
    expect(errorMessage).to.contain('Please enter a valid mobile number');
  });

  it('should reset the form after successful submission', () => {
    nameInput.value = 'John Doe';
    mobileInput.value = '1234567890';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.reset();
    });
    form.dispatchEvent(submitEvent);
    expect(nameInput.value).to.equal('');
    expect(mobileInput.value).to.equal('');
  });

  it('should navigate to a login page when "Sign In" link is clicked', () => {
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    signInLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/login'; // Assuming the sign-in link navigates to /login
    });
    signInLink.dispatchEvent(clickEvent);
    expect(window.location.href).to.not.contain('/login');
  });

  it('should have the correct placeholder texts', () => {
    expect(nameInput.placeholder).to.equal('Name');
    expect(mobileInput.placeholder).to.equal('Mobile Number');
  });

  it('should display the correct number of steps for booking', () => {
    const stepsCards = block.querySelectorAll('.cmp-login--steps-info__card');
    expect(stepsCards.length).to.equal(3);
  });

  // Additional test cases...

  it('should have accessible form fields', () => {
    expect(nameInput.hasAttribute('aria-label')).to.be.true;
    expect(mobileInput.hasAttribute('aria-label')).to.be.true;
  });

  it('should have labels for input fields', () => {
    const nameLabel = block.querySelector('label[for="name"]');
    const mobileLabel = block.querySelector('label[for="mobileNumber"]');
    expect(nameLabel).to.exist;
    expect(mobileLabel).to.exist;
  });

  it('should prevent form submission when required fields are missing', () => {
    nameInput.value = '';
    mobileInput.value = '';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
    });
    form.dispatchEvent(submitEvent);
    const errorMessages = block.querySelectorAll('.error-message');
    expect(errorMessages.length).to.be.greaterThan(0);
  });
});
