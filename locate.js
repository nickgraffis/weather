function autocomplete (str) {
  var settings = {
    url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key={APIKEY}&input=' + str,
    method: 'GET',
  }

  $.ajax(settings).done(function (response) {
    response.predictions.map(i => {
      $('#cityResults').append(`<li>${i.place_id}`);
    })
  })
}

module.exports = {
  autocomplete: autocomplete,
}
