<template>
  <div class="window">
    <header class="toolbar toolbar-header">
      <h1 class="title">Lan Scanner Demo (jslanscan)</h1>
      <div class="toolbar-actions">
        <div class="btn-group">
          <button class="btn btn-default">
            <span class="icon icon-target icon-text"></span>
            Refresh local IP
          </button>
          <button class="btn btn-default">
            <span class="icon icon-address icon-text"></span>
            Set IP range
          </button>
        </div>
        <button class="btn btn-default" @click="scanLAN">
          <span class="icon icon-flash icon-text"></span>
          Start LAN scan
        </button>

        <button class="btn btn-default pull-right">
          <span class="icon icon-tools icon-text"></span>
          Settings
        </button>

        <button class="btn btn-default btn-dropdown pull-right">
          <span>WebSockets</span>
        </button>
      </div>
    </header>
    <div class="window-content">
      <div class="pane-group">
        <div class="pane-sm sidebar">
          <ul class="list-group">
            <li class="list-group-item">
              <div class="media-body">
                <strong>Local IP</strong>
                <ul class="local-ip">
                  <li v-for="ip in localIP">{{ ip }}</li>
                </ul>
              </div>
            </li>
            <li class="list-group-item">
              <div class="media-body">
                <strong>Scan progress</strong>
                <p>{{ scanProgress }}%</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="pane">
          <table class="table-striped">
            <thead>
              <tr>
                <th>Host</th>
                <th>Alive</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="host in hosts">
                <td>{{ host.ip }}</td>
                <td class="alive">
                  <span v-if="host.alive" class="icon icon-check true"></span>
                  <span v-else class="icon icon-cancel false"></span>
                </td>
              </tr>
              <!-- <tr>
                <td>photon.css</td>
                <td>CSS</td>
                <td>28K</td>
              </tr>
              <tr>
                <td>photon.css</td>
                <td>CSS</td>
                <td>28K</td>
              </tr>
              <tr>
                <td>photon.css</td>
                <td>CSS</td>
                <td>28K</td>
              </tr>
              <tr>
                <td>photon.css</td>
                <td>CSS</td>
                <td>28K</td>
              </tr> -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <footer class="toolbar toolbar-footer">
      <div class="toolbar-actions">
        <button class="btn btn-primary btn-large scan">
          Scan local network
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
var LanScanner = require('../../static/jslanscan')

export default {
  name: 'demo',
  data () {
    return {
      localIP: [],
      scanning: false,
      scanProgress: 0,
      hosts: []
    }
  },
  methods: {
    updateLocalIp () {
      this.localIP = []
      this.scanner.getLocalIP((ip) => {
        this.localIP.push(ip)
      })
    },
    scanLAN (e) {
      this.hosts = []
      this.scanner.scanLan((host, status) => {
        this.hosts.push({
          ip: host,
          alive: status
        })
      }, 10, 'ws')
    }
  },
  mounted () {
    this.scanner = new LanScanner()
    this.updateLocalIp()
    this.scanner.progress((percentage) => {
      this.scanProgress = percentage
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.btn.scan {
  display: block;
  margin: auto;
}

.local-ip {
  padding-left: 0px;
}

.alive {
  font-size: 18px;

  .true {
    color: green;
  }
  .false {
    color: red;
  }
}
</style>
