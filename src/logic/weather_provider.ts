import {
  get_current_weather as get_current_weather_openmateo,
  get_hourly_forecast as get_hourly_forecast_openmateo,
  search as search_openmateo,
} from '@/openmateo/openmateoapi'

export type Weather = {
  temperature: number
  apparent_temperature: number
  precipitation: number
  humidity: number
  wind: number
  cloudcover: number
  approx_uv: number
  timestamp: string // GMT
  weather_code: string
  location: Location
  is_day: boolean | undefined
}

export type Location = {
  name: string
  country: string
  latitude: number
  longitude: number
}

export const get_current_weather = async (location: Location): Promise<Weather> => {
  const mateo_weather = await get_current_weather_openmateo(location.latitude, location.longitude)

  const timestamp_gmt_15: string = mateo_weather.current_weather!.time
  const current_index: number = mateo_weather.minutely_15!.time!.indexOf(timestamp_gmt_15)

  const current_direct_rad = mateo_weather.minutely_15!.direct_radiation![current_index]!
  const current_diff_rad = mateo_weather.minutely_15!.diffuse_radiation![current_index]!

  const approx_uv = (current_direct_rad + current_diff_rad) * 0.0016

  return {
    temperature: mateo_weather.current_weather!.temperature,
    apparent_temperature: mateo_weather.minutely_15!.apparent_temperature![current_index]!,
    precipitation: mateo_weather.minutely_15!.precipitation![current_index]!,
    humidity: mateo_weather.minutely_15!.relative_humidity_2m![current_index]!,
    wind: mateo_weather.current_weather!.windspeed!,
    cloudcover: mateo_weather.minutely_15!.cloudcover![current_index]!,
    approx_uv: approx_uv,
    timestamp: timestamp_gmt_15 + 'Z',
    weather_code: weather_code_to_string(mateo_weather.current_weather!.weathercode),
    location: location,
    is_day: mateo_weather.current_weather!.is_day,
  }
}

export const search_location = async (search_term: string): Promise<Location[]> => {
  const results = await search_openmateo(search_term)
  if (!results.results) {
    return []
  }
  return results.results.map((x) => ({
    name: x.name,
    country: x.country,
    latitude: x.latitude,
    longitude: x.longitude,
  }))
}

/**
 * @returns an array of Weather with 24 elements for the next 24 hours
 */
export const get_weather_forecast_next_24_hours = async (
  location: Location,
): Promise<Weather[]> => {
  const mateo_weather = await get_hourly_forecast_openmateo(location.latitude, location.longitude)

  const index = mateo_weather.hourly!.time!.findIndex(
    (x) => new Date(x + 'Z') > new Date(mateo_weather.current_weather!.time + 'Z'),
  )

  if (index == -1) {
    console.log('something went wrong')
    return []
  }

  const mateo_weathers_array = mateo_weather.hourly!
  const weathers: Weather[] = []

  for (let i = index; i < index + 24; i++) {
    const current_direct_rad = mateo_weathers_array.direct_radiation![i]!
    const current_diff_rad = mateo_weathers_array.diffuse_radiation![i]!

    const approx_uv = (current_direct_rad + current_diff_rad) * 0.0016

    weathers.push({
      temperature: mateo_weathers_array.temperature_2m![i]!,
      apparent_temperature: mateo_weathers_array.apparent_temperature![i]!,
      precipitation: mateo_weathers_array.precipitation![i]!,
      humidity: mateo_weathers_array.relative_humidity_2m![i]!,
      wind: mateo_weathers_array.windspeed_10m![i]!,
      cloudcover: mateo_weathers_array.cloudcover![i]!,
      approx_uv: approx_uv,
      timestamp: mateo_weathers_array.time![i]! + 'Z',
      weather_code: weather_code_to_string(mateo_weathers_array.weathercode![i]!),
      location: location,
      is_day: undefined,
    })
  }

  return weathers
}

const weather_code_to_string = (weather_code: number): string => {
  switch (weather_code) {
    // Clear / Cloudy
    case 0:
      return 'Clear sky'
    case 1:
      return 'Mainly clear'
    case 2:
      return 'Partly cloudy'
    case 3:
      return 'Overcast'

    // Fog / Mist
    case 45:
      return 'Fog'
    case 48:
      return 'Depositing rime fog'

    // Drizzle
    case 51:
      return 'Light drizzle'
    case 53:
      return 'Moderate drizzle'
    case 55:
      return 'Dense drizzle'
    case 56:
      return 'Light freezing drizzle'
    case 57:
      return 'Dense freezing drizzle'

    // Rain
    case 61:
      return 'Slight rain'
    case 63:
      return 'Moderate rain'
    case 65:
      return 'Heavy rain'
    case 66:
      return 'Light freezing rain'
    case 67:
      return 'Heavy freezing rain'

    // Snow
    case 71:
      return 'Slight snow fall'
    case 73:
      return 'Moderate snow fall'
    case 75:
      return 'Heavy snow fall'
    case 77:
      return 'Snow grains'

    // Showers
    case 80:
      return 'Slight rain showers'
    case 81:
      return 'Moderate rain showers'
    case 82:
      return 'Violent rain showers'

    // Snow showers
    case 85:
      return 'Slight snow showers'
    case 86:
      return 'Heavy snow showers'

    // Thunderstorms
    case 95:
      return 'Thunderstorm'
    case 96:
      return 'Thunderstorm with hail (moderate)'
    case 99:
      return 'Thunderstorm with hail (heavy)'

    default:
      return 'Unknown weather code'
  }
}

/**
 * Won't call any API
 *
 */
export const get_unique_location_id = (location: Location) => {
  return `${location.latitude}, ${location.longitude}`
}
