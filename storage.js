function createCityObject(id, name, favorite = false) {
  let object = {
    id: id,
    name: name,
    favorite: favorite,
  };

  return createCity(object);
}

function createCity(object) {
  let cities = getCitiesArray();
  if (queryCityByName(object.name)) {
    return 'City already in history';
  } else {
    cities.push(object);
    pushCityToLocalStorage(cities);
    return object;
  }
}

function pushCityToLocalStorage(array) {
  localStorage.setItem('cities', JSON.stringify(array));
  return true;
}

function getCitiesArray() {
  if (localStorage.getItem('cities')) {
    try {
      let cities = JSON.parse(localStorage.getItem('cities'));
      if (cities.length > 0) {
        return cities;
      } else {
        return [cities];
      }
    } catch {
      let cities = [localStorage.getItem('cities')];
      return cities;
    }
  } else {
    return [];
  }
}

function createCityId() {
  let ids = getCitiesArray().map(i => i.id);
  let i = 0;
  while(ids.includes(getCitiesArray().length + i)) {
    i++;
  }

  return getCitiesArray().length + i;
}

function queryCity(id) {
  let cities = getCitiesArray();

  for (let i = 0; i < cities.length; i++) {
    if (cities[i].id === id) {
      return cities[i];
    }
  }

  return false;
}

function queryCityByName(name) {
  let cities = getCitiesArray();

  for (let i = 0; i < cities.length; i++) {
    if (cities[i].name === name) {
      return cities[i];
    }
  }

  return false;
}

function queryFavoriteCity() {
  let cities = getCitiesArray();

  for (let i = 0; i < cities.length; i++) {
    if (cities[i].favorite) {
      return cities[i];
    }
  }

  return false;
}

function updateFavoriteCity(id) {
  let cities = getCitiesArray();

  cities.map(c => {
    if (c.id == id) c.favorite = true;
    if (c.id != id && c.favorite == true) c.favorite = false;
  });

  pushCityToLocalStorage(cities);

  return queryCity(id);
}

function indexOfObject(array, attribute, value) {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i][attribute] == value) {
      return i;
    }
  }

  return -1;
}

function deleteCity(id) {
  let isFav = queryFavoriteCity()
  let cities = getCitiesArray();
  let index = indexOfObject(cities, 'id', id);
  cities.splice(index, 1);

  pushCityToLocalStorage(cities);
  if (isFav.id == id) {
    let newFav = getCitiesArray()[0].id;
    updateFavoriteCity(newFav);
  }

  return false;
}

module.exports = {
  createCityObject: createCityObject,
  getCitiesArray: getCitiesArray,
  createCityId: createCityId,
  queryCity: queryCity,
  queryCityByName: queryCityByName,
  deleteCity: deleteCity,
  queryFavoriteCity: queryFavoriteCity,
  updateFavoriteCity: updateFavoriteCity
}
