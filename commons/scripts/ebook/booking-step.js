/* eslint-disable array-callback-return */
import { html } from '../vendor/htm-preact.js';
import { useEffect, useState } from '../vendor/preact-hooks.js';
import { hnodeAs } from './multi-step-form.js';
import { formatRupeesWithSymbol } from '../../utility/apiUtils.js';

const BookingStep = ({
  config, nextUpdateUserSession, previousUpdateUserSession, display, step, errors,
}) => {
  const [bookingHeading, setBookingHeading] = useState({});

  const convertToHTML = (element) => {
    const paragraph = document.createElement('span');
    const i = element?.innerHTML || '';
    paragraph.innerHTML = i;
    document.querySelector('.cmp-ebook-journey__booking-amount .description').innerHTML = '';
    document.querySelector('.cmp-ebook-journey__booking-amount .description')?.appendChild(paragraph);
  };

  useEffect(() => {
    convertToHTML(bookingHeading[1]);
  }, [bookingHeading]);
  useEffect(() => {
    const stepsContent = document.querySelector('.login.hide-content');
    let ebookStepsWrapper = '';
    [...stepsContent.children]?.map((row, index) => {
      if ([...stepsContent.children].length - 1 === index) {
        ebookStepsWrapper = row.firstElementChild;
      }
    });
    [...ebookStepsWrapper.children]?.map((content, key) => {
      setBookingHeading((current) => ({ ...current, [key]: content }));
    });
  }, []);

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    await nextUpdateUserSession(e, bookingHeading[5]?.textContent);
  };

  const handlePrevious = async (e) => {
    await previousUpdateUserSession(e, bookingHeading[5]?.textContent);
  };

  return html` <div class="cmp-ebook-journey__booking-amount ${display === 'true' ? 'show' : ''}">
    <div class="details">
      <div>
        <h3>${bookingHeading[0]?.textContent || ''}</h3>
        <h2>${formatRupeesWithSymbol(Number(bookingHeading[5]?.textContent))}/-</h2>
      </div>
      <p class="description">
      </p>
    </div>
    <div class="cmp-ebook-journey__cta-buttons">
      <div class="cmp-ebook-journey__booking-amount-button-wrapper cmp-ebook-journey__previous-button-wrapper">
        <button class="cmp-ebook-journey__previous cta__new cta__new-primary" type="button" onClick=${(e) => handlePrevious(e)}
        >${bookingHeading[2]?.textContent || ''}</button>
      </div>
      <div class="cmp-ebook-journey__booking-amount-button-wrapper cmp-ebook-journey__continue-button-wrapper">
        ${step === 'summary'
    ? html` ${(Boolean(errors.fieldErrors) || Boolean(errors.fieldEmptyCheck))
      ? html` <button type="submit" class="cmp-ebook-journey__continue cta__new cta__new-primary" disabled>
                        ${hnodeAs(config.proceedButton, 'span')}
                      </button>`
      : html` <button class="cmp-ebook-journey__continue cta__new cta__new-primary" type="submit" onClick=${(e) => handleOnSubmit(e)}>
                        ${hnodeAs(config.proceedButton, 'span')}
                      </button>`}
                      `
    : html` <button class="cmp-ebook-journey__continue cta__new cta__new-primary" type="submit" onClick=${handleOnSubmit}
        >${bookingHeading[3]?.textContent || ''}</button>`

}
       
      </div>
    </div>
  </div>`;
};

export default BookingStep;
