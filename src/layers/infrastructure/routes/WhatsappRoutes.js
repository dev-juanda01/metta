import { BaseRoutes } from "./BaseRoutes.js";

class WhatsAppRoutes extends BaseRoutes {
    constructor(controller) {
        super(controller);
    }

    getResponseMessage(endpoint) {
        this.router.get(`/${endpoint}`, this.controller.webhookResponse);
    }

    routes() {
        this.getResponseMessage("webhook");

        return this.router;
    }
}

export { WhatsAppRoutes };
