require('dotenv').config()
const OpenWeather = require('./weather-discover.js');
const MyOpenWeather = new OpenWeather(process.env.OPENWEATHER_APP_ID);

MyOpenWeather.location('Seattle').current()
.then(function (obj) {
  console.log(obj.call);
  obj.location({lon: obj.response.coord.lon, lat: obj.response.coord.lat})
  .oneCall()
  .then(obj => console.log(obj))
});
