"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * リクエストプロジェクト設定ルーター
 */
const cinerinoapi = require("@cinerino/api-nodejs-client");
const express = require("express");
const setProject = express.Router();
setProject.use((req, _, next) => {
    let project;
    // 環境変数設定が存在する場合
    if (typeof process.env.PROJECT_ID === 'string') {
        project = { typeOf: cinerinoapi.factory.organizationType.Project, id: process.env.PROJECT_ID };
    }
    // プロジェクトが決定すればリクエストに設定
    if (project !== undefined) {
        req.project = project;
    }
    next();
});
// プロジェクト指定ルーティング配下については、すべてreq.projectを上書き
setProject.use('/projects/:id', (req, _, next) => {
    req.project = { typeOf: cinerinoapi.factory.organizationType.Project, id: req.params.id };
    next();
});
exports.default = setProject;
