// carConfig.js
export const carConfig = {
  mspin: '',
  desgCd: '',
  desgDesc: 'DESG DESCRIPTION',
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  date: '',
  configCityCd: '',
  configCity: '',
  modelCd: '',
  modelDesc: '',
  model3dCode: '',
  variantCd: '',
  variantDesc: '',
  variant3dCode: '',
  colorCd: '',
  createdDate: '',
  modifiedDate: '',
  accessories: [],
};

export const updateCarConfig = (key, value) => {
  if (key.includes('.')) {
    const keys = key.split('.');
    let temp = carConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      temp = temp[keys[i]];
    }
    temp[keys[keys.length - 1]] = value;
  } else {
    carConfig[key] = value;
  }

  saveCarConfigToLocalStorage();
};

export const getCarConfig = () => ({ ...carConfig });

export const saveCarConfigToLocalStorage = () => {
  try {
    localStorage.setItem('carConfig', JSON.stringify(carConfig));
  } catch (error) {
    console.error('Error saving car config to localStorage:', error);
  }
};

export const loadCarConfigFromLocalStorage = () => {
  const savedConfig = localStorage.getItem('carConfig');
  if (savedConfig) {
    Object.assign(carConfig, JSON.parse(savedConfig));
  }
};
