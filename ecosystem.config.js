module.exports = {
  apps: [
    {
      name: "my-next-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4401",
      instances: "max", // หรือใส่จำนวน Core เช่น 2
      exec_mode: "cluster", // ใช้ Cluster Mode เพื่อประสิทธิภาพสูงสุด
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};