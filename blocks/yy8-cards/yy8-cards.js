import utility from '../../utility/utility.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [
    imgCardFirstEl,
    imgAltFirstEl,
    titleFirstEl,
    descriptionFirstEl,
    imgCardSecondEl,
    imgAltSecondEl,
    titleSecondEl,
    descriptionSecondEl,
    imgCardThirdEl,
    imgAltThirdEl,
    titleThirdEl,
    descriptionThirdEl,
  ] = children;

  const imgCardOne = imgCardFirstEl?.querySelector('img')?.src || '';
  const imgAltOne = imgAltFirstEl?.textContent?.trim() || '';
  const titleFirst = titleFirstEl || '';
  const descriptionFirst = descriptionFirstEl?.textContent?.trim() || '';

  const imgCardSecond = imgCardSecondEl?.querySelector('img')?.src || '';
  const imgAltSecond = imgAltSecondEl?.textContent?.trim() || '';
  const titleSecond = titleSecondEl || '';
  const descriptionSecond = descriptionSecondEl?.textContent?.trim() || '';

  const imgCardThird = imgCardThirdEl?.querySelector('img')?.src || '';
  const imgAltThird = imgAltThirdEl?.textContent?.trim() || '';
  const titleThird = titleThirdEl || '';
  const descriptionThird = descriptionThirdEl?.textContent?.trim() || '';

  block.innerHTML = utility.sanitizeHtml(`
    <div class="card-wrapper">
    <div class="card-clip">
    <div class="container">
    <div class="card-section">
        <div class="image-card">
            <div class="card">
                <div class="card-img">
                    ${imgCardOne ? `<img src="${imgCardOne}" alt="${imgAltOne}">` : ''}
                </div>
                <div class="card-content">
                    ${titleFirst?.outerHTML || '<!-- Title not found -->'}
                    <p>${descriptionFirst}</p>
                </div>
            </div>
        </div>
        <div class="image-card">
            <div class="card">
                <div class="card-img">
                    ${imgCardSecond ? `<img src="${imgCardSecond}" alt="${imgAltSecond}">` : ''}
                </div>
                <div class="card-content">
                    ${titleSecond?.outerHTML || '<!-- Title not found -->'}
                    <p>${descriptionSecond}</p>
                </div>
            </div>
        </div>
        <div class="image-card">
            <div class="card">
                <div class="card-img">
                    ${imgCardThird ? `<img src="${imgCardThird}" alt="${imgAltThird}">` : ''}
                </div>
                <div class="card-content">
                    ${titleThird?.outerHTML || '<!-- Title not found -->'}
                    <p>${descriptionThird}</p>
                </div>
            </div>
        </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    `);
}
