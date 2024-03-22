//@ts-ignore
import { onMessage, sendMessage } from "webext-bridge"

const TIME_STEP = 10 * 1000
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

// @ts-ignore
onMessage("new_chat", async (message) => {
    console.log(message)
    //@ts-ignore
    const { sender,data } = message
    try {
        // //todo post to server and log in local

        sendHttpRequest('https://hangqing.naochou.cn/api/heartbeat', {});

        const apiUrl = 'https://hangqing.naochou.cn/api/whatsapp';
        let params = {
            text: "",
            time: "",
            author: {
                name: "",
                id: ""
            }

        }
        // @ts-ignore
        for (let i in data) {
            // @ts-ignore
            let item = data[i]
            params = {
                author: {
                    name: item.toUser,
                    id: "13870997279"
                },
                text: item.text,
                time: formatTimestamp(item.time)

            }
            console.log(params)
            try {
                const result = await sendHttpRequest(apiUrl, params);
                console.log(result);
            } catch (error) {
                console.error("Failed to send HTTP request:", error.message)
            }
        }


        // postData().then(() => {
        //     // 异步操作完成后，设置下一个闹钟
        //     //setNextAlarm()
        //     // console.log(data)
        //     sendMessage("start_tracking", { detail: { a: "asd" } }, { context: "content-script", tabId: sender.tabId })
        // })

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


//@ts-ignore
async function sendHttpRequest(url: string, data: any): Promise<any> {
    try {
        const response = await fetch(url, {
            method: "POST", // 或者 'GET'，具体取决于你的需求
            headers: {
                "Content-Type": "application/json" // 根据你的数据格式设置合适的 Content-Type
                // 其他可能需要的头部信息可以在这里添加
            },
            body: JSON.stringify(data) // 根据你的数据格式进行序列化
        })

        if (!response.ok) {
            throw new Error(`HTTP request failed with status ${response.status}`)
        }

        const responseData = await response.json() // 解析 JSON 响应
        return responseData
    } catch (error) {
        console.error("Error sending HTTP request:", error.message)
        throw error // 可以选择抛出异常，也可以根据需要处理错误
    }
}

function formatTimestamp(timestamp: string | number | Date) {
    let date = new Date(timestamp) // 将时间戳转换为 Date 对象

    let year = date.getFullYear() // 获取年份
    let month = (date.getMonth() + 1).toString().padStart(2, "0") // 获取月份，+1 是因为 getMonth() 返回的月份是从 0 开始的
    let day = date.getDate().toString().padStart(2, "0") // 获取日期

    let hours = date.getHours().toString().padStart(2, "0") // 获取小时
    let minutes = date.getMinutes().toString().padStart(2, "0") // 获取分钟
    let seconds = date.getSeconds().toString().padStart(2, "0") // 获取秒钟
    //console.log(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`)
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` // 返回格式化的日期时间字符串
}

//https://subscribe.fastcloud.host/api/v1/client/subscribe?token=e324be1d0e9508e94c83cc9bebc50152
