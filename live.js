const liveServer = require("live-server");

var params = {
    port: 8181,
    host: "0.0.0.0",
    root: "./public",
    open: false,
    file: "index.html",
    wait: 1000,
    logLevel: 2,
};

liveServer.start(params);
