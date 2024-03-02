import { BaseRoutes } from "./BaseRoutes.js";

class ClientRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    create() {
        super.create("create", [
            this.middlewares.isNotEmtyField("name"),
            this.middlewares.isStringValid("name"),
            this.middlewares.isNotEmtyField("phone"),
            this.middlewares.isStringValid("phone"),
        ])
    }
}

export { ClientRoutes }