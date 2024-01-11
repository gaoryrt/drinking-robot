import axios from 'axios'
import { config } from 'dotenv'
import { generateImageFiles, generateImagesLinks } from "./index.js"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { setGlobalDispatcher, ProxyAgent } from "undici";
import cron from 'node-cron'
config()

process.env.http_proxy = 'http://localhost:7890';
process.env.https_proxy = 'http://localhost:7890';
//! for fetch proxy
if (process.env.https_proxy) {
    // Corporate proxy uses CA not in undici's certificate store
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const dispatcher = new ProxyAgent({ uri: new URL(process.env.https_proxy).toString() });
    setGlobalDispatcher(dispatcher);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
async function drinkWater() {
    // todo 生成喝水的prompt
    const prompt = ''
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
}

const DEFAULT_WEATHER = '今天的天气是：xx~xx，多云，现在的温度是XX'
const locationId = 1815286
const lat = 30.53820937571849
const lon = 104.07017129606447
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=zh_cn&appid=${process.env.WEATHER_KEY}`;
// todo 如何查询天气
async function getWeather() {
    try {
        const res = await axios.get(WEATHER_URL)
        return {
            temperature: res.data.main.feels_like,
            sky: res.data.weather[0].description,
            ico: res.data.weather[0].icon
        }
    } catch (err) {
        console.log(err)
    }
}
// todo 今日诗词：https://v1.jinrishici.com/all
const DEFAULT_POEM = '落霞与孤鹜齐飞，秋水共长天一色'
const POEM_URL = "https://v1.jinrishici.com/all"
const POEM_WINTER_URL = "https://v1.jinrishici.com/siji/dongtian"
async function getPoem() {
    try {
        const res = await axios.get(POEM_WINTER_URL)
        return res.data.content

    } catch (err) {
        console.log(err)
    }
}

// install bingImageCreateor
// 模拟阻塞
function blockForSeconds(seconds) {
    const waitUntil = new Date(new Date().getTime() + seconds * 1000);
    while (waitUntil > new Date()) { }
    console.log('阻塞操作完成');
}
const MAX_RETRY = 50
async function makeImgAndSave(poem) {
    let retries = 0;
    while (retries < MAX_RETRY) {
        try {

            const result = await model.generateContent(`revise ${poem} to a DALL-E prompt about 50 words,only output prompt, do not output other words`)
            const response = await result.response
            const prompt = response.text()
            console.log(poem, "😰😰😰", prompt)
            const imageLinks = await generateImagesLinks(prompt); // returns an array of 4 image links
            return imageLinks
        } catch (err) {
            console.log('makeImg error', err)
        }
        retries++;
        blockForSeconds(1)
    }
}


// makeImgAndSave()
const title = ['Winter Is Coming']
async function run() {
    try {
        const weather = await getWeather()
        const poem = await getPoem() ?? DEFAULT_POEM
        const imageLinks = await makeImgAndSave(poem)
        const idx = poem.indexOf('，')
        const frontPoem = poem.slice(0, idx + 1)
        const endPoem = poem.slice(idx + 1, poem.length - 1)
        const webhook = "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=f8b44b78-4a2c-4053-a6ea-eecfbd80fcc5"
        const msg = {
            "msgtype": "news",
            "news": {
                "articles": [
                    {
                        "title": `Weather And Poem`,
                        "description": ``,
                        "url": `${imageLinks[0]}`,
                        "picurl": `${imageLinks[0]}`
                    },
                    {
                        "title": `温度：${weather.temperature}°C   ${weather.sky}`,
                        "description": ` `,
                        "url": `${imageLinks[1]}`,
                        "picurl": `${imageLinks[1]}`
                    },
                    {
                        "title": `${frontPoem}`,
                        "description": ``,
                        "url": `${imageLinks[2]}`,

                        "picurl": `${imageLinks[2]}`
                    },
                    {
                        "title": `${endPoem}`,
                        "description": ``,
                        "url": `${imageLinks[3]}`,
                        "picurl": `${imageLinks[3]}`
                    }
                ]
            }
        }
        // const fileData = fs.readFileSync("./OUT_DIR/2023-12-18 02:46:20.jpeg");
        // console.log(fileData)
        // const md5 = CryptoJS.MD5(fileData).toString()
        // const data = fileData.toString("base64");
        // console.log(md5)
        // const imgMsg = {
        //     "msgtype": "image",
        //     "image": {
        //         "base64": data,
        //         "md5": md5
        //     }
        // }
        const res = await axios.post(webhook, msg)
        console.log(res.data)
    } catch (err) {
        console.log(err)
    }
}

// run()

let time = '0 28 9 * * 1-5'
cron.schedule(time, () => {
    run()
})

let latest_ts = 1702633747
const getFrank = async () => {
    try {
        const res = await axios.get("https://frankenstein.gaoryrt.com/api/get?channel=frankenstein")
        return res.data.result.filter(item => item.ts > latest_ts)
    } catch (err) {
        console.log(err)
    }
}
const genMessage = (dataList) => {
    const content = dataList.reduce((acc, cur, idx) => {
        const res = `>${cur.cont} ${cur.nn}: <font color=\"warning\">[${cur.link}](${cur.link})</font>`
        latest_ts = Math.max(latest_ts, cur.ts)
        if (idx === dataList.length - 1)
            return acc + res
        else
            return acc + res + '\n'
    }, "")
    return {
        "msgtype": "markdown",
        "markdown": {
            "content": `#### <font color=\"info\">**白嫖缝合怪**</font>\n${content}`,
        }
    }
}
const sendFrank = async () => {
    try {
        // todo check new
        const dataList = await getFrank()
        if (dataList.length) {
            // https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0a12a053-f249-492a-83a4-5655437b9783
            await axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=dc2b66d3-c921-414d-addf-29a492d6a98f", genMessage(dataList))
            // const res = await axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0a12a053-f249-492a-83a4-5655437b9783"
            // , genMessage(dataList))
            return res.data
        }
    } catch (err) {
        console.log(err)
    }
}

const TIME = '0 0 18 * * 1-5'
cron.schedule(TIME,async ()=>{
    try{
        const msg = await sendFrank()
        console.log(msg)
    }catch(err){
        console.log(err)
    }
})