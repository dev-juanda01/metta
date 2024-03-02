import * as constants from "../../../app/constants.js";
import User from "../models/User.js";
import { BaseRepository } from "./BaseRepository.js";

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async create(data) {
        const is_email_valid = await this.verifyUserEmail(data.email);
        if(!is_email_valid.ok) return is_email_valid;

        return super.create(data);
    }

    async verifyUserEmail(email) {
        try {
            const is_email = await this.model.findOne({ email });

            if (is_email) {
                return {
                    ok: false,
                    status: constants.generals.code_status.STATUS_400,
                    msg: constants.users.email_already_exists,
                };
            }

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                msg: constants.generals.messages.success_process
            }
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }
}

export { UserRepository };
