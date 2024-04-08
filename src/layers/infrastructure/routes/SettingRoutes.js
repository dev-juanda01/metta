import { BaseRoutes } from "./BaseRoutes.js";

class SettingRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    updateExpiredTime() {
        this.router.post(
            "/update/expired_time",
            [
                this.middlewares_encoded.validateTokenRequest,
                this.middlewares.isUUIDValid("uuid"),
                this.middlewares.isNotEmtyField("expired_time"),
                this.middlewares.isInRange("expired_time", 4, 24),
                this.middlewares.validateFields,
            ],
            this.controller.updateExpiredTime
        );
    }

    update() {
        super.update(undefined, [
            this.middlewares_encoded.validateTokenRequest,
            this.middlewares.isUUIDValid("id"),
            this.middlewares.isNotEmtyField("data"),
        ]);
    }

    routes() {
        this.update();
        this.updateExpiredTime();

        return this.router;
    }
}

export { SettingRoutes };
