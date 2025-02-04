import utility from './utility.js';

const HighlightUtils = {

  generateSwitchListHTML: (items, getTabName) => {
    const generateSwitchListItemHTML = (tabName, index) => `
                  <li class="switch-list-item switch-index-${index}"><h3 class="switch-list-title">${tabName}</h3></li>
                `;

    const switchListHTML = items.map((item, index) => {
      const tabName = getTabName(item);
      return generateSwitchListItemHTML(tabName, index);
    }).join('');

    return utility.sanitizeHtml(`
            <div class="switch-list-section">
              <ul class="switch-list">
                ${switchListHTML}
              </ul>
            </div>
          `);
  },
  setupTabs: (container, className = 'highlightItem') => {
    const switchList = container.querySelector('.switch-list');
    let prevContenHeight = '';
    let activeTab = 0;
    switchList.addEventListener('click', (event) => {
      const switchItem = event.target.closest('.switch-list-item');
      if (!switchItem) return;

      const index = Array.from(switchList.children).indexOf(switchItem);
      const highlightItems = container.querySelectorAll(`.${className}`) || [];
      const highlightContentItems = container.querySelectorAll(`.${className}-content`) || [];
      const switchItems = container.querySelectorAll('.switch-list-item') || [];

      if (highlightItems.length > 0) {
        highlightItems.forEach((highlightItem) => {
          highlightItem.style.display = 'none';
        });
      }

      if (highlightContentItems.length > 0) {
        highlightContentItems.forEach((highlightContentItem) => {
          highlightContentItem.style.display = 'none';
        });
      }

      if (highlightItems.length > index) {
        const highlighContentItem = highlightItems[index];
        highlighContentItem.style.display = 'flex';
        if (highlightContentItems[index].closest('.zoomin-effect') && index !== activeTab) {
          const moreContent = highlighContentItem.querySelector('.more-content');
          const moreContentExpanded = highlighContentItem.querySelector('.more-content-expanded');
          const readMoreButton = highlighContentItem.querySelector('.read-more');
          const isContentVisible = moreContent.style.display !== 'none';
          if (!isContentVisible) {
            moreContent.style.display = isContentVisible ? 'none' : 'block';
            moreContentExpanded.style.display = isContentVisible ? 'block' : 'none';
            readMoreButton.textContent = 'Read more';
          }
          activeTab = index;
          const image = highlightItems[index].querySelector('.highlightItem-img');
          if (image) {
            image.classList.remove('zoom');
            setTimeout(() => {
              image.classList.add('zoom');
            }, 300);
          }
        }
      }

      if (highlightContentItems.length > index) {
        if (highlightContentItems[index].closest('.no-zoomin-effect')) {
          highlightContentItems[index].style.display = 'block';
          const contentWrapper = highlightContentItems[index];
          const targetHeight = contentWrapper.scrollHeight;
          contentWrapper.style.height = prevContenHeight;
          setTimeout(() => {
            contentWrapper.style.height = `${targetHeight}px`;
          }, 100);
          contentWrapper.addEventListener('transitionend', function handler() {
            contentWrapper.style.height = 'auto';
            contentWrapper.removeEventListener('transitionend', handler);
          });
          prevContenHeight = `${targetHeight}px`;
        } else {
          highlightContentItems[index].style.display = 'block';
        }
      }

      switchItems.forEach((item) => item.classList.remove('active'));
      switchItem.classList.add('active');
    });

    // Initial setup
    const defaultHighlightItem = container.querySelector(`.${className}.switch-index-0`);

    if (defaultHighlightItem) {
      defaultHighlightItem.style.display = 'flex';
    }

    const firstSwitchItem = container.querySelector('.switch-list-item');
    if (firstSwitchItem) {
      firstSwitchItem.classList.add('active');
    }

    if (defaultHighlightItem?.closest('.highlight-tabs')?.classList?.contains('no-zoomin-effect')) {
      setTimeout(() => {
        prevContenHeight = `${defaultHighlightItem.querySelector('.highlightItem-content').scrollHeight}px`;
      }, 500);
    }
  },

};

export default HighlightUtils;
