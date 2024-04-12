import * as constants from "../../../app/constants.js";
import Setting from "../models/Setting.js";
import { BaseRepository } from "./BaseRepository.js";

class SettingRepository extends BaseRepository {
    constructor() {
        super(Setting);
    }

    async getDefaultSetting() {
        try {
            const setting_admin = await this.model.findOne().exec();

            const { _id, __v, ...rest_setting } = setting_admin._doc;

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result: rest_setting,
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
}

export { SettingRepository };
