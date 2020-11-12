const icon = require('./weather-icons.js');
const help = require('./weather-helpers.js');

function createWeatherObject(city, weather) {
  var object = {
    city_name: city,
    current: help.createCurrentArray(weather.current),
    hourly: help.createHourlyArray(weather.hourly, weather.current.sunrise, weather.current.sunset),
    daily: help.createDailyArray(weather.daily),
    lat: weather.lat,
    lon: weather.lon
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
      url: 'https://api.openweathermap.org/data/2.5/onecall?lat=' + response.coord.lat + '&lon=' + response.coord.lon + '&exclude=minutely&appid=4253ae682bded8fe54667e18d996e279',
      method: 'GET',
    }
    $.ajax(geo).done(function(geoResponse) {
      var unsplash = {
        url: 'https://api.unsplash.com/search/photos?page=1&query=' + city + '&orientation=landscape&client_id=7MZwsnhmpaHSUgesJtEf4SVPh8nLbxAgdh1pIh03g3Q',
        method: 'GET',
      }
      $.ajax(unsplash).done(function(picResponse) {
        let formattedResponse = createWeatherObject(response.name, geoResponse);
        formattedResponse.picture = picResponse.results[0].urls.raw;
        console.log(geoResponse);
        callback(formattedResponse)
      });
    });
  });
}

module.exports = {
  getWeather: getWeather
}
