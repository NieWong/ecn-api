"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const start = async () => {
    const app = await (0, app_1.createApp)();
    app.listen(env_1.env.port, () => {
        console.log(`API listening on :${env_1.env.port}`);
    });
};
start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
