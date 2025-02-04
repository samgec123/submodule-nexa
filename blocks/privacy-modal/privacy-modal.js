import utility from '../../commons/utility/utility.js';
import modelUtility from '../../utility/modelUtils.js';

export default function decorate(block) {
  const [
    tandCheadingEl,
    tandCdescriptionEl,
    privacyHeadingEl,
    privacyDescriptionEl,
  ] = block.children;

  const tandCheading = tandCheadingEl?.textContent?.trim() || '';
  const privacyHeading = privacyHeadingEl?.textContent?.trim() || '';

  const newHtml = `
  <div class="modal-overlay"></div>
  <div class="feature-tab-modal modal hide">
    <div class="modal-content">
      <span class="close-button"></span>
      <div class="modal-body">
        <div class="faq-section termsSection">
          <div class="faq-item termItem">
            <div class="question">${tandCheading}</div>
            <div class="answer">${tandCdescriptionEl.outerHTML}</div>
          </div>
          <div class="faq-item termItem">
            <div class="question">${privacyHeading}</div>
            <div class="answer">${privacyDescriptionEl.outerHTML}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

  const faqItems = block.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.question');
    const answer = item.querySelector('.answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach((faq) => {
        faq.classList.remove('active');
        faq.querySelector('.answer').classList.remove('open');
        faq.querySelector('.answer').classList.add('close');
      });

      if (!isActive) {
        item.classList.add('active');
        answer.classList.remove('close');
        answer.classList.add('open');
      } else {
        item.classList.remove('active');
        answer.classList.remove('open');
        answer.classList.add('close');
      }
    });
  });
  const modelParent = document.querySelector('.privacy-modal-container');
  const modal = block.querySelector('.modal');
  const modalBody = modal.querySelector('.modal-body');
  const closeButton = modal.querySelector('.close-button');
  const modalOverlay = block.querySelector('.modal-overlay');
  modelUtility.initModel(modelParent, modal, modalBody, closeButton, modalOverlay);

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.remove('active');
    modal.classList.add('modal-fade-out');
    modal.classList.remove('modal-fade-in');
    modalOverlay.classList.remove('active');
    modelParent.style.display = 'none';
    document.body.style.overflow='auto';
  });
}
