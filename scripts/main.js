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


const $weatherSummary = $('#js-weather-summary');
const $weatherShowcase = $('#js-weather-showcase');
// const $weatherIcon = $('#js-weather-icon');
// const $coffeeOne = $('#js-coffee-one');
// const $coffeeTwo = $('#js-coffee-two');
// const $coffeeThree = $('#js-coffee-three');
const $coffeeTable = $('#coffee-table tbody');

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

  function renderWeatherIcon(icon) {
    const skycons = new Skycons({
      color: 'black',
    });
    const iconString = getIconString(icon);
    skycons.add(document.getElementById('currentWeatherIcon'), Skycons[iconString]);
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

    $weatherSummary.text(summary);
    $weatherShowcase.append(`
      <dt>
        Time
      </dt>
      <dd>
        ${new Date(time * 1000)}
      </dd>
      `);
      renderWeatherIcon(icon);
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

    // COFFEE
    function initMap(coordinates, response) {
      const myLatLng = {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        info: 'You!',
      };
      // Create a map object and specify the DOM element for display.
      const map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 14,
      });

      const markerData = response.data.response.groups[0].items;
      console.log( 'markerData ', markerData );
      const markers = markerData.map(marker => ({
        lat: marker.venue.location.lat,
        lng: marker.venue.location.lng,
        info: marker.venue.name,
      }));

      const locations = [
        myLatLng,
        // [coffeeShopOne.info, coffeeShopOne.lat, coffeeShopOne.lng, 1],
        // [coffeeShopTwo.info, coffeeShopTwo.lat, coffeeShopTwo.lng, 2],
        // [coffeeShopThree.info, coffeeShopThree.lat, coffeeShopThree.lng, 3]
      ];

      // console.log('locations', locations);

      markers.forEach((marker) => {
        locations.push(marker);
      });


      const infowindow = new google.maps.InfoWindow({});

      let marker;

      for (let i = 0, len = locations.length; i < len; i += 1) {
        const loc = locations[i];
        // console.log('location', loc);
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(loc.info, loc.lat, loc.lng, loc, i),
          map,
          label: (i === 0) ? 'X' : i.toString(),
        });
        // console.log('marker', marker);

        google.maps.event.addListener(marker, 'click', () => {
          infowindow.setContent(loc.info);
          infowindow.open(map, marker);
        });
      }
    }

    function renderTableRows(item, i = 0) {
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
        if (!i) return;
        renderTableRows(item, i);
      });
    }

    // fetch coffee venues from Foursquare

    function getCoffeeLocations(coordinates) {
      axios.get(`https://api.foursquare.com/v2/venues/explore?client_id=VVO2RYUAX4D455H2LVRIUMOUGUVUK3UY0T0YABYFTERIYMS4&client_secret=20YBURIZDKZJHFIGBEPKYSRRIZWDYXTDBAYWEA1SJW24DHMJ&v=20161016&radius=750&openNow=1&section=coffee&ll=${coordinates.latitude},${coordinates.longitude}`)
      .then((response) => {
        initMap(coordinates, response);
        const items = response.data.response.groups[0].items;
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
