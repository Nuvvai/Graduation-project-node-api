import { Response } from 'express';
import { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { IJwtSignPayload } from '../controller/authController';

/**
 * Interface representing the properties of a refresh token cookie.
 * 
 * @interface IRefreshToken_cookiesProperty
 * @property {boolean} httpOnly - Indicates whether the cookie is accessible only through the HTTP protocol.
 * @property {boolean} secure - Indicates whether the cookie is only to be sent over HTTPS.
 * @property {boolean | 'lax' | 'strict' | undefined | "none"} sameSite - Indicates the same-site policy for the cookie.
 * @property {string} Domain - The domain for which the cookie is valid.
 * @property {string} path - The path for which the cookie is valid.
 * @property {number} maxAge - The maximum age of the cookie in seconds.
 * 
 * @HazemSabry
 */
interface IRefreshToken_cookiesProperty {
    /**Indicates whether the cookie is accessible only through the HTTP protocol.*/
    httpOnly: boolean;
    /**Indicates whether the cookie is only to be sent over HTTPS.*/
    secure: boolean;
    /**Indicates the same-site policy for the cookie. Can be a boolean or one of 'lax', 'strict', or 'none'.*/
    sameSite: boolean | 'lax' | 'strict' | undefined | "none";
    /**The domain for which the cookie is valid.*/
    Domain: string;
    /**The path for which the cookie is valid.*/
    path: string;
    /**The maximum age of the cookie in seconds.*/
    maxAge?: number;
}

/**
 * Interface representing the properties of a token response.
 * @interface ITokenResponse
 * 
 * @HazemSabry
 */
interface IToken {
    /**
     * Sends a refresh token to the client by signing a JWT with the user's information
     * and setting it as a cookie in the response.
     *
     * @param user - The user object containing the user's details such as `_id`, `username`, and `email`.
     *
     * @remarks
     * - The JWT is signed using the secret key and has an expiration time defined by `refreshTokenExpiresIn`.
     * - The refresh token is stored in the client's cookies with properties defined by `refreshToken_cookiesProperty`.
     * 
     * @HazemSabry
     */
    sendRefreshToken(user: IUser): Promise<void>;

    /**
     * Generates an access token for a given user.
     *
     * @param user - The payload containing user information to be included in the token.
     * @returns A signed JWT access token as a string.
     * 
     * @HazemSabry
     */
    generateAccessToken(user: IJwtSignPayload): Promise<string>;

    /**
     * Clears the refresh token cookie from the response.
     * 
     * This method removes the 'refreshToken' cookie by calling the `clearCookie` 
     * method on the response object (`res`). It uses the `refreshToken_cookiesProperty` 
     * to specify additional options for clearing the cookie.
     * 
     * @HazemSabry
     */
    clearRefreshToken(): Promise<void>;
}

/**
 * The `Token` class is responsible for handling JSON Web Token (JWT) operations,
 * including generating and sending refresh tokens, generating access tokens, and
 * clearing refresh tokens from cookies.
 * 
 * @HazemSabry
 */
class Token implements IToken {
    /**The name of the frontend domain*/
    private FRONTEND_DOMAIN_NAME: string;
    /**
     * A private property that holds the secret key used for token generation or validation.
     * This key is typically loaded from a secure environment variable or configuration file.
     */
    private secretKey: string | undefined;
    /**
     * Represents the HTTP response object.
     * This is typically used to send a response back to the client
     * in an Express.js application.
     */
    private res: Response;
    /**
     * Specifies the duration for which the refresh token remains valid.
     * The value is represented as a string that can be parsed by the `ms` library.
     * Examples of valid values include "1d", "2h", "30m", etc.
     */
    private refreshTokenExpiresIn: ms.StringValue;
    /**
     * Specifies the duration until the access token expires.
     * The value should be a string representing a time span, 
     * compatible with the `ms` library (e.g., "1h", "30m", "2d").
     */
    private accessTokenExpiresIn: ms.StringValue;
    /**
     * Represents the properties of the refresh token stored in cookies.
     * This property is used to manage and access the refresh token details
     * required for authentication and session management.
     */
    private refreshToken_cookiesProperty: IRefreshToken_cookiesProperty;

    /**
     * Constructs a new instance of the Token utility class.
     *
     * @param res - The HTTP response object used to send tokens and set cookies.
     * @param FRONTEND_DOMAIN_NAME - The domain name of the frontend application. Defaults to the value of the `FRONTEND_DOMAIN_NAME` environment variable or `'http://localhost:5173'` if not provided.
     * @param secretKey - The secret key used to retrieve the token from the server. Defaults to the value of the `secretKey` environment variable.
     * @param refreshTokenExpiresIn - The refresh token expiration in milliseconds. Defaults to 7 days from when the token generate.
     * @param accessTokenExpiresIn - The access token expiration in milliseconds. Defaults to 15 mints from when the token generate.
     * @param refreshToken_cookiesProperty - The cookies property used to retrieve the token from the server. Defaults to the value is undefined.
     */
    constructor(res: Response, FRONTEND_DOMAIN_NAME: string = process.env.FRONTEND_DOMAIN_NAME || 'http://localhost:5173', secretKey: string | undefined = process.env.JWT_Token, refreshTokenExpiresIn: ms.StringValue = '7d', accessTokenExpiresIn: ms.StringValue = '15m', refreshToken_cookiesProperty: IRefreshToken_cookiesProperty | undefined = undefined) {
        this.secretKey = secretKey;
        if (!secretKey) {
            res.status(500);
            throw new Error("Server error, secret key not found, cannot send token");
        }
        this.FRONTEND_DOMAIN_NAME = FRONTEND_DOMAIN_NAME;
        this.refreshTokenExpiresIn = refreshTokenExpiresIn;
        this.accessTokenExpiresIn = accessTokenExpiresIn;
        this.refreshToken_cookiesProperty = refreshToken_cookiesProperty || { httpOnly: true, secure: true, sameSite: 'none', Domain: FRONTEND_DOMAIN_NAME, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 };
        this.res = res;
    }

    async sendRefreshToken(user: IUser) {
        const refreshToken: string = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            this.secretKey as string,
            { expiresIn: this.refreshTokenExpiresIn }
        );

        // Set token in cookies
        this.res.cookie("refreshToken", refreshToken, this.refreshToken_cookiesProperty);
    }

    async generateAccessToken(user: IJwtSignPayload) {
        const accessToken: string = jwt.sign({ id: user.id, username: user.username, email: user.email }, this.secretKey as string, { expiresIn: this.accessTokenExpiresIn });
        return accessToken;
    }

    async clearRefreshToken() {
        const cookieOptions = this.refreshToken_cookiesProperty;
        delete cookieOptions.maxAge; // Clear maxAge to ensure the cookie is removed
        this.res.clearCookie('refreshToken', cookieOptions);
    }
}

export default Token;