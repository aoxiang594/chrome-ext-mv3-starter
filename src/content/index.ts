/* eslint-disable no-console */
import { onMessage, sendMessage } from "webext-bridge"

const messageList: string[] = []

function injectScript(url: string) {
    const s = document.createElement("script")
    s.type = "text/javascript"
    s.src = chrome.runtime.getURL(url)
    // s.onload = function() {
    //     this.remove()
    // };
    // console.info(s)
    document.head.appendChild(s)

}

injectScript("content/js/getData.global.js")
// injectScript('js/progressBar.js');
// injectScript('js/logData.js');

//todo timeout 来检查最近发送消息之类的
console.info("[chrome-ext-mv3-starter] Hello world from content script")

// communication example: send previous tab title from background page
// onMessage("tab-prev", ({ data }) => {
//     console.log(`[chrome-ext-mv3-starter] Navigate from page "${data.title}"`)
// })

document.addEventListener("get_chat_finish", (e) => {


    console.log("get_chat_finish")
    // @ts-ignore
    console.info(e.detail.list)
    let data: any = []
    // @ts-ignore
    e.detail.list.forEach((msg: any) => {
        let temp : any = [];
        temp = msg.data.filter((item: any) => {

            //business
            let match = item.text.match(/\d+/g)
            console.log(item.text);
            console.log(match)
            //|| item.text.match(/\d+/g).length > 8,数字的数量 > 8 是货单
            if (match === null || item.text.match(/\d+/g).length < 8) {
                // console.log(nowTime() + data.body.match(/\d+/g).length);
                return false
            }

            //todo check local message list exists
            console.log(messageList.indexOf(item.text))
            if (messageList.indexOf(item.text) > -1) {
                //exists in local message list
                return false
            }
            messageList.push(item.text)

            // console.log(item.text)
            return true
        })
        data = data.concat(temp)
    })
    console.log(data)


    sendMessage("new_chat", data, "background").then(r => {
        console.log(r)
    })
})

document.addEventListener("page_completed", () => {
    sendMessage("page_completed", {}, "background").then(r => {
        console.log(r)
    })
})

// document.addEventListener("start_tracking", (e) => {
//     // @ts-ignore
//     console.log(e.detail)
//     // document.dispatchEvent(new CustomEvent('start_tracking'));
// })


onMessage("start_tracking", async (message) => {
    console.log("background message" + JSON.stringify(message))
    document.dispatchEvent(new CustomEvent("start_tracking"))
})
// setTimeout(() => {
//     if(!isPageCompleted())
//     {
//
//     }
// }, 10000)


