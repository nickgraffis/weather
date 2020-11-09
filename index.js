const w = require('./weather.js');
const store = require('./storage.js');

$(document).ready(function() {
  $('.extra').on('click', function () {
    console.log('OK');
    $(this).addClass('w-10/12 h-48 absolute');
    $(this).css('left', '9%');
    $(this).css('top', 'calc(50% - 12em)');
  });
});

// window.expand = function (clickedElement) {
//   if (clickedElement.getAttribute('data-size') === 'expand') {
//     clickedElement.setAttribute('data-size', 'small');
//     clickedElement.classList.remove('absolute');
//     clickedElement.classList.remove('h-48');
//     clickedElement.classList.remove('w-10/12');
//   } else {
//     clickedElement.setAttribute('data-size', 'expand');
//     clickedElement.classList += ' w-10/12 absolute h-48';
//   }
// }

var searchShowing = false;
var screenSize;
var currentCity = null;

function capitolize(str) {
  let words = str.split(' ');
  let display = words.map((i) => {return i[0].toUpperCase() + i.slice(1)});

  return display.join(' ');
}

function getFile(file) {
  var x = new XMLHttpRequest();
  x.open("GET", file, false);
  x.send();
  return x.responseText;
}

window.search = function (city = null) {
  let str;
  if (city) {
    str = city;
    showHistory();
  } else {
    str = $('#searchInput').val();
    console.log(store.queryFavoriteCity());
    if (!store.queryFavoriteCity()) {
      store.createCityObject(store.createCityId(), str, true);
    } else {
      store.createCityObject(store.createCityId(), str);
    }
  }

  currentCity = str;
  w.getWeather(str, eval('render.' + screenSize + 'Screen'));
  $('#searchInput').val('');
  if (searchShowing) {
    $('#nav-bar').removeClass('h-screen pt-12 bg-opacity-50 static');
    searchShowing= false;
    document.getElementsByTagName('weather-history')[0].innerHTML = '';
  }
}

window.showSearch = function () {
  if (searchShowing) {
    $('#nav-bar').removeClass('h-screen pt-12 bg-opacity-50');
    searchShowing= false;
  } else {
    $('#nav-bar').addClass('h-screen pt-12 bg-opacity-50');
    searchShowing = true;
  }
}

window.showHistory = function () {
  if (searchShowing) {
    $('#nav-bar').removeClass('h-screen pt-12 bg-opacity-50 static');
    searchShowing= false;
    document.getElementsByTagName('weather-history')[0].innerHTML = '';

  } else {
    $('#nav-bar').addClass('h-screen pt-12 bg-opacity-50 static');
    searchShowing = true;
    document.getElementsByTagName('weather-history')[0].innerHTML = '';
    let historyItems = store.getCitiesArray();
    historyItems.map(i => {
      w.getWeather(i.name, function (city, response) {
        let weather = w.createWeatherObject(city, response);
        let file = eval('`' + getFile('./components/history.html') + '`');
        let div = document.createElement('DIV');
        div.classList = 'flex justify-between history-item-in';
        div.innerHTML = file;
        document.getElementsByTagName('weather-history')[0].append(div);
      })
    })
  }
}

window.changeFavorite = function (id, event) {
  let favorite = document.querySelector('.favorite');
  favorite.classList.remove('favorite');
  favorite.innerHTML = '<svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path stroke="#a0aec0" fill="#e2e8f0" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
  let star = event.currentTarget;
  console.log(event.currentTarget);
  star.classList.add('favorite');
  star.innerHTML = '<svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path stroke="#a0aec0" fill="#3182ce" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';
  store.updateFavoriteCity(id);
}

window.deleteCity = function (id, event) {
  let target = event.currentTarget;
  let parent = target.parentElement;
  let grandparent = parent.parentElement;
  grandparent.remove();
}

var render = {
  smallScreen: function (city, response) {
    var weather = w.createWeatherObject(city, response);
    console.log(weather);
    if (weather.tod === 'night') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', '');
    }
    document.getElementsByTagName('weather-title')[0].innerHTML = eval('`' + getFile('./components/title.html') + '`');
    document.getElementsByTagName('weather-extras')[0].innerHTML = eval('`' + getFile('./components/extras.html') + '`');
    document.getElementsByTagName('weather-hourly')[0].innerHTML = eval('`' + getFile('./components/hourly.html') + '`');
    document.getElementsByTagName('weather-daily')[0].innerHTML = eval('`' + getFile('./components/daily.html') + '`');
    document.getElementsByTagName('weather-indepth')[0].innerHTML = eval('`' + getFile('./components/indepth.html') + '`');
  },
  bigScreen: function (city, response) {
    var weather = w.createWeatherObject(city, response);
    console.log(weather);
    if (weather.tod === 'night') {
      document.body.setAttribute('data-theme', 'dark');
    }
    document.getElementsByTagName('weather-title')[0].innerHTML = eval('`' + getFile('./components/big/title.html') + '`');
  }
}

var app = document.querySelector('#application');

setInterval(function(){
  if (window.innerWidth <= 414) {
    if (app.getAttribute('data-size') != 'small') {
      app.setAttribute('data-size', 'small');
      app.innerHTML = eval('`' + getFile('./templates/small.html') + '`');

      let city;
      if (currentCity != null) {
        city = currentCity;
      } else {
        console.log(store.getCitiesArray());
        if (store.getCitiesArray().length > 0) {
          city = store.queryFavoriteCity().name;
        } else {
          city = 'irvine';
        }
      }

      currentCity = city;
      w.getWeather(city, render.smallScreen);

      screenSize = 'small';
    } else {
      console.log('no change');
    }
  } else {
    if (app.getAttribute('data-size') != 'large') {
      app.setAttribute('data-size', 'large');
      app.innerHTML = eval('`' + getFile('./templates/big.html') + '`');

      let city;
      if (currentCity != null) {
        city = currentCity;
      } else {
        console.log(store.getCitiesArray());
        if (store.getCitiesArray().length > 0) {
          city = store.queryFavoriteCity().name;
        } else {
          city = 'irvine';
        }
      }

      currentCity = city;
      w.getWeather(city, render.bigScreen);

      screenSize = 'big';
    } else {
      console.log('no change');
    }
  }
}, 1000);
