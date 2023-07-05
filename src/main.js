import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import './index.css'
import ViewUiPlus from 'view-ui-plus';
import 'view-ui-plus/dist/styles/viewuiplus.css';
import { createPinia } from 'pinia';
const pinia = createPinia()
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import actions from './shared/action';
const initQianKun = () => {
    renderWithQiankun({
        // 当前应用在主应用中的生命周期
        // 文档 https://qiankun.umijs.org/zh/guide/getting-started#

        mount(props) {
            render(props.container)
            //  可以通过props读取主应用的参数：msg
            // 监听主应用传值
            props.onGlobalStateChange((res) => {
                // store.count = res.count
                // console.log(res.count)
            })
            actions.setActions(props)
        },
        bootstrap() { },
        unmount() { },
    })
}

const render = (container) => {
    // 如果是在主应用的环境下就挂载主应用的节点，否则挂载到本地
    const appDom = container ? container : "#app"
    createApp(App).use(router).use(pinia).use(ViewUiPlus).mount('#app')
}
// 判断当前应用是否在主应用中
qiankunWindow.__POWERED_BY_QIANKUN__ ? initQianKun() : render()

//createApp(App).use(router).use(pinia).use(ViewUiPlus).mount('#app')