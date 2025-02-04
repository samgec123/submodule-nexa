import utility from '../../utility/utility.js';
import analytics from '../../utility/analytics.js';

export default async function decorate(block) {
  block.innerHTML = utility.sanitizeHtml(`
                <div class="more-from-nexa-wrapper">
                   <div class="more-from-nexa block" data-block-name="more-from-nexa" data-block-status="loaded">
                      <div class="main__container">
                         <div class="title-container">
                            <h2 id="more-from-nexa" class="custom-title">More from NEXA</h2>
                         </div>
                         <div class="car-list-container">
                            <div class="car-card"><a href="https://www.nexaexperience.com/e-vitara" class="car-link active">e VITARA</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/invicto" class="car-link">Invicto</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/fronx" class="car-link">Fronx</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/jimny" class="car-link">Jimny</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/grand-vitara" class="car-link">Grand Vitara</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/xl6" class="car-link">XL6</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/ignis" class="car-link">Ignis</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/baleno" class="car-link">Baleno</a></div>
                            <div class="car-card"><a href="https://www.nexaexperience.com/ciaz" class="car-link">Ciaz</a></div>
                         </div>
                      </div>
                   </div>
                </div>`);

                block.querySelectorAll('a').forEach((link) => {
                  const data = {};
                  data.componentName = block.dataset.blockName;
                  data.componentTitle = link.closest('.teaser__card')?.querySelector('.teaser__title')?.textContent?.trim() || link?.textContent?.trim() || '';
                  data.componentType = 'button';
                  data.webName = link.textContent.trim() || '';
                  data.linkType = link;
                  link.addEventListener('click', () => {
                    analytics.setButtonDetails(data);
                  });
                });
}
