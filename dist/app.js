"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("./middleware/auth");
const notFound_1 = require("./middleware/notFound");
const errorHandler_1 = require("./middleware/errorHandler");
const index_1 = __importDefault(require("./routes/index"));
const env_1 = require("./config/env");
const security = (0, helmet_1.default)();
// Configure multer for file uploads (in-memory storage)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: env_1.env.uploadMaxMb * 1024 * 1024,
        files: 5,
    },
});
const createApp = async () => {
    const app = (0, express_1.default)();
    // Global middleware
    app.use(security);
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    // Auth middleware (optional - extracts user from JWT if present)
    app.use(auth_1.authenticate);
    // Health check
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    // API routes
    app.use("/api", index_1.default);
    // File upload route (needs special handling with multer)
    app.post("/api/files", upload.single("file"), async (req, res, next) => {
        const { uploadFile } = await Promise.resolve().then(() => __importStar(require("./controllers/file.controller")));
        const handlers = uploadFile;
        handlers[1](req, res, next);
    });
    // 404 handler
    app.use(notFound_1.notFound);
    // Error handler
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
