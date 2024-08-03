class AuthenticationService {
    constructor(repository) {
        this.repository = repository;
    }

    async authenticate(email, password) {
        return await this.repository.authenticate(email, password);
    }

    async refresh(refresh_token) {
        return await this.repository.refresh(refresh_token);
    }
}

export { AuthenticationService }