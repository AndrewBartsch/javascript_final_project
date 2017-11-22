/* global $, Skycons, axios, google */
/* eslint-disable no-console */

// get coordinates on Window on load ( pronise )
// Then call darksky api with coordinates
// Populate html with data fron dark sky (with the graphics)
// Then call foursquare
// Store data
// render a google map
// pin venues from foursquare
// $(document).ready(function){

const $window = $(window)
const $loader = $('#js-loader');
const $weatherSummary = $('#js-weather-summary');
const $weatherShowcase = $('#js-weather-showcase');
const $coffeeTable = $('#coffee-table tbody');
const $weatherShowcaseTime = $('#time')
const $weatherForecast = $('#js-forecast-weather-summary')

function renderWeatherTemp(temp) {
  const celsiusNumber = ((temp - 32) / (9 / 5)).toFixed(2);
  const celsiusString = `${celsiusNumber} °C`;
  $weatherShowcase.append(`
    <dt>
      Temperature
    </dt>
    <dd>
      ${celsiusString}
    </dd>
    `);
  }

function getIconString(icon) {
  return icon.toUpperCase().replace(/-/g, '_');
}

function renderWeatherIcon(icon, elementId) {
  const skycons = new Skycons({
    color: 'black',
  });
  const iconString = getIconString(icon);
  skycons.add(document.getElementById(elementId), Skycons[iconString]);
  skycons.play();
}

function handleWeatherData(data) {
  // console.log('currently', data.currently);
  const {
    temperature,
    time,
    summary,
    icon,
  } = data.currently;

  const {
      icon: forecasticon,
      summary: forecastsummary,
  } = data.daily;

  $weatherSummary.text(summary);
  $weatherForecast.text(forecastsummary);
  $weatherShowcaseTime.append(`
    <dt>
      Time
    </dt>
    <dd>
      ${new Date(time * 1000)}
    </dd>
    `);
  renderWeatherIcon(icon, 'currentWeatherIcon');
  renderWeatherIcon(forecasticon, 'forecastWeatherIcon');
  renderWeatherTemp(temperature);
}

// get location and return a promise
function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// fetch data from darksky
function getWeatherData(coordinates) {
  axios.get(`https://api.darksky.net/forecast/1457d6f1317a446ae14320510b709b71/${coordinates.latitude}, ${coordinates.longitude}`)
    .then((response) => {
    // render weather Data
      handleWeatherData(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
}


function renderMarker(marker, label, map) {
  const latLng = new google.maps.LatLng(marker.lat, marker.lng);
  const pin = new google.maps.Marker({
    position: latLng,
    label: `${label}`,
    map,
  });
  const infowindow = new google.maps.InfoWindow({});
  google.maps.event.addListener(pin, 'click', () => {
    infowindow.setContent(marker.info);
    infowindow.open(map, pin);
  });
}

function initMap(coordinates, response) {
  const myLatLng = {
    lat: coordinates.latitude,
    lng: coordinates.longitude,
    // info: 'You!',
  };
  // Create a map object and specify the DOM element for display.
  const map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 14,
  });

  const markerData = response.data.response.groups[0].items;
  const markers = markerData.map(marker => ({
    lat: marker.venue.location.lat,
    lng: marker.venue.location.lng,
    info: marker.venue.name,
  }));

  markers.forEach((marker, i) => {
    renderMarker(marker, i+1, map);
  });

  renderMarker(myLatLng,'YOU', map);
  $loader.hide()
}

function renderTableRows(item, i) {
  $coffeeTable.append(`<tr>
    <td>${i+1}</td>
    <td>${item.venue.name}</td>
    <td>
      ${item.venue.location.formattedAddress.map(fragment => `<span>${fragment}</span>`)}
    </td>
    <td>${item.venue.rating}</td>
  </tr>`);
}

function writeTableRows(items) {
  items.forEach((item, i) => {
    renderTableRows(item, i);
  });
}

// fetch coffee venues from Foursquare

function getCoffeeLocations(coordinates) {
  axios.get(`https://api.foursquare.com/v2/venues/explore?client_id=VVO2RYUAX4D455H2LVRIUMOUGUVUK3UY0T0YABYFTERIYMS4&client_secret=20YBURIZDKZJHFIGBEPKYSRRIZWDYXTDBAYWEA1SJW24DHMJ&v=20161016&radius=750&openNow=1&section=coffee&ll=${coordinates.latitude},${coordinates.longitude}`)
    .then((response) => {
      initMap(coordinates, response);
      const items = response.data.response.groups[0].items;
      console.log(items);
      writeTableRows(items);
    })
    .catch((error) => {
      console.error('coffee error', error);
    });
}

// start the app
document.addEventListener('DOMContentLoaded', () => {
  getPosition()
    .then((response) => {
      const { coords } = response;
      const { coords: { longitude: long, latitude: lat } } = response;
      getWeatherData(coords);
      getCoffeeLocations(coords);
    })
    .catch((err) => {
      console.error(err);
    });
});

$(window).on('load', () => {
  $loader.show()
});
