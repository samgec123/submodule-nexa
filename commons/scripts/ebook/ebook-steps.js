/* eslint-disable array-callback-return */
/* eslint-disable max-len */
import { html } from '../vendor/htm-preact.js';
import { useEffect, useState } from '../vendor/preact-hooks.js';

const EbookStep = ({ selectedDealer }) => {
  const [values, setValues] = useState([]);
  const [heading, setHeading] = useState('');
  useEffect(() => {
    const stepsContent = document.querySelector('.login.hide-content');
    let ebookStepsWrapper = '';
    [...stepsContent.children]?.map((row, index) => {
      if ([...stepsContent.children].length - 2 === index) {
        ebookStepsWrapper = row.firstElementChild;
      }
    });
    const finalValue = [];
    [...ebookStepsWrapper.children]?.map((row, index) => {
      if (index % 2 === 0 && index !== 0) {
        finalValue.push({ number: [...ebookStepsWrapper.children][index - 1]?.textContent , text: row.textContent});
      } else if(index === 0){
        setHeading(row.textContent);
      }
    });
    setValues((finalValue));
  }, []);

  const getCurrentStep = () => {
    const url = new URL(window.location.href);
    const step = url.searchParams.get('step');
    return step;
  };

  return html`
        <section class="cmp-ebook-journey__steps">
        <div class="cmp-ebook-journey__steps__header">
          <h1>${heading}</h1>
          ${getCurrentStep() === 'summary'
    ? html`<div class="cmp-ebook-journey__steps__contact-dealer">
            Need Help? <a 
            href="tel:${selectedDealer?.phone}" 
            aria-label="phone">
            Contact Dealer
            </a>
          </div>` : ''
}
        </div>
        <div class="cmp-ebook-journey__steps__container">
          ${
  values?.map((content) => html`
            <span data-step="${content.number}" class="steps">
              <i><i>${content.number}</i></i><span>${content.text}</span>
            </span>`)
}
        </div>
        </section>`;
};

EbookStep.defaults = {
  submitButton: html`<p>Send OTP</p>`,
};

export default EbookStep;
