"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const post_routes_1 = __importDefault(require("./post.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const file_routes_1 = __importDefault(require("./file.routes"));
const post_image_routes_1 = __importDefault(require("./post-image.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/posts", post_routes_1.default);
router.use("/categories", category_routes_1.default);
router.use("/files", file_routes_1.default);
router.use("/posts", post_image_routes_1.default); // /posts/:postId/images
exports.default = router;
