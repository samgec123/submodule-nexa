// Location Change Event
export const createLocationChangeEvent = (message, location) => new CustomEvent('updateLocation', {
  detail: { message, location },
});

export const dispatchLocationChangeEvent = (message, location) => {
  const event = createLocationChangeEvent(message, location);
  document.dispatchEvent(event);
};

export const createCarIconClickEvent = (message) => new CustomEvent('carIconClick', {
  detail: { message },
});

export const dispatchCarIconClickEvent = (message) => {
  const event = createCarIconClickEvent(message);
  document.dispatchEvent(event);
};

export const createHeroBannerDealerEvent = (message) => new CustomEvent('hero-banner-dealer-changed', {
  detail: { message },
});

export const dispatchHeroBannerDealerEvent = (message) => {
  const event = createHeroBannerDealerEvent(message);
  document.dispatchEvent(event);
};
