import { html } from '../../vendor/htm-preact.js';
import { hnodeAs } from '../multi-step-form.js';

const FeaturesModal = ({
  isOpen, onClose, features, config, vehicleDetails, modelDetails,
}) => {
  if (!isOpen) return null;

  document.querySelector('body').classList.add('overflow-hidden');
  const handleAccordionToggle = (e) => {
    const header = e.currentTarget;
    const content = header.parentElement;
    content.classList.toggle('features-modal__accordion-content--open');
  };

  return html`
    <div class="features-modal__overlay">
      <div class="features-modal">
        <button class="features-modal__close" onClick=${onClose}></button>
        ${hnodeAs(config.featuresModalHeading, 'h3')}
        <div class="feature-modal__vehicle-details">
          <span>${vehicleDetails.split(':')?.[0]}</span>
          <span>${modelDetails}</span>
        </div>
        <span>${config.featuresLabel}</span>
        <div class="features-modal__accordion">
          ${features.map(
    (feature, index) => html`
              <div class="features-modal__accordion-item ${index === 0 ? 'features-modal__accordion-content--open' : ''}">
                <div
                  class="features-modal__accordion-header"
                  onClick=${handleAccordionToggle}
                >
                  <h4>${feature.category}</h4>
                  <span class="features-modal__accordion-icon"></span>
                </div>
                <div class="features-modal__accordion-content">
                  ${feature.items.map(
    (item) => html` <p><span>${item.title}</span> <span> ${item.description || 'NA'}</span></p> `,
  )}
                </div>
              </div>
            `,
  )}
        </div>
      </div>
    </div>
  `;
};

export default FeaturesModal;
