<template>
  <v-container fluid class="constrained-width px-2 px-sm-4">
    <v-row class="mt-0 mt-sm-2">
      <v-col cols="12" md="6" class="pt-0">
        <!-- <pre>{{ col1 }}</pre>
        <pre>{{ col2 }}</pre> -->
        <klippy-disconnected-card v-if="!klippyConnected"></klippy-disconnected-card>
        <status-card v-if="klippyConnected"></status-card>
        <draggable
          class="list-group"
          v-model="col1"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false"
        >
          <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <component v-for="c in col1" :is="c.name" :key="c.name"></component>
          </transition-group>
        </draggable>
      </v-col>
      <v-col cols="12" md="6" class="pt-0">
        <draggable
          class="list-group"
          v-model="col2"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false">
          <transition-group type="transition" :name="!drag ? 'flip-list' : null">
            <component v-for="c in col2" :is="c.name" :key="c.name"></component>
          </transition-group>
        </draggable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import draggable from 'vuedraggable'
import StatusCard from '@/components/cards/dashboard/StatusCard.vue'
import ToolsCard from '@/components/cards/dashboard/ToolsCard.vue'
import ToolheadCard from '@/components/cards/dashboard/ToolheadCard.vue'
import TemperatureTargetsCard from '@/components/cards/dashboard/TemperatureTargetsCard.vue'
import TemperatureGraphCard from '@/components/cards/dashboard/TemperatureGraphCard.vue'
import CameraCard from '@/components/cards/dashboard/CameraCard.vue'
import ConsoleCard from '@/components/cards/dashboard/ConsoleCard.vue'
import PrinterLimitsCard from '@/components/cards/dashboard/PrinterLimitsCard.vue'
import KlippyDisconnectedCard from '@/components/cards/KlippyDisconnectedCard.vue'
import UtilsMixin from '@/mixins/utils'

@Component({
  components: {
    draggable,
    StatusCard,
    ToolsCard,
    ToolheadCard,
    TemperatureTargetsCard,
    TemperatureGraphCard,
    CameraCard,
    PrinterLimitsCard,
    KlippyDisconnectedCard,
    ConsoleCard
  }
})
export default class Dashboard extends Mixins(UtilsMixin) {
  aCol1 = [
    { name: 'camera-card' },
    { name: 'toolhead-card' },
    { name: 'printer-limits-card' }
  ]

  aCol2 = [
    { name: 'tools-card' },
    { name: 'console-card' },
    { name: 'temperature-graph-card' }
  ]

  drag = false

  get cameraEnabled (): boolean {
    return this.$store.state.config.fileConfig.camera.enabled
  }

  get col1 (): Array<{ name: string }> {
    return this.aCol1.filter((s) => {
      if (s.name === 'camera-card' && !this.cameraEnabled) {
        return false
      }
      return true
    })
  }

  set col1 (val: Array<{ name: string }>) {
    this.aCol1 = val
  }

  get col2 (): Array<{ name: string }> {
    return this.aCol2
  }

  set col2 (val: Array<{ name: string }>) {
    this.aCol2 = val
  }

  get isInLayout (): boolean {
    return (this.$store.state.config.layoutMode)
  }

  get dragOptions () {
    return {
      animation: 200,
      group: 'dashboard',
      disabled: !this.isInLayout,
      ghostClass: 'ghost'
    }
  }
}
</script>

<style lang="scss" scoped>
  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  .ghost {
    opacity: 0.5;
    background: #ccc;
  }

  .list-group {
    min-height: 20px;

    span {
      display: flex;
      flex-direction: column;
    }
  }

</style>
