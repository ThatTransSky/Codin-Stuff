const request = require('request');

class WeatherAPIHandler {
  constructor(location, units) {
    // Replace YOUR_API_KEY with your actual API key
    this.apiKey = process.env.WEATHER_API_TOKEN;
    this.location = location;
    this.units = units;
  }

  /**
   * getCoordinates(): Calls the Geocoding API {@link https://openweathermap.org/api/geocoding-api}
   *
   * @method
   * @returns {Promise<Object>} A promise containing the latitude and longitude of the specified location.
   */

  getCoordinates() {
    // Set the base URL for the geocoding API
    const baseUrl = 'http://api.openweathermap.org/geo/1.0/direct?';
    // Build the full URL with the location and API key
    const fullUrl = `${baseUrl}q=${this.location}&limit=1&appid=${this.apiKey}`;

    return new Promise((resolve, reject) => {
      // Send a GET request to the API
      request.get(fullUrl, (error, response, body) => {
        // If the request was successful, resolve the promise with the coordinates
        if (response.statusCode === 200) {
          const data = JSON.parse(body);
          if (data && data.length > 0) {
            resolve({ lat: data[0].lat, lon: data[0].lon });
          } else {
            reject({
              message: `The location provided is invalid.\nPlease use the following format:\n\`{\``,
              data: data,
            });
          }
        } else {
          // If the request was unsuccessful, reject the promise with an error message
          reject(`Error: Could not retrieve coordinates for the specified location.`);
        }
      });
    });
  }
  /**
   * getWeather():
   *
   * @
   */
  getWeather(units) {
    // Set the base URL for the weather API
    const baseUrl = 'http://api.openweathermap.org/data/2.5/weather?';
    // Get the coordinates from the getCoordinates() method
    try {
      const coordinates = this.getCoordinates();
    } catch (err) {}
    // Build the full URL with the coordinates and API key
    const fullUrl = `${baseUrl}lat=${lat}&lon=${lon}&units=${units}&appid=${this.apiKey}`;

    return new Promise((resolve, reject) => {
      // Send a GET request to the API
      request.get(fullUrl, (error, response, body) => {
        // If the request was successful, resolve the promise with the weather data
        if (response.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          // If the request was unsuccessful, reject the promise with an error message
          reject(`Error: Could not retrieve weather data for the specified location.`);
        }
      });
    });
  }
}

module.exports = WeatherAPIHandler;
