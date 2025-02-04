import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';
import utility from '../../utility/utility.js';
import Helper from './helper.js';

export default async function decorate(block) {
  if (utility.isEditorMode(block)) {
    block.classList.add('view360-editor-mode');
  }
  const [
    cfDetailsEl,
    contentEl,
    ctaDetailsEl,
    tabsEl,
    loaderEl,
    assetTypeEl
  ] = block.children;

  const variantPath = cfDetailsEl?.querySelector('a')?.textContent?.trim() || '';
  const totalImages = parseInt(cfDetailsEl?.querySelector('p:last-child')?.textContent?.trim() || '0', 10);
  const title = contentEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList?.add('view360__title');
  title?.remove();
  const description = contentEl?.querySelector('div')?.innerHTML?.trim();
  const cta = ctaDetailsEl?.querySelector('a');
  if (cta) {
    cta.className = 'view360__primary-btn';
    cta.setAttribute('target', ctaDetailsEl?.querySelector('p:last-child')?.textContent?.trim() || '_self');
  }

  let exteriorLabel = '';
  let interiorLabel = '';
  let indicationText = '';
  let notAvailableText = '';
  let id = '';

  if (tabsEl?.children[0]?.children) {
    [exteriorLabel, interiorLabel, notAvailableText, indicationText, id] = Array.from(tabsEl.children[0].children).map((item) => item.textContent?.trim() || '');
  }

  if (id) {
    block.setAttribute('id', id);
  }

  const [loaderImageEl, altTextEl, loadingTextEl] = loaderEl?.firstElementChild?.children ?? [];
  const loadingImage = loaderImageEl?.querySelector('picture');
  const altText = altTextEl?.textContent?.trim() || '';
  const loadingText = loadingTextEl?.textContent?.trim();
  if (loadingImage) {
    loadingImage?.querySelector('img')?.setAttribute('alt', altText);
  }

  const assetType = assetTypeEl?.textContent?.trim() || '4K';

  block.innerHTML = utility.sanitizeHtml(`
    <div class="view360__container">
      <div class="view360__top-section">
        <div class="view360__left-section">
          ${(title) ? title.outerHTML : ''}
        </div>
        <div class="view360__right-section">
          ${(description) ? `<div class="view360__description">${description}</div>` : ''}
          ${(cta) ? `<div class="cta__primary">${cta.outerHTML}</div>` : ''}
        </div>
      </div>
      <div class="view360__bottom-section">
        <div class="view360__colors-wrapper">
          <div class="slide-icon slide-left"></div>
          <div class="view360__colors-list"></div>
          <div class="slide-icon slide-right"></div>
        </div>
        <div class="view360__content view360__content--active view360__content-exterior">
          <div class="view360-icon">
            <span>${indicationText}</span>
          </div>
          <canvas id="view360-canvas-exterior">
          </canvas>
          <p class="view360__not-available hidden">${notAvailableText}</p>
        </div>
        <div class="view360__content view360__content-interior hidden">
          <div class="view360-icon">
            <span>${indicationText}</span>
          </div>
          <div id="one3d">
          </div>
          <div class="view360-loading-overlay">
            ${(loadingImage) ? `${loadingImage.outerHTML}` : ''}
            <div class="view360-loading-overlay-content">
              ${(loadingText) ? `<p class="view360-loading-text">${loadingText}</p>` : ''}
              <div class="view360-progress-bar"></div>
              <div class="view360-progress-text">0%</div>
            </div>
          </div>
        </div>
        <div class="view360__tabs-wrapper">
          <div class="view360__tabs">
            ${(exteriorLabel) ? `<span class="view360__tab-label view360__tab-label--active view360-tab-exterior">${exteriorLabel}</span>` : ''} 
            ${(interiorLabel) ? `<span class="view360__tab-label view360-tab-interior">${interiorLabel}</span>` : ''} 
          </div>
        </div>
      </div>
    </div>
  `);

  const { dynamicMediaFolderUrl, one3dCdnScriptPrefix, shadesOfWhite } = await fetchPlaceholders();
  let interiorInit = false;
  const initTabs = (exteriorController, carInfo) => {
    block.querySelectorAll('.view360__tab-label').forEach((tab) => {
      tab.addEventListener('click', () => {
        if (!tab.classList.contains('view360__tab-label--active')) {
          block.querySelector('.view360__tab-label--active')?.classList?.remove('view360__tab-label--active');
          tab.classList.add('view360__tab-label--active');
        }
        if (tab.classList.contains('view360-tab-exterior')) {
          block.querySelector('.view360__colors-wrapper').classList.remove('hidden');
          block.querySelector('.view360__content-interior').classList.add('hidden');
          block.querySelector('.view360__content-exterior').classList.remove('hidden');
          requestAnimationFrame(exteriorController?.resizeCanvas);
        } else {
          block.querySelector('.view360__colors-wrapper').classList.add('hidden');
          block.querySelector('.view360__content-exterior').classList.add('hidden');
          block.querySelector('.view360__content-interior').classList.remove('hidden');
          if (!interiorInit) {
            interiorInit = true;
            Helper.initInterior(block, one3dCdnScriptPrefix, assetType, carInfo);
          }
        }
      });
    });
  };

  let initBlock = false;
  const loadBlock = async () => {
    if (!initBlock) {
      initBlock = true;
      const carInfo = await Helper.getCarInfo(variantPath);
      const controller = Helper.initExterior(block, totalImages, carInfo, dynamicMediaFolderUrl, shadesOfWhite);
      initTabs(controller, carInfo);
    }
  };
  if (Window.DELAYED_PHASE) {
    loadBlock();
  } else {
    document.addEventListener('delayed-phase', loadBlock);
  }
  window.addEventListener('scroll', loadBlock);

  block.querySelector('.view360__primary-btn')?.addEventListener('click', (e) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = block.querySelector('.view360__title')?.textContent?.trim() || '';
    data.componentType = 'button';
    data.webName = e.target?.textContent?.trim() || '';
    data.linkType = e.target;
    analytics.setButtonDetails(data);
  });
}
