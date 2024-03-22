console.info('Get Data Load')
// import { sendMessage } from 'webext-bridge/content-script'

const getChatModule = e => e.default && e.default.Chat && e.default.Msg ? e.default : null
// const getConnModule = e => e.default && e.default.ref && e.default.refTTL ? e.default : null;
// const getDecryptModule = e => e.decryptE2EMedia ? e : null;
// const getDownloadManagerModule = e => e.default && e.DownloadManager ? e.default : null;

// for whatsapp web version 2.2226.5
const getChatModels = (result) => result.Chat.models || result.Chat._models
const getMsgModels = (chatModel) => chatModel.msgs.models || chatModel.msgs._models
const ID_KEY = '__x_id'
const CHAT_TITLE = '__x_formattedTitle'
const FROM_USER = '__x_from'
const TO_USER = '__x_to'
const MSG_TYPE = '__x_type'
// const MSG_KIND = '__x_kind'
const MSG_IS_GROUP = '__x_isGroup'
const SENT_TIME = '__x_t'
const MSG_TEXT = '__x_body'
const MSG_IMAGE_TEXT = '__x_caption';
const LOADING = '__x_pendingInitialLoading'
const msgType = ['chat', 'hsm','image']


window.addEventListener('getData', function(e) {
    log('GetData Event')
    const chunk = window.webpackChunkwhatsapp_web_client
    const { startDate, endDate } = e.detail
    // progressBar.initProgressBar();
    // console.info(e.detail)
    const exportData = (chatModels) => {
        try {
                let chatData = chatModels.map(chatModel => {
                    let user = chatModel[ID_KEY].user
                    let userName = chatModel[CHAT_TITLE]
                    let msgModels = getMsgModels(chatModel)
                    let msgs = msgModels.filter(msg => {
                    //log(msg['__x_type'],msg)
                    // log(msg)

                    if (msg[FROM_USER].user !== user && msg[TO_USER].user !== user) return false
                    if(msg[MSG_TYPE] === 'image' && msg[MSG_IMAGE_TEXT] === undefined)
                    {
                        //
                        //log(msg[MSG_IMAGE_TEXT])
                        //image no description
                        return false;
                    }
                    if (!msgType.includes(msg[MSG_TYPE])) return false
                    if (msg[SENT_TIME] * 1000 < startDate) return false
                    if (msg[SENT_TIME] * 1000 > endDate) return false

                    //log(msg[MSG_TYPE],msg,msg[MSG_TYPE] === 'image' ? msg[MSG_IMAGE_TEXT]:msg[MSG_TEXT])
                    // if (msg[MSG_KIND] !== 'group') return false
                    return true
                }).map(msg => {
                    // log(msg[MSG_TYPE],msg,msg[MSG_TYPE] === 'image' ? msg[MSG_IMAGE_TEXT]:msg[MSG_TEXT])
                    return {
                        text: msg[MSG_TYPE] === 'image' ? msg[MSG_IMAGE_TEXT]:msg[MSG_TEXT],
                        fromUser: msg[FROM_USER].user,
                        toUser: msg[TO_USER].user,
                        time: msg[SENT_TIME] * 1000
                    }
                })
                // log(msgs)
                return { data: msgs, user, userName }
            }).filter(chat => chat.data.length)
            log('Get Chat Over')
            webpackChunkwhatsapp_web_client.pop()
            window.dispatchEvent(new CustomEvent('get_chat_finish', { detail: { list: chatData } }))
            chatData = null
            msgModels = null
            msgs = null
            // post("https://hangqing.naochou.cn/api/whatsapp",{list:chatData}).then(res=>{
            //     log(res)
            // }).e
            // setTimeout(startTracking, TIME_STEP)
        } catch (error) {
            //logData.downloadLog(startDate, endDate, `${error.name}: ${error.message}`, chatModels);
        }
    }

    const callback = async (result, loadEarlierMsgs) => {
        try {
            let models = getChatModels(result)
            //logData.setLog(models, 'init');

            let loadMsgs = (chatModel, resolve) => {
                loadEarlierMsgs(chatModel).then(function(msgs) {
                    if (msgs && msgs.length > 0 && msgs[0][SENT_TIME] * 1000 >= startDate) {
                        loadMsgs(chatModel, resolve)
                    } else {
                        // progressBar.changeProgressText(models.length, chatModel[CHAT_TITLE]);
                        resolve()
                    }
                })
            }

            let loadChats = () => {
                let groupChat = models.filter((chatModel, i) => {
                    return getMsgModels(chatModel).length > 0 && chatModel[MSG_IS_GROUP]
                })
                const promiseArr = groupChat
                    .map((chatModel, index) => {
                        return new Promise((resolve) => {
                            loadMsgs(chatModel, resolve)
                        })
                    })
                Promise.all(promiseArr).then(() => {
                    exportData(groupChat)
                })

            }

            let loadStatus = (chatModel, resolve) => {
                loadEarlierMsgs(chatModel).then(function(msgs) {
                    resolve()
                })
            }

            let checkLoading = () => {
                setTimeout(() => {
                    const promiseArr = models
                        .map((chatModel, index) => {
                            return new Promise((resolve) => {
                                loadStatus(chatModel, resolve)
                            })
                        })
                    Promise.all(promiseArr).then(() => {
                        const isLoading = models.every(chatModel => chatModel[LOADING])
                        if (isLoading) {
                            checkLoading()
                        } else {
                            loadChats()
                        }
                    })
                }, 1500)
            }

            let isLoading = models.every(chatModel => chatModel[LOADING])
            if (isLoading) {
                // progressBar.changeProgressText(models.length, '', 'loading...');
                checkLoading()
            } else {
                loadChats()
            }
            checkLoading = null
            loadStatus = null
            // loadMsgs = null
            isLoading = null
        } catch (error) {
            //logData.downloadLog(startDate, endDate, `${error.name}: ${error.message}`, chatModels);
        }


    }

    chunk.push([
        [''],
        {},
        function(e) {
            let result = []
            for (let item in e.m) {

                result.push(e(item))
            }
            const load = result.find(item => {
                if (item && typeof item === 'object' && item.loadEarlierMsgs) {
                    return true
                }
                return false
            })
            for (let key in result) {
                if (result[key] && typeof result[key] === 'object') {
                    const foundedChat = getChatModule(result[key])
                    if (foundedChat) {
                        callback(foundedChat, load.loadEarlierMsgs)
                        break
                    }
                }
            }
        }
    ])
})

