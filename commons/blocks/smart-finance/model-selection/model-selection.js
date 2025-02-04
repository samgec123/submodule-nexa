import { fetchPlaceholders } from '../../../scripts/aem.js';
import utility from '../../../utility/utility.js';

export default async function decorate(block) {
  const { publishDomain } = await fetchPlaceholders();
  const [
    pretitleEl,
    titleEl,
    selectButtonLinkEl,
    selectVariantEl,
  ] = block.children;
  const elementsToHide = [
    pretitleEl,
    titleEl,
    selectButtonLinkEl,
    selectVariantEl,
  ];

  elementsToHide.forEach((el) => el?.classList.add('hide'));
  const pretitle = pretitleEl?.textContent?.trim();
  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  const componentVariation = selectVariantEl?.textContent?.trim();
  const selectButtonLink = selectButtonLinkEl?.querySelector('a')?.href || '#';
  let carCardsContainer = '';
  let graphQlEndpoint;
  let privateCars = null;
  let commercialCars = null;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const toggleHtml = `
    <div class="toggler-section">
        <label style="display: flex;align-items: flex-end;">Vehicle Type</label>
        <div class="toggler-option">
            <input type="radio" id="private" name="arena-type" value="private" class="radio-style">
            <label for="private">Private</label><br>
        </div>
        <div class="toggler-option">
            <input type="radio" id="commercial" name="arena-type" value="commercial" class="radio-style">
            <label for="commercial">Commercial</label>
        </div>
    </div>`;

  function renderCards(result) {
    const cars = result.data.carModelList.items;
    if (!Array.isArray(cars) || cars.length === 0) {
      return null;
    }

    if (componentVariation === 'arena-variant') {
      block.parentElement.classList.add('arena-style');
    }else{
      sessionStorage.setItem('registrationType', '640001');
    }
    carCardsContainer = '';
    cars.forEach((car) => {
      /* eslint no-underscore-dangle: 0 */
      const cardHtml = `<li>
            <div class="carImg model_list">
                ${(car.carImage?._publishUrl) ? `<div class="car-image"><img src="${car.carImage._publishUrl}" alt=""></div>` : ''}    
                ${(car.carLogoImage?._publishUrl && car.modelDesc) ? `<div class="logo"><span>${car.modelDesc}</span><img src="${car.carLogoImage._publishUrl}" alt="${car.logoImageAltText}"></div>` : ''}
            </div>
            <div class="blackButton" data-modelCd ="${car.modelCd}"><a href="${selectButtonLink}" class="model_list">Select</a></div>
        </li>`;
      carCardsContainer += cardHtml;
    });
    block.innerHTML = '';

    block.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
            <div class="container chooseCarSection">
                <div class="top-wrapper">
                <div class="title-wrapper">
                    <span class="pretitle">${pretitle}</span>
                    <div class="title">${title ? title.outerHTML : ''}</div>
                    </div>
                    ${componentVariation === 'arena-variant' ? toggleHtml : ''}
                </div>
                <ul>
                    ${carCardsContainer}
                </ul>
            </div>
                   `),
    );
    block.querySelectorAll('.blackButton').forEach((button) => {
      button.addEventListener('click', function setLocalStorageModel() {
        const modelCd = this.getAttribute('data-modelCd');
        localStorage.setItem('modelCd', modelCd);
      });
    });
    return true;
  }

  function handleCarType() {
    const radios = document.querySelectorAll('input[type=radio][name="arena-type"]');
    Array.prototype.forEach.call(radios, (radio) => {
      // eslint-disable-next-line no-use-before-define
      radio.addEventListener('change', changeHandler);
    });
  }

  function changeHandler(event) {
    const selectedValue = event.target.value;

    if (selectedValue === 'private') {
      sessionStorage.setItem('registrationType', '640001');
      renderCards(privateCars);
      document.getElementById('private').checked = true;
      handleCarType();
    } else if (selectedValue === 'commercial') {
      sessionStorage.setItem('registrationType', '640002');
      if (commercialCars == null) {
        graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/CommercialCarList`;
        fetch(graphQlEndpoint, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            commercialCars = result;
            renderCards(commercialCars);
            document.getElementById('commercial').checked = true;
            handleCarType();
          })
          .catch();
      } else {
        renderCards(commercialCars);
        document.getElementById('commercial').checked = true;
        handleCarType();
      }
    }
  }

  if (componentVariation === 'arena-variant') {
    graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/ArenaCarList`;
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        privateCars = result;
        renderCards(privateCars);
        document.getElementById('private').checked = true;
        handleCarType();
      })
      .catch();
  } else {
    graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/NexaCarList`;
    fetch(graphQlEndpoint, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        renderCards(result);
      })
      .catch();
  }
}
