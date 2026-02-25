"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePostImage = exports.addPostImage = void 0;
const post_image_service_1 = require("../services/post-image.service");
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../validation/middleware");
const post_image_schema_1 = require("../validation/schemas/post-image.schema");
exports.addPostImage = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(post_image_schema_1.addPostImageSchema),
    async (req, res, next) => {
        try {
            const postImage = await post_image_service_1.postImageService.add({
                postId: String(req.params.postId),
                fileId: req.body.fileId,
                sort: req.body.sort,
                actor: req.user,
            });
            res.status(201).json(postImage);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.removePostImage = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(post_image_schema_1.removePostImageSchema),
    async (req, res, next) => {
        try {
            await post_image_service_1.postImageService.remove({
                postId: String(req.params.postId),
                fileId: req.body.fileId,
                actor: req.user,
            });
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
