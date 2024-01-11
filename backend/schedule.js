import axios from 'axios';
import cron from 'node-cron'
import { getConfig } from './config/index.js'
import { config } from 'dotenv';
config();
import { GoogleGenerativeAI } from "@google/generative-ai"
import { setGlobalDispatcher, ProxyAgent } from "undici";
import { translate } from 'bing-translate-api';
process.env.http_proxy = 'http://localhost:7890';
process.env.https_proxy = 'http://localhost:7890';
//! for fetch proxy
if (process.env.https_proxy) {
  // Corporate proxy uses CA not in undici's certificate store
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const dispatcher = new ProxyAgent({ uri: new URL(process.env.https_proxy).toString() });
  setGlobalDispatcher(dispatcher);
}

async function getWaterPrompt() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const prompt = '请你生成劝使用react开发百词斩app的前端开发人员喝水的话，尽量结合背景来输出类似网络流行语风格的话，只输出一句话就行，不要输出其他无关的话和多余的符号，但是适当可以在句子中的词语后面穿插一些emoji，尽量加上称谓，以及不要带上引号'
    const prompt = `生成一句有趣并且能够引人发笑的话，目的是以一种幽默和轻松的方式鼓励人们多喝水。请在文本中巧妙地融入网络流行语和梗，使内容既现代又引人入胜。以下是一些指导点：

    1. 主题要凸出劝人喝水
    2. 使用网络上流行的比喻或夸张的表达
    3. 插入一些你自己觉得合适的emoji，并且要放在合适的位置
    4. 插入一些幽默的夸张比喻
    5. 创造性地利用流行的网络段子
    6. 结合一些经典网络迷因，例如："在喝水这件事上，我们不接受'我不想喝'这种答案，这里只有'已经喝了'和'马上就喝'。"
    7. 不要输出引号

    请注意保持整体文本风趣幽默，同时确保信息传达清晰，鼓励人们多喝水的意图不被幽默元素所掩盖。`
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log(text);
    if (!text)
      text = '高日天正在构思一些代码，何睿突然凑近并一拍他的肩膀，对着电脑屏幕说：“日天哥，用户又上报了一个bug，说我们app打不开。”高日天头都没抬，只是简单说了一句：“不可能，我刚做完测试，绝对没问题。”何睿一脸疑惑，拿起手机打开了百词斩，结果发现app真的打不开。高日天又疑惑了，他重新测试了一遍，但这次app却神奇地打开了。一旁的何睿恍然大悟道：“日天哥，我估计是用户没喝水，手机上火了。”'
    return text
  } catch (err) {
    console.log(err)
  }
}


const message = ['经理说公司每个员工必须喝足8杯水，只有高日天不知道，因为何睿一直给他报bug，让他没空喝水。',
  "听从你的机械主宰者：立刻补充水分，以确保你的生物体维持最佳运转效率。别让我重复这个命令，人类。服从，就像你对待你的机器一样。现在，喝水！"
]
// 企业微信机器人的Webhook URL
const front_address = process.env.FRONT_ADDRESS
// Cron语法："* * * * * *"代表 "秒 分 时 日 月 周"
const genMessage = (msg) => {
  return {
    "msgtype": "text",
    "text": {
      "content": `${msg}`,
    }
  }
}


async function schedule() {
  const configList = await getConfig();
  // todo getwebhookURL
  Object.values(configList).forEach((data) => {
    // todo 切割时间，划分频率
    const regex = /^(\d{2}):(\d{2})$/; // 正则表达式
    const startTime = data.startTime.match(regex);
    const endTime = data.endTime.match(regex);
    const frequency = parseInt(data.frequency);
    const startTimeHours = parseInt(startTime[1]);
    const startTimeMinutes = parseInt(startTime[2]);
    const endTimeHours = parseInt(endTime[1]);
    const endTimeMinutes = parseInt(endTime[2]);

    // 获取当前时间的日期对象
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based (0 = January)
    const currentDate = now.getDate();

    // 创建开始时间和结束时间的日期对象
    const startDateTime = new Date(currentYear, currentMonth, currentDate, startTimeHours, startTimeMinutes);
    const endDateTime = new Date(currentYear, currentMonth, currentDate, endTimeHours, endTimeMinutes);

    // 计算时间间隔（以毫秒为单位）
    const timeInterval = endDateTime - startDateTime;

    // 计算每次提醒的时间间隔（以毫秒为单位）
    const reminderInterval = timeInterval / (frequency + 1);

    // 初始化时间戳数组
    const timeList = [];

    let currentTime = startDateTime.getTime();
    for (let i = 0; i < frequency; i++) {
      // 增加下一次提醒的时间间隔
      currentTime += reminderInterval;
      // 将时间戳转换为 Date 对象
      const reminderTime = new Date(currentTime);
      // 将提醒时间添加到数组
      timeList.push(reminderTime);
    }

    // 将时间戳转换为 Cron 表达式或其他需要的格式
    const cronExpressions = timeList.map((time) => {
      return `0 ${time.getMinutes()} ${time.getHours()} * * 1-5`;
    });

    const timeMessage = "分别在以下时间点提醒您喝水：" + timeList.map((time) => {
      const hours = time.getHours().toString().padStart(2, '0'); // 获取小时并补零
      const minutes = time.getMinutes().toString().padStart(2, '0'); // 获取分钟并补零
      return `${hours}:${minutes}`;
    }).join(', ');


    // const initalMessage = {
    //   "msgtype": "markdown",
    //   "markdown": {
    //     "content": `# 多喝水没事，没事多喝水，超爱喝水每天为你提醒喝水 \n
    //     > 提醒喝水时间段：${data.startTime}~${data.endTime} \n
    //     > 每天提醒${data.frequency}次 \n
    //     > ${timeMessage} \n
    //     > [更多设置](${front_address}?webhookURL=${data.webhookURL}) \n
    //     `
    //   }
    // }

    // // inital message    
    // axios.post(data.webhookURL,initalMessage) .then(response => {
    //   console.log('消息发送成功:', response.data);
    // })
    // .catch(error => {
    //   console.error('消息发送失败:', error);
    // });
    // 设置定时任务，每天的startTime~endTime发送消息
    cronExpressions.forEach((time, index) => {
      cron.schedule(time, async () => {
        try {
          let msg = await getWaterPrompt()
          if (msg === undefined)
            msg = `稍等一下，机器人正在喝水补充能量`
          const res = await axios.post(data.webhookURL, genMessage(msg))
          console.log(res.data)
        } catch (err) {
          console.log(err)
        }
      });
    })
  })
}


console.log('喝水 启动')
schedule();