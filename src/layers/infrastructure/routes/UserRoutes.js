import { BaseRoutes } from "./BaseRoutes.js";

class UserRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    create() {
        super.create("create", [
            this.middlewares.isNotEmtyField("password"),
            this.middlewares.isNotEmtyField("email"),
            this.middlewares.isEmailValid("email"),
        ]);
    }
}

export { UserRoutes };
