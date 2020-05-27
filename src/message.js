const utils = require('./utils');

/**
 * Creates message from template and weather data.
 * @param {object} weather
 * @param {object} cfg
 * @return {string}
 */
function createFrom(weather, cfg) {
  const template = cfg.template;
  return template
      .replace('<#TIME>', _formatTime(weather.time, cfg.timezoneOffset))
      .replace('<#WIND>', _formatWind(weather.wspeed, weather.wgust, weather.bearing, cfg.wind))
      .replace('<#RWY>', _formatRwy(weather.bearing, cfg.rwy))
      .replace('<#CIRCUIT>', _formatCircuit(weather.bearing, cfg.circuits))
      .replace('<#TEMP>', _formatTemperature(weather.temp, cfg.temperature))
      .replace('<#CLOUDBASE>', _formatCloudbase(weather.cloudbasevalue, cfg.cloudbase))
      .replace('<#QNH>', _formatQnh(weather.press));
}

/**
 * @param {string} time
 * @param {string} tzOffset
 * @return {string}
 * @private
 */
function _formatTime(time, tzOffset) {
  const split = time.split(':');
  const hours = parseInt(split[0]) - parseInt(tzOffset);
  return `${hours} ${split[1]} UTC`;
}

/**
 * @param {string} speed
 * @param {string} gust
 * @param {string} bearing
 * @param {object} cfg
 * @return {string}
 * @private
 */
function _formatWind(speed, gust, bearing, cfg) {
  speed = parseFloat(speed);
  if (speed < 2) {
    return cfg.calm;
  }
  const u = cfg.speedUnits;
  const g = gust - speed > 3 ? `. ${cfg.gust} ${Math.round(gust)} ${u}` : '';
  return `${Math.round(speed)} ${u}, ${bearing} ${cfg.bearingUnits}${g}`;
}

/**
 * @param {string} bearing
 * @param {object} cfg
 * @return {string}
 * @private
 */
function _formatRwy(bearing, cfg) {
  bearing = parseFloat(bearing);
  for (let i = 0; i < cfg.length; i++) {
    const c = cfg[i];
    const xs = c.condition.split(' ');
    const operator = xs[0];
    const value = xs[1];
    if (utils.operators.hasOwnProperty(operator) && utils.operators[operator](bearing, value)) {
      return c.number.padStart(2, '0').split('').join(' ') + ' ';
    }
  }
  return '';
}

/**
 * @param {string} bearing
 * @param {object} cfg
 * @return {string}
 * @private
 */
function _formatCircuit(bearing, cfg) {
  bearing = parseFloat(bearing);
  for (let i = 0; i < cfg.length; i++) {
    const c = cfg[i];
    const xs = c.condition.split(' ');
    const operator = xs[0];
    const value = xs[1];
    if (utils.operators.hasOwnProperty(operator) && utils.operators[operator](bearing, value)) {
      return c.text;
    }
  }
  return '';
}

/**
 * @param {string} temperature
 * @param {object} cfg
 * @return {string}
 * @private
 */
function _formatTemperature(temperature, cfg) {
  temperature = parseFloat(temperature);
  return `${Math.round(temperature).toString()} ${cfg.units}`;
}

/**
 * @param {string} cloudbase
 * @param {object} cfg
 * @return {string}
 * @private
 */
function _formatCloudbase(cloudbase, cfg) {
  return `${cloudbase} ${cfg.units}`;
}

/**
 * @param {string} pressure
 * @return {string}
 * @private
 */
function _formatQnh(pressure) {
  pressure = parseFloat(pressure);
  const string = Math.round(pressure).toString();
  return string.split('').join(' ');
}

exports.createFrom = createFrom;
