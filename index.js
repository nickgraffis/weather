const w = require('./weather.js');

var searchShowing = false;

window.showSearch = function () {
  if (searchShowing) {
    $('#nav-bar').removeClass('h-screen');
    searchShowing= false;
  } else {
      $('#nav-bar').addClass('h-screen');
      searchShowing = true;
  }
}

function load() {
  w.getWeather('denver');
}

load();
