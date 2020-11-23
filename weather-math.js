var windChart = require('./wind_direction.json');
var aqiChart = require('./aqichart.json');
// var Moon = {
//   phases: ['new-moon', 'waxing-crescent-moon', 'quarter-moon', 'waxing-gibbous-moon', 'full-moon', 'waning-gibbous-moon', 'last-quarter-moon', 'waning-crescent-moon'],
//   phase: function (year, month, day) {
//     let A = year / 100;
//     let B = A / 4;
//     let C = 2 - (A + B);
//     let D = (365.25 * (year + 4716)).toFixed(0);
//     let E = (30.6001 * (month + 1)).toFixed(0);
//     let JD = (C + D + E + day) - 1524.5;
//
//     let daysSinceNew = JD - 2451549.5;
//     let newMoons = daysSinceNew % 29.53
//     let daysIntoCycle = newMoons * 29.53;
//     let b;
//
//     if (daysIntoCycle === 7) {
//       b = 2;
//     } else if (daysIntoCycle === 22) {
//       b = 6;
//     } else if (daysIntoCycle === 15) {
//       b = 4;
//     } else if (daysIntoCycle < 1) {
//       b = 0;
//     } else if (daysIntoCycle < 7) {
//       b = 1;
//     } else if (daysIntoCycle > 7 && daysIntoCycle < 15) {
//       b = 3;
//     } else if (daysIntoCycle > 15 && daysIntoCycle < 22) {
//       b = 5;
//     }
//     return {phase: b, name: Moon.phases[b]};
//   }
// }
//
// console.log(Moon.phase('2020', '10', '31'));


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

function metersToMile(meters) {
  if (meters === 10000) {
    return 10;
  }
  return meters / 1609;
}

function uviChart(uvi) {
  let intensity = '';
  let color ='';

  if (uvi < 2) {
    intensity = 'low';
    color = 'green-500';
  } else if (uvi < 5 && uvi > 2) {
    intensity = 'moderate';
    color = 'blue-500';
  } else if (uvi < 7 && uvi > 5) {
    intensity = 'high';
    color = 'yellow-500';
  } else if (uvi < 10 && uvi > 7) {
    intensity = 'very high';
    color = 'orange-500';
  } else {
    intensity = 'extreme';
    color = 'red-500';
  }

  return {intensity: intensity, color: color};
}

function pressure (value) {
  return (value * 100) / 3386;
}

function humidityChart (value) {
  if (value > 70) {
    return {string: 'high', emoji: '🥵'};
  } else if (value < 30) {
    return {string: 'dry', emoji: '🌵'};
  } else {
    return {string: 'normal', emoji: '🤙'}
  }
}

function dewPointChart (value) {
  if (toF(value) >= 70) {
    return {string: 'muggy', emoji: '🥵'};
  } else if (toF(value) < 70 && toF(value) >= 65) {
    return {string: 'unpleasant', emoji: '😓'};
  } else if (toF(value) < 65 && toF(value) >= 60) {
    return {string: 'sticky', emoji: '😐'};
  } else if (toF(value) < 60 && toF(value) >= 50) {
    return {string: 'comfortable', emoji: '🤙'}
  } else {
    return {string: 'dry', emoji: '🌵'}
  }
}

function mmToIn(value) {
  return value / 25.4;
}

// Converts numeric degrees to radians
    function toRad(Value)
    {
        return Value * Math.PI / 180;
    }

function calcCrow(lat1, lon1, lat2, lon2)
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

function aqiStringify (value) {
  if (value <= 50) {
    return "good";
  } else if (value <= 100) {
    return "moderate";
  } else if (value <=150) {
    return "unhealthy for sensitive groups";
  } else if (value <= 200) {
    return "unhealthy";
  } else if (value <= 300) {
    return "very unhealthy";
  } else {
    return "hazardous";
  }
}

function aqiEmojify (value) {
  if (value <= 50) {
    return "🙂";
  } else if (value <= 100) {
    return "😐";
  } else if (value <=150) {
    return "☹️";
  } else if (value <= 200) {
    return "😷";
  } else if (value <= 300) {
    return "😷";
  } else {
    return "😷";
  }
}

function findAQI (data) {
  let highestAQI = 0;
  let aqi;
  for (let i = 0; i < data.length; i++) {
    console.log(data[i].parameter)
    for (let j = 0; j < aqiChart.length; j++) {
      if (aqiChart[j].title === data[i].parameter) {
        for (let k = 0; k < aqiChart[j].ranges.length; k++) {
            console.log(data[i].value);
          if (data[i].value > aqiChart[j].ranges[k].low && data[i].value < aqiChart[j].ranges[k].high) {
            let aqiValue = (((aqiChart[j].ranges[k].aqi_high - aqiChart[j].ranges[k].aqi_low) / (aqiChart[j].ranges[k].high - aqiChart[j].ranges[k].low)) * (data[i].value - aqiChart[j].ranges[k].low)) + aqiChart[j].ranges[k].aqi_low;
            let aqiString = aqiStringify(aqiValue);
            let aqiEmoji = aqiEmojify(aqiValue);
            if (highestAQI < aqiValue) {
              highestAQI = aqiValue;
              aqi = {parameter: data[i].parameter, value: aqiValue, emoji: aqiEmoji, string: aqiString};
            }
          }
        }
      }
    }
  }
  return aqi;
}

function findAQ (lat, lon, iq) {
  var shortestCrow;
  let shortestCoordinates;
  let shortestCity;
  let shortestData;
  for (let i = 0; i < iq.results.length; i++) {
    if(iq.results[i].coordinates) {
      let crow = calcCrow(lat, lon, iq.results[i].coordinates.latitude, iq.results[i].coordinates.longitude);
      if (i === 0) {
        shortestCrow = crow;
        shortestCity = iq.results[i].city;
        shortestData = iq.results[i].measurements;
        shortestCoordinates = {latitude: iq.results[i].coordinates.latitude, longitude: iq.results[i].coordinates.longitude};
      } else {
        if (crow < shortestCrow) {
          console.log(crow);
          console.log(iq.results[i].city);
          shortestCrow = crow;
          shortestCity = iq.results[i].city;
          shortestData = iq.results[i].measurements;
          shortestCoordinates = {latitude: iq.results[i].coordinates.latitude, longitude: iq.results[i].coordinates.longitude};
          console.log(shortestCoordinates);
        }
      }
    }
  }
  return findAQI(shortestData);
}

module.exports = {
  uviChart: uviChart,
  windDirection: windDirection,
  Moon: Moon,
  toF: toF,
  pressure: pressure,
  mmToIn: mmToIn,
  metersToMile: metersToMile,
  humidityChart: humidityChart,
  dewPointChart: dewPointChart,
  findAQ: findAQ,
  calcCrow: calcCrow,
}
