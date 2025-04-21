import User, { IUser } from '../models/User';
import { Response } from 'express';

/**
 * Interface for the validation methods.
 * @interface IValidate
 * 
 * @HazemSabry
 */
interface IValidate {
    /**
     * Validates the syntax of a username to ensure it does not contain the "@" character.
     *
     * @param username - The username string to validate.
     * @returns A promise that resolves to `true` if the username is valid, or `false` if it contains the "@" character.
     *
     * @remarks
     * If the username contains the "@" character, this method sends a 406 Not Acceptable response
     * with an error message indicating the invalid syntax.
     * @HazemSabry
     */
    usernameSyntax: (username: string) => Promise<boolean>;

    /**
     * Validates the syntax of an email address.
     *
     * @param email - The email address to validate.
     * @returns A promise that resolves to `true` if the email syntax is valid, 
     *          otherwise `false`. If invalid, a 406 status response with an 
     *          error message is sent.
     * @HazemSabry
     */
    emailSyntax: (email: string) => Promise<boolean>;

    /**
     * Validates the syntax of a given password based on specific criteria.
     * 
     * The password must meet the following requirements:
     * - At least 6 characters in length.
     * - Contain at least one uppercase letter.
     * - Contain at least one lowercase letter.
     * - Contain at least one numeric digit.
     * - Contain at least one special character (e.g., @$!%*?&).
     * 
     * If the password does not meet these criteria, an HTTP 406 response is sent
     * with an appropriate error message.
     * 
     * @param password - The password string to validate.
     * @returns A promise that resolves to `true` if the password meets the criteria,
     *          or `false` otherwise.
     * @HazemSabry
     */
    passwordSyntax: (password: string) => Promise<boolean>;

        /**
     * Checks if a given username already exists in the database.
     * If the username exists, it sends a 409 Conflict response with an appropriate message.
     *
     * @param username - The username to check for existence.
     * @returns A promise that resolves to `true` if the username exists, otherwise `false`.
     * @HazemSabry
     */
    usernameExists: (username: string) => Promise<boolean>;

    /**
     * Checks if the provided email already exists in the database.
     * If the email exists, it sends a 409 Conflict response with a message indicating
     * that the email is already in use.
     *
     * @param email - The email address to check for existence.
     * @returns A promise that resolves to `true` if the email exists, otherwise `false`.
     * @HazemSabry
     */
    emailExists: (email: string) => Promise<boolean>;
}


/**
 * A class that implements the IValidate interface for validating user input.
 * It provides methods to validate usernames, emails, passwords, and check for existing usernames and emails.
 * @implements {IValidate}
 * @param {Response} res - The Express response object used to send responses.
 * 
 * @HazemSabry
 */
export default class Validate implements IValidate{
    /**Represents the HTTP response object.*/
    private res:Response;

    /**
     * Creates an instance of the utility class with the provided response object.
     *
     * @param res - The HTTP response object to be used for validation or other operations.
     */
    constructor(res: Response) {
        this.res = res;
    }
    
    async usernameSyntax (username: string): Promise<boolean> {
        if (! (username.indexOf('@') === -1)) {
            this.res.status(406).json({ message: 'Invalid username can not include "@"' });
            return false;
        }
        return true;
    }

    async emailSyntax (email: string): Promise<boolean> { 
        if (! (email.length >= 6 && email.indexOf('@') !== -1)) {
            this.res.status(406).json({ message: 'Invalid email format' });
            return false;
        }
        return true;
    }

    async passwordSyntax (password: string): Promise<boolean> { 
        if (! (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password))) {
            this.res.status(406).json({ message: 'Password must be at lest 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
            return false;
        }
        return true;
    }

    async usernameExists(username: string): Promise<boolean> { 
        const existingUsername: IUser | null = await User.findOne<IUser>({ username })
        if (existingUsername) {
            this.res.status(409).json({ message: 'Username already exists' });
            return true;
        }
        return false;
    }

    async emailExists(email: string): Promise<boolean> {
        const existingEmail: IUser | null = await User.findOne<IUser>({ email })
        if (existingEmail) {
            this.res.status(409).json({ message: 'Email already used before' });
            return true;
        }
        return false;
    }
}