const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const currentWeatherOptions = ['weather', 'box', 'find', 'group'];
const excludeOptions = ['current', 'minutely', 'hourly', 'daily', 'alerts'];
const statisticalOptions = ['month', 'day'];
const accumulatedOptions = ['temperature', 'precipitation'];
const supportedLang = [
  { af: 'Afrikaans' },  { al: 'Albanian' },
  { ar: 'Arabic' },     { az: 'Azerbaijani' },
  { bg: 'Bulgarian' },  { ca: 'Catalan' },
  { cz: 'Czech' },      { da: 'Danish' },
  { de: 'German' },     { el: 'Greek' },
  { en: 'English' },    { eu: 'Basque' },
  { fa: 'Persian' },    { fi: 'Finnish' },
  { fr: 'French' },     { gl: 'Galician' },
  { he: 'Hebrew' },     { hi: 'Hindi' },
  { hr: 'Croatian' },   { hu: 'Hungarian' },
  { id: 'Indonesian' }, { it: 'Italian' },
  { ja: 'Japanese' },   { kr: 'Korean' },
  { la: 'Latvian' },    { lt: 'Lithuanian' },
  { mk: 'Macedonian' }, { no: 'Norwegian' },
  { nl: 'Dutch' },      { pl: 'Polish' },
  { pt: 'Portuguese' }, { pt_br: 'Português' },
  { ro: 'Romanian' },   { ru: 'Russian' },
  { sv: 'Swedish' }, {se: 'Swedish'},
  { sk: 'Slovak' }, { sl: 'Slovenian' },
  { sp: 'Spainish' }, { es: 'Spainish'},
  { sr: 'Serbian' },    { th: 'Thai' },
  { tr: 'Turkish' },    { ua: 'Ukrainian' },
  { uk: 'Ukrainian' },
  { vi: 'Vietnamese' }, { zh_cn: 'Chinese Simplified' },
  { zh_tw: 'Chinese Traditional' }, { zu: 'Zulu' }
];
const unitOptions = ['standard', 'imperial', 'metric'];
const opOptions = [
  { Op: 'PAC0', meaning: 'Convective precipitation', units: 'mm' },
  { Op: 'PR0', meaning: 'Precipitation intensity', units: 'mm/s' },
  { Op: 'PA0', meaning: 'Accumulated precipitation', units: 'mm' },
  {
    Op: 'PAR0',
    meaning: 'Accumulated precipitation - rain',
    units: 'mm'
  },
  {
    Op: 'PAS0',
    meaning: 'Accumulated precipitation - snow',
    units: 'mm'
  },
  { Op: 'SD0', meaning: 'Depth of snow', units: 'm' },
  {
    Op: 'WS10',
    meaning: 'Wind speed at an altitude of 10 meters',
    units: 'm/s'
  },
  {
    Op: 'WND',
    meaning: 'Joint display of speed wind (color) and wind direction (arrows), received by U and V components',
    units: 'm/s'
  },
  {
    Op: 'APM',
    meaning: 'Atmospheric pressure on mean sea level',
    units: 'hPa'
  },
  {
    Op: 'TA2',
    meaning: 'Air temperature at a height of 2 meters',
    units: '°C'
  },
  { Op: 'TD2', meaning: 'Temperature of a dew point', units: '°C' },
  { Op: 'TS0', meaning: 'Soil temperature 0-10 сm', units: 'K' },
  { Op: 'TS10', meaning: 'Soil temperature >10 сm', units: 'K' },
  { Op: 'HRD0', meaning: 'Relative humidity', units: '%' },
  { Op: 'CL', meaning: 'Cloudiness', units: '%' }
]

class OpenWeather {
  constructor (OPENWEATHER_APP_ID, version = 2.5) {
    this.weatherApiKey = OPENWEATHER_APP_ID;
    this.type;
    this.longitude;
    this.latitude;
    this.city;
    this.country;
    this.state;
    this.zip;
    this.ids;
    this.version = version;
    this.subdomain = 'api';
    this.base = `https://${this.subdomain}.openweathermap.org/data/${this.version}/`;
    this.url;
    this.method = 'GET';
    this.headers = null;
    this.body = null;
    this.call;
    this.options = [];
    this.error = null;
    this.response;
  }

  get excludeOptions () {
    return excludeOptions;
  }

  get currentWeatherOptions () {
    return currentWeatherOptions;
  }

  get statisticalOptions () {
    return statisticalOptions;
  }

  get accumulatedOptions () {
    return accumulatedOptions;
  }

  get supportedLang () {
    return supportedLang;
  }

  get opOptions () {
    return opOptions;
  }

  get unitOptions () {
    return unitOptions;
  }

