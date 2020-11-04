const moment = require('moment');
// var cityCodes = require('./city.list.json');
var windChart = require('./wind_direction.json');

function capitolize(str) {
  let words = str.split(' ');
  let display = words.map((i) => {return i[0].toUpperCase() + i.slice(1)});

  return display.join(' ');
}

function toF (temp) {
  return Math.floor((temp - 273.15) * 9/5 + 32);
}

function getFile(file) {
  var x = new XMLHttpRequest();
  x.open("GET", file, false);
  x.send();
  return x.responseText;
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

function createHourlyArray(weather) {
  let array = weather.hourly;
  let sunset = parseInt(moment(weather.current.sunset * 1000).format('H'));
  let sunrise = parseInt(moment(weather.current.sunrise * 1000).format('H'));
  let i = 0;
  let hourlyArray = [];
  while (i < array.length) {
    let tod = (sunset + 1) > parseInt(moment(array[i].dt * 1000).format('H')) && (sunrise - 2) < parseInt(moment(array[i].dt * 1000).format('H')) ? 'day' : 'night';
    if (parseInt(moment(array[i].dt * 1000).format('H')) === sunset + 1) {
      hourlyArray.push({
        time: moment(weather.current.sunset * 1000).format('h:mm a'),
        temp: toF(array[i].temp),
        icon: 'sunset'
      });
      hourlyArray.push({
        time: moment(array[i].dt * 1000).format('h a'),
        temp: toF(array[i].temp),
        icon: iconify(array[i], tod)
      });
      i++;
      continue;
    } else if (parseInt(moment(array[i].dt * 1000).format('H')) === sunrise - 1) {
      hourlyArray.push({
        time: moment(weather.current.sunset * 1000).format('h:mm a'),
        temp: toF(array[i].temp),
        icon: 'sunrise'
      });
      hourlyArray.push({
        time: moment(array[i].dt * 1000).format('h a'),
        temp: toF(array[i].temp),
        icon: iconify(array[i], tod)
      });
      i++;
      continue;
    } else {
      hourlyArray.push({
        time: moment(array[i].dt * 1000).format('h a'),
        temp: toF(array[i].temp),
        icon: iconify(array[i], tod)
      });
      i++;
      continue;
    }
  }
  return hourlyArray;
}

function createExtras(weather) {
  var extras = [
    {
      title: 'wind',
      string: windDirection(weather.current.wind_deg).direction + ' ' + weather.current.wind_speed + ' mph',
      icon: 'windstock'
    },
    {
      title: 'uv index',
      string: weather.current.uvi + ' ' + uviChart(weather.current.uvi),
      icon: 'sun'
    },
    {
      title: 'humidity',
      string: weather.current.humidity + '%',
      icon: 'rain-gauge'
    },
    {
      title: 'visibility',
      string: ((weather.current.visibility * 3.281) / 5280).toFixed(2) + ' mi',
      icon: 'cloud-2'
    },
    {
      title: 'feels like',
      string: toF(weather.current.feels_like) + '°',
      icon: 'thermometer'
    },
    {
      title: 'pressure',
      string: Math.floor(weather.current.pressure / 34) + ' inHg',
      icon: 'pressure'
    },
    {
      title: 'rain',
      string: weather.daily[0].pop + '%',
      icon: 'umbrella'
    },
    {
      title: 'dew point',
      string: toF(weather.current.dew_point) + '°',
      icon: 'dew-point'
    }
  ]

  return extras;
}

function createDailyArray (city, array) {
  return array.map(function (item) {
    let tod = item.sunset > item.dt && item.sunrise < item.dt ? 'day' : 'night';
    return {
      date: moment(item.dt * 1000).format('dddd'),
      high: toF(item.temp.max),
      low: toF(item.temp.min),
      description: item.weather.main,
      icon: iconify(item, tod),
      pop: item.pop
    }
  });
}

function createWeatherString (weather) {
  return `Today is ${weather.weather[0].description} with a high of ${toF(weather.temp.max)}° and a low of ${toF(weather.temp.min)}°. There is a ${weather.pop}% chance of rain.`;
}

function thunderstormIcon(description) {
  if (description.includes('rain') || description.includes('drizzle')) {
    return 'thunderstorm-rain';
  } else if (description.includes('heavy') || description.includes('ragged')) {
    return 'thunderstorm-heavy';
  } else {
    return 'thunderstorm-thunderstorm';
  }
}

function drizzle (main, description) {
  let prefix = 'rain';
  if (main === 'drizzle') {
    if (description.includes('shower')) {
      return prefix + '-dot-4';
    } else if (description.includes('rain')) {
      return prefix + '-dot-3';
    } else {
      return prefix + '-dot-2';
    }
  } else {
    if (description.includes('freezing')) {
      return prefix + '-freezing';
    } else if (description.includes('shower')) {
      if (description.includes('light') || description.includes('moderate')) {
        return prefix + '-line-5';
      } else if (description.includes('heavy') || description.includes('ragged')) {
        return prefix + '-line-5';
      }
    } else {
      if (description.includes('light') || description.includes('moderate')) {
        return prefix + '-sun';
      } else if (description.includes('heavy')) {
        return prefix + '-drop-3';
      } else if (description.includes('extreme')) {
        return prefix + '-line-5';
      }
    }
  }
}

function snow (description) {
  if (description.includes('sleet') || description.includes('rain') || description.includes('shower')) {
    return 'rain-freezing';
  } else if (description.includes('light')) {
    return 'snow-1';
  } else if (description.includes('heavy')) {
    return 'snow-5';
  } else {
    return 'snow-3';
  }
}

function clouds (tod, description) {
  if (tod === 'night') {
    return 'night-cloudy';
  } else if (description.includes('few') || description.includes('scattered')) {
    return 'day-cloud';
  } else {
    return 'cloud-1';
  }
}

function iconify (weather, tod) {
  let main = weather.weather[0].main.toLowerCase();
  let description = weather.weather[0].description;
  if (main === 'thunderstorm') {
    return thunderstorm(description);
  } else if (main === 'drizzle' || main === 'rain') {
    return drizzle(main, description);
  } else if (main === 'snow') {
    return snow(description);
  } else if (main === 'mist') {
    return 'mist';
  } else if (main === 'smoke' || main === 'dust' || main === 'ash' || main === 'sand') {
    return 'dust';
  } else if (main === 'haze') {
    if (tod === 'day') {
      return 'haze';
    } else {
      return 'night-fog';
    }
  } else if (main === 'tornado') {
    return 'tornado';
  } else if (main === 'fog') {
    if (tod === 'day') {
      return 'cloud-1';
    } else {
      return 'night-fog';
    }
  } else if (main === 'clear') {
    if (tod === 'day') {
      return 'sun';
    } else {
      return 'night-clear';
    }
  } else if (main === 'clouds') {
    return clouds(tod, description);
  } else {
    return false;
  }
}

function createWeatherObject(city, weather) {
  let tod = (weather.current.sunset * 1000) > Date.now() && (weather.current.sunrise * 1000) < Date.now() ? 'day' : 'night';
  var object = {
    date: weather.current.dt,
    city_name: city,
    current_temp: toF(weather.current.temp),
    high: toF(weather.daily[0].temp.max),
    low: toF(weather.daily[0].temp.min),
    description: weather.current.weather[0].main,
    string: createWeatherString(weather.daily[0]),
    icon: iconify(weather.current, tod),
    hourly: createHourlyArray(weather),
    daily: createDailyArray(city, weather.daily),
    extras: createExtras(weather)
  };

  return object;
}

function citySearch (search) {
  var matcher = search;
  var matchingKeys = cityCodes.filter(function(key) {
    return key.name.toLowerCase().indexOf(matcher) === 0
  });

  return matchingKeys.map(function(key) {
      return {
        city: key.name,
        state: key.state,
        country: key.country,
        lon: key.coord.lon,
        lat: key.coord.lat,
      };
    });
}

function getWeather (city) {
  var settings = {
    url: 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=4253ae682bded8fe54667e18d996e279',
    method: 'GET',
  };
  $.ajax(settings).done(function (response) {
    var geo = {
      url: 'https://api.openweathermap.org/data/2.5/onecall?lat=' + response.coord.lat + '&lon=' + response.coord.lon + '&exclude=minutely&appid=4253ae682bded8fe54667e18d996e279',
      method: 'GET',
    }
    $.ajax(geo).done(function (geoResponse) {
      var weather = createWeatherObject(response.name, geoResponse);
      console.log(weather);
      document.getElementsByTagName('weather-title')[0].innerHTML = eval('`' + getFile('./components/title.html') + '`');
      document.getElementsByTagName('weather-current')[0].innerHTML = eval('`' + getFile('./components/current.html') + '`');
      document.getElementsByTagName('weather-extras')[0].innerHTML = eval('`' + getFile('./components/extras.html') + '`');
      document.getElementsByTagName('weather-hourly')[0].innerHTML = eval('`' + getFile('./components/hourly.html') + '`');
      document.getElementsByTagName('weather-daily')[0].innerHTML = eval('`' + getFile('./components/daily.html') + '`');
      document.getElementsByTagName('weather-indepth')[0].innerHTML = eval('`' + getFile('./components/indepth.html') + '`');
  });
  });
}

module.exports = {
  getWeather: getWeather,
  citySearch: citySearch
}
