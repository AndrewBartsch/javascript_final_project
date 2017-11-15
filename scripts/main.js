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
    renderWheatherIcon( icon );
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
  
  function renderWheatherIcon( icon ) {
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
        getWeatherData( response.coords )
      })
      .catch((err) => {
        console.error(err.message);
      });
    }
  });
