const tabUtils = {
  init: (
    el,
    {
      tabsWrapperClass = 'tabs-wrapper',
      tabClass = 'tab',
      buttonWrapperClass = 'tab-buttons',
      buttonClass = 'tab-button',
      defaultTabIndex = 0,
      position = 'bottom',
    } = {},
  ) => {
    if (!el) {
      throw new Error('No tab elements found');
    }

    el.querySelector(`.${tabsWrapperClass}`)?.classList?.add('tabs-wrapper-default', `tabs-wrapper--${position}`);
    const tabs = Array.from(el.querySelectorAll(`.${tabClass}`));
    const buttons = Array.from(el.querySelectorAll(`.${buttonClass}`));

    if (tabs.length === 0 || buttons.length === 0) {
      return {};
    }

    el.querySelector(`.${buttonWrapperClass}`)?.classList?.add('tab-buttons');

    const showTab = (index) => {
      const activeTab = el.querySelector('.tab--active');
      const activeButton = el.querySelector('.button--active');
      if (parseInt(activeTab.dataset.tabIndex, 10) === index) {
        return;
      }
      if (parseInt(activeButton.dataset.targetIndex, 10) === index) {
        return;
      }
      activeTab.classList.remove('tab--active');
      activeButton.classList.remove('button--active');
      tabs[index]?.classList.add('tab--active');
      buttons[index]?.classList.add('button--active');
    };

    buttons.forEach((button, index) => {
      button.classList.add('button', `button-${index}`);
      if (!tabs[index]) {
        return;
      }
      tabs[index].classList.add('tab', `tab-${index}`);
      if (index === defaultTabIndex) {
        tabs[index].classList.add('tab--active');
        button.classList.add('button--active');
      }
      tabs[index].dataset.tabIndex = index;
      button.dataset.targetIndex = index;
      button.addEventListener('click', () => {
        showTab(index);
      });
    });

    return {
      activateTab: (index) => {
        if (index >= 0 && index < buttons.length) {
          showTab(index);
        }
      },
    };
  },
};

export default tabUtils;
