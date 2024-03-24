import express from "express";
import { BaseCRUD } from "../../application/BaseCRUD.js";
import { RoutesMiddlware } from "../middlewares/RoutesMiddleware.js";
import { JsonWebTokenMiddleware } from "../middlewares/JsonWebTokenMiddleware.js";

class BaseRoutes extends BaseCRUD {
    constructor(controller) {
        super();

        this.controller = controller;
        this.router = express.Router();
        this.middlewares = new RoutesMiddlware();
        this.middlewares_encoded = new JsonWebTokenMiddleware();
    }

    create(endpoint = "create", middlewares = []) {
        this.router.post(
            `/${endpoint}`,
            [...middlewares, this.middlewares.validateFields],
            this.controller.create
        );
    }

    update(middlewares = []) {
        this.router.put(
            "/update",
            [...middlewares, this.middlewares.validateFields],
            this.controller.update
        );
    }

    delete(middlewares = []) {
        this.router.delete(
            "/delete",
            [...middlewares, this.middlewares.validateFields],
            this.controller.delete
        );
    }

    getAll(middlewares = []) {
        this.router.get(
            "/all",
            [...middlewares, this.middlewares.validateFields],
            this.controller.getAll
        );
    }

    getById(middlewares = []) {
        this.router.get(
            "/detail/:id",
            [...middlewares, this.middlewares.validateFields],
            this.controller.getById
        );
    }

    routes() {
        this.create();
        this.update();
        this.delete();
        this.getAll();
        this.getById();

        return this.router;
    }
}

export { BaseRoutes };
