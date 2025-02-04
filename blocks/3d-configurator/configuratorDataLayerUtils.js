import utility from '../../utility/utility.js';
import { getMetadata } from '../../commons/scripts/aem.js';
import analytics from '../../utility/analytics.js';

const configuratorDataLayerUtils = {
  getComponentTitle(className) {
    return document.querySelector(className)?.textContent?.trim() || '';
  },
  createAccObj(categoriesData, accessories) {
    const categoryMapping = {};

    categoriesData?.data?.parentCategories?.forEach((parentCategory) => {
      parentCategory?.subCategories?.forEach((subCategory) => {
        subCategory?.accessories?.forEach((accessory) => {
          categoryMapping[accessory?.partNum] = parentCategory?.parentCategoryDesc;
        });
      });
    });

    const separatedCategories = {};

    accessories?.forEach((accessory) => {
      const category = utility.toCamelCase(categoryMapping[accessory?.partNum]);
      if (category) {
        if (!separatedCategories[category]) {
          separatedCategories[category] = [];
        }
        separatedCategories[category].push(accessory?.partDesc);
      }
    });

    return separatedCategories;
  },
  pushSaveDataToDataLayer(e, selectedColor, selectedVariant, categoriesData, addedAccessories) {
    const pageDetails = {};
    const carModelName = getMetadata('car-model-name') || '';
    pageDetails.model = carModelName;
    pageDetails.variant = selectedVariant?.variantName || '';
    pageDetails.color = selectedColor?.eColorDesc || '';
    pageDetails.enquiryName = 'Car Configurator';
    pageDetails.linkType = 'other';
    pageDetails.webName = e.target?.textContent || '';
    pageDetails.configuratorAccessories = this.createAccObj(categoriesData, addedAccessories);
    pageDetails.savedCarName = carModelName;
    analytics.setCustomizeSave(pageDetails);
  },
  pushClickToDataLayer(e, comTitle) {
    const data = {};
    data.componentName = '3d-configurator';
    data.componentTitle = comTitle || '';
    data.componentType = 'CTA';
    data.webName = e.target?.textContent?.trim() || '';
    data.linkType = 'other';
    analytics.setButtonDetails(data);
  },
  pushStartToDataLayer(e, selectedColor, selectedVariant) {
    const pageDetails = {};
    pageDetails.model = getMetadata('car-model-name') || '';
    pageDetails.variant = selectedVariant?.variantName || '';
    pageDetails.color = selectedColor?.eColorDesc || '';
    pageDetails.enquiryName = 'Car Configurator';
    pageDetails.linkType = 'other';
    pageDetails.webName = e.target?.textContent?.trim() || '';
    analytics.setcustomizeStart(pageDetails);
  },
  pushUserInteractionToDataLayer(e, savedCar) {
    const model = savedCar?.modelDesc || '';
    const pageDetails = {};
    pageDetails.savedCarName = model;
    pageDetails.enquiryName = 'Car Configurator';
    pageDetails.linkType = 'other';
    pageDetails.webName = e.target?.textContent || '';
    analytics.setSavedConfigDetails(pageDetails);
  },
};
export default configuratorDataLayerUtils;