  location (place, options = {state: null, country: null}) {
    if (typeof place === 'object') {
      this.type = place[0] ? 'ids' : 'coordinates';
      this.longitude = place[0] ? null :  place.lon;
      this.latitude = place[0] ? null : place.lat;
      this.ids = place[0] ? place : null;
    } else if (typeof place === 'number') {
      this.type = 'ids';
      this.ids = [place];
    } else {
      this.type = 'string';
      this.city = isNaN(parseInt(place)) ? place : null;
      this.zip = isNaN(parseInt(place)) ? null : parseInt(place);
      this.state = options.state;
      this.country = options.country;
    }
    return this;
  }

  locationString () {
    if (this.type === 'string') {
      return `${this.city ? 'q=' + this.city : ''}${this.zip ? 'zip=' + this.zip : ''}${this.state ? ',' + this.state : ''}${this.country ? ',' + this.country : ''}`;
    } else if (this.type === 'ids') {
      if (this.ids.length > 1) {
        return `id=${this.ids.slice(0, -1).join(',') + ',' + this.ids.slice(-1)}`;
      } else {
        return `id=${this.ids[0]}`;
      }
    } else {
      return `lat=${this.latitude}&lon=${this.longitude}`;
    }
  }

  urlString () {
    if (this.ids && this.ids.length > 1) {
      this.call = 'group';
    }

    let options = this.options.map(opt => `&${Object.keys(opt)}=${opt[Object.keys(opt)]}`).join('');
    this.url = `${this.base}${this.call}?${this.locationString()}${options}&appid=${this.weatherApiKey}`;

    return this.url;
  }

  units (units) {
    this.options.push({units});
    return this;
  }

  lang (lang) {
    this.options.push({lang});
    return this;
  }

  bbox (lonLeft, latBottom, lonRight, latTop, zoom) {
    this.options.push({bbox: `${lonLeft}, ${latBottom}, ${lonRight}, ${latTop}, ${zoom}`});
    return this;
  }

  cnt (cnt) {
    this.options.push({cnt});
    return this;
  }

  start (start) {
    this.options.push({start});
    return this;
  }

  end (end) {
    this.options.push({end});
    return this;
  }

  month (month) {
    this.options.push({month});
    return this;
  }

  day (day) {
    this.options.push({day});
    return this;
  }

  threshold (threshold) {
    this.options.push({threshold});
    return this;
  }

  exclude (option) {
    this.options.push({exclude: option});
    return this;
  }

  timemachine (dt) {
    this.call += '/timemachine';
    this.options.push({dt});
    return this;
  }

  current (zone = 'weather') {
    this.call = zone;
    return this.request();
  }

  hourly4Days () {
    this.call = 'forcast/hourly';
    return this.request();
  }

  oneCall () {
    this.call = 'onecall';
    return this.request();
  }

  daily16Days () {
    this.call = 'forcast/daily';
    return this.request();
  }

  climate30Days () {
    this.call = 'forcast/climate';
    return this.request();
  }

  bulk () {

  }

  roadRisk (array) {
    this.method = 'POST';
    this.call = 'roadrisk';
    this.body = JSON.stringify(array);
    this.headers = [{'Content-Type': 'application/json'}]
    return this.request();
  }

  fiveDay3Hour () {
    this.call = 'forcast';
    return this.request();
  }

  historical () {
    this.subdomain = 'history';
    this.call = 'history/city';
    this.options.push({type: 'hour'});
    return this.request();
  }

  statistical (type = null) {
    this.call = type ? 'aggregated/' + type : 'aggregated';
    this.subdomain = 'history';
    return this.request();
  }

  accumulated (type) {
    this.subdomain = 'history';
    this.call = '/history/accumulated_' + type;
    return this.request();
  }

  historyBulk () {

  }

  historicalByStateAllZipCodes () {

  }

  historicalForcasts () {

  }

  weatherMaps2 (op, z, x, y) {

  }

  globalPrecipitationMap () {

  }

  reliefMap () {

  }

  weatherMaps1 () {

  }

  weatherStations () {

  }

  weatherTriggers () {

  }

  uvIndex (type = null) {
    this.call = type ? 'uvi/' + type : 'uvi';
    return this.request();
  }

  request() {
    return new Promise((resolve, reject) => {
      let xhttp = new XMLHttpRequest();
      xhttp.that = this;
      if (this.headers) {
        headers.forEach(h => xhttp.setRequestHeader(h.header, h.value));
      }
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          xhttp.that.response = JSON.parse(xhttp.responseText);
          resolve(xhttp.that);
        } else if (this.readyState == 4 && this.status != 200) {
          reject(JSON.parse(xhttp.statusText));
        }
      };
      xhttp.open(this.method, this.urlString(), true);
      xhttp.send(this.body);
    });
  }
}

module.exports = OpenWeather;
