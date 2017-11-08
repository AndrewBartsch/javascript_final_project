// get coordinates on Window on load ( pronise )
// Then call darksky api with coordinates
// Populate html with data fron dark sky (with the graphics)
// Then call foursquare
// Store data
// render a google map
// pin venues from foursquare

function getPosition (options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function getWeatherData( coordinates ){
    console.log( 'inside get weather data');

    axios.get(`https://api.darksky.net/forecast/1457d6f1317a446ae14320510b709b71/${coordinates.latitude}, ${coordinates.longitude}`)
    .then( response => {
        console.log( response.data );
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
