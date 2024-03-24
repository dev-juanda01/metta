class AuthenticationController {
    constructor(service) {
        this.service = service;
    }

    /**
     * This method allowed the authentication for users
     *
     * @param {object} req represent the object request
     * @param {object} res represent the object response
     */
    authenticate = async (req, res) => {
        const { email, password } = req.body;

        const { ok, status, ...result_auth } = await this.service.authenticate(
            email,
            password
        );

        res.status(status).json(result_auth);
    }

    /**
     * This method allowed the authentication for users
     *
     * @param {object} req represent the object request
     * @param {object} res represent the object response
     */
    refresh = async (req, res) => {
        const { refresh_token } = req.body;

        const { ok, status, ...data_auth } = await this.service.refresh(
            refresh_token
        );

        res.status(status).json(data_auth);
    }
}

export { AuthenticationController };
