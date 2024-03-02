
class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    create(data) {
        return this.repository.create(data);
    }

    update(id, data) {
        return this.repository.update(id, data);
    }

    getAll() {
        return this.repository.getAll();
    }

    getById(id) {
        return this.repository.getById(id);
    }
}

export { BaseService }