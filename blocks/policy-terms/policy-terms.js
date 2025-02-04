import utility from '../../utility/utility.js';

export default function decorate(block) {
  const [pretitleEl, ...policyItemsEl] = block.children;

  const pretitle = pretitleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  pretitle.classList.add('pre-title');

  const tabsHtml = [];
  const tabContentsHtml = [];

  policyItemsEl.forEach((item, index) => {
    const tabTitle = item.children[0]?.textContent?.trim() || '';
    const tabData = item.children[1]?.outerHTML || '';

    const tab = `<li class='tab-item ${
      index === 0 ? 'active' : ''
    }' data-index=${index}>${tabTitle}</li>`;
    tabsHtml.push(tab);

    item.innerHTML = `<div class="tab-content ${
      index === 0 ? 'active' : ''
    }" data-index=${index}>${tabData}</div>`;
    tabContentsHtml.push(item.outerHTML);
  });

  block.innerHTML = utility.sanitizeHtml(`
    <div class="policy-terms__container">
      <div class="header">
        <div class="pre-title-container">
          ${pretitle?.outerHTML}
        </div>
        <div class="tabs-container">
          <ul class="tab-list">
            ${tabsHtml.join('')}
          </ul>
        </div>
      </div>
      <div class="body">
        <div class='content'>
          ${tabContentsHtml.join('')}
        </div>
      </div>
    </div>
  `);

  const tabs = block.querySelectorAll('.tab-list .tab-item');
  const tabContents = block.querySelectorAll('.content .tab-content');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      if (!tab.classList.contains('active')) {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        tabContents.forEach((tabContent) => tabContent.classList.remove('active'));
        tabContents[index]?.classList.add('active');
      }
    });
  });
}
