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

    detail = async (req, res) => {
        const user = req.user;
        let { ok, status, ...extras } = await this.service.getById(user);

        if(ok) {
            extras = {
                uuid: extras.result.uuid,
                name: extras.result.name,
                is_admin: extras.result.is_admin,
                email: extras.result.email
            };
        }

        res.status(status).json(extras);

    }
}

export { UserController };
