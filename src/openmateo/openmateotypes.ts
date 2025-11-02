import { z } from 'zod'

// ---------- CURRENT WEATHER ----------
export const CurrentWeatherUnitsSchema = z.object({
  time: z.string(),
  interval: z.string(),
  temperature: z.string(),
  windspeed: z.string(),
  winddirection: z.string(),
  is_day: z.string(),
  weathercode: z.string(),
})

export const CurrentWeatherSchema = z.object({
  time: z.string(), // ISO 8601
  interval: z.number(),
  temperature: z.number(),
  windspeed: z.number(),
  winddirection: z.number(),
  is_day: z.boolean(),
  weathercode: z.number(),
})

// ---------- HOURLY WEATHER ----------
export const HourlyUnitsSchema = z.object({
  time: z.string().optional(),
  temperature_2m: z.string().optional(),
  apparent_temperature: z.string().optional(),
  relative_humidity_2m: z.string().optional(),
  dew_point_2m: z.string().optional(),
  precipitation: z.string().optional(),
  rain: z.string().optional(),
  snowfall: z.string().optional(),
  weathercode: z.string().optional(),
  cloudcover: z.string().optional(),
  pressure_msl: z.string().optional(),
  surface_pressure: z.string().optional(),
  windspeed_10m: z.string().optional(),
  winddirection_10m: z.string().optional(),
  windgusts_10m: z.string().optional(),
  shortwave_radiation: z.string().optional(),
  direct_radiation: z.string().optional(),
  diffuse_radiation: z.string().optional(),
  evapotranspiration: z.string().optional(),
})

export const HourlySchema = z.object({
  time: z.array(z.string()).optional(),
  temperature_2m: z.array(z.number().nullable()).optional(),
  apparent_temperature: z.array(z.number().nullable()).optional(),
  relative_humidity_2m: z.array(z.number().nullable()).optional(),
  dew_point_2m: z.array(z.number().nullable()).optional(),
  precipitation: z.array(z.number().nullable()).optional(),
  rain: z.array(z.number().nullable()).optional(),
  snowfall: z.array(z.number().nullable()).optional(),
  weathercode: z.array(z.number().nullable()).optional(),
  cloudcover: z.array(z.number().nullable()).optional(),
  pressure_msl: z.array(z.number().nullable()).optional(),
  surface_pressure: z.array(z.number().nullable()).optional(),
  windspeed_10m: z.array(z.number().nullable()).optional(),
  winddirection_10m: z.array(z.number().nullable()).optional(),
  windgusts_10m: z.array(z.number().nullable()).optional(),
  shortwave_radiation: z.array(z.number().nullable()).optional(),
  direct_radiation: z.array(z.number().nullable()).optional(),
  diffuse_radiation: z.array(z.number().nullable()).optional(),
  evapotranspiration: z.array(z.number().nullable()).optional(),
})

// ---------- DAILY WEATHER ----------
export const DailyUnitsSchema = z.object({
  time: z.string().optional(),
  temperature_2m_max: z.string().optional(),
  temperature_2m_min: z.string().optional(),
  apparent_temperature_max: z.string().optional(),
  apparent_temperature_min: z.string().optional(),
  sunrise: z.string().optional(),
  sunset: z.string().optional(),
  daylight_duration: z.string().optional(),
  sunshine_duration: z.string().optional(),
  precipitation_sum: z.string().optional(),
  rain_sum: z.string().optional(),
  snowfall_sum: z.string().optional(),
  precipitation_hours: z.string().optional(),
  weathercode: z.string().optional(),
  windspeed_10m_max: z.string().optional(),
  windgusts_10m_max: z.string().optional(),
  winddirection_10m_dominant: z.string().optional(),
})

export const DailySchema = z.object({
  time: z.array(z.string()).optional(),
  temperature_2m_max: z.array(z.number().nullable()).optional(),
  temperature_2m_min: z.array(z.number().nullable()).optional(),
  apparent_temperature_max: z.array(z.number().nullable()).optional(),
  apparent_temperature_min: z.array(z.number().nullable()).optional(),
  sunrise: z.array(z.string().nullable()).optional(),
  sunset: z.array(z.string().nullable()).optional(),
  daylight_duration: z.array(z.number().nullable()).optional(),
  sunshine_duration: z.array(z.number().nullable()).optional(),
  precipitation_sum: z.array(z.number().nullable()).optional(),
  rain_sum: z.array(z.number().nullable()).optional(),
  snowfall_sum: z.array(z.number().nullable()).optional(),
  precipitation_hours: z.array(z.number().nullable()).optional(),
  weathercode: z.array(z.number().nullable()).optional(),
  windspeed_10m_max: z.array(z.number().nullable()).optional(),
  windgusts_10m_max: z.array(z.number().nullable()).optional(),
  winddirection_10m_dominant: z.array(z.number().nullable()).optional(),
})

// ---------- FORECAST METADATA ----------
export const ForecastMetadataSchema = z.object({
  forecast_start: z.string().optional(),
  forecast_end: z.string().optional(),
  forecast_interval: z.string().optional(),
  model: z.string().optional(),
})

// ---------- FULL RESPONSE ----------
export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),

  current_weather_units: CurrentWeatherUnitsSchema.optional(),
  current_weather: CurrentWeatherSchema.optional(),

  hourly_units: HourlyUnitsSchema.optional(),
  hourly: HourlySchema.optional(),

  daily_units: DailyUnitsSchema.optional(),
  daily: DailySchema.optional(),

  minutely_15_units: HourlyUnitsSchema.optional(), // optional section (same structure as hourly)
  minutely_15: HourlySchema.optional(),

  forecast_metadata: ForecastMetadataSchema.optional(),
})

// LOCATION SEARCH

export const LocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number(),
  feature_code: z.string(),
  country_code: z.string(),
  admin1_id: z.number(),
  admin2_id: z.number().optional(),
  admin3_id: z.number().optional(),
  timezone: z.string(),
  population: z.number().optional(),
  country_id: z.number(),
  country: z.string(),
  admin1: z.string(),
  admin2: z.string().optional(),
  admin3: z.string().optional(),
})

export const LocationSearchResponseSchema = z.object({
  generationtime_ms: z.number(),
  results: z.array(LocationSchema),
})
export type Location = z.infer<typeof LocationSchema>
export type LocationSearchResponse = z.infer<typeof LocationSearchResponseSchema>
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>
export type Weather = WeatherResponse
