/* eslint-disable no-undef */
export default function initMap1(lat, lng, latLongArray) {
  const map = new mappls.Map('map', {
    center: { lat, lng },
    zoomControl: true,
    hybrid: false,
    search: true,
    location: false,
    zoom: 14,
  });

  mappls.getStyles();
  mappls.setStyle('grey-day');
  map.addListener('load', () => {
    map.setCenter({ lat, lng });
  });

  map.addListener('load', () => {
    const geoData = {
      type: 'FeatureCollection',
      features: latLongArray.map((point) => ({
        type: 'Feature',
        properties: {
        },
        geometry: {
          type: 'Point',
          coordinates: point,
        },
      })),
    };
    // eslint-disable-next-line no-unused-vars
    const marker = mappls.Marker({
      map,
      position: geoData,
      icon_url: '../../../icons/nexa_logo.png',
      clusters: false,
      fitbounds: true,
    });
  });

  map.on('click', (e) => {
    map.flyTo({
      center: e.lngLat,
    });
  });
}
