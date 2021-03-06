import Vue from 'vue'
import { GetterTree } from 'vuex'
import { Heater, Fan, SocketState, TimeEstimates, Sensor, Chart, ChartDataSet, RunoutSensor, BedMesh, Endstops } from './types'
import { Thumbnail } from '@/store/files/types'
import { RootState } from '../types'
import { chartConfiguration } from '@/globals'
import { TinyColor } from '@ctrl/tinycolor'
import { get, isFinite } from 'lodash-es'
import { getThumb } from '../helpers'

export const getters: GetterTree<SocketState, RootState> = {
  /**
   * Indicates if our socket is connected / open.
   */
  getConnectionState: (state): boolean => {
    return state.open
  },

  /**
   * Indicates if our socket is attempting to connect still..
   */
  getConnectingState: (state): boolean => {
    return state.connecting
  },

  /**
   * Indicates if klippy is connected or not.
   */
  getKlippyConnected: (state): boolean => {
    // Valid states are;
    // ready, startup, shutdown, error
    if (
      state.printer.info.state !== 'ready' ||
      state.printer.webhooks.state !== 'ready'
      // state.printer.info.state === 'error' ||
      // state.printer.info.state === 'shutdown' ||
      // state.printer.webhooks.state === 'error' ||
      // state.printer.webhooks.state === 'shutdown'
    ) {
      return false
    }
    return true
  },

  getKlippyState: (state): string => {
    const state1 = state.printer.webhooks.state || ''
    const state2 = state.printer.info.state || ''

    if (state1 === state2) {
      return Vue.$filters.capitalize(state1)
    }
    if (state1 !== 'ready') {
      return Vue.$filters.capitalize(state1)
    }
    if (state2 !== 'ready') {
      return Vue.$filters.capitalize(state2)
    }
    return state1
  },

  getKlippyStateMessage: (state): string => {
    // If an external source fires an estop, or the client
    // is refreshed while klipper is down - the webhook data maybe invalid
    // but the printer info should be good.
    let message = ''
    if (
      state.printer.webhooks.state_message &&
      state.printer.webhooks.state_message !== ''
    ) {
      message = state.printer.webhooks.state_message
    } else {
      if (state.printer.info.state_message) {
        message = state.printer.info.state_message
      }
    }
    return message.trim().replace(/(?:\r\n|\r|\n)/g, '<br />')
  },

  /**
   * Returns a string value indicating the state of the printer.
   */
  getPrinterState: (state): string => {
    const state1 = state.printer.idle_timeout.state // printing, ready, idle
    const state2 = state.printer.print_stats.state // printing, paused, standby, complete
    // If the idle state says we're printing, bnut the print_stats say otherwise - then
    // we're probably busy moving the toolhead or doing some other process.
    // Possible values are;
    // printing, busy, paused, ready, idle, standby
    if (state1 && state2) {
      if (
        state2.toLowerCase() === 'paused'
      ) {
        return state2
      }
      if (
        state1.toLowerCase() === 'printing' &&
        state2.toLowerCase() !== 'printing'
      ) {
        // The printers idle_timeout changes to printing when it's busy applying
        // some change - but not necessarily printing anything. This state hopefully
        // helps aleviate that confusion.
        return 'Busy'
      }
      return state1
    } else {
      return 'Loading'
    }
  },

  getPrintImage: (state) => {
    let thumb: Thumbnail | undefined
    if (state.printer.current_file) {
      thumb = getThumb(state.printer.current_file)
    }
    return thumb
  },

  /**
   * Returns an object representing the time estimates of a current print.
   */
  getTimeEstimates: (state) => (type: 'slicer' | 'file' | 'filament' | 'totals'): TimeEstimates => {
    const progress = (
      !state.printer.display_status.progress ||
      isNaN(+state.printer.display_status.progress) ||
      !isFinite(+state.printer.display_status.progress)
    )
      ? 0
      : state.printer.display_status.progress

    const duration = (
      !state.printer.print_stats.print_duration ||
      isNaN(+state.printer.print_stats.print_duration) ||
      !isFinite(+state.printer.print_stats.print_duration)
    )
      ? 0
      : state.printer.print_stats.print_duration

    const usedFilament = (
      !state.printer.print_stats.filament_used ||
      isNaN(+state.printer.print_stats.filament_used) ||
      !isFinite(+state.printer.print_stats.filament_used)
    )
      ? 0
      : state.printer.print_stats.filament_used

    const estimatedFilament = (
      !state.printer.current_file.filament_total ||
      isNaN(+state.printer.current_file.filament_total) ||
      !isFinite(+state.printer.current_file.filament_total)
    )
      ? 0
      : state.printer.current_file.filament_total

    let timeLeft = 0
    let totalDuration = 0

    switch (type) {
      case 'slicer': {
        totalDuration = (state.printer.current_file.estimated_time > 0) ? state.printer.current_file.estimated_time : duration
        timeLeft = totalDuration - duration
        break
      }
      case 'filament': {
        totalDuration = duration / (usedFilament / estimatedFilament)
        timeLeft = totalDuration - duration
        break
      }
      case 'file': {
        totalDuration = duration / (progress)
        timeLeft = totalDuration - duration
        break
      }
      case 'totals': { // totals only.
        totalDuration = 0
        timeLeft = 0
        break
      }
      default: { // totals only.
        totalDuration = 0
        timeLeft = 0
      }
    }

    totalDuration = (
      isNaN(+totalDuration) ||
      !isFinite(+totalDuration)
    )
      ? 0
      : totalDuration

    timeLeft = (
      isNaN(+timeLeft) ||
      !isFinite(+timeLeft)
    )
      ? 0
      : timeLeft

    const o = {
      type,
      progress: (progress * 100).toFixed(),
      timeLeft: Vue.$filters.formatCounterTime(timeLeft),
      duration: Vue.$filters.formatCounterTime(duration),
      totalDuration: Vue.$filters.formatCounterTime(totalDuration) // estimated total duration
    }
    return o
  },

  /**
   * Given axes, returns a boolean indicating if the axes are homed.
   */
  getHomedAxes: (state) => (axes?: string): boolean => {
    if (axes && axes.length > 0) {
      let r = false
      const a = axes.split('')
      a.forEach((char) => {
        r = state.printer.toolhead.homed_axes.includes(char)
      })
      return r
    }
    return false
  },

  /**
   * Return a runout sensor's data by name
   */
  getRunoutSensorByName: (state) => (name: string): RunoutSensor | undefined => {
    const sensor = get(state.printer, 'filament_switch_sensor ' + name, undefined)
    if (sensor) {
      return {
        name,
        ...sensor
      }
    }
    return undefined
  },

  getRunoutSensors: (state): RunoutSensor[] => {
    const supportedSensors = ['filament_switch_sensor']
    const sensors: RunoutSensor[] = []
    for (const item in state.printer) {
      const split = item.split(' ')

      if (supportedSensors.includes(split[0])) {
        const name = (split.length > 1) ? split[1] : item
        const sensor = get(state.printer, 'filament_switch_sensor ' + name, undefined)
        sensors.push({
          name,
          ...sensor
        })
      }
    }
    return sensors
  },

  /**
   * Has this printer been configured for bed meshes?
   */
  getSupportsBedMesh: (state) => {
    return (state.printer.configfile.config.bed_mesh)
  },

  /**
   * Returns all available bed meshes, including those only in memory / currently loaded.
   */
  getBedMeshes: (state): BedMesh[] => {
    const meshes: BedMesh[] = []
    let currentProfile = ''
    if (state.printer.bed_mesh) {
      currentProfile = state.printer.bed_mesh.profile_name
    }
    if (state.printer.configfile && state.printer.configfile.config) {
      for (const item in state.printer.configfile.config) {
        if (item.includes(' ')) {
          const split = item.split(' ')
          if (
            split.length > 0 &&
            split[0] === 'bed_mesh'
          ) {
            const profile: BedMesh = {
              profile_name: split[1],
              active: false
            }
            if (currentProfile === split[1]) profile.active = true
            meshes.push(profile)
          }
        }
      }
    }
    return meshes.sort((a: BedMesh, b: BedMesh) => {
      const name1 = a.profile_name.toLowerCase()
      const name2 = b.profile_name.toLowerCase()
      if (a.profile_name === 'default' || b.profile_name === 'default') return 1
      return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0
    })
  },

  getEndstops: (state): Endstops => {
    if (
      state.endstops
    ) {
      const sorted: Endstops = {}
      Object.keys(state.endstops).sort().forEach((key) => {
        sorted[key] = state.endstops[key]
      })
      return sorted
    }
    return {}
  },

  /**
   * Return available heaters
   */
  getHeaters: (state): Heater[] => {
    if (
      state.printer.heaters.available_heaters &&
      state.printer.heaters.available_heaters.length
    ) {
      const r: Heater[] = []
      state.printer.heaters.available_heaters.forEach((e: string) => {
        const heater = state.printer[e]
        if (heater && Object.keys(heater).length > 0) {
          const config = (state.printer.configfile.config[e]) ? state.printer.configfile.config[e] : undefined
          let name = e
          // Some heater items may have a prefix determining type.
          // Check for these and split as necessary.
          const keys = [
            'heater_generic'
          ]
          const split = e.split(' ')
          if (split.length > 1 && keys.includes(split[0])) {
            split.shift()
            name = split.join(' ')
          }
          r.push({
            name,
            ...heater,
            minTemp: (config && config.min_temp) ? parseInt(config.min_temp) : null,
            maxTemp: (config && config.max_temp) ? parseInt(config.max_temp) : null
          })
        }
      })
      return r.sort((a: Heater, b: Heater) => {
        const name1 = a.name.toUpperCase()
        const name2 = b.name.toUpperCase()
        return (name1 < name2) ? -1 : (name1 > name2) ? 1 : 0
      })
    }
    return []
  },

  /**
  * Return available fans
  */
  getFans: (state) => (filter?: string[]): Fan[] => {
    const supportedFans = (filter && filter.length)
      ? filter
      : [
        'temperature_fan',
        'controller_fan',
        'heater_fan',
        'fan_generic',
        'fan'
      ]

    const controllableFans = [
      'fan'
    ]

    const fans: Fan[] = []

    for (const item in state.printer) {
      const split = item.split(' ')

      if (supportedFans.includes(split[0])) {
        const name = (split.length > 1) ? split[1] : item
        let prettyName = (name === 'fan') ? 'Part Fan' : Vue.$filters.startCase(name)
        if (!name.endsWith('fan')) prettyName += ' Fan'
        const type = (split.length) ? split[0] : item
        const config = (state.printer.configfile.config[item]) ? state.printer.configfile.config[item] : undefined
        const fan = {
          ...state.printer[item],
          ...config,
          name,
          prettyName,
          type,
          controllable: (controllableFans.includes(split[0])),
          minTemp: (config && config.min_temp) ? parseInt(config.min_temp) : null,
          maxTemp: (config && config.max_temp) ? parseInt(config.max_temp) : null
        }
        fans.push(fan)
      }
    }
    return fans
  },

  /**
   * Return available temperature probes / sensors.
   */
  getSensors: (state): Sensor[] => {
    const supportedSensors = [
      'temperature_sensor',
      'temperature_probe'
    ]
    const sensors: Sensor[] = []
    for (const item in state.printer) {
      const split = item.split(' ')

      if (supportedSensors.includes(split[0])) {
        const name = (split.length > 1) ? split[1] : item
        const type = (split.length) ? split[0] : item
        const config = (state.printer.configfile.config[item]) ? state.printer.configfile.config[item] : undefined
        const sensor = {
          ...state.printer[item],
          ...config,
          minTemp: (config && config.min_temp) ? parseInt(config.min_temp) : null,
          maxTemp: (config && config.max_temp) ? parseInt(config.max_temp) : null,
          name,
          type
        }
        sensors.push(sensor)
      }
    }
    return sensors
  },

  /**
   * Return macros that are visible on the dashboard.
   */
  getVisibleMacros: (state) => {
    const macros: string[] = []
    for (const macro in state.macros) {
      if (state.macros[macro].visible) {
        macros.push(macro)
      }
    }
    return macros
  },

  /**
   * Determine if we have a specific wait, or list of waits active or not.
   */
  hasWait: (state) => (wait: string | string[]): boolean => {
    if (Array.isArray(wait) && wait.length) {
      let waits = wait as string[]
      waits = waits.filter(val => state.waits.includes(val))
      return (waits.length > 0)
    } else {
      wait = wait as string
      return state.waits.includes(wait)
    }
  },

  /**
   * Determine if we have any waits.
   */
  hasWaits: (state) => {
    return state.waits.length > 0
  },

  getChartData: (state) => {
    const chartData: Chart = {
      labels: [],
      datasets: []
    }

    state.chart.forEach((item) => {
      // Based on the name of this sensor, pick appropriate colors.
      // Beds should probably be some variation of blue;
      // Hotends should be some variation of red;
      // Other sensors can hue off'f green.
      const defaults: ChartDataSet = {
        data: item.data,
        label: item.label,
        display: false,
        radius: item.radius,
        spanGaps: true,
        borderWidth: 1
      }

      let isTarget = false
      let namedColor = chartConfiguration.COLORS.NAMED[item.label]

      if (item.label.includes('Target')) {
        isTarget = true
        namedColor = chartConfiguration.COLORS.NAMED[item.label.replace('Target', '')]
      }

      if (namedColor) {
        if (isTarget) {
          defaults.fill = false
          defaults.borderColor = new TinyColor(namedColor).lighten(25).toRgbString()
        } else {
          defaults.fill = true
          defaults.borderColor = new TinyColor(namedColor).toRgbString()
          defaults.backgroundColor = new TinyColor(namedColor).setAlpha(0.1).toRgbString()
        }
      }
      chartData.datasets.push(defaults)
    })
    return chartData
  }

}