// document.addEventListener('finish', function(e) {
//     // progressBar.stopProgressBar();
//
// })

function checkPageCompleted() {

    let headers = document.getElementsByTagName('header')
    // if (window.webpackChunkwhatsapp_web_client) {
    if (headers.length > 0) {
        log('Completed')
        // document.dispatchEvent(new CustomEvent('page_completed'))
        // insertActionPanel()
        document.dispatchEvent(new CustomEvent('start_tracking'))
        // console.log( window.localStorage.getItem('wa_last_time'))
    } else {
        console.info('uncomplete')

        setTimeout(checkPageCompleted, 3000)
    }
}

//
document.addEventListener('start_tracking', function(e) {
    log('start_tracking')
    let date = new Date()

    let startDate = window.localStorage.getItem('wa_last_time') ?? date.getTime() - 86400000
    // let startDate = date.getTime() - 86400 * 100 * 1000
    let endDate = date.getTime()
    window.localStorage.setItem('wa_last_time', endDate)
    // document.getElementById('recent-info-text').innerText = formatTimestamp(endDate)
    // log('start get');
    window.dispatchEvent(new CustomEvent('getData', { detail: { startDate, endDate } }))
})
//
//
// function insertActionPanel() {
//     let panel = document.createElement('div')
//     panel.style.padding = '10px 16px'
//     panel.style.background = 'white'
//     panel.style.display = 'flex'
//
//     //insert avatar
//     let avatar = document.createElement('div')
//     avatar.style.paddingRight = '15px'
//     let avatarImg = document.createElement('img')
//     avatarImg.style.borderRadius = '50%'
//     avatarImg.style.height = '40px'
//     avatarImg.style.width = '40px'
//     avatarImg.style.cursor = 'pointer'
//     avatarImg.src = 'https://pps.whatsapp.net/v/t61.24694-24/406676026_392891869834707_5865521325507254358_n.jpg?stp=dst-jpg_s96x96&ccb=11-4&oh=01_AdSMnfszmsedtaYW8DiRSZpzdY3LEHNyHp5ACZxek4uRwg&oe=659777F1&_nc_sid=e6ed6c&_nc_cat=107'
//     avatar.appendChild(avatarImg)
//     // avatar.addEventListener('click', ()=>{
//     //     document.dispatchEvent(new CustomEvent('start_tracking'));
//     // })
//     panel.appendChild(avatar)
//
//     let box = document.createElement('div')
//     box.style.display = 'flex'
//     box.style.flexDirection = 'column'
//     let searchBox = document.createElement('div')
//     searchBox.innerHTML = '<span>Today:</span><b>92</b>'
//     //insert recent info
//     let recentInfo = document.createElement('div')
//     recentInfo.style.color = '#667781'
//     recentInfo.style.fontSize = '14px'
//     let recentInfoTitle = document.createElement('span')
//     let recentInfoText = document.createElement('span')
//     recentInfoTitle.innerText = 'Last Time:'
//     recentInfoText.innerText = ''
//     recentInfoText.id = 'recent-info-text'
//     recentInfo.appendChild(recentInfoTitle)
//     recentInfo.appendChild(recentInfoText)
//     panel.appendChild(recentInfo)
//     let headers = document.getElementsByTagName('header')
//     if (headers.length > 0) {
//         headers[0].parentNode.insertBefore(panel, headers[0])
//     }
// }


function formatTimestamp(timestamp) {
    let date = new Date(timestamp) // 将时间戳转换为 Date 对象

    let year = date.getFullYear() // 获取年份
    let month = (date.getMonth() + 1).toString().padStart(2, '0') // 获取月份，+1 是因为 getMonth() 返回的月份是从 0 开始的
    let day = date.getDate().toString().padStart(2, '0') // 获取日期

    let hours = date.getHours().toString().padStart(2, '0') // 获取小时
    let minutes = date.getMinutes().toString().padStart(2, '0') // 获取分钟
    let seconds = date.getSeconds().toString().padStart(2, '0') // 获取秒钟
    //log(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`)
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` // 返回格式化的日期时间字符串
}

function log(text) {
    console.log(formatTimestamp((new Date()).getTime()) + ': ' + text)
}

/**
 *
 * @param url
 * @param data
 * @returns {Promise<Response>}
 */
function post(url, data) {
    return fetchWithToken(url, { method: 'post', body: JSON.stringify(data) })
}

/**
 *
 * @param url
 * @returns {Promise<Response>}
 */
function get(url) {
    return fetchWithToken(url, { method: 'get' })
}

/**
 *
 * @param url
 * @param config
 * @returns {Promise<Response>}
 */
function fetchWithToken(url, config = {}) {
    let token = window.localStorage.getItem('wa_token')
    // 设置默认的 headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...config.headers
    }

    // 发起 fetch 请求
    return fetch(url, {
        ...config,
        headers
    })
}

checkPageCompleted()

