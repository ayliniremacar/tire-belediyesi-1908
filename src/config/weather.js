export const WEATHER_CONFIG = {
  // Tire'nin koordinatları: 38.0889, 27.7356
  LAT: 38.0889,
  LON: 27.7356,
  BASE_URL: 'https://api.open-meteo.com/v1/forecast'
};

export const getWeatherUrl = () => {
  return `${WEATHER_CONFIG.BASE_URL}?latitude=${WEATHER_CONFIG.LAT}&longitude=${WEATHER_CONFIG.LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
}; 