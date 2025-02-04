import {
  useEffect,
  useState, useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import interaction from '../interaction.js';
import { TickIconColorPanel, BlackTickIconColorPanel } from '../Icons.js';

const ColorPicker = ({
  colors,
  model,
  iscolorPickerVisible,
  setIsColorPickerVisible,
  selectedColor,
  setSelectedColor,
  isMobile = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isFirstRender = useRef(true);
  // const [selectedColor, setSelectedColor] = useState(colors[0]);

  // Toggles the visibility of the color picker dropdown
  const toggleVisibility = (event) => {
    setIsColorPickerVisible(false);
  };

  // Handles the color selection
  const handleColorChange = (event) => {
    const colorValue = event.target.value;
    const colorDesc = event.target.dataset.cocolorValuelor;
    const selected = colors.find((color) => color.eColorCd === colorValue);
    setSelectedColor(selected);
    window.ONE3D.changeColor(colorValue);
    // event.target.closest('label').querySelector('.color-box');
    const colorCode = event?.target?.nextElementSibling.getAttribute('style');
    const elementClass = event?.target?.nextElementSibling.className;
    interaction.colorSelectorFunctions.updateSelectedColorDisplay(
      selected.eColorDesc,
      colorCode,
      elementClass,
    );
    if (!isMobile) {
      setIsColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Set it to false after first render
      return;
    }

    // Check if selectedColor exists in the colors array based on color3dCode
    const updatedColor = colors.find(
      (color) => color.color3dCode === selectedColor?.color3dCode
        || selectedColor.eColorCd === color.eColorCd,
    );

    // If color3dCode matches, set the selectedColor to that one, else fall back to the first color in the list
    const newSelectedColor = updatedColor || colors[0];

    setSelectedColor(newSelectedColor);

    const selectedColorLabel = newSelectedColor?.eColorDesc;
    const colorBoxStyle = newSelectedColor?.hexCode?.length === 2
      ? `background: linear-gradient(135deg, ${newSelectedColor?.hexCode[0]} 50%, ${newSelectedColor?.hexCode[1]} 50%);`
      : `background-color: ${newSelectedColor?.hexCode[0]};`;

    const selectedElementClass = newSelectedColor?.hexCode?.length === 2 ? 'dual-tone' : 'single-color';

    interaction.colorSelectorFunctions.updateSelectedColorDisplay(
      selectedColorLabel,
      colorBoxStyle,
      selectedElementClass,
    );

    window.ONE3D.changeColor(
      newSelectedColor?.color3dCode || newSelectedColor?.eColorCd,
    );
  }, [colors]);

  // Creates the style for the color box (single-tone or dual-tone)
  const getColorBoxStyle = (color) => {
    if (color.hexCode.length === 2) {
      return {
        background: `linear-gradient(135deg, ${color.hexCode[0]} 50%, ${color.hexCode[1]} 50%)`,
      };
    }
    return { backgroundColor: color.hexCode[0] };
  };
  return isMobile
    ? html`
        <div className="color__selector-container-mobile">
          <div className="color__pickers">
            ${colors?.map(
    (color) => html`
                <label
                  className="color-radio"
                  key=${color.color3dCode || color.eColorCd}
                >
                  <input
                    type="radio"
                    name="carColor"
                    value=${model === 'swift'
    ? color.color3dCode
    : color.eColorCd}
                    data-color=${color.eColorDesc}
                    checked=${selectedColor?.color3dCode
                      === color.color3dCode
                    || selectedColor.eColorCd === color.eColorCd}
                    onChange=${handleColorChange}
                  />
                  <span
                    className=${`color-box ${
    color.hexCode.length === 2 ? 'dual-tone' : 'single-color'
  } ${
    selectedColor?.color3dCode === color.color3dCode
                      || selectedColor.eColorCd === color.eColorCd
      ? 'selected'
      : ''
  }`}
                    style=${getColorBoxStyle(color)}
                  >
                    ${selectedColor?.color3dCode === color.color3dCode || selectedColor.eColorCd === color.eColorCd ? html`
                    ${(selectedColor.eColorDesc.toLowerCase().includes('white')) ? html`
                        <${BlackTickIconColorPanel} />
                      ` : html`
                        <${TickIconColorPanel} />
                      `}
                  ` : ''}
                  </span>
                </label>
              `,
  )}
          </div>
          ${selectedColor.color3dCode === selectedColor.color3dCode
          || selectedColor.eColorCd === selectedColor.eColorCd
    ? html`<p className="color-name">${selectedColor.eColorDesc}</p>`
    : ''}
          <!-- Display the selected color box -->
        </div>
      `
    : html`
        <div className="color__selector-container">
          <!-- Selected color display and toggle button -->
          <div className="color__pickers-topContainer">
            <p className="selected-color">${selectedColor?.eColorDesc}</p>
            <button className="down-arrow-btn" onClick=${toggleVisibility}>
              <!-- SVG for dropdown arrow -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M11.9999 15.0537L6.34619 9.39994L7.39994 8.34619L11.9999 12.9462L16.5999 8.34619L17.6537 9.39994L11.9999 15.0537Z"
                  fill="#1C1B1F"
                />
              </svg>
            </button>
          </div>

          <!-- Color picker options -->
          <div className="color__pickers">
            ${colors?.map(
    (color) => html`
                <label
                  className="color-radio"
                  key=${color.color3dCode || color.eColorCd}
                >
                  <input
                    type="radio"
                    name="carColor"
                    value=${model === 'swift'
    ? color.color3dCode
    : color.eColorCd}
                    data-color=${color.eColorDesc}
                    checked=${selectedColor.color3dCode === color.color3dCode
                    || selectedColor.eColorCd === color.eColorCd}
                    onChange=${handleColorChange}
                  />
                  <span
                    className=${`color-box ${
    color.hexCode.length === 2 ? 'dual-tone' : 'single-color'
  } ${
    selectedColor?.color3dCode === color.color3dCode
                      || selectedColor.eColorCd === color.eColorCd
      ? 'selected'
      : ''
  }`}
                    style=${getColorBoxStyle(color)}
                  >
                  ${(selectedColor?.color3dCode === color.color3dCode || selectedColor.eColorCd === color.eColorCd) ? html`
                    ${(selectedColor.eColorDesc.toLowerCase().includes('white')) ? html`
                        <${BlackTickIconColorPanel} />
                      ` : html`
                        <${TickIconColorPanel} />
                      `}
                  ` : ''}
                  </span>
                </label>
              `,
  )}
          </div>

          <!-- Display the selected color box -->
        </div>
      `;
};

export default ColorPicker;
