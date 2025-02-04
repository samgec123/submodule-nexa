export default async function decorate(block) {
  const [
    idEl,
    titleEl,
    featureDropdownEl,
    techDropdownEl,
    hideSimilaritiesEl,
    descriptionEl,
    searchPlaceholderEl,
  ] = block.children;

  const id = idEl?.textContent?.trim() || '';
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title.removeAttribute('id');
  title.classList.add('compare-title');
  const featureDropdown = featureDropdownEl?.textContent?.trim();
  const techDropdown = techDropdownEl?.textContent?.trim();
  const hideSimilarities = hideSimilaritiesEl?.textContent?.trim();
  const description = descriptionEl?.textContent?.trim();
  const searchPlaceholder = searchPlaceholderEl?.textContent?.trim();

  const newContainer = document.createElement('div');
  newContainer.classList.add('comparison-table');
  newContainer.innerHTML = `
  <div class="car-details">
    <div class="car-details_top">
      ${(title) ? `<div class="car-details_title">
        ${title.outerHTML}<select><option>${featureDropdown}</option><option>${techDropdown}</option></select>
        <span class="title_svg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.2037 5.56417L7.76787 12L1.33203 5.56417L2.2782 4.618L7.76787 10.1078L13.2575 4.618L14.2037 5.56417Z" fill="#18171A" />
          </svg>
      </div>` : ''}
      <div class="car-details_description">
        ${description}
      </div>
    </div>
    <div class="car-details_middle">
      <div class="car-details_search">
        <input placeholder="${searchPlaceholder}" class="car-details_search-box" />
        <span class="search_icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.0284 13.7193L8.8412 9.53198C8.50787 9.8072 8.12453 10.0226 7.6912 10.1781C7.25786 10.3337 6.80959
             10.4115 6.34636 10.4115C5.20692 10.4115 4.24259 10.017 3.45336 9.22798C2.66414
              8.43898 2.26953 7.47487 2.26953 6.33565C2.26953 5.19653 2.66403 4.23209 3.45303
              3.44231C4.24203 2.65265 5.20614 2.25781 6.34536 2.25781C7.48448 2.25781 8.44892 2.65242 9.2387
              3.44165C10.0284 4.23087 10.4232 5.1952 10.4232 6.33465C10.4232 6.81076 10.3433 7.26548 10.1835
              7.69881C10.0236 8.13215 9.81036 8.50903 9.5437 8.82948L13.7309 13.0166L13.0284 13.7193ZM6.34636
              9.41165C7.20536 9.41165 7.93292 9.11353 8.52903 8.51731C9.12525 7.9212 9.42337 7.19365 9.42337
              6.33465C9.42337 5.47565 9.12525 4.74809 8.52903 4.15198C7.93292 3.55576 7.20536 3.25765 6.34636
              3.25765C5.48736 3.25765 4.75981 3.55576 4.1637 4.15198C3.56748 4.74809 3.26936 5.47565 3.26936
              6.33465C3.26936 7.19365 3.56748 7.9212 4.1637 8.51731C4.75981 9.11353 5.48736 9.41165 6.34636
              9.41165Z" fill="#515151" />
          </svg>
      </div>
      <div class="highlight">
        <div class="car-details_highlight">
          <div class="highlight_text">${hideSimilarities}</div>
          <div class="toggle_btn disable"><svg xmlns="http://www.w3.org/2000/svg" width="27" height="14" viewBox="0 0 27 14" fill="none">
              <rect x="0.675" y="0.675" width="25.65" height="12.65" rx="6.325" stroke="#515151" stroke-width="1.35" />
              <circle cx="7" cy="7" r="4" fill="#515151" />
            </svg></div>
        </div>
        <div class="car-models" id="carModels">

        </div>
        <span class="add-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9.3737 10.6276H4.58203V9.3776H9.3737V4.58594H10.6237V9.3776H15.4154V10.6276H10.6237V15.4193H9.3737V10.6276Z" fill="white"/>
  </svg></span>
  </div>
    </div>
    <div class="car-details_bottom" id="carDetailsAccordion">
    </div>
  </div>
  </div>`;

  if (id) {
    block.setAttribute('id', id);
  }

  block.innerHTML = '';
  block.appendChild(newContainer);
  const carData = {
    models: [{
      name: 'Sigma',
      type: 'Smart Hybrid',
    },
    {
      name: 'Delta',
      type: 'Smart Hybrid',
    },
    {
      name: 'Zeta',
      type: 'Smart Hybrid',
    },
    {
      name: 'Alpha',
      type: 'Smart Hybrid',
    },
    ],
    features: [{
      title: 'Exterior',
      items: [{
        featureTitle: 'Dual Tone Exteriors Black',
        comparisons: ['Available', 'Available', 'Not Available', 'Available'],
      },
      {
        featureTitle: 'Alloy Wheels',
        comparisons: ['Not Available', 'Available', 'Available', 'Available'],
      },
      ],
    },
    {
      title: 'Interior',
      items: [{
        featureTitle: 'Leather Seats',
        comparisons: [
          'Not Available',
          'Not Available',
          'Available',
          'Available',
        ],
      },
      {
        featureTitle: 'Touchscreen Display',
        comparisons: ['Available', 'Available', 'Available', 'Available'],
      },
      ],
    },
    {
      title: 'Safety',
      items: [{
        featureTitle: 'ABS with EBD',
        comparisons: ['Available', 'Available', 'Available', 'Available'],
      },
      {
        featureTitle: 'Airbags',
        comparisons: ['2', '2', '2', '6'],
      },
      ],
    },
    ],
  };

  const carModelsContainer = document.getElementById('carModels');
  carModelsContainer.innerHTML = carData.models
    .map(
      (model) => `
        <div class="car-model">
          <p class="car-model_name">${model.name}</p>
          <p class="car-model_type">${model.type}</p>
          <span class="delete-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4.66797 14C4.3013 14 3.98741 13.8694 3.7263 13.6083C3.46519 13.3472
            3.33464 13.0333 3.33464 12.6667V4H2.66797V2.66667H6.0013V2H10.0013V2.66667H13.3346V4H12.668V12.6667C12.668
            13.0333 12.5374 13.3472 12.2763 13.6083C12.0152 13.8694 11.7013 14 11.3346 14H4.66797ZM11.3346
            4H4.66797V12.6667H11.3346V4ZM6.0013 11.3333H7.33464V5.33333H6.0013V11.3333ZM8.66797
            11.3333H10.0013V5.33333H8.66797V11.3333Z" fill="#1D1B20"/>
          </svg></span>
        </div>
      `,
    )
    .join('');

  const accordionContainer = document.getElementById('carDetailsAccordion');
  accordionContainer.innerHTML = carData.features
    .map(
      (feature) => `
        <div class="car-details_accordion">
          <div class="accordion-title">
          ${feature.title}
          <span class="toggle_arrow"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.2037 5.56417L7.76787 12L1.33203 5.56417L2.2782 4.618L7.76787 10.1078L13.2575 4.618L14.2037 5.56417Z" fill="white"/>
          </svg></span></div>
          <div class="accordion_table hidden">
            <table class="feature-table">
              <tbody>
                ${feature.items
    .map(
      (item) => `
                            <tr class="feature">
                            <td class="feature-title">${item.featureTitle}</td>
                            <td class="feature-comparison">
                              ${item.comparisons
    .map((comparison) => `<span class="comparison-item">${comparison}</span>`)
    .join(' ')}
                            </td>
                          </tr>
                           `,
    )
    .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `,
    )
    .join('');

  function toggleAccordion(clickedArrow) {
    const accordionTitle = clickedArrow.parentElement;
    const accordionTable = accordionTitle.nextElementSibling;
    const isOpen = !accordionTable.classList.contains('hidden');

    if (isOpen) {
      accordionTable.classList.add('hidden');
      clickedArrow.classList.remove('active');
    } else {
      document.querySelectorAll('.accordion_table').forEach((table) => {
        table.classList.add('hidden');
      });
      document.querySelectorAll('.toggle_arrow').forEach((arrow) => {
        arrow.classList.remove('active');
      });

      accordionTable.classList.remove('hidden');
      clickedArrow.classList.add('active');
    }
  }

  document.querySelectorAll('.toggle_arrow').forEach((arrow) => {
    arrow.addEventListener('click', () => {
      toggleAccordion(arrow);
    });
  });

  function hideEqualFeatures() {
    document.querySelectorAll('.accordion_table').forEach((table) => {
      const features = table.querySelectorAll('.feature');

      features.forEach((feature) => {
        const comparisonItems = feature.querySelectorAll('.comparison-item');

        const comparisonValues = Array.from(comparisonItems).map(
          (item) => item.textContent.trim(),
        );

        const allEqual = comparisonValues.every(
          (val) => val === comparisonValues[0],
        );

        if (allEqual) {
          feature.style.display = 'none';
        }
      });
    });
  }

  const toggleBtn = document.querySelector('.toggle_btn');
  toggleBtn.addEventListener('click', () => {
    if (toggleBtn.classList.contains('disable')) {
      toggleBtn.classList.remove('disable');
      toggleBtn.classList.add('enable');
      hideEqualFeatures();
    } else {
      toggleBtn.classList.remove('enable');
      toggleBtn.classList.add('disable');
      document.querySelectorAll('.feature').forEach((feature) => {
        feature.style.display = 'flex';
      });
    }
  });
}
