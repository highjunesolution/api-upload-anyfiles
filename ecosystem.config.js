module.exports = {
    apps: [
        {
            name: "server",
            script: "./server.js",
            exec_mode: "cluster",
            instances: 2,
            watch: false,
            env: {
                NODE_ENV: "production",
            }
        }
    ]
}