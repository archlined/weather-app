import { ref, type Ref } from 'vue'
import {
  type Weather,
  type Location,
  get_current_weather,
  get_weather_forecast_next_24_hours,
} from '@/logic/weather_provider'

import { get_unique_location_id } from '@/logic/weather_provider'

const local_storage_key = 'weathers'

export type SavedEntry = {
  updated_at_timestamp: string
  location: Location
  current_weather: Weather
  next_24hours_forecast: Weather[]
}

export type CreateSaveEntry = {
  location: Location
  current_weather: Weather
  next_24hours_forecast: Weather[]
}

export const saved: Ref<SavedEntry[]> = ref([])

// export const saved_weathers: Ref<Weather[]> = ref([])

export const save_and_sync_local_storage = (new_save: CreateSaveEntry) => {
  const already_there = saved.value.findIndex(
    (x) => get_unique_location_id(x.location) == get_unique_location_id(new_save.location),
  )

  if (already_there != -1) {
    console.log('Weather was already saved, updating it...')
    saved.value[already_there] = {
      ...new_save,
      updated_at_timestamp: new Date().getUTCDate().toString(),
    }
  } else {
    saved.value.push({
      ...new_save,
      updated_at_timestamp: new Date().getUTCDate().toString(),
    })
  }

  put_to_local_storage()
}

export const remove_and_sync_local_storage = (saved_location: Location) => {
  const found_save = saved.value.findIndex(
    (x) => get_unique_location_id(x.location) == get_unique_location_id(saved_location),
  )

  if (found_save == -1) {
    console.log('ERROR: Weather with ', saved_location, ' was not found in ', saved.value)
    console.log('There is nothing to remove')
    return
  }

  saved.value.splice(found_save, 1)
  put_to_local_storage()
}

const put_to_local_storage = () => {
  localStorage.setItem(local_storage_key, JSON.stringify(saved.value))
}

/**
 * Tries to load the saved weathers from local storage, it's fine if the they don't exist
 */
export const load_from_local_storage = () => {
  const weathers = localStorage.getItem(local_storage_key)
  if (!weathers) return

  saved.value = JSON.parse(weathers)
}

export const update_all_saved_weathers = async () => {
  const p_new_current_weathers = saved.value.map((x) => get_current_weather(x.location))
  const p_new_24hour_forecasts = saved.value.map((x) =>
    get_weather_forecast_next_24_hours(x.location),
  )

  try {
    const [new_current_weathers, new_24hour_forecasts] = await Promise.all([
      Promise.all(p_new_current_weathers),
      Promise.all(p_new_24hour_forecasts),
    ])

    saved.value.forEach((x, i) => {
      x.current_weather = new_current_weathers[i]!
      x.next_24hours_forecast = new_24hour_forecasts[i]!
    })
  } catch {
    console.log('Failed to update saved weathers')
  }
}
