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
const $weatherIcon = $('#js-weather-icon');

function handleWeatherData( data ) {
   console.log( data.currently );
   const temp = data.currently.temperature;
   const time = data.currently.time;
   const summary = data.currently.summary;
   const icon = data.currently.icon;

   $weatherSummary.text( summary );
   $weatherShowcase.append(`
      <dt>
         Time
      </dt>
      <dd>
         ${new Date( time*1000 )}
      </dd>
      `)
      renderWeatherIcon( icon );
      renderWeatherTemp( temp );
   }

   function renderWeatherTemp( temp ) {
      const celsiusNumber = ( (temp - 32) * 5/9 ).toFixed(2);
      const celsiusString = `${celsiusNumber} °C`;
      $weatherShowcase.append(`
         <dt>
            Temperature
         </dt>
         <dd>
            ${celsiusString}
         </dd>
         `)
      }

      function renderWeatherIcon( icon ) {
         const  skycons = new Skycons({
            color: "black"
         });
         const iconString = getIconString( icon )
         skycons.add(document.getElementById("currentWeatherIcon"), Skycons[iconString]);
         skycons.play();
      }

      function getIconString( icon ) {
         return icon.toUpperCase().replace(/-/g, '_');
      }

      //get location and return a promise
      function getPosition (options) {
         return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
         });
      }

      // fetch data from darksky
      function getWeatherData( coordinates ){
         axios.get(`https://api.darksky.net/forecast/1457d6f1317a446ae14320510b709b71/${coordinates.latitude}, ${coordinates.longitude}`)
         .then( response => {
            // render weather Data
            handleWeatherData( response.data )
         })
         .catch( error => {
            console.error( error );
         })
      }

      // start the app
      document.addEventListener("DOMContentLoaded", ( ) =>  {
         window.onload = ( ) => {
            getPosition()
            .then((response) => {
               console.log( response.coords.latitude );
               console.log( response.coords.longitude );
               latitude = response.coords.latitude;
               longitude = response.coords.longitude;
               getWeatherData( response.coords );
               getCoffeeLocations( response.coords );
               //initMap( response.coords );
            })
            .catch((err) => {
               console.error(err.message);
            });
         }
      });

      // fetch coffee venues from Foursquare

      function getCoffeeLocations( coordinates ){
         axios.get(`https://api.foursquare.com/v2/venues/explore?client_id=VVO2RYUAX4D455H2LVRIUMOUGUVUK3UY0T0YABYFTERIYMS4&client_secret=20YBURIZDKZJHFIGBEPKYSRRIZWDYXTDBAYWEA1SJW24DHMJ&v=20161016&radius=750&openNow=1&section=coffe&ll=${coordinates.latitude},${coordinates.longitude}`)
         .then( response => {
            console.log(coordinates);
            console.log(response);
            initMap(coordinates, response);
         })
         .catch( error => {
            console.log( error );
         })
    };

      function initMap( coordinates, response ) {
         const myLatLng = {
            lat: coordinates.latitude,
            lng: coordinates.longitude,
            info: "You!"
         };
         // Create a map object and specify the DOM element for display.
         const map = new google.maps.Map(document.getElementById('map'), {
            center: myLatLng,
            zoom: 14
         });
         // Create a marker and set its position.
        const coffeeShopOne = {lat: response.data.response.groups[0].items[0].venue.location.lat,
                             lng: response.data.response.groups[0].items[0].venue.location.lng,
                             info: response.data.response.groups[0].items[0].venue.name
                            };

        const coffeeShopTwo = {lat: response.data.response.groups[0].items[1].venue.location.lat,
                            lng: response.data.response.groups[0].items[1].venue.location.lng,
                            info: response.data.response.groups[0].items[1].venue.name
                            };

        const coffeeShopThree = {lat: response.data.response.groups[0].items[2].venue.location.lat,
                              lng: response.data.response.groups[0].items[2].venue.location.lng,
                              info: response.data.response.groups[0].items[2].venue.name
                              };

        var locations = [
                         [myLatLng.info, myLatLng.lat, myLatLng.lng, 0],
                         [coffeeShopOne.info, coffeeShopOne.lat, coffeeShopOne.lng, 1],
                         [coffeeShopTwo.info, coffeeShopTwo.lat, coffeeShopTwo.lng, 2],
                         [coffeeShopThree.info, coffeeShopThree.lat, coffeeShopThree.lng, 3]
                        ];

        var infowindow = new google.maps.InfoWindow({});

        var marker, i;

        for (i = 0; i < locations.length; i++) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i][1], locations[i][2], locations[i][3], locations[i],4),
			map: map
		});

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				infowindow.setContent(locations[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
        };
    }
