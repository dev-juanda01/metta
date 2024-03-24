import { BaseRoutes } from "./BaseRoutes.js";

class AuthenticationRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
        this.controller = controller;
    }

    autheticate(endpoint, middlewares) {
        this.router.post(
            `/${endpoint}`,
            [...middlewares, this.middlewares.validateFields],
            this.controller.authenticate
        );
    }

    refresh(endpoint, middlewares) {
        this.router.post(
            `/${endpoint}`,
            [...middlewares, this.middlewares.validateFields],
            this.controller.refresh
        );
    }

    routes() {
        this.autheticate("session/user/", [
            this.middlewares.isNotEmtyField("email"),
            this.middlewares.isEmailValid("email"),
            this.middlewares.isNotEmtyField("password"),
            this.middlewares.isStringValid("password"),
            this.middlewares.validateFields,
        ]);

        this.refresh("session/user/refresh/", [
            this.middlewares.isNotEmtyField("refresh_token"),
            this.middlewares.validateFields,
        ]);

        return this.router;
    }
}

export { AuthenticationRoutes };
