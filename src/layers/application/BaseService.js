import { BaseCRUD } from "./BaseCRUD.js";

class BaseService extends BaseCRUD {
    constructor(repository) {
        super();
        this.repository = repository;
    }

    create(data) {
        return this.repository.create(data);
    }

    async update(id, data) {
        return await this.repository.update(id, data);
    }

    async getAll() {
        return await this.repository.getAll();
    }

    async getById(id) {
        return await this.repository.getById(id);
    }

    async getOneByField({ field, value }) {
        return await this.repository.getOneByField({ field, value });
    }
}

export { BaseService }