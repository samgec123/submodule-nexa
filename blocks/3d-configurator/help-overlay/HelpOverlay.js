import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useEffect,
  useState,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import common from '../common.js';
import {
  HelpConfigratorIcons,
  OverlayHelpIcon,
  UnderlineIcon,
} from '../Icons.js';

const HelpOverlay = ({
  helpConfig,
  showHelpScreen,
  setShowHelpScreen,
}) => {
  const menuList = helpConfig;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timer, setTimer] = useState(null); // Timer to handle inactivity

  const topArrowEl = document.querySelector('.top-arrow');
  const bottomArrowEl = document.querySelector('.bottom-arrow');

  // Reset the inactivity timer
  const resetTimer = () => {
    if (timer) clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        handleRightArrowClick(); // Go to the next item after 5 seconds
      }, 5000),
    );
  };

  const handleLeftArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex > 0) {
        const newIndex = prevIndex - 1;
        handleFloatingContainer(newIndex);
        resetTimer();
        return newIndex;
      }
      return prevIndex; // Don't move if at the first item
    });
  };

  const handleRightArrowClick = () => {
    setSelectedIndex((prevIndex) => {
      if (prevIndex < menuList.length - 1) {
        const newIndex = prevIndex + 1;
        handleFloatingContainer(newIndex);
        resetTimer();
        return newIndex;
      }
      return prevIndex; // Don't move if at the last item
    });
  };

  const handleFloatingContainer = (floatingIndex) => {
    // remove existing highlight/focus section
    const highlightedSection = document.querySelector(
      '.configurator-highlight',
    );
    highlightedSection?.classList.remove('configurator-highlight');
    // adding highlight/focus to selected section
    const visibleSectionEl = document.querySelector(
      `.${menuList[floatingIndex].elementSelector}`,
    );
    visibleSectionEl?.classList.add('configurator-highlight');
    // set arrow visibility as per highlight/focus section
    const arrowPostion = menuList[floatingIndex].alignArrow;
    const elSelector = menuList[floatingIndex].elementSelector;
    const floatingContainer = document.querySelector('.floating-container');
    floatingContainer?.setAttribute('position', elSelector);
    if (arrowPostion === 'top') {
      topArrowEl?.classList.remove('hide');
      bottomArrowEl?.classList.add('hide');
    } else if (arrowPostion === 'bottom') {
      topArrowEl?.classList.add('hide');
      bottomArrowEl?.classList.remove('hide');
    } else {
      topArrowEl?.classList.add('hide');
      bottomArrowEl?.classList.add('hide');
    }
  };

  useEffect(() => {
    // reset any previous selected menu
    console.log('selected: ', selectedIndex);
    if (showHelpScreen) {
      handleFloatingContainer(selectedIndex);
    }
  }, [showHelpScreen]);

  useEffect(() => {
    // Set the initial timer
    if (showHelpScreen) {
      resetTimer();
    }

    // Cleanup the timer when the component unmounts
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [selectedIndex, showHelpScreen]); // Reset timer whenever the selected index changes

  const closeHelpOverlay = () => {
    const activeHighlight = document.querySelector('.configurator-highlight');
    activeHighlight?.classList.remove('configurator-highlight');
    setShowHelpScreen(false);
    if (timer) clearTimeout(timer);
    setSelectedIndex(0);
    common.toggleClass('.help-configrator-overlay', 'hide');
  };
  return html`
    <div class="help-configrator-overlay hide">
      <div class="container">
        <div class="help-menu">
          <h3 class="title-section">
            <${OverlayHelpIcon} /> <span class="title">Help</span>
            <span class="title-bottom-line"><${UnderlineIcon} /></span>
          </h3>
          <ul class="help-items">
            ${menuList?.map(
    (menuItem, index) => html`
                <li
                  class="help-item ${selectedIndex === index ? 'selected' : ''}"
                >
                  ${menuItem.menuTitle}
                </li>
              `,
  )}
          </ul>
        </div>
      </div>
      <div class="floating-guide-wrapper">
        <div class="floating-container">
          <div class="left-arrow" onClick=${handleLeftArrowClick}>
            <${HelpConfigratorIcons.leftArrowIcon} />
          </div>
          <div class="center">
            <div class="top-arrow">
              <${HelpConfigratorIcons.topArrowIcon} />
            </div>
            <div class="title">${menuList[selectedIndex].selectedName}</div>
            <div class="bottom-arrow hide">
              <${HelpConfigratorIcons.bottomArrowIcon} />
            </div>
          </div>
          <div class="right-arrow" onClick=${handleRightArrowClick}>
            <${HelpConfigratorIcons.rightArrowIcon} />
          </div>
        </div>
      </div>
      <div
        class="close-help-overlay"
        onClick=${closeHelpOverlay}
      >
        <${HelpConfigratorIcons.helpCloseIcon} />
      </div>
    </div>
  `;
};

export default HelpOverlay;
