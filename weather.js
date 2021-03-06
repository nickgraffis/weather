const moment = require('moment');
// var cityCodes = require('./city.list.json');
var windChart = require('./wind_direction.json');

var Moon = {
  phases: ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon'],
  phase: function (year, month, day) {
    let c = e = jd = b = 0;

    if (month < 3) {
      year--;
      month += 12;
    }

    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // jd is total days elapsed
    jd /= 29.5305882; // divide by the moon cycle
    b = parseInt(jd); // int(jd) -> b, take integer part of jd
    jd -= b; // subtract integer part to leave fractional part of original jd
    b = Math.round(jd * 8); // scale fraction from 0-8 and round

    if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
    return {phase: b, name: Moon.phases[b]};
  }
};

// Moon.phase('2018', '01', '19');

function toF (temp) {
  return Math.floor((temp - 273.15) * 9/5 + 32);
}

function windDirection(deg) {
  let degrees = windChart.map(function (el) { return el.degree; });

  degrees.sort((a, b) => {
    return Math.abs(deg - a) - Math.abs(deg - b);
  });

  for (var i=0; i < windChart.length; i++) {
    if (windChart[i].degree === degrees[0]) {
        return windChart[i];
    }
  }
}

function uviChart(uvi) {
  let intensity = '';

  if (uvi < 2) {
    intensity = 'low';
  } else if (uvi < 5 && uvi > 2) {
    intensity = 'moderate';
  } else if (uvi < 7 && uvi > 5) {
    intensity = 'high';
  } else if (uvi < 10 && uvi > 7) {
    intensity = 'very high';
  } else {
    intensity = 'extreme';
  }

  return intensity;
}

module.exports = {
  getWeather: getWeather,
  citySearch: citySearch,
  createWeatherObject: createWeatherObject
}
