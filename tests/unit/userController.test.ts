import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../../src/models/User';
import { getUserProfile, deleteUser, updateUserProfile } from '../../src/controller/userController';
import Validate from '../../src/utils/Validate';

jest.mock('../../src/models/User');
jest.mock('bcryptjs');
jest.mock('../../src/utils/Validate');

describe('User Controller Tests', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockRequest = {
        user: { username: 'testuser', email: 'test@example.com' } as IUser
        };
        
        mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn()
        };
        
        mockNext = jest.fn();
    });

    describe('getUserProfile', () => {
        it('should return user when found', async () => {
            const mockUser = { 
                username: 'testuser', 
                email: 'test@example.com',
                _id: 'user123'
            };
            
            (User.findOne as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockResolvedValue(mockUser)
            }));
            
            await getUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 when user not found', async () => {
            (User.findOne as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockResolvedValue(null)
            }));
            
            await getUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found!' });
        });

        it('should call next with error when exception occurs', async () => {
            const mockError = new Error('Database error');
            
            (User.findOne as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockRejectedValue(mockError)
            }));
            
            await getUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });
            (User.findOneAndDelete as jest.Mock).mockResolvedValue({ username: 'testuser' });
            
            await deleteUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(User.findOneAndDelete).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully!' });
        });

        it('should return 404 when user not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            
            await deleteUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(User.findOneAndDelete).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found!' });
            });

            it('should call next with error when exception occurs', async () => {
            const mockError = new Error('Database error');
            (User.findOne as jest.Mock).mockRejectedValue(mockError);
            
            await deleteUser(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    describe('updateUserProfile', () => {
        it('should return 400 when no fields are provided to update', async () => {
            mockRequest.body = {};
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No fields provided to update!' });
        });

        it('should update username successfully', async () => {
            mockRequest.body = { newName: 'newusername' };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(validateInstance.usernameSyntax).toHaveBeenCalledWith('testuser');
            expect(mockUser.username).toBe('newusername');
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Profile updated successfully!',
                userExists: mockUser
            });
        });

        it('should update email successfully', async () => {
            mockRequest.body = { newEmail: 'new@example.com' };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                emailSyntax: jest.fn().mockResolvedValue(true)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(validateInstance.usernameSyntax).toHaveBeenCalledWith('testuser');
            expect(validateInstance.emailSyntax).toHaveBeenCalledWith('new@example.com');
            expect(mockUser.email).toBe('new@example.com');
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should update password successfully when all passwords are provided correctly', async () => {
            mockRequest.body = { 
                newPassword: 'newPassword123', 
                newPasswordAgain: 'newPassword123',
                oldPassword: 'oldPassword123'
            };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedOldPassword',
                save: jest.fn().mockResolvedValue(true)
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                passwordSyntax: jest.fn().mockResolvedValue(true)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(validateInstance.usernameSyntax).toHaveBeenCalledWith('testuser');
            expect(validateInstance.passwordSyntax).toHaveBeenCalledWith('newPassword123');
            expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword123', 'hashedOldPassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 12);
            expect(mockUser.password).toBe('hashedNewPassword');
            expect(mockUser.save).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 when passwords do not match', async () => {
            mockRequest.body = { 
                newPassword: 'newPassword123', 
                newPasswordAgain: 'differentPassword',
                oldPassword: 'oldPassword123'
            };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedOldPassword'
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                passwordSyntax: jest.fn().mockResolvedValue(true)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "Passwords don't match!" });
        });

        it('should return 400 when new password is provided without old password', async () => {
            mockRequest.body = { 
                newPassword: 'newPassword123', 
                newPasswordAgain: 'newPassword123'
            };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedOldPassword'
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                passwordSyntax: jest.fn().mockResolvedValue(true)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "Please enter old password!" });
        });

        it('should return 400 when old password is incorrect', async () => {
            mockRequest.body = { 
                newPassword: 'newPassword123', 
                newPasswordAgain: 'newPassword123',
                oldPassword: 'wrongOldPassword'
            };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedOldPassword'
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                passwordSyntax: jest.fn().mockResolvedValue(true)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(bcrypt.compare).toHaveBeenCalledWith('wrongOldPassword', 'hashedOldPassword');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: "Incorrect old password!" });
        });

        it('should return 404 when user not found', async () => {
            mockRequest.body = { newName: 'newusername' };
            
            (User.findOne as jest.Mock).mockResolvedValue(null);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found!' });
        });

        it('should call next with error when exception occurs', async () => {
            mockRequest.body = { newName: 'newusername' };
            
            const mockError = new Error('Database error');
            (User.findOne as jest.Mock).mockRejectedValue(mockError);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(mockNext).toHaveBeenCalledWith(mockError);
        });

        it('should handle validation failure for email', async () => {
            mockRequest.body = { newEmail: 'invalid-email' };
            
            const mockUser = {
                username: 'testuser',
                email: 'test@example.com'
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);
            
            const validateInstance = {
                usernameSyntax: jest.fn().mockReturnValue(true),
                emailSyntax: jest.fn().mockResolvedValue(false)
            };
            (Validate as jest.MockedClass<typeof Validate>).mockImplementation(() => validateInstance as any);
            
            await updateUserProfile(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
            
            expect(validateInstance.emailSyntax).toHaveBeenCalledWith('invalid-email');
            expect(mockUser.email).toBe('test@example.com');
        });
    });
});