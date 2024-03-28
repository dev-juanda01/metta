import { BaseController } from "./BaseController.js";

class ConversationController extends BaseController {
    constructor(service) {
        super(service);
    }

    create = async (req, res) => {
        const data = req.body;
        data.from = req.user;

        const { ok, status, ...extras } = await this.service.create(data);

        res.status(status).json(extras);
    };

    upload = async (req, res) => {
        const attach_data = {
            props: {
                ...req.body,
                from: req.user
            },
            files: req.files,
        };

        const { ok, status, ...extras } = await this.service.upload(
            attach_data
        );

        res.status(status).json(extras);
    };
}

export { ConversationController };
