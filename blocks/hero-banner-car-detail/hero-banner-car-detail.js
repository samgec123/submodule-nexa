import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../utility/utility.js';
import apiUtils from '../../utility/apiUtils.js';
import analytics from '../../utility/analytics.js';

export default function decorate(block) {
  const [
    contentEl,
    priceEl,
    disclaimerEl,
    ctaEl,
    specEl,
    customSpecsEl,
  ] = Array.from(block.children).map((item) => item.firstElementChild);
  const [desktopVideo, mobileVideo] = Array.from(contentEl?.querySelectorAll('a')).map((item) => {
    const link = item.textContent?.trim();
    (item?.closest('p') ?? item).remove();
    return link;
  });
  const [desktopPoster, mobilePoster] = Array.from(contentEl?.querySelectorAll('picture')).map((item) => {
    const src = item.querySelector('img')?.src;
    (item.closest('p') ?? item).remove();
    return src;
  });
  const title = contentEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList.add('car-hero-banner-title');
  const pretitle = utility.textContentChecker(title?.previousElementSibling);
  const tagline = utility.textContentChecker(title?.nextElementSibling);
  const [priceLabel, priceText] = Array.from(priceEl?.children)?.map((item) => item.textContent?.trim()) ?? [];
  const disclaimer = disclaimerEl?.innerHTML;
  const [primaryCta, secondaryCta] = Array.from(ctaEl?.querySelectorAll('a')).map((item) => {
    (item?.closest('p') ?? item).remove();
    return item;
  });
  const [primaryTarget, secondaryTarget] = Array.from(ctaEl.children).map((item) => item.textContent?.trim() || '_self');
  primaryCta?.setAttribute('target', primaryTarget);
  secondaryCta?.setAttribute('target', secondaryTarget);
  primaryCta?.classList.add('car-hero-banner-primary-btn', 'cta__new', 'cta__new-primary');
  secondaryCta?.classList.add('car-hero-banner-secondary-btn', 'cta__new', 'cta__new-outlined');
  const cfEl = specEl?.querySelector('a');
  let modelPath = '';
  if (cfEl) {
    modelPath = utility.textContentChecker(cfEl);
    (cfEl.closest('p') ?? cfEl)?.remove();
  }
  const selectedSpecs = specEl?.textContent?.trim()?.split(',')?.filter((item) => item) ?? [];
  const [
    overrideSpecsEl,
    spec1LabelEl,
    spec1ValueEl,
    spec2LabelEl,
    spec2ValueEl,
    spec3LabelEl,
    spec3ValueEl,
  ] = customSpecsEl?.children ?? [];
  const overrideSpecs = ((overrideSpecsEl?.textContent?.trim() || 'true') === 'true');
  let videoUrl = desktopVideo;
  let poster = desktopPoster;
  if (window.matchMedia('(width < 768px)').matches) {
    videoUrl = mobileVideo || desktopVideo;
    poster = mobilePoster || desktopPoster;
  }
  let contentHtml = '';
  if (pretitle || title || tagline) {
    contentHtml = `
        ${(pretitle) ? `<p class="car-hero-banner-pretitle">${pretitle}</p>` : ''}
        ${(title) ? `${title.outerHTML}` : ''}
        ${(tagline) ? `<p class="car-hero-banner-tagline">${tagline}</p>` : ''}
    `;
  }
  let ctasHtml = '';
  if (primaryCta || secondaryCta) {
    ctasHtml = `
      <div class="car-hero-banner-actions">
        ${(secondaryCta) ? `${secondaryCta.outerHTML}` : ''}
        ${(primaryCta) ? `${primaryCta.outerHTML}` : ''}
      </div>
    `;
  }
  let videoHtml = '';
  if (videoUrl) {
    videoHtml = `
      <div class="car-hero-banner-video">
        <video src="" poster="${poster}" playsinline autoplay loop muted="muted" preload="auto" width="100%"></video>
      </div>
    `;
  }
  block.innerHTML = utility.sanitizeHtml(`
    <div class="car-hero-banner-container">
      <div class="car-hero-banner-content">
        <div class="car-hero-banner-top-content">
          ${contentHtml}
          <div class="car-hero-banner-price"></div>
        </div>
        <div class="car-hero-banner-bottom-content">
          <div class="car-hero-banner-specs car-hero-banner-bottom-left">
          </div>
          <div class="car-hero-banner-bottom-right">
            ${ctasHtml}
            ${(disclaimer) ? `<div class="car-hero-banner-disclaimer">${disclaimer}</div>` : ''}
          </div>
        </div>
      </div>
      ${videoHtml}
    </div>
  `);
  let modelCd = '';
  const updatePrice = async (forCode) => {
    const price = (await apiUtils.getModelPrice(modelCd, 'EXC', forCode)) ?? '';
    block.querySelector('.car-hero-banner-price').innerHTML = '';
        if (price && priceText) {
          block.querySelector('.car-hero-banner-price').innerHTML = `
            ${priceLabel || ''} <b>${priceText?.replace('{price}', utility.formatCurrency(price).replaceAll(',', ' ').replace('₹', ''))}</b>
          `;
          }
  };
  const getCustomSpecs = () => [
    {
      label: spec1LabelEl?.textContent?.trim(),
      value: spec1ValueEl?.textContent?.trim(),
    },
    {
      label: spec2LabelEl?.textContent?.trim(),
      value: spec2ValueEl?.textContent?.trim(),
    },
    {
      label: spec3LabelEl?.textContent?.trim(),
      value: spec3ValueEl?.textContent?.trim(),
    },
  ];
  const getCfSpecs = async (data) => {
    const labelResult = (await apiUtils.getCarLabelsList());
    const specList = [];
    if (labelResult.length > 0) {
      const labels = labelResult[0];
      selectedSpecs.forEach((spec) => {
        switch (spec) {
          case 'displacement':
            if (data.displacement !== null && labels.engineCapacityLabel) {
              specList.push({ label: labels.engineCapacityLabel, value: data.displacement });
            }
            break;
          case 'maxPower':
            if (data.maxPower !== null && labels.maxPowerLabel) {
              specList.push({ label: labels.maxPowerLabel, value: data.maxPower });
            }
            break;
          case 'fuelEfficiency':
            if (data.fuelEfficiency !== null && labels.fuelEfficiencyLabel) {
              specList.push({ label: labels.fuelEfficiencyLabel, value: data.fuelEfficiency });
            }
            break;
          default:
            break;
        }
      });
    }
    return specList;
  };
  const loadBanner = async () => {
    const { publishDomain } = await fetchPlaceholders();
    block.querySelector('video').src = `${publishDomain}${videoUrl}`;
    const data = await apiUtils.getCarModelByPath(modelPath);
    utility.getScrollHighlightsAssetPrefix(modelPath, data);
    modelCd = data.modelCd;
    const primaryUrl = block.querySelector('.car-hero-banner-primary-btn')?.href || '';
    const secondaryUrl = block.querySelector('.car-hero-banner-secondary-btn')?.href || '';
    const [finalPrimaryUrl, finalSecondaryUrl] = [primaryUrl, secondaryUrl].map((url) => {
      if (!url) {
        return url;
      }
      const obj = new URL(url);
      obj.searchParams.set('modelCd', modelCd);
      return obj.href;
    });
    block.querySelector('.car-hero-banner-primary-btn')?.setAttribute('href', finalPrimaryUrl);
    block.querySelector('.car-hero-banner-secondary-btn')?.setAttribute('href', finalSecondaryUrl);
    const forCode = utility.getSelectedLocation()?.forCode ?? '08';
    updatePrice(forCode);
    let specList = [];
    if (overrideSpecs || selectedSpecs.length <= 0) {
      specList = getCustomSpecs();
    } else {
      specList = await getCfSpecs(data);
    }
    const specListContainer = block.querySelector('.car-hero-banner-specs');
    specList.forEach((spec) => {
      if (!spec.label || !spec.value) {
        return;
      }
      const div = document.createElement('div');
      div.classList.add('car-hero-banner-spec-container');
      div.innerHTML = `
        <span class="specs-label">${spec.label}</span>
        <span class="specs-value">${spec.value}</span>
      `;
      specListContainer.insertAdjacentElement('beforeend', div);
    });
  };
  document.addEventListener('updateLocation', (event) => {
    const forCode = event?.detail?.message ?? utility.getSelectedLocation()?.forCode ?? '08';
    updatePrice(forCode);
  });
  block.querySelectorAll('a').forEach((link) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = `${(pretitle) ? `${pretitle} ` : ''}${(title?.textContent?.trim()) ? `${title.textContent.trim()} ` : ''}${(tagline) ? `${tagline} ` : ''}`;
    data.componentType = 'button';
    data.webName = utility.textContentChecker(link);
    data.linkType = link;
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });
  loadBanner();
}
