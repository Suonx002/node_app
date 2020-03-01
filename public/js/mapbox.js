/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoic3VvbngwMDIiLCJhIjoiY2s3OTd3bWJjMGc4OTNmbnUxdmZ0MXJpbSJ9.j21pcjXzu9YfcvzJNMTJJw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/suonx002/ck797z8s20npy1ipdjfztm1rd',
    scrollZoom: false
    //   center: [-118.113491, 34.111745],
    //   zoom: 4,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(location => {
    // create marker
    const element = document.createElement('div');
    element.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element,
      anchor: 'bottom'
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    // extend map bounds to include current location
    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
