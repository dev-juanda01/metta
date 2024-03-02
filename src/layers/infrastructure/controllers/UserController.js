import { BaseController } from "./BaseController.js";

class UserController extends BaseController {
    constructor(service) {
        super(service);
    }

    create = async (req, res) => {
        const data = req.body;
        const { ok, status, ...extras } = await this.service.create(data);

        res.status(status).json(extras);
    }
}

export { UserController };
