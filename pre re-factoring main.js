

const $weatherSummary = $('#js-weather-summary');
const $weatherShowcase = $('#js-weather-showcase');
const $weatherIcon = $('#js-weather-icon');
const $dailyWeatherSummary = $('#js-daily-weather-summary');
const $dailyWeatherIcon = $('js-daily-weather-icon');
const $coffeeOne = $('#js-coffee-one');
const $coffeeTwo = $('#js-coffee-two');
const $coffeeThree = $('#js-coffee-three');

function handleWeatherData( data ) {
   console.log( data.currently );
   console.log( data.daily );
   const temp = data.currently.temperature;
   const time = data.currently.time;
   const summary = data.currently.summary;
   const icon = data.currently.icon;
   const dailySummary = data.daily.summary;
   const dailyIcon = data.daily.icon;
   console.log( dailySummary );

   $weatherSummary.text( summary );
   $dailyWeatherSummary.text( dailySummary );
   $weatherShowcase.append(`
      <dt>
         Time
      </dt>
      <dd>
         ${new Date( time*1000 )}
      </dd>
      `)
      renderWeatherIcon( icon );
      renderWeatherIcon( dailyIcon );
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
        // how do i assign second icon to second element ID?
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
     };

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
         axios.get(`https://api.foursquare.com/v2/venues/explore?client_id=VVO2RYUAX4D455H2LVRIUMOUGUVUK3UY0T0YABYFTERIYMS4&client_secret=20YBURIZDKZJHFIGBEPKYSRRIZWDYXTDBAYWEA1SJW24DHMJ&v=20161016&radius=750&section=coffee&openNow=1&ll=${coordinates.latitude},${coordinates.longitude}`)
         .then( response => {
            console.log(coordinates);
            console.log(response);
            initMap(coordinates, response);
            document.getElementById("js-coffee-one").innerHTML = response.data.response.groups[0].items[0].venue.name;
            document.getElementById("js-coffee-two").innerHTML = response.data.response.groups[0].items[1].venue.name;
            document.getElementById("js-coffee-three").innerHTML = response.data.response.groups[0].items[2].venue.name;
            //const coffeeOne = response.data.response.groups[0].items[0].venue.name;
            //$coffeeOne.text (coffeeOne);
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
        var markerLabel = 'X123';
        var markerIndex = 0;

        for (i = 0; i < locations.length; i++) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i][1], locations[i][2], locations[i][3], locations[i],4),
			map: map,
            label: markerLabel[markerIndex++ % markerLabel.length]
		});

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				infowindow.setContent(locations[i][0]);
				infowindow.open(map, marker);
			}
		})(marker, i));
        };
    }
