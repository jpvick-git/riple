module.exports = {
  apps: [
    {
      name: "riple",
      cwd: "/var/www/riple",
      script: "node_modules/next/dist/bin/next",
      // Port 3001 — leave 3000 free for other apps on the same droplet
      args: "start -p 3001 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};
