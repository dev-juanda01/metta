import { BaseRoutes } from "./BaseRoutes.js";

class ConversationRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    create() {
        super.create("add/message", [
            this.middlewares_encoded.validateTokenRequest,
            this.middlewares.isNotEmtyField("to"),
            this.middlewares.isUUIDValid("to"),
            this.middlewares.isNotEmtyField("content"),
            this.middlewares.isObjectValid("content"),
            this.middlewares.validateFields,
        ]);
    }

    attachFile() {
        this.router.post(
            "/attach/file",
            [
                this.middlewares_encoded.validateTokenRequest,
                this.middlewares.isUUIDValid("to"),
                this.middlewares.isNotEmtyField("type"),
                this.middlewares.validateFields,
            ],
            this.controller.upload
        );
    }

    routes() {
        this.attachFile();
        return super.routes();
    }
}

export { ConversationRoutes };
