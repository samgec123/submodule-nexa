import authUtils from '../../commons/utility/authUtils.js';
import apiUtils from '../../utility/apiUtils.js';
import utility from '../../utility/utility.js';
// Utility function to create a flag toggler
const createToggleFunction = (toggleFunction) => async (flag) => {
  const newFlag = !flag;
  await toggleFunction(newFlag);
  return newFlag;
};

const toggleFunctionsMap = {
  Lights: createToggleFunction((flag) => window.ONE3D?.toggleLights(flag)),
  Orvms: createToggleFunction((flag) => window.ONE3D?.toggleORVM(flag)),
  Doors: createToggleFunction((flag) => window.ONE3D?.toggleDoors(flag)),
  Wheels: createToggleFunction((flag) => window.ONE3D?.toggleWheel(flag)),
  Window: createToggleFunction((flag) => window.ONE3D?.toggleWindow(flag)),
  Sunroof: createToggleFunction((flag) => window.ONE3D?.toggleSunroof(flag)),
  cameraOffset: (xOffset, yOffset) => window.ONE3D?.cameraOffset(xOffset, yOffset),
};

const disableTopandBottomContainer = () => {
  const headerContainer = document.querySelector('.config-header');
  const bottomContainerDesktop = document.querySelector(
    '.bottom-interaction-panel-container.desktop',
  );
  if (!utility.isCarConfigSmView()) {
    bottomContainerDesktop.classList.add('disabled');
    headerContainer.classList.add('disabled');
  } else {
    const bottomContainerMobile = document.querySelector(
      '.bottom-interaction-panel-container.mobile',
    );
    bottomContainerDesktop && bottomContainerDesktop.classList.add('disabled');
    bottomContainerMobile && bottomContainerMobile.classList.add('disabled');
    headerContainer.classList.add('disabled');
    document.querySelector('.mode-buttons')?.classList.add('disabled');
  }
};

const enableTopandBottomContainer = () => {
  const headerContainer = document.querySelector('.config-header');
  const bottomContainerDesktop = document.querySelector(
    '.bottom-interaction-panel-container.desktop',
  );
  if (!utility.isCarConfigSmView()) {
    bottomContainerDesktop.classList.remove('disabled');
    headerContainer.classList.remove('disabled');
  } else {
    const bottomContainerMobile = document.querySelector(
      '.bottom-interaction-panel-container.mobile',
    );
    bottomContainerDesktop && bottomContainerDesktop.classList.remove('disabled');
    bottomContainerMobile && bottomContainerMobile.classList.remove('disabled');
    headerContainer.classList.remove('disabled');
    document.querySelector('.mode-buttons')?.classList.remove('disabled');
  }
};

const toggleActionWithDisable = (actionFunction, ...args) => {
  disableTopandBottomContainer();

  return actionFunction(...args).then((data) => {
    enableTopandBottomContainer();
    window.ONE3D?.resize(true);
  });
};

const handleAccessoryWithDisable = (actionFunction, ...args) => {
  disableTopandBottomContainer();

  return actionFunction(...args)
    .then(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.ONE3D.exitAccessoriesView();
    })
    .catch((error) => {
      console.error('Error handling accessory action:', error);
    })
    .finally(() => {
      enableTopandBottomContainer();
      window.ONE3D.resize(true);
    });
};

const viewFunctions = {
  exteriorView: () => {
    window.ONE3D?.exteriorView && toggleActionWithDisable(window.ONE3D?.exteriorView);
    window.ONE3D?.resize(true);
  },
  interiorView: () => {
    window.ONE3D?.interiorView && toggleActionWithDisable(window.ONE3D?.interiorView);
    window.ONE3D?.resize(true);
  },
  backseatView: () => toggleActionWithDisable(window.ONE3D.backseatView),
  frontseatView: () => toggleActionWithDisable(window.ONE3D.frontseatView),
  lastseatView: () => toggleActionWithDisable(window.ONE3D.lastseatView),
};

const colorSelectorFunctions = {
  createColorSelectors: (colors) => {
    const container = document.querySelector('.color__selector-container');
    container.innerHTML = '';

    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.classList.add('color__pickers');

    const colorPickerTopContainer = document.createElement('div');
    colorPickerTopContainer.classList.add('color__pickers-topContainer');

    const showColor = document.createElement('p');
    showColor.classList.add('selected-color');

    const downArrowEl = document.createElement('button');
    downArrowEl.classList.add('down-arrow-btn');

    downArrowEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <mask id="mask0_777_112548" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <rect width="24" height="24" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_777_112548)">
      <path d="M11.9999 15.0537L6.34619 9.39994L7.39994 8.34619L11.9999 12.9462L16.5999 8.34619L17.6537 9.39994L11.9999 15.0537Z" fill="#1C1B1F"/>
    </g>
  </svg>`;

    colorPickerTopContainer.appendChild(showColor);
    colorPickerTopContainer.appendChild(downArrowEl);
    container.appendChild(colorPickerTopContainer);

    downArrowEl.addEventListener('click', () => {
      const element = document.querySelector('.color__selector-container');
      if (element) {
        element.classList.toggle('hide'); // Toggle the class
      }
    });

    colors.forEach((color) => {
      const label = colorSelectorFunctions.createColorLabel(color);
      colorPickerContainer.appendChild(label);
    });

    container.appendChild(colorPickerContainer);
    container.querySelectorAll('input[name="carColor"]').forEach((radio) => {
      radio.addEventListener('change', colorSelectorFunctions.handleCarColorChange);
    });
    // setting default color name
    const defaultColorEl = document.querySelector('input[name="carColor"]:checked');
    const defaultColorTextEl = document.querySelector('.selected-color');

    if (defaultColorEl && defaultColorTextEl) {
      defaultColorTextEl.textContent = defaultColorEl.getAttribute('data-color');
    }
    // colorSelectorFunctions.checkInitialColor();
  },

  createColorLabel: (color, model) => {
    const colorBoxStyle = color.hexCode.length === 2
      ? `background: linear-gradient(135deg, ${color.hexCode[0]} 50%, ${color.hexCode[1]} 50%);`
      : `background-color: ${color.hexCode[0]};`;

    const label = document.createElement('label');
    label.classList.add('color-radio');

    const colorRadioValue = color.eColorCd;
    label.innerHTML = `
      <input type="radio" name="carColor" data-color="${color.eColorDesc}" value="${colorRadioValue}" />
      <span class="color-box ${color.hexCode.length === 2 ? 'dual-tone' : 'single-color'}" style="${colorBoxStyle}"></span>
    `;

    return label;
  },

  handleCarColorChange: (event) => {
    const colorValue = event?.target?.value;
    const colorDesc = event?.target?.dataset?.color;
    const colorName = colorValue?.replaceAll('_', ' ') || '';
    const colorCode = event?.target?.nextElementSibling.getAttribute('style');
    const elementClass = event?.target?.nextElementSibling.className;
    const colorContainer = document.querySelector('.color__selector-container');
    colorSelectorFunctions.updateSelectedColorDisplay(colorDesc, colorCode, elementClass);
    colorSelectorFunctions.showColorChangeToast(colorName);
    window.ONE3D.changeColor(colorValue);
    // close the color picker after color selection
    colorContainer.classList.add('hide');
  },

  updateSelectedColorDisplay: (colorName, colorCode, elementClass) => {
    // const selectedColorDisplay = document.querySelector('.selected-color');
    const selectedColorText = document.querySelectorAll('.selected-color-name');
    const selectedColorBox = document.querySelectorAll('.selected-color-box');
    selectedColorText.forEach((el) => {
      el.textContent = colorName;
    });

    selectedColorBox.forEach((el) => {
      el.style.background = '';
      el.style.backgroundColor = '';
      // if color has some shades else single color
      if (elementClass.includes('dual-tone')) {
        const gradient = colorCode.match(/background:\s*(linear-gradient\(.+\))/)?.[1];
        if (gradient) {
          el.style.background = gradient;
        }
      } else if (elementClass.includes('single-color')) {
        const flatColor = colorCode.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]*\))/)?.[1];
        if (flatColor) {
          el.style.backgroundColor = flatColor;
        }
      }
    });
  },

  showColorChangeToast: (colorName) => {
    const toastContainer = document.querySelector('.color__change-toast');
    const toastText = toastContainer?.querySelector('.toast-text');

    if (toastText) {
      const suffix = toastText.innerText?.split(' ').slice(-4).join(' ');
      toastText.innerText = `${colorName ?? ''} ${suffix ?? ''}`;
    }

    toastContainer?.classList.add('fade-in-toast');

    setTimeout(() => {
      toastContainer?.classList.remove('fade-in-toast');
      toastContainer?.classList.add('fade-out-toast');
    }, 2000);
  },

  checkInitialColor: () => {
    colorSelectorFunctions.updateSelectedColorDisplay('Luster Blue', 'background-color: #1f47c2;', 'color-box single-color');
  },
};

const loadConfigurator = (cdnscript, color, model, variant, assetType, selectedModel) => {
  const originalConsoleLog = console.log;
  const script = document.createElement('script');
  if (assetType === '4k') { script.src = `${cdnscript}one3d/project/${model}/player/one3d_functions.min.js`; } else if (assetType === 'hd') { script.src = `${cdnscript}one3d/assets/${model}/one3d_functions.min.js`; }
  script.type = 'text/javascript';
  const mobileCheck = utility.isCarConfigSmView();
  script.onload = () => {
    console.log = originalConsoleLog;

    window.ONE3D.init(
      'one3d',
      `${cdnscript}one3d/`,
      model,
      variant,
      {
        showDefaultLoader: true,
        showTutorial: false,
        color,
        onProgress: () => {},
        showFeatureHp: !mobileCheck,
        hotspotCallback: (name) => {
          getCarHotspots(selectedModel, name);
        },

      },
    ).then(() => {
      document.querySelector('.bottom-interaction-panel-container.desktop')?.classList.remove('hide-interection');
      document.querySelector('.bottom-interaction-panel-container.mobile')?.classList.remove('hide-interection');
      document.querySelector('.config-header')?.classList.remove('hide-interection');
      document.querySelector('.mode-buttons')?.classList.remove('hide-onload');
    }).catch(() => {});
  };

  document.head.appendChild(script);
};

const createViewHandler = (viewFunction) => () => viewFunction();

const createToggleHandler = (toggleFunction, flagRef) => async (e) => {
  const button = e.currentTarget;
  button.disabled = true;
  button.classList.toggle('interaction__active');

  try {
    flagRef.current = await toggleFunction(flagRef.current);
  } catch (error) {
    const appContainer = document.querySelector('#app3d');
    if (appContainer) {
      appContainer.innerHTML = '<p>Failed to toggle the feature. Please try again later.</p>';
    }
  } finally {
    button.disabled = false;
  }
};

const changeEnvironment = async (envType) => {
  try {
    const result = await toggleActionWithDisable(window.ONE3D.ChangeEnv, envType);
    return result;
  } catch (error) {
    throw error;
  }
};

async function getCarHotspots(modelCd, name) {
  const hotspot = await apiUtils.getCarHotspots(modelCd, name);
  const hotspotVideo = hotspot
    ? hotspot.hotspotVideo?._dmS7Url || hotspot.hotspotVideo?._publishUrl || ''
    : '';
  const hotspotThumbnail = hotspot
    ? hotspot.hotspotThumbnail?._dmS7Url || hotspot.hotspotThumbnail?._publishUrl || ''
    : '';
  const hotspotTitle = hotspot ? hotspot.hotspotTitle : '';

  const event = new CustomEvent('hotspotVideoUpdated', {
    detail: {
      videoUrl: hotspotVideo,
      thumbnailUrl: hotspotThumbnail,
      hotspotTitle,
    },
  });
  window.dispatchEvent(event);
}

const showHotspot = async (flag) => {
  await window.ONE3D.viewFeatureHotspot(flag);
};

const captureFunctions = {
  captureScreenshot: async (camera, width, height, extension, options) => {
    try {
      const result = await window.ONE3D.captureScreenshot(camera, width, height, extension, options);
      return result;
    } catch (error) {
      console.error('Failed to capture screenshot', error);
      throw error;
    }
  },
};

const createCaptureHandler = (camera, width, height, extension, options) => async (e) => {
  const button = e.currentTarget;
  button.disabled = true;
  try {
    const result = await window.ONE3D.captureScreenshot(camera, width, height, extension, options);

    Object.entries(result).forEach(([key, base64Data]) => {
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = `${key}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
  } finally {
    button.disabled = false;
  }
};

const resizeDiv = () => window.ONE3D.resize();

const formatDisplayPrice = (price) => String(price).replace(/,/g, ' ');

const isUserLogin = async () => {
  await authUtils.waitForAuth();
  const profile = await authUtils.getProfile();
  return profile !== null;
};

const storeDataForConfigModel = (selectedVariant, selectedModel, activeTab, addedAccessories, selectedColor) => {
  const existingData = JSON.parse(localStorage.getItem('currentConfigData')) || {};

  existingData[selectedModel] = {
    selectedVariant,
    activeTab,
    addedAccessories,
    selectedColor,
  };
  localStorage.setItem('currentConfigData', JSON.stringify(existingData));
};

const getDataForConfigModel = (modelCd) => {
  const currentConfigData = JSON.parse(localStorage.getItem('currentConfigData')) || {};
  return currentConfigData[modelCd];
};

const removeKeyFromModelConfig = (modelCd, key) => {
  const existingData = JSON.parse(localStorage.getItem('currentConfigData')) || {};

  if (existingData[modelCd]) {
    delete existingData[modelCd][key];

    if (Object.keys(existingData[modelCd]).length === 0) {
      delete existingData[modelCd];
    }

    if (Object.keys(existingData).length === 0) {
      localStorage.removeItem('currentConfigData');
    } else {
      localStorage.setItem('currentConfigData', JSON.stringify(existingData));
    }
  }
};

export default {
  toggleFunctionsMap,
  viewFunctions,
  colorSelectorFunctions,
  loadConfigurator,
  createViewHandler,
  createToggleHandler,
  captureFunctions,
  createCaptureHandler,
  resizeDiv,
  changeEnvironment,
  showHotspot,
  toggleActionWithDisable,
  isUserLogin,
  storeDataForConfigModel,
  getDataForConfigModel,
  removeKeyFromModelConfig,
  handleAccessoryWithDisable,
  formatDisplayPrice,
};
