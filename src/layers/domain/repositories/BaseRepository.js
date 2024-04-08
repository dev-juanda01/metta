import { v4 as uuid } from "uuid";
import * as constants from "../../../app/constants.js";
import { BaseCRUD } from "../../application/BaseCRUD.js";

class BaseRepository extends BaseCRUD {
    constructor(model) {
        super();
        this.model = model;
    }

    async create(data) {
        try {
            data.uuid = uuid();
            const result = new this.model(data);
            await result.save();

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_201,
                result: result._doc,
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

    async update(id, data) {
        try {
            const result = await this.model.findOneAndUpdate({ uuid: id }, data, { new: true });

            if (!result) {
                return {
                    ok: false,
                    status: constants.generals.code_status.STATUS_404,
                    msg: constants.generals.messages.not_exists,
                };
            }

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result,
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

    async getById(id) {
        try {
            const result = await this.model.findOne({ uuid: id });

            if (!result) {
                return {
                    ok: false,
                    status: constants.generals.code_status.STATUS_404,
                    msg: constants.generals.messages.not_exists,
                };
            }

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result,
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

    async getOneByField({ field, value }) {
        try {
            const result = await this.model.findOne({ [field]: value });

            if (!result) {
                return {
                    ok: false,
                    status: constants.generals.code_status.STATUS_404,
                    msg: constants.generals.messages.not_exists,
                };
            }

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result,
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

    async getAll() {
        try {
            const result = await this.model.find({});

            return {
                ok: true,
                status: constants.generals.code_status.STATUS_200,
                result,
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

export { BaseRepository };
