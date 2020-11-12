function thunderstorm(description) {
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

function find (weather, tod) {
  let main = weather.main.toLowerCase();
  let description = weather.description;
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

module.exports = {
  find: find
}
