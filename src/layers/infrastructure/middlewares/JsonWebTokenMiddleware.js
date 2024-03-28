import jwt from "jsonwebtoken";
import * as constants from "../../../app/constants.js";

class JsonWebTokenMiddleware {
    /**
     *
     * @param {string} payload data to enconded in token jwt
     * @returns return a new token generated
     */
    generateToken(payload, secret, expires) {
        return new Promise((resolve, reject) => {
            jwt.sign(
                { payload },
                secret,
                { expiresIn: expires },
                (error, token) => {
                    if (error) {
                        console.log(error);

                        reject({
                            ok: false,
                            msg: constants.jwt.failed_generate_jwt,
                            status: constants.generals.code_status.STATUS_400,
                        });
                    } else {
                        resolve({
                            ok: true,
                            token,
                            status: constants.generals.code_status.STATUS_200,
                        });
                    }
                }
            );
        });
    }

    /**
     *
     * @param {string} token token to validated
     * @returns return object with property ok is state process
     */
    validateToken(token, secret) {
        if (!token) {
            return {
                ok: false,
                status: constants.generals.code_status.STATUS_400,
                msg: constants.jwt.token_not_provider,
            };
        }

        try {
            const { payload } = jwt.verify(token, secret);

            return {
                ok: true,
                payload,
                status: constants.generals.code_status.STATUS_200,
            };
        } catch (error) {
            console.log(error);

            return {
                ok: false,
                status: constants.generals.code_status.STATUS_401,
                msg: constants.jwt.invalid_token,
            };
        }
    }

    /**
     *
     * @param {object} req request to process http
     * @param {object} res response to process http
     * @param {function} next callback execute next middleware
     */
    validateTokenRequest = (req, res, next) => {
        const token = req.header("Authorization");

        // verify access token
        const { ok, status, ...rest } = this.validateToken(
            token,
            constants.jwt.secret_jwt
        );
        
        if (!ok) {
            return res.status(status).json(rest);
        }

        // bind uuid user to request object
        req.user = rest.payload;
        next();
    }
}

export { JsonWebTokenMiddleware };
