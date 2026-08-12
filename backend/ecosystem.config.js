// PM2 ecosystem configuration for Whaticket backend
module.exports = {
  apps: [
    {
      name: "whaticket-backend",
      script: "dist/server.js",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 8080
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      err_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};
