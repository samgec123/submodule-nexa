import { html } from '../../../scripts/vendor/htm-preact.js';
import {
  useContext, useState, useRef, useEffect,
} from '../../../scripts/vendor/preact-hooks.js';
import { MultiStepFormContext } from './multi-step-form.js';

const Dropdown = ({ inputValue, onSelectCity }) => {
  const [cityList, setCityList] = useState([]);
  const [inputFieldValue, setInputFieldValue] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const dropdownRef = useRef(null);
  const { placeholders } = useContext(MultiStepFormContext);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputFieldValue(value);
    if (value.length > 2) {
      const filtered = cityList.filter((city) => city.toLowerCase().includes(value.toLowerCase()));
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cityList); // Show all cities if input is less than 3 characters
    }
  };

  useEffect(() => {
    // Fetch city list when the component mounts
    const getCities = async () => {
      try {
        const response = await fetch(`${placeholders.apiDomain}/app-service/api/v1/city/all`);
        const data = await response.json();

        if (data.status === 'success') {
          // Extracting cities from the response
          const cities = data.city_list.map((cityItem) => cityItem.city);
          setCityList(cities);
          setFilteredCities(cities);
        } else {
          // do noting
        }
      } catch (error) {
        // do noting
      }
    };

    getCities();
  }, []);

  useEffect(()=>{
    setInputFieldValue('');
    setFilteredCities(cityList);
  },[inputValue])

  useEffect(() => {
    const allItems = dropdownRef.current.querySelectorAll('li');
    allItems.forEach((item) => {
      // Get the text content of the list item
      const itemText = item.textContent.toLowerCase();

      // Remove highlight if the item text doesn't match inputValue
      if (itemText !== inputValue.toLowerCase()) {
        item.classList.remove('highlight');
      }
    });

    // Check if any li has the 'highlight' class
    const highlightedItem = dropdownRef.current.querySelector('.highlight');

    // If no item is highlighted, add 'highlight' to the first li
    if (!highlightedItem) {
      const firstLi = dropdownRef.current.querySelector('li');
      if (firstLi) {
        firstLi.classList.add('highlight');
      }
    }
  }, [filteredCities]);

  const handleOptionClick = (cityName) => {
    const firstLi = dropdownRef.current.querySelector('li');
    if (firstLi) {
      firstLi.classList.remove('highlight');
    }
    onSelectCity(cityName); // Pass selected city name to parent
  };

  return html`
    <span class="select-dropdown" dir="ltr">
      <span class="select-search select-search--dropdown">
        <input
                class="select-search__field"
                type="search"
                placeholder="Search City*"
                value=${inputFieldValue}
                onInput=${handleInputChange}
        />
      </span>
      <span class="select-results">
        <ul ref=${dropdownRef} role="tree" aria-expanded="true" aria-hidden="false">
          ${filteredCities.length > 0
    ? filteredCities.map((city) => html`
              <li
                class=${`${city.toLowerCase() === inputValue.toLowerCase() ? 'highlight' : ''}`}
                role="treeitem"
                aria-selected="false"
                onclick=${() => handleOptionClick(city)}
              >
                ${city}
              </li>
            `)
    : html`<li >No results found</li>`
}
        </ul>
      </span>
    </span>
    `;
};

export default Dropdown;
