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
    // const prompt = `生成一句有趣并且能够引人发笑的话，目的是以一种幽默和轻松的方式鼓励人们多喝水。请在文本中巧妙地融入网络流行语和梗，使内容既现代又引人入胜。以下是一些指导点：

    //   1. 结合一下背景生成：前端程序员，百词斩，上班，工作，摸鱼
    //   2. 使用网络上流行的比喻或夸张的表达
    //   3. 插入一些你自己觉得合适的emoji，并且要放在合适的位置
    //   4. 插入一些幽默的夸张比喻
    //   5. 创造性地利用流行的网络段子
    //   6. 结合一些经典网络迷因，例如："在喝水这件事上，我们不接受'我不想喝'这种答案，这里只有'已经喝了'和'马上就喝'。"
    //   7. 不要输出引号

    //   请注意保持整体文本风趣幽默，同时确保信息传达清晰，鼓励人们多喝水的意图不被幽默元素所掩盖。`

    const prompt = `段子之所以成为段子，最显著的结构特点就是要有转折，也被称作“预期落空”，即通过误导等叙事技巧先给读者建立一个预期，随后安排转折使预期落空。这是一个段子的趣味性的最主要来源，毕竟人人都喜欢反差感。
        段子的创作过程常常是跟阅读顺序是反着的，也就是说，段子创作的起点是往往是转折之后的部分。这可以是一个笑点，比如最常用的谐音、双关、或者生活中偶然发现的有趣或荒诞的场景，也可以是自己想表达某个观点，或者自己想抒发某种情绪。
        然后我们需要从要表达的点开始逆向往前扩展。
        如果是想表达某个观点，或者评说某个事物。《喜剧圣经》有一个经典方法来让观点变得生动有趣，即考虑四个问题：为什么困难？为什么愚蠢？为什么奇怪？为什么害怕？很多严肃的主题套入这四个问题都会得到荒诞或有趣的答案。
        关于如何去建立预期和让预期落空，最核心的机制就是文本的可多重解读性。这有点像赵本山小品里常见的场景，两个角色之间存在误会，然后一个角色说的每一句话都会被另一个人解读成别的意思。段子也是类似的，只不过读者不是上帝视角，而是被设计误导的另一个角色。
        从日常生活中发掘可多重解读的文本是需要一定天赋的，本质上是要能从多个（可能不相关的）主题中寻找连接，而且这种连接是多多益善的——连接点越多，误导效果就越强，而且这种加强不是相加而更像是相乘的效果。
        与单口喜剧（国内也叫脱口秀）不同，段子是文本形式的，很容易被读者重复阅读，因此段子更适合设置理解门槛、保留一定的解读空间，让读者有一种解谜的快感。例如可以使用反讽和夸张的手法，读者可能第一感觉是这说的也太扯了，然后再回头重看一遍就理解了你真正想表达的观点。
        请你基于以上这段对段子的理解，写一个劝人喝水的段子，要求如下:
        1.只输出段子，不要输出其他无关的话
        2.段子的背景信息是在成都的一家名字叫超有爱科技的公司的百词斩（一款帮助用户背单词的app）部门的前端开发组，
        主人公名字叫高日天，男的,高日天主要负责前端开发，和何睿：测试人员，男的。
        何睿经常会找高日天来解决用户上报的bug，何睿对高日天的称呼一般是叫日天哥
        3.段子的核心必须要凸出劝人喝水的含义
        4.段子一定要搞笑
        5.段子控制在最多70字，尽量保持在60字左右
        6.如果是对话形式的段子，总对话要不超过6句
        7.尽量要生成非对话形式的段子
        8.段子尽量围绕何睿去找高日天报bug这个主题进行
        `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    return text
  } catch (err) {
    console.log(err)
  }
}

getWaterPrompt().then(res => {
  // axios.post("https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=dc2b66d3-c921-414d-addf-29a492d6a98f", {
  //   "msgtype": "text",
  //   "text": {
  //     "content": `${res}`
  //   }
  // }).then(res => console.log(res.data))
})
