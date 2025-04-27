<template>
  <div>
    <h2>Communicate with Qt Backend</h2>
    <p>{{ message }}</p>
    <button @click="sendMessageToQt">Send Message to Qt</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const message = ref('Waiting for Qt backend connection...')
const qtObject = ref(null)

// 等待 Qt 对象可用
const waitForQt = () => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (typeof QWebChannel !== 'undefined' && qt && qt.webChannelTransport) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })
}
// 初始化 QWebChannel
const initQWebChannel = () => {
  if (typeof QWebChannel !== 'undefined' || !qt || !qt.webChannelTransport) {
    const qWebChannel = new QWebChannel(qt.webChannelTransport, (channel) => {
      // 获取 Qt 后端暴露的对象
      qtObject.value = channel.objects.qtObject
      message.value = 'Connected to Qt backend!'

      // 监听 Qt 后端发送的消息
      qtObject.value.receiveMessage.connect((msg) => {
        message.value = `Message from Qt: ${msg}`
      })
    })
  } else {
    console.error('QWebChannel is not defined!')
  }
}

// 发送消息到 Qt 后端
const sendMessageToQt = () => {
  if (qtObject.value) {
    const msg = 'Hello from Vue 3!'
    qtObject.value.sendMessage(msg)
    message.value = `Sent message to Qt: ${msg}`
  } else {
    message.value = 'Qt backend is not connected!'
  }
}

// 组件挂载时初始化 QWebChannel
onMounted(async () => {
  try {
    // 获取 WebSocket URL
    const wsUrl = window.getWebSocketUrl()
    console.log('Connecting to WebSocket:', wsUrl)

    // 初始化 WebSocket 连接（如果需要）
    const socket = new WebSocket(wsUrl)
    socket.onopen = () => {
      console.log('WebSocket connection established!')
    }
    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    // 等待 qt.webChannelTransport 可用
    // await waitForQt()
    initQWebChannel()
  } catch (error) {
    console.error('Failed to initialize QWebChannel:', error)
  }
})
</script>

<style scoped>
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>