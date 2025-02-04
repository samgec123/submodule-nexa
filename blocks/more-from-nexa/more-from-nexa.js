import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import utility from '../../commons/utility/utility.js';

export default async function decorate(block) {
  const { children } = block.children[0].children[0];
  const [titleEl] = children;

  const title = titleEl?.textContent?.trim();

  const { publishDomain, cfPrefix } = await fetchPlaceholders();

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('main__container');

  const titleContainer = document.createElement('div');
  titleContainer.classList.add('title-container');
  if (title) {
    titleEl.textContent = title;
    titleEl.classList.add('custom-title');
    titleContainer.appendChild(titleEl);
  }
  mainContainer.appendChild(titleContainer);

  block.innerHTML = '';
  block.appendChild(mainContainer);

  // Fetch car data from the GraphQL endpoint
  const graphQlEndpoint = `${publishDomain}/graphql/execute.json/msil-platform/NexaCarList`;
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  function renderCarList(cars) {
    const currentPagePath = window.location.pathname;
    const carListContainer = document.createElement('div');
    carListContainer.classList.add('car-list-container');

    cars.forEach((car) => {
      const carCard = document.createElement('div');
      carCard.classList.add('car-card');
      const path = car.carDetailsPagePath?._path?.replace(cfPrefix, '') || '';

      const carLink = document.createElement('a');
      carLink.href = path || '#';
      carLink.classList.add('car-link');

      // Create h3 tag
      const carTitle = document.createElement('h3');
      carTitle.textContent = car.modelDesc;
      carTitle.classList.add('car-title');

      // Append h3 inside anchor
      carLink.appendChild(carTitle);

      if (path && (path.includes(currentPagePath) || currentPagePath.includes(path))) {
        carLink.classList.add('active');
      }

      carCard.appendChild(carLink);
      carListContainer.appendChild(carCard);
    });

    mainContainer.insertAdjacentHTML('beforeend', utility.sanitizeHtml(carListContainer.outerHTML));
  }

  const initCars = async () => {
    try {
      const response = await fetch(graphQlEndpoint, requestOptions);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const cars = result.data.carModelList.items;

      if (cars && cars.length > 0) {
        cars.sort((a, b) => a.carOrder - b.carOrder);

        renderCarList(cars);
      } else {
        console.error('No cars found in the response');
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
    }
  };

  initCars();
}
