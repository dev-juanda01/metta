class BaseController {
    constructor(service) {
        this.service = service;
    }

    create = (req, res) => {
        const data = req.body;
        const { ok, status, ...extras } = this.service.create(data);

        res.status(status).json(extras);
    }

    update = async (req, res) => {
        const { id, data } = req.body;
        const { ok, status, ...extras } = await this.service.update(id, data);

        res.status(status).json(extras);
    }

    async delete() {}

    async getAll() {}

    async getById() {}
}

export { BaseController };
