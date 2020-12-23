# TODO [fluidd]

## Next Up
- draggable panels
- z-offset configuration + sheet config
- upload progress indicator
- add ability to delete bed mesh profile
- 
- update panel collapse so these are remembered per instance
- stage 1 themes (pick a specific theme (red, green etc..)
- ensure users can still download log files when the printer is not in an error state
- docker image
- load gcode help and implement in console
- show mm/s in status
- auto save printer settings?
- PID calibrate option via dialog maybe?
- Drag and Drop move.
- Add a way to specify a value for sliders

- self update
- draggable cards (vue-draggable)
- side panel hamburger gets notification circle (orange or red) which indicates something new.
- side panel itself gets an alert notifying of new updates
- side panel itself gets toggle to allow dragging panels or not
- side panel itself gets a button to save layouts?


## Refactoring / Core
- cleanup socket store / move socket out and keep printer data
- split utils mixin into many mixins, in a logical way
- add console.log wrapper for dev vs prod
- add a cached throttle to (socket notifications) temp updates, print timers, position trackers.
- Performance / memory heap checks

## Known Bugs:
- if you complete a print, then delete the original gcode;
  - then you can still attempt to reprint something that's no longer there and;
  - the metadata load fails because the file is no longer there.
- max_accel and max_accel_to_decel are actually floats, even tho they're potentially very large
  whole numbers. max_accel_to_decel is half of max_accel if not defined in your printer.cfg, so
  potentially returns a float (3001 / 2 === 1500.5). The v-slider doesn't really represent this
  at the moment tho. Is this a problem?

## General Improvements
- Bulk actions on files
- finish up update notification / pwa setup
- figure out https
- click / tap image camara update option (i.e., not constant image updates)
- probed vs mesh bed level display option
- should be able to force part speed fan during a print?
- add UI to filter out temp waits from console

## Filesystem Improvements:
- file expand details for metadata (needed tho?, maybe just for current print)
- ability to move folder / files

## [Page] UI Settings

## [Page] Printer Configuration
- add pid heater calibrate
- add stepper buzz
- add z endstop calibrate
- add widget for setting z offset during configuration
- add a widget to configure ztilt (needed?)

## User wants (not necessarily something we'll implement in the suggested way...)
- add QUERY_PROBE to endstops widget
- parse underscores out of macro names
- another request to have the current temps above the macors etc during a print, but not while not printing.
- draggable dashboard panels?
- maybe look at tightening the mobile ui. have fan's as a value, that you can click
  on which then makes a popout to adjust fan?
- gcode viewer
- gcode analyser
- ability to categorise / group macros and expand contract them
- Dry run. (print without extruding)
- Cancel object, cancel area,
- gcode viewer that works with more than 25mb
- timelapses
- plugins for raise cloud, astroprint and alike
- to remote access without vpn
- more security?