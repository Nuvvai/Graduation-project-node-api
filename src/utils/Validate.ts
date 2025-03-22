import User, { IUser } from '../models/User';

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
    usernameSyntax: (username: string) => boolean;

    /**
     * Validates the syntax of an email by checking if it contains a '@' character and at least 6 characters.
     *
     * @param email - The email string to validate.
     * @returns `true` if the email contains a '@' character and at least 6 characters, otherwise `false`.
     * 
     * @HazemSabry
     */
    emailSyntax: (email: string) => boolean;

    /**
     * Validates the syntax of a password by checking if it contains at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character.
     *
     * @param password - The password string to validate.
     * @returns `true` if the password contains at least 6 characters, one uppercase letter, one lowercase letter, one number, and one special character, otherwise `false`.
     * 
     * @HazemSabry
     */
    passwordSyntax: (password: string) => boolean;

    /**
     * Checks if a username already exists in the database.
     *
     * @param username - The username string to check.
     * @returns `true` if the username already exists, otherwise `false`.
     * 
     * @HazemSabry
     */
    usernameExists: (username: string) => Promise<boolean>;

    /**
     * Checks if an email already exists in the database.
     *
     * @param email - The email string to check.
     * @returns `true` if the email already exists, otherwise `false`.
     * 
     * @HazemSabry
     */
    emailExists: (email: string) => Promise<boolean>;
}

/**
 * Class for validating user input.
 * 
 * @HazemSabry
 */
export default class Validate implements IValidate{
    constructor() { }
    
    
    usernameSyntax = (username: string) => {
        return username.indexOf('@') === -1
    }

    emailSyntax = (email: string) => {
        return email.length >= 6 && email.indexOf('@') !== -1
    }

    passwordSyntax = (password: string) => {
        return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)
    }

    async usernameExists(username: string) { 
        const existingUsername: IUser | null = await User.findOne<IUser>({ username })
        return existingUsername ? true : false;
    }

    async emailExists(email: string){
        const existingEmail: IUser | null = await User.findOne<IUser>({ email })
        return existingEmail ? true : false;
    }
}