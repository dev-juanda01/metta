class BaseCRUD {
    constructor() {
        if (this.constructor == BaseCRUD) {
            throw new Error("Can't instantiate abstract class");
        }
    }

    create(data) {}

    update(id, data) {}

    delete(id) {}

    getAll() {}

    getById(id) {}
}

export { BaseCRUD }