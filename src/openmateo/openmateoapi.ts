import type { LocationSearchResponse, WeatherResponse } from './openmateotypes'

// The timestamps returned by these functions are in GTM/UTC time, but the string
// (WeatherResponse.current_weather.time and WeatherResponse.hourly.time and etc)
// does not contain the 'Z' at the end

export const get_current_weather = async (latitude: number, longitude: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true` +
      `&minutely_15=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,snowfall,shortwave_radiation,direct_radiation,diffuse_radiation,cloudcover,windspeed_10m,weathercode`,
  )
  const weather: WeatherResponse = await res.json()

  console.log(weather)

  return weather
}

export const get_minutely_15_forecast = async (latitude: number, longitude: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true` +
      `&minutely_15=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,snowfall,shortwave_radiation,direct_radiation,diffuse_radiation,cloudcover,windspeed_10m,weathercode`,
  )
  const weather: WeatherResponse = await res.json()

  console.log(weather)

  return weather
}

export const get_hourly_forecast = async (latitude: number, longitude: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true` +
      `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,snowfall,shortwave_radiation,direct_radiation,diffuse_radiation,cloudcover,windspeed_10m,weathercode`,
  )
  const weather: WeatherResponse = await res.json()

  console.log(weather)

  return weather
}

export const get_daily_forecast = async (latitude: number, longitude: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${latitude}&longitude=${longitude}` +
      `&current_weather=true` +
      `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,snowfall,shortwave_radiation,direct_radiation,diffuse_radiation,cloudcover,windspeed_10m,weathercode`,
  )
  const weather: WeatherResponse = await res.json()

  console.log(weather)

  return weather
}

export const search = async (search_term: string) => {
  const geo_response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search_term)}`,
  )
  const geo_data: LocationSearchResponse = await geo_response.json()

  console.log(geo_data)

  return geo_data
}
