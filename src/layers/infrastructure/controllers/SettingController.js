import { BaseController } from "./BaseController.js";

class SettingController extends BaseController {
    constructor(service) {
        super(service);
    }

    updateExpiredTime = async (req, res) => {
        const { uuid, expired_time } = req.body;

        const { ok, status, ...extras } = await this.service.update(uuid, {
            expired_time,
        });

        res.status(status).json(extras);
    };
}

export { SettingController };
