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
     * Validates the syntax of a username by checking if it does not contain the '@' character.
     *
     * @param username - The username string to validate.
     * @returns `true` if the username does not contain the '@' character, otherwise `false`.
     * 
     * @HazemSabry
     */
    usernameSyntax: (username: string) => void;

    /**
     * Validates the syntax of an email by checking if it contains a '@' character and at least 6 characters.
     *
     * @param email - The email string to validate.
     * @returns `true` if the email contains a '@' character and at least 6 characters, otherwise `false`.
     * 
     * @HazemSabry
     */
    emailSyntax: (email: string) => void;

    /**
     * Validates the syntax of a password by checking if it contains at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character.
     *
     * @param password - The password string to validate.
     * @returns `true` if the password contains at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character, otherwise `false`.
     * 
     * @HazemSabry
     */
    passwordSyntax: (password: string) => void;

    /**
     * Checks if a username already exists in the database.
     *
     * @param username - The username string to check.
     * @returns `true` if the username already exists, otherwise `false`.
     * 
     * @HazemSabry
     */
    usernameExists: (username: string) => Promise<void>;

    /**
     * Checks if an email already exists in the database.
     *
     * @param email - The email string to check.
     * @returns `true` if the email already exists, otherwise `false`.
     * 
     * @HazemSabry
     */
    emailExists: (email: string) => Promise<void>;
}

/**
 * Class for validating user input.
 * 
 * @HazemSabry
 */
export default class Validate implements IValidate{
    private res:Response;

    constructor(res: Response) {
        this.res = res;
    }
    
    
    usernameSyntax (username: string) {
        if (! (username.indexOf('@') === -1)) {
            this.res.status(406).json({ message: 'Invalid username can not include "@"' });
        }
    }

    emailSyntax (email: string) { 
        if (! (email.length >= 6 && email.indexOf('@') !== -1)) {
            this.res.status(406).json({ message: 'Invalid email format' });
        }
    }

    passwordSyntax (password: string) { 
        if (! (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password))) {
            this.res.status(406).json({ message: 'Password must be at lest 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }
    }

    async usernameExists(username: string) { 
        const existingUsername: IUser | null = await User.findOne<IUser>({ username })
        if (existingUsername) {
            this.res.status(409).json({ message: 'Username already exists' });
        }
    }

    async emailExists(email: string){
        const existingEmail: IUser | null = await User.findOne<IUser>({ email })
        if (existingEmail) {
            this.res.status(409).json({ message: 'Email already used before' });
            return;
        }
    }
}