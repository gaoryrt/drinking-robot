import axios from 'axios'
import moment from 'moment'
import cron from 'node-cron'
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
const run = async () => {
    try {
        // todo check new
        const dataList = await getFrank()
        if (dataList.length) {
            // https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0a12a053-f249-492a-83a4-5655437b9783
            // await axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=dc2b66d3-c921-414d-addf-29a492d6a98f", genMessage(dataList))
            const res = await axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=0a12a053-f249-492a-83a4-5655437b9783"
            , genMessage(dataList))
            return res.data
        }
    } catch (err) {
        console.log(err)
    }
}

const TIME = '0 0 18 * * 1-5'
cron.schedule(TIME,async ()=>{
    try{
        const msg = await run()
        console.log(msg)
    }catch(err){
        console.log(err)
    }
})