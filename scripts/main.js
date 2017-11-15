// get coordinates on Window on load ( pronise )
// Then call darksky api with coordinates
// Populate html with data fron dark sky (with the graphics)
// Then call foursquare
// Store data
// render a google map
// pin venues from foursquare
// $(document).ready(function){

var weatherResponse;
var latitude;
var longitude;
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
                    initMap( response.coords );
                })
                .catch((err) => {
                    console.error(err.message);
                });
            }
        });

        console.log(longitude);
        console.log(latitude);

        // fetch coffee venues from Foursquare

        function getCoffeeLocations( coordinates ){
            axios.get(`https://api.foursquare.com/v2/venues/explore?client_id=VVO2RYUAX4D455H2LVRIUMOUGUVUK3UY0T0YABYFTERIYMS4&client_secret=20YBURIZDKZJHFIGBEPKYSRRIZWDYXTDBAYWEA1SJW24DHMJ&v=20161016&radius=250&openNow=1&ll=51.51535,-0.07204519999999999&${coordinates.latitude},${coordinates.longitude}`)
            .then( response => {
                // pass coffee locations to map
                console.log(response);
            })
            .catch( error => {
                console.log( error );
            })
        }

        function initMap( coordinates ) {
            var myLatLng = {lat: -25.363, lng: 131.044};

            // Create a map object and specify the DOM element for display.
            var map = new google.maps.Map(document.getElementById('map'), {
                center: myLatLng,
                zoom: 4
            });

            // Create a marker and set its position.
            var marker = new google.maps.Marker({
                map: map,
                position: myLatLng,
                title: 'Hello World!'
            });
        }
