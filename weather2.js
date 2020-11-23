const icon = require('./weather-icons.js');
const help = require('./weather-helpers.js');
const weathermath = require('./weather-math.js');

function createWeatherObject(city, weather) {
  var object = {
    city_name: city,
    current: help.createCurrentArray(weather.current),
    hourly: help.createHourlyArray(weather.hourly, weather.current.sunrise, weather.current.sunset),
    daily: help.createDailyArray(weather.daily),
    minutely: weather.minutely,
    lat: weather.lat,
    lon: weather.lon,
    string: help.createWeatherString(weather),
    timezone: weather.timezone
  }

  return object;
}

function getWeather(city, callback) {
  var settings = {
    url: 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=4253ae682bded8fe54667e18d996e279',
    method: 'GET',
  };
  $.ajax(settings).done(function(response) {
    var geo = {
      url: 'https://api.openweathermap.org/data/2.5/onecall?lat=' + response.coord.lat + '&lon=' + response.coord.lon + '&appid=4253ae682bded8fe54667e18d996e279',
      method: 'GET',
    }
    $.ajax(geo).done(function(geoResponse) {
      var iqAir = {
        url: 'https://api.openaq.org/v1/latest?country=' + response.sys.country + '&limit=5000',
        method: 'GET',
      }
      $.ajax(iqAir).done(function (iqResponse) {
        var unsplash = {
          url: 'https://api.unsplash.com/search/photos?page=1&query=' + city + '&orientation=landscape&client_id=7MZwsnhmpaHSUgesJtEf4SVPh8nLbxAgdh1pIh03g3Q',
          method: 'GET',
        }
        $.ajax(unsplash).done(function(picResponse) {
          let formattedResponse = createWeatherObject(response.name, geoResponse);
          formattedResponse.air_quality = weathermath.findAQ(response.coord.lat, response.coord.lon, iqResponse);
          formattedResponse.picture = picResponse.results[0].urls.raw;
          formattedResponse.country_name = response.sys.country;
          console.log(geoResponse);
          console.log(response);
          callback(formattedResponse)
        });
      });
    });
  }).fail(function(xhr, status, error) {
      var errorMessage = xhr.status + ': ' + xhr.statusText
      callback({city_name: 'Error', message: errorMessage});
});
}

module.exports = {
  getWeather: getWeather
}
