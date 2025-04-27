import { createApp } from 'vue'
import { vfmPlugin } from 'vue-final-modal'
import './style.css'
import App from './App.vue'

const root = createApp(App)
root.use(vfmPlugin)

root.mount('#app')
