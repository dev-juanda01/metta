class AuthenticationController {
    /**
     * This method allowed the authentication for users
     *
     * @param {object} req represent the object request
     * @param {object} res represent the object response
     */
    async authUserApi(req, res) {
        const user = req.body;

        const authUser = new AutheticationUser(new ManageJWT());
        const { ok, status, ...result_auth } = await authUser.loginUser(user);

        res.status(status).json(result_auth);
    }

    /**
     * This method allowed the authentication for users
     *
     * @param {object} req represent the object request
     * @param {object} res represent the object response
     */
    async refreshToken(req, res) {
        const { refresh_token } = req.body;

        const manager_jwt = new ManageJWT();
        const authUser = new AutheticationUser(manager_jwt);

        const { ok, status, ...data_auth } = await authUser.refreshToken(
            refresh_token
        );

        res.status(status).json(data_auth);
    }
}

export { AuthenticationController };
