// done use pm2 to start project
// done use pm2 to look at the project log  pm2 ls
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
    {
      name: 'backend',
      script: 'npm',
      args: 'start',
      cwd: 'backend',
      watch: false,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    },
    // 启动后端中的schedule.js
    {
      name: 'schedule',
      script: 'node',
      args: 'schedule.js',
      cwd: 'backend',
      watch: false,
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};