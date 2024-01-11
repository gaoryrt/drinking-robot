// done use pm2 to start project
// done use pm2 to look at the project log  pm2 ls

const { watch } = require("fs");

// watch 热更新
module.exports = {
  apps: [
    // // 启动前端项目
    // {
    //   name: 'frontend',
    //   script: 'npm',
    //   args: 'run serve',
    //   cwd: 'frontend',
    //   watch: false,
    //   ignore_watch: ['node_modules'],
    //   env: {
    //     NODE_ENV: 'production',
    //     PORT: 3000
    //   }
    // },
    // 启动后端项目
    // {
    //   name: 'backend',
    //   script: 'npm',
    //   args: 'start',
    //   cwd: 'backend',
    //   watch: false,
    //   ignore_watch: ['node_modules'],
    //   env: {
    //     NODE_ENV: 'production',
    //     PORT: 8000
    //   }
    // },
    // 启动后端中的schedule.js
    {
      name: 'clash',
      script: './clash-linux-amd64-v1.10.0',
      args: '-f glados.yaml -d .',
      cwd: '../clash',
      log_file: 'clash.log',
      error_file: 'clash_error.log',
      time: true,
      watch: true,
    },
    {
      name: 'schedule',
      script: 'node',
      args: 'schedule.js',
      cwd: 'backend',
      watch: true,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'Gemini and Bing',
      script: 'node',
      args: 'testGemini.js',
      cwd: 'backend',
      watch: false,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};