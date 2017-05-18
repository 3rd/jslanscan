/*
  Minimal thread pool
*/
function StupidPool (threadCount, waitBetween) {
  this.threadCount = threadCount || 10
  this.waitBetween = waitBetween || 500
  this.pool = []
  this.next = 0
  this.resolved = 0
  this.events = {
    done: {
      emitted: false,
      handler: null
    },
    progress: {
      handler: null,
      last: -1
    }
  }
}

StupidPool.prototype.setThreadCount = function (threadCount) {
  this.threadCount = threadCount
}

StupidPool.prototype.push = function (fn) {
  this.pool.push(function (callback) {
    fn(callback)
  })
}

StupidPool.prototype.clear = function () {
  this.pool = []
}

StupidPool.prototype.runNext = function () {
  if (this.next < this.pool.length) {
    this.pool[this.next++].call(null, () => {
      this.resolved++
      this.emitProgress()
      setTimeout(() => {
        this.runNext()
      }, this.waitBetween)
    })
  } else {
    this.emitDone()
  }
}

StupidPool.prototype.run = function () {
  this.next = 0
  this.resolved = 0
  this.events.done.emitted = false
  this.events.progress.last = -1
  for (let i = 0; i < this.threadCount; i++) {
    this.runNext()
  }
}

StupidPool.prototype.emitDone = function () {
  if (!this.events.done.emitted && this.events.done.handler !== null) {
    this.events.done.handler.call(this)
  }
  this.events.done.emitted = true
}

StupidPool.prototype.emitProgress = function () {
  if (this.events.progress.handler !== null) {
    let total = this.pool.length
    let percentage = Math.floor(this.resolved * 100 / total)
    if (percentage > this.events.progress.last) {
      this.events.progress.last = percentage
      this.events.progress.handler.call(this, percentage)
    }
  }
}

StupidPool.prototype.done = function (callback) {
  this.events.done.handler = callback
}

StupidPool.prototype.progress = function (callback) {
  this.events.progress.handler = callback
}

/*
  Lan Scanner class

  Methods:
    - getLocalIP (callback) / Leverages RTCPeerConnection's information leak
    - getSubnetFromIP (ip) // Returns an array containing all the IPs in the same subnet
    - connect (host, callback, timeout) // Will probe a host to check if it's alive, will callback with bool
    - scan (host, handler, threadCount) // Will scan a list of hosts and callback the handler with the host IP and alive status (bool) of each
    - scanLan (handler, threadCount) // Just like scan() but gets the list of hosts by itself using getLocalIP()
*/

function LanScanner () {
  this.pool = new StupidPool()
}

LanScanner.prototype.getLocalIP = function (callback) {
  let RTC = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || false
  let connection = new RTC({
    iceServers: []
  })
  let regex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
  connection.createDataChannel('')
  connection.createOffer(connection.setLocalDescription.bind(connection), () => {})
  connection.onicecandidate = (ice) => {
    if (ice.candidate) {
      let matches = ice.candidate.candidate.match(regex)
      callback(matches[0])
    }
  }
}

LanScanner.prototype.getSubnetFromIP = function (ip) {
  let subnet = []
  let prefix = ip.split('.').slice(0, 3).join('.') + '.'
  for (let i = 1; i < 255; i++) {
    subnet.push(prefix + i)
  }
  return subnet
}

LanScanner.prototype.connect = function (host, callback, timeout) {
  timeout = timeout || 500
  let http = new XMLHttpRequest()
  http.timeout = timeout
  http.onerror = http.onload = function (e) {
    http = null
    callback(true)
  }
  http.ontimeout = function (e) {
    http = null
    callback(false)
  }
  http.open('GET', (window.location.protocol === 'https:' ? 'https:' : 'http:') + '//' + host + '/' + Math.random().toString(36), true)
  http.send()
}

LanScanner.prototype.scan = function (hosts, hostStatusHandler, threadCount) {
  threadCount = threadCount || 10
  this.pool.setThreadCount(threadCount)
  this.pool.clear()
  hosts.forEach((host) => {
    this.pool.push((notify) => {
      this.connect(host, function (status) {
        hostStatusHandler(host, status)
        notify()
      })
    })
  })
  this.pool.run()
}

LanScanner.prototype.scanLan = function (hostStatusHandler, threadCount) {
  threadCount = threadCount || 10
  this.pool.setThreadCount(threadCount)
  this.getLocalIP((ip) => {
    let hosts = this.getSubnetFromIP(ip)
    this.scan(hosts, hostStatusHandler, threadCount)
  })
}

LanScanner.prototype.done = function (callback) {
  this.pool.done(callback)
}

LanScanner.prototype.progress = function (callback) {
  this.pool.progress(callback)
}
