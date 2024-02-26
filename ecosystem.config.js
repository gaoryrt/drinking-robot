// done use pm2 to start project
// done use pm2 to look at the project log  pm2 ls

// const { watch } = require("fs");

// watch 热更新
module.exports = {
  apps: [
    // 启动后端中的schedule.js
    {
      name: "schedule",
      script: "node",
      args: "schedule.js",
      cwd: "backend",
      watch: true,
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
