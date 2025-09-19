import jwt from "jsonwebtoken";

/**
 * @desc Generate a JSON Web Token for authentication.
 * @param {string} id - The user ID to include in the token payload.
 * @returns {string} - Signed JWT token.
 */
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }

    if (!process.env.JWT_EXPIRES_IN) {
        throw new Error(
            "JWT_EXPIRES_IN is not defined in environment variables"
        );
    }

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

export default generateToken;
