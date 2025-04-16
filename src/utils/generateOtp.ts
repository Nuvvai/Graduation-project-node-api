import otpGenerator from 'otp-generator';
import otpUser, {IotpUser}  from '../models/otpUser';

/**
 * @author Mennatallah Ashraf
 * @description Generates a unique 6-digit numeric OTP.
 * @returns {Promise<string>} The generated unique OTP.
 */
export const generateUniqueOtp = async (): Promise<string> => {
    let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
    });

    let otpUserExists = await otpUser.findOne<IotpUser>({ otp });
    while (otpUserExists) {
        otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true,
        });
        otpUserExists = await otpUser.findOne<IotpUser>({ otp });
    }

    return otp;
};
