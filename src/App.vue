<template>
  <div id="app">
    <canvas id="canvas-id" width="1024" height="1024" />
    <!-- <pre>{{this.mazeAscii}}</pre> -->
  </div>
</template>

<script>
import game from './game/game'
import { sidewinder, mazeToAscii} from './game/mazeGeneration'

export default {
  name: 'app',
  data: () => ({
    mazeAscii: ''
  }),
  mounted () {
    game()
    this.mazeAscii = mazeToAscii(sidewinder(20))
  }
}
</script>

<style>
html, body {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: block;
  /* width: 100%;
  height: 100%; */
}

#canvas-id {
  width: 48%;
  height: 48%;
  border-style: solid;
  border-width: 2px;
  margin: 5px;
  padding: 0;
  /* display: block; */
}
</style>
