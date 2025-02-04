import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import interaction from '../interaction.js';

const EmptySummaryContent = ({ totalPrice, handleCloseSummaryPopup, grandTotalLabel }) => html`
    <div class="empty-summary-section">
      <div class="empty-categories">
        <div>Interior:</div>
        <div>Exterior:</div>
      </div>
      <div class="empty-summary-content">
        <span
          >No customisations made to the car. Please visit Customise Section to
          select your packages and accessories.</span
        >
        <button class="customise-btn" onClick=${handleCloseSummaryPopup}>Customise</button>
      </div>
      <div class="total-price-section">
        <div class="grand-total-label">${grandTotalLabel}</div>
        <div class="grand-total-value">₹ ${interaction.formatDisplayPrice(totalPrice)}</div>
      </div>
    </div>
  `;

export default EmptySummaryContent;
