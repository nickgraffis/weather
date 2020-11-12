const w = require('./weather2.js');
const store = require('./storage.js');
const moment = require('moment');
const weathermath = require('./weather-math.js');

var searchShowing = false;
var screenSize;
var currentCity = 'San Fransisco';

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
    $('#nav-bar').removeClass('h-screen pt-12 bg-opacity-20');
    searchShowing= false;
  } else {
    $('#nav-bar').addClass('h-screen pt-12 bg-opacity-20');
    searchShowing = true;
  }
}

window.showHistory = function () {
  if (searchShowing) {
    $('#nav-bar').removeClass('h-screen pt-12 bg-opacity-20 static');
    searchShowing= false;
    document.getElementsByTagName('weather-history')[0].innerHTML = '';

  } else {
    $('#nav-bar').addClass('h-screen pt-12 bg-opacity-20 static');
    searchShowing = true;
    document.getElementsByTagName('weather-history')[0].innerHTML = '';
    let historyItems = store.getCitiesArray();
    historyItems.map(i => {
      w.getWeather(i.name, function (response) {
        let weather = response;
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
  favorite.innerHTML = '<span style="color:#e2e8f0;"><i class="fas fa-star"></i></span>';
  let star = event.currentTarget;
  console.log(event.currentTarget);
  star.classList.add('favorite');
  star.innerHTML = '<span style="color: #3182ce;"><i class="fas fa-star"></i></span>';
  store.updateFavoriteCity(id);
}

window.deleteCity = function (id, event) {
  let target = event.currentTarget;
  let parent = target.parentElement;
  let grandparent = parent.parentElement;
  grandparent.remove();
}

var render = {
  smallScreen: function (response) {
    var weather = response;
    console.log(weather);
    if (weather.current.tod === 'night') {
      document.body.setAttribute('data-theme', 'dark');
      if (document.querySelector('.sun')) {
        document.querySelector('.sun').classList = 'moon';
      }
    } else {
      document.body.setAttribute('data-theme', '');
      if (document.querySelector('.moon')) {
        document.querySelector('.moon').classList = 'sun';
      }
    }
    document.getElementsByTagName('weather-title')[0].innerHTML = eval('`' + getFile('./components/title.html') + '`');
    document.getElementsByTagName('weather-extras')[0].innerHTML = eval('`' + getFile('./components/extras.html') + '`');
    document.getElementsByTagName('weather-hourly')[0].innerHTML = eval('`' + getFile('./components/hourly.html') + '`');
    document.getElementsByTagName('weather-daily')[0].innerHTML = eval('`' + getFile('./components/daily.html') + '`');
    document.getElementsByTagName('weather-indepth')[0].innerHTML = eval('`' + getFile('./components/indepth.html') + '`');
  },
  bigScreen: function (response) {
    var weather = response;
    console.log(weather);
    if (weather.tod === 'night') {
      document.body.setAttribute('data-theme', 'dark');
    }
    document.getElementsByTagName('weather-title')[0].innerHTML = eval('`' + getFile('./components/big/title.html') + '`');
    document.getElementsByTagName('weather-weekly')[0].innerHTML = eval('`' + getFile('./components/big/weekly.html') + '`');
    document.getElementsByTagName('weather-extras')[0].innerHTML = eval('`' + getFile('./components/big/extras.html') + '`');

  }
}

var app = document.querySelector('#application');

setInterval(function(){
  if (window.innerWidth <= 414) {
    if (app.getAttribute('data-size') != 'small') {
      let city;
      if (currentCity != null) {
        city = currentCity;
      } else {
        if (store.getCitiesArray().length > 0) {
          city = store.queryFavoriteCity().name;
        } else {
          city = 'irvine';
        }
      }

      if (currentCity !== city) {
        currentCity = city;
        w.getWeather(city, render.smallScreen);
      }
      currentCity = city;
      w.getWeather(city, render.smallScreen);

      app.setAttribute('data-size', 'small');
      app.innerHTML = eval('`' + getFile('./templates/small.html') + '`');

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
