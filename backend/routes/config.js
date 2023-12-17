const express = require('express');
const axios = require('axios')
const { getConfig, saveConfig } = require('../config');
const router = express.Router();

// Middleware for data validation
function validateConfig(req, res, next) {
    const config = req.body;
    if (typeof config !== 'object' || config === null) {
        return res.status(400).send('Bad Request: config must be a JSON object.');
    }
    next();
}
// todo 增加 webhook参数
// Middleware for processing query parameter
function processWebhookURLParameter(req, res, next) {
    const { webhookURL } = req.body; // Extract the webhookURL query parameter
    if (!webhookURL) {
        return res.status(400).send('Bad Request: webhookURL query parameter is missing.');
    }
    next();
}

const postMiddleware = async (req, res, next) => {
    const data = req.body;
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
    
    const timeMessage = "分别在以下时间点提醒您喝水：" + timeList.map((time) => {
        const hours = time.getHours().toString().padStart(2, '0'); // 获取小时并补零
        const minutes = time.getMinutes().toString().padStart(2, '0'); // 获取分钟并补零
        return `${hours}:${minutes}`;
    }).join(', ');

    const initialMessage = {
        "msgtype": "markdown",
        "markdown": {
            "content": `# 多喝水没事，没事多喝水，超爱喝水每天为你提醒喝水 \n
            > 提醒喝水时间段：${req.body.startTime}~${req.body.endTime} \n
            > 每天提醒${req.body.frequency}次 \n
            > ${timeMessage} \n
            > [更多设置](${process.env.FRONT_ADDRESS}?webhookURL=${req.body.webhookURL}) \n
            `
        }
    }
    try {
        const response = await axios.post(req.body.webhookURL, initialMessage);
        console.log('Response from other server:', response.data);
    } catch (error) {
        console.error('Error sending request to other server:', error.message);
    }
    next();
};
// Middleware for reading existing configuration
async function readExistingConfig(req, res, next) {
    try {
        const existingConfig = await getConfig();
        req.existingConfig = existingConfig; // Attach existing configuration to the request object
        next();
    } catch (error) {
        res.status(500).send('Error reading existing configuration.');
    }
}
// Use middleware before the routes where it's needed
router.post('/', validateConfig,processWebhookURLParameter, postMiddleware,readExistingConfig, async (req, res) => {
    try {
        // todo check has
        if (req.existingConfig[req.body.webhookURL] !== undefined){
            console.log("🥵🥵editing",req.existingConfig)
            req.existingConfig[req.body.webhookURL] = req.body
            console.log("🥵🥵editd",req.existingConfig)
        }else{ // add 
            req.existingConfig = {
                ...req.existingConfig,
                [req.body.webhookURL]:req.body
            }
        }
        
        await saveConfig(req.existingConfig);
        res.status(200).send('Configuration saved successfully.');
    } catch (error) {
        res.status(500).send('Error saving configuration.');
    }
});

router.get('/', readExistingConfig,async (req, res) => {
    const queryParameters = req.query;

    // Check if there are no query parameters, return an empty response
    if (Object.keys(queryParameters).length === 0) {
        return res.status(200).json({
            startTime: "",
            endTime: "",
            frequency: "1",
            webhookURL: ""
        });
    }

    // Check if there is a 'webhookURL' query parameter
    if (queryParameters.webhookURL) {
        const webhookURL = queryParameters.webhookURL;
        // Use the webhookURL to retrieve the corresponding data (replace with your logic)
        const config = req.existingConfig;
        const dataForWebhook = config[webhookURL];
        console.log("🥵checking GET", config, dataForWebhook);
        if (dataForWebhook) {
            return res.status(200).json(dataForWebhook);
        } else {
            return res.status(404).json({ message: 'Webhook not found.' });
        }
    } else {
        return res.status(400).json({ message: 'Invalid query parameters.' });
    }
});



module.exports = router;
