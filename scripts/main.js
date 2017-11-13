// get coordinates on Window on load ( pronise )
// Then call darksky api with coordinates
// Populate html with data fron dark sky (with the graphics)
// Then call foursquare
// Store data
// render a google map
// pin venues from foursquare
// $(document).ready(function){

  var weatherResponse;
  const $weatherSummary = $('#js-weather-summary');
  const $weatherShowcase = $('#js-weather-showcase');
  const $weatherIcon = $('#js-weather-icon');

  function handleWeatherData( data ) {
    console.log( data );
    $weatherSummary.text( data.minutely.summary )
    // $weatherIcon.add(document.getElementById("js-weather-icon"), icons.data.minutely.icon)
    // ^ trying to pull the icon string from DarkSky API, pull the icon file, and map it to HTML page
    for ( let timeSlot  of data.minutely.data ) {
      $weatherShowcase.append(`
        <dt>
          Time
        </dt>
        <dd>
          ${new Date( timeSlot.time*1000 )}
        </dd>
        <dt>
          Precipitation intensity
        </dt>
        <dd>
          ${ timeSlot.precipIntensity}
        </dd>
        <dt>
          Precipitation probability
        </dt>
        <dd>
          ${ timeSlot.precipProbability}
        </dd>
      `)
    }
  }

  function getPosition (options) {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  function getWeatherData( coordinates ){
    console.log( 'inside get weather data');

    axios.get(`https://api.darksky.net/forecast/1457d6f1317a446ae14320510b709b71/${coordinates.latitude}, ${coordinates.longitude}`)
    .then( response => {
      handleWeatherData( response.data )
    })
    .catch( error => {
      console.error( error );
    })
  }


  document.addEventListener("DOMContentLoaded", ( ) =>  {
    window.onload = ( ) => {
      console.log( 'hello');
      getPosition()
      .then((response) => {
        console.log( response.coords );
        console.log('LAT => ', response.coords.latitude);
        console.log('LONG => ', response.coords.longitude);
        getWeatherData( response.coords )
      })
      .catch((err) => {
        console.error(err.message);
      });
    }
  });

var icons = new Skycons(),
    list  = [
      "clear-day", "clear-night", "partly-cloudy-day",
      "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
      "fog"
    ],
    i;
for(i = list.length; i--; )
  icons.set(list[i], list[i]);
icons.play();

//});
