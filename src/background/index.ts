import { onMessage, sendMessage } from "webext-bridge"

const TIME_STEP = 30 * 1000
chrome.runtime.onInstalled.addListener((): void => {
    // eslint-disable-next-line no-console
    console.log("Extension installed")
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type decleration
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    if (!previousTabId) {
        previousTabId = tabId
        return
    }
    const tab = await chrome.tabs.get(previousTabId)
    previousTabId = tabId
    if (!tab) return

    // eslint-disable-next-line no-console
    console.log("previous tab", tab)

})

// @ts-ignore
// onMessage("get-current-tab", async () => {
//     try {
//         const tab = await chrome.tabs.get(previousTabId)
//         return {
//             title: tab?.id
//         }
//     } catch {
//         return {
//             title: undefined
//         }
//     }
// })

onMessage("new_chat", async (message) => {
    console.log(message)
    const {
        sender,
        data
    } = message
    try {
        // //todo post to server and log in local
        console.log(sender)
        console.log(data)
        postData().then(() => {
            // 异步操作完成后，设置下一个闹钟
            //setNextAlarm()
            // console.log(data)
            sendMessage("start_tracking", { detail: { a: "asd" } }, { context: "content-script", tabId: sender.tabId })
        })

        // setTimeout(() => {
        //     sendMessage("start_tracking", { detail: { a: "asd" } }, { context: "content-script", tabId: sender.tabId })
        // }, TIME_STEP)
        return { status: "success", message: "后台收到聊天信息" }
    } catch {

    }
})

onMessage("page_completed", async () => {
    try {
        console.info("completed")
        return { status: "success" }
    } catch {

    }
})


// background.js

// 函数：设置下一个闹钟
function setNextAlarm() {
    chrome.alarms.create("oneMinuteAlarm", { delayInMinutes: 1 })
}

// 监听闹钟触发的事件
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "oneMinuteAlarm") {
        console.log("Alarm triggered! Time:", new Date().toLocaleTimeString())

        // 在这里执行你想要的动作
        // 例如，一些异步操作
        postData().then(() => {
            // 异步操作完成后，设置下一个闹钟
            setNextAlarm()
        })
    }
})

// 初始化：设置第一个闹钟
// setNextAlarm()

// 示例异步操作函数
function postData(): Promise<void> {
    return new Promise((resolve) => {
        console.log("等待 promise")
        // 这里执行一些异步任务
        setTimeout(() => {
            console.log("Async operation completed.")
            resolve()
        }, TIME_STEP) // 假设异步任务需要2秒钟
    })
}
