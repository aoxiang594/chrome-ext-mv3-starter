/* eslint-disable no-console */
import { onMessage, sendMessage } from "webext-bridge"

// const messageList: string[] = []

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

window.addEventListener("get_chat_finish", (e) => {


    // console.log("get_chat_finish")
    // console.log( window.localStorage.getItem('wa_last_time'))
    // setTimeout(()=>{
    //     let date = new Date()
    //     // console.log( window.localStorage.getItem('wa_last_time'))
    //     let startDate = window.localStorage.getItem('wa_last_time') ?? date.getTime() - 86400000
    //
    //     let endDate = date.getTime()
    //     // console.log(endDate)
    //     window.localStorage.setItem('wa_last_time', String(endDate))
    //
    //     window.dispatchEvent(new CustomEvent('getData', { detail: { startDate, endDate } }))
    // },15000)
    //@ts-ignore
    //console.info(e.detail.list)
    let data: any = []
    // @ts-ignore
    let messageList: Array<string>  = window.localStorage.getItem('wa_message_list') === null ?[]:JSON.parse(window.localStorage.getItem('wa_message_list'));

    // @ts-ignore
    e.detail.list.forEach((msg: any) => {
        let temp : any = [];
        temp = msg.data.filter((item: any) => {

            //business
            let match = item.text.match(/\d+/g)
            if (match === null || item.text.match(/\d+/g).length < 8) {
                // console.log(nowTime() + data.body.match(/\d+/g).length);
                return false
            }

            //todo check local message list exists
            // console.log(messageList.indexOf(item.text))
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
    window.localStorage.setItem('wa_message_list',JSON.stringify(messageList));
    // console.log(data)

    console.log("识别到:",data)
    sendMessage("new_chat", data, "background").then(r => {
        console.log(r)
    })
    setTimeout(()=>{
        document.dispatchEvent(new CustomEvent('start_tracking'))
    },10000)
})

window.addEventListener("page_completed", () => {
    sendMessage("page_completed", {}, "background").then(r => {
        console.log(r)
    })
})

// window.addEventListener("start_tracking", (e) => {
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


setTimeout(()=>{
    window.location.reload();
}, 5 * 60 * 1000)
// function convertEmojiToUTF16(str: string ) {
//     //@ts-ignore
//     return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(m:string) {
//         return m.charCodeAt(0) - 0xD800 << 10 | m.charCodeAt(1) - 0xDC00 | 0x10000;
//     });
// }
