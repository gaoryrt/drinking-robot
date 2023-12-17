// 轮询发送消息
//todo 
const axios = require('axios');
const cron = require('node-cron');
const { getConfig } = require('./config');
const { config } = require('dotenv');
require('dotenv').config();
// 企业微信机器人的Webhook URL
const front_address = process.env.FRONT_ADDRESS
// Cron语法："* * * * * *"代表 "秒 分 时 日 月 周"
const messageList = [
  {
    "msgtype": "text",
    "text": {
      "content": `当你的bug解决不了，这时候多喝水就对辣，多喝水没事，没事多喝水，多喝水多喝水多喝水......`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `喝水是保持身体健康的重要一步。记得多喝水，规律饮水，保持体内水平衡。`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `每天喝足够的水有助于提高注意力和警觉性。定时提醒自己多喝水吧！`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `水是生命之源，不要忘记给身体提供充足的水分。设定提醒，不要让自己渴望。`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `喝水只有0次和无数次，多多喝水，多多益善`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `react最佳实践：每编写100行代码，就来杯水，让思维清晰如水流。`,
    }
  },
  {
    "msgtype": "text",
    "text": {
      "content": `上班的秘诀之一：定时喝水，定时上厕所。水能提神，厕所能解乏！`,
    }
  }
];
async function schedule(){
  const configList = await getConfig();
  // todo getwebhookURL
  Object.values(configList).forEach((data)=>{
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
    const reminderInterval = timeInterval / (frequency+1);
    
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
    
  
    const initalMessage = {
      "msgtype": "markdown",
      "markdown": {
        "content": `# 多喝水没事，没事多喝水，超爱喝水每天为你提醒喝水 \n
        > 提醒喝水时间段：${data.startTime}~${data.endTime} \n
        > 每天提醒${data.frequency}次 \n
        > ${timeMessage} \n
        > [更多设置](${front_address}?webhookURL=${data.webhookURL}) \n
        `
      }
    }

    // // inital message    
    // axios.post(data.webhookURL,initalMessage) .then(response => {
    //   console.log('消息发送成功:', response.data);
    // })
    // .catch(error => {
    //   console.error('消息发送失败:', error);
    // });
    // 设置定时任务，每天的startTime~endTime发送消息
    // cronExpressions.forEach((time, index) => {
    //   cron.schedule(time, () => {
    //     axios.post(data.webhookURL, messageList[Math.floor(Math.random()*messageList.length)])
    //     .then(response => {
    //       console.log('消息发送成功:', response.data);
    //     })
    //     .catch(error => {
    //       console.error('消息发送失败:', error);
    //     });
    //   });
    // })
  })
}


schedule();