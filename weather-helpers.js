const icon = require('./weather-icons.js');
const weathermath = require('./weather-math.js');
const moment = require('moment');

function findTimeOfDay(weather, sunRise, sunSet) {
  if (sunRise) { return sunSet > weather.dt && sunRise < weather.dt ? 'day' : 'night'; }
  else { return weather.sunset > weather.dt && weather.sunrise < weather.dt ? 'day' : 'night'; }
}

function createWeatherString (weather) {
  return `Today is ${weather.weather[0].description} with a high of ${weathermath.toF(weather.temp.max)}° and a low of ${weathermath.toF(weather.temp.min)}°. There is a ${weather.pop}% chance of rain.`;
}

function createWeatherArray(weather, tod) {
  return weather.map(function(w) {
    return {
      main: w.main,
      description: w.description,
      icon: icon.find(w, tod)
    }
  });
}

function createHourlyArray (array, sunRise, sunSet) {
  let hourlyArray = [];

  for (a of array) {
    if (moment(a.dt * 1000).format('kk') === moment(sunSet * 1000).format('kk')) {
      hourlyArray.push(createCurrentArray(a, sunRise, sunSet));
      hourlyArray.push({
        temp: a.temp,
        dt: sunSet,
        pop: a.pop,
        weather: [{icon: 'sunset'}]
      });
    } else if (moment(a.dt * 1000).format('kk') === moment(sunRise * 1000).format('kk')) {
      hourlyArray.push(createCurrentArray(a, sunRise, sunSet));
      hourlyArray.push({
        temp: a.temp,
        dt: sunRise,
        pop: a.pop,
        weather: [{icon: 'sunrise'}]
      });
    } else {
      hourlyArray.push(createCurrentArray(a, sunRise, sunSet));
    }
  }

  return hourlyArray;
}

function createDailyArray (array) {
  return array.map(function(item) {
    return createCurrentArray(item);
  });
}

function createExtras(weather) {
  return weather.map(function(w) {
    return {
      title: w.key,
      value: w.value
    }
  })
}

function createCurrentArray (weather, sunRise, sunSet) {
  return {
    dt: weather.dt,
    extras: createExtras([
      {key: 'humidity', value: weather.humidity ? weather.humidity : null},
      {key: 'pressure', value: weather.pressure ? weather.pressure : null},
      {key: 'uvi', value: weather.uvi ? weather.uvi : null},
      {key: 'visibility', value: weather.visibility ? weather.visibility : null},
      {key: 'cloudiness', value: weather.clouds},
      {key: 'dew-point', value: weather.dew_point},
      {key: 'feels-like', value: weather.feels_like},
      {key: 'wind', value: {
          wind_deg: weather.wind_deg,
          wind_speed: weather.wind_speed,
        },
      }
    ]),
    pop: weather.pop ? weather.pop : null,
    rain: weather.rain ? weather.rain : null,
    snow: weather.snow ? weather.snow : null,
    sunrise: weather.sunrise ? weather.sunrise : sunRise,
    sunset: weather.sunset ? weather.sunset : sunSet,
    tod: weather.sunrise ? findTimeOfDay(weather) : findTimeOfDay(weather, sunRise, sunSet),
    temp: weather.temp,
    weather: createWeatherArray(weather.weather, weather.sunrise ? findTimeOfDay(weather) : findTimeOfDay(weather, sunRise, sunSet),),
    string: createWeatherString(weather)
  }
}

module.exports = {
  createCurrentArray: createCurrentArray,
  createDailyArray: createDailyArray,
  createHourlyArray: createHourlyArray,
}
