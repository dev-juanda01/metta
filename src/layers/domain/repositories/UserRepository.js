import * as constants from "../../../app/constants.js";
import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import { BaseRepository } from "./BaseRepository.js";

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async create(data) {
        const is_email_valid = await this.verifyUserEmail(data.email);
        if (!is_email_valid.ok) return is_email_valid;

        // Salt to encrypt password
        const salt = bcryptjs.genSaltSync();
        data.password = bcryptjs.hashSync(data.password, salt);

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
                msg: constants.generals.messages.success_process,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }

    /**
     * 
     * @param {string} field field reference search a value
     * @param {string} value value filter to query
     * @returns return a object prevalidate
     */
    async getOneUserByField(field, value) {
        try {
            const user = await this.model.findOne({ [field]: value });

            // validate user
            const is_valid = this.validate(user);
            if (!is_valid.ok) return is_valid;

            // return user
            return is_valid;
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_500,
                msg: constants.generals.messages.error_server,
            };
        }
    }

    /**
     * 
     * @param {object} user document founded to validate user
     * @returns object with validation user
     */
    validate(user) {
        if (!user) {
            return {
                ok: false,
                msg: constants.users.user_not_exists,
                status: constants.generals.code_status.STATUS_404,
            };
        }

        return { ok: true, status: constants.generals.code_status.STATUS_200, user };
    }

    /**
     *
     * @param {string} password password provider to user session
     * @param {string} userPassword password to compare original
     * @returns object with ok, status, msg fields
     */
    verifyPassword(password, userPassword) {
        const matchPassword = bcryptjs.compareSync(password, userPassword);

        if (!matchPassword) {
            return {
                ok: false,
                status: constants.generals.code_status.STATUS_400,
                msg: constants.users.password_incorrect,
            };
        }

        return { ok: true, status: constants.generals.code_status.STATUS_200 };
    }
}

export { UserRepository };
