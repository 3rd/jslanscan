<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  background: #00c6ff;
  background: -webkit-linear-gradient(to right, #00c6ff, #0072ff);
  background: linear-gradient(to right, #00c6ff, #0072ff);
}
#app {
  color: #2c3e50;
  position: relative;
  width: 800px;
  height: 600px;
  margin: auto;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 100px;
}
</style>
