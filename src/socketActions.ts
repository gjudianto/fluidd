import Vue from 'vue'
import store from '@/store'
import { Waits } from '@/globals'

// /printer/restart (klipper restart) (DONE)
// /printer/firmware_restart (klipper firmware_restart) (DONE)
// /server/restart (restart server?)

// /machine/shutdown (shutdown host) (DONE)
// /machine/reboot (reboot host) (DONE)

// /machine/services/restart?service=klipper
// /machine/services/restart?service=moonraker

export const SocketActions = {
  async machineServicesRestart (service: string) {
    const wait = Waits.onServiceRestart
    Vue.$socket.emit(
      'machine.services.restart', {
        dispatch: 'void',
        params: { service },
        wait
      }
    )
  },

  async machineReboot () {
    Vue.$socket.emit(
      'machine.reboot', {
        dispatch: 'void'
      }
    )
  },

  async machineShutdown () {
    Vue.$socket.emit(
      'machine.shutdown', {
        dispatch: 'void'
      }
    )
  },

  async machineUpdateStatus (refresh = false) {
    const wait = Waits.onForceUpdateCheck
    Vue.$socket.emit(
      'machine.update.status', {
        dispatch: 'version/onUpdateStatus',
        params: { refresh },
        wait
      }
    )
  },

  async machineUpdateMoonraker () {
    const wait = Waits.onUpdate
    Vue.$socket.emit(
      'machine.update.moonraker', {
        dispatch: 'version/onUpdatedMoonraker',
        wait
      }
    )
  },

  async machineUpdateKlipper () {
    const wait = Waits.onUpdate
    Vue.$socket.emit(
      'machine.update.klipper', {
        dispatch: 'version/onUpdatedKlipper',
        params: {
          include_deps: true
        },
        wait
      }
    )
  },

  async machineUpdateClient () {
    const wait = Waits.onUpdate
    Vue.$socket.emit(
      'machine.update.client', {
        dispatch: 'version/onUpdatedClient',
        wait
      }
    )
  },

  async machineUpdateSystem () {
    const wait = Waits.onUpdate
    Vue.$socket.emit(
      'machine.update.system', {
        dispatch: 'version/onUpdatedSystem',
        wait
      }
    )
  },

  async machineDevicePowerDevices () {
    Vue.$socket.emit(
      'machine.device_power.devices', {
        dispatch: 'devicePower/init'
      }
    )
  },

  async machineDevicePowerStatus (device: string) {
    Vue.$socket.emit(
      'machine.device_power.status', {
        dispatch: 'devicePower/onStatus',
        params: { [device]: null }
      }
    )
  },

  async machineDevicePowerToggle (device: string, state: string, wait?: string) {
    const emit = (state === 'on')
      ? 'machine.device_power.on'
      : 'machine.device_power.off'
    if (wait) store.dispatch('socket/addWait', wait)
    Vue.$socket.emit(
      emit, {
        dispatch: 'devicePower/onToggle',
        params: { [device]: null },
        wait
      }
    )
  },

  async printerInfo () {
    Vue.$socket.emit(
      'printer.info', {
        dispatch: 'socket/onPrinterInfo'
      }
    )
  },

  async printerRestart () {
    Vue.$socket.emit(
      'printer.restart', {
        dispatch: 'void',
        wait: Waits.onKlipperRestart
      }
    )
  },

  async printerFirmwareRestart () {
    Vue.$socket.emit(
      'printer.firmware_restart', {
        dispatch: 'void',
        wait: Waits.onKlipperFirmwareRestart
      }
    )
  },

  async printerQueryEndstops () {
    Vue.$socket.emit(
      'printer.query_endstops.status', {
        dispatch: 'socket/onQueryEndstops'
      }
    )
  },

  async printerObjectsList () {
    Vue.$socket.emit(
      'printer.objects.list', {
        dispatch: 'socket/onPrinterObjectsList'
      }
    )
  },

  async printerObjectsSubscribe (objects: {[key: string]: null}) {
    Vue.$socket.emit(
      'printer.objects.subscribe', {
        dispatch: 'socket/onPrinterObjectsSubscribe',
        params: {
          objects
        }
      }
    )
  },

  async printerPrintStart (path: string) {
    Vue.$socket.emit(
      'printer.print.start', {
        dispatch: 'void',
        params: {
          filename: path
        }
      }
    )
  },

  async printerPrintCancel () {
    store.dispatch('socket/addWait', Waits.onPrintCancel)
    Vue.$socket.emit(
      'printer.print.cancel', {
        dispatch: 'socket/onPrintCancel',
        wait: Waits.onPrintCancel
      }
    )
  },

  async printerPrintPause () {
    store.dispatch('socket/addWait', Waits.onPrintPause)
    Vue.$socket.emit(
      'printer.print.pause', {
        dispatch: 'socket/onPrintPause',
        wait: Waits.onPrintPause
      }
    )
  },

  async printerPrintResume () {
    store.dispatch('socket/addWait', Waits.onPrintResume)
    Vue.$socket.emit(
      'printer.print.resume', {
        dispatch: 'socket/onPrintResume',
        wait: Waits.onPrintResume
      }
    )
  },

  async printerGcodeScript (gcode: string, wait?: string) {
    if (wait) store.dispatch('socket/addWait', wait)
    Vue.$socket.emit(
      'printer.gcode.script', {
        dispatch: 'socket/onGcodeScript',
        params: {
          script: gcode
        },
        wait
      }
    )
  },

  async printerEmergencyStop () {
    Vue.$socket.emit(
      'printer.emergency_stop', {
        dispatch: 'socket/notifyKlippyDisconnected'
      }
    )
  },

  async serverInfo () {
    Vue.$socket.emit(
      'server.info', {
        dispatch: 'socket/onServerInfo'
      }
    )
  },

  async serverRestart () {
    Vue.$socket.emit(
      'server.restart', {
        dispatch: 'void'
      }
    )
  },

  async serverTemperatureStore () {
    Vue.$socket.emit(
      'server.temperature_store', {
        dispatch: 'socket/onTemperatureStore'
      }
    )
  },

  async serverGcodeStore () {
    Vue.$socket.emit(
      'server.gcode_store', {
        dispatch: 'socket/onGcodeStore'
      }
    )
  },

  /**
   * Loads the metadata for a given filepath.
   * Expects the full path including root.
   * Optionally pass the just the filename and path.
   */
  async serverFilesMetaData (filepath: string) {
    Vue.$socket.emit(
      'server.files.metadata', {
        dispatch: 'files/onFileUpdate',
        params: { filename: filepath }
      }
    )
  },

  /**
   * This only requires path, but we pass root along too
   * for brevity.
   */
  async serverFilesGetDirectory (root: string, path: string) {
    const wait = `${Waits.onGetDirectory}${path}`
    Vue.$socket.emit(
      'server.files.get_directory',
      {
        dispatch: 'files/onServerFilesGetDirectory',
        wait,
        params: { root, path, extended: true }
      }
    )
  },
  async serverFilesMove (source: string, dest: string) {
    Vue.$socket.emit(
      'server.files.move', {
        dispatch: 'void',
        params: {
          source,
          dest
        }
      }
    )
  },

  /**
   * Create a directory.
   * Root should be included in the path.
   */
  async serverFilesPostDirectory (path: string) {
    Vue.$socket.emit(
      'server.files.post_directory', {
        dispatch: 'void',
        params: {
          path
        }
      }
    )
  },

  async serverFilesDeleteFile (path: string) {
    Vue.$socket.emit(
      'server.files.delete_file', {
        dispatch: 'void',
        params: {
          path
        }
      }
    )
  },

  async serverFilesDeleteDirectory (path: string) {
    Vue.$socket.emit(
      'server.files.delete_directory', {
        dispatch: 'void',
        params: {
          path,
          force: false
        }
      }
    )
  }
}
