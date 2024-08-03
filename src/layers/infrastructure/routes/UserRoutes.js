import { BaseRoutes } from "./BaseRoutes.js";
import { AppConstants } from "#app";

class UserRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    create() {
        super.create("create", [
            this.middlewares.isNotEmtyField("password"),
            this.middlewares.isNotEmtyField("email"),
            this.middlewares.isEmailValid("email"),
            this.middlewares.isNotEmtyField("role"),
            this.middlewares.isInCollection("role", AppConstants.users.roles.all),
        ]);
    }

    detail(enpoint, middlewares) {
        this.router.get(
            `/${enpoint}`,
            [...middlewares, this.middlewares.validateFields],
            this.controller.detail
        );
    }

    routes() {
        this.create();
        this.detail("session/detail", [
            this.middlewares_encoded.validateTokenRequest,
        ]);

        return this.router;
    }
}

export { UserRoutes };
