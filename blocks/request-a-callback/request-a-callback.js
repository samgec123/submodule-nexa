export default function decorate(block) {
  const [card1divEl, card2divEl, ...dropdownOptionsEl] = block.children;

  function getDropdownOptions(optionsEl) {
    return Array.from(optionsEl).map((option) => {
      const [optionLabelEl, optionValueEl] = option.children;
      const optionLabel = optionLabelEl?.querySelector('p')?.textContent || null;
      const optionValue = optionValueEl?.querySelector('p')?.textContent || null;

      return { Label: optionLabel, Value: optionValue };
    });
  }

  const [card1PreTitle, card1Title, card1CtaLabel, card1CtaLink, card1CtaTarget] = card1divEl?.children[0]?.children || null;
  const [card2PreTitle, card2Title, card2CtaLabel, card2CtaLink, card2CtaTarget] = card2divEl?.children[0]?.children || null;

  const dropdownOptions = getDropdownOptions(dropdownOptionsEl);
  const optionsHTML = dropdownOptions.map((option, index) => `
                    <div class="dropdown-options" key="${index}" value="${option.Value}">${option.Label}</div>
                `).join('');

  // Construct the inner HTML
  block.innerHTML = `
    <div class="request_callback-container">
        <div class="request__callback-card">
            <div class="pre-title">${card1PreTitle?.innerHTML}</div>
            <div class="title">${card1Title?.innerHTML}</div>
            <div class="request_dropdown-box">
              <div class="default-option">
                <div class="selected-option" value="${dropdownOptions[0]?.Value}">${dropdownOptions[0]?.Label}</div>
                <span class="dropdown_arrow"></span>
              </div>
              <div class="request_dropdown">
                ${optionsHTML}
              </div>
            </div>
            <a class="request_call-cta" href="${card1CtaLink?.textContent.trim()}" target="${card1CtaTarget?.textContent.trim()}">${card1CtaLabel?.textContent.trim()}</a>
        </div>
        <div class="read_blog-card">
          <div class="text-container">
            <div class="pre-title">${card2PreTitle?.innerHTML}</div>
            <div class="title">${card2Title?.innerHTML}</div>
          </div>
          <div class="action-container">  
            <div class="arrow_icon"></div>
            <a class="read_blog-cta" href="${card2CtaLink?.textContent.trim()}" target="${card2CtaTarget?.textContent.trim()}">${card2CtaLabel?.textContent.trim()}</a>
          </div>
        </div>
    </div>
    `;

  const toggleDropdown = block.querySelector('.dropdown_arrow');
  const optionsDiv = block.querySelector('.request_dropdown');
  const defaultOption = block.querySelector('.default-option .selected-option');
  const dropdownOptionsEls = block.querySelectorAll('.dropdown-options');

  dropdownOptionsEls[0].classList.add('active');

  toggleDropdown.addEventListener('click', () => {
    toggleDropdown.classList.toggle('active');
    optionsDiv.classList.toggle('dropdown-active');
  });

  dropdownOptionsEls.forEach((option) => {
    option.addEventListener('click', () => {
      const selectedLabel = option.textContent.trim();
      const selectedValue = option.getAttribute('value');

      defaultOption.textContent = selectedLabel;
      defaultOption.setAttribute('value', selectedValue);

      dropdownOptionsEls.forEach((opt) => opt.classList.remove('active'));

      option.classList.add('active');

      toggleDropdown.classList.remove('active');
      optionsDiv.classList.remove('dropdown-active');
    });
  });
}
