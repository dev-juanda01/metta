import { check, validationResult } from "express-validator";

class RoutesMiddlware {
    validateFields(req, res, next) {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        next();
    }

    isNotEmtyField(field) {
        return check(field, "This field is required").notEmpty();
    }

    isEmailValid(field) {
        return check(field, "This email is not valid format").isEmail();
    }

    isStringValid(field) {
        return check(field, "This field is not valid string format").isString();
    }

    isUUIDValid(field) {
        return check(field, "This field is not valid uuid format").isUUID(4);
    }

    isBooleanField(field) {
        return check(field, "This field is not valid boolean format").isBoolean();
    }

    isObjectValid(field) {
        return check(field, "This field must be object format").isObject();
    }
}

export { RoutesMiddlware };
