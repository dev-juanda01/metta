import { BaseRoutes } from "./BaseRoutes.js";

class ConversationRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    create() {
        super.create("add/message", [
            this.middlewares.isNotEmtyField("user"),
            this.middlewares.isUUIDValid("user"),
            this.middlewares.isNotEmtyField("client"),
            this.middlewares.isUUIDValid("client"),
            this.middlewares.isNotEmtyField("content"),
        ]);
    }
}

export { ConversationRoutes };
