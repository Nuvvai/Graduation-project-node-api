import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import mongoose from 'mongoose';

jest.mock('../../src/models/User');
jest.mock('bcryptjs');
jest.mock('../../src/middleware/verifyToken', () => ({
    verifyToken: jest.fn((req, res, next) => {
        req.user = { username: 'admin', role: 'admin' };
        next();
    })
}));

describe('User Controller', () => {    
    beforeEach(() => {        
        jest.resetModules();
        jest.clearAllMocks();
        jest.mock('../../src/middleware/verifyToken', () => ({
            verifyToken: jest.fn((req, res, next) => {
                req.user = { username: 'admin', role: 'admin' };
                next();
            })
        }));
    });
    
    // describe('getAllUsers', () => {
    //     it('should return all users excluding passwords', async () => {
    //         const mockUsers = [
    //             { _id: '1', username: 'user1', email: 'user1@example.com', password: 'pass1', role: 'user' },
    //             { _id: '2', username: 'user2', email: 'user2@example.com', password: 'pass2', role: 'user' }
    //         ];
            
    //         // current user: admin
    //         (User.findOne as jest.Mock).mockResolvedValueOnce({ 
    //             username: 'admin', 
    //             role: 'admin' 
    //         });

    //         (User.find as jest.Mock).mockReturnValue({
    //             select: jest.fn().mockResolvedValue(mockUsers),
    //         });
            
    //         const response = await request(app).get('/users')
            
    //         expect(response.status).toBe(200);
    //         expect(response.body).toEqual(mockUsers);
    //         expect(User.find).toHaveBeenCalledTimes(1);
    //     });
        
    //     it('should return 403 if user is not admin', async () => {
    //         (User.findOne as jest.Mock).mockResolvedValueOnce({ 
    //             username: 'regularuser', 
    //             role: 'user' 
    //         });
        
    //         const response = await request(app).get('/users')
            
    //         expect(response.status).toBe(403);
    //         expect(response.body.message).toBe("Unauthorized action!");
    //     });
        
    //     it('should handle errors properly', async () => {
    //         (User.findOne as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
            
    //         const response = await request(app).get('/users')
            
    //         expect(response.status).toBe(500);
    //     });
    // });
    
    describe('getUserProfile', () => {
        it('should return a user profile if authorized', async () => {
            const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com', password: 'pass1', role: 'user' };
            
            (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

            //current user: admin
            (User.findOne as jest.Mock).mockResolvedValueOnce({ 
                username: 'admin', 
                role: 'admin' 
            });
            
            const response = await request(app).get('/users/testuser')
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
        });
        
        it('should return 404 if user not found', async () => {
            (User.findOne as jest.Mock).mockResolvedValueOnce(null);
            
            const response = await request(app).get('/users/nonexistentuser')
            
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found!');
        });
        
        it('should return 403 if not authorized to view another profile', async () => {
            jest.mock('../../src/middleware/verifyToken', () => ({
                verifyToken: jest.fn((req, res, next) => {
                    req.user = { username: 'regularuser', role: 'user' };
                    next();
                })
            }));
            
            const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com', password: 'pass1', role: 'user' };
        
            (User.findOne as jest.Mock)
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce({ username: 'regularuser', role: 'user' }); 
        
            const response = await request(app).get('/users/testuser')
        
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Unauthorized action!');
        });
    });
    
    describe('deleteUser', () => {
        it('should delete a user if authorized', async () => {
            const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com', password: 'pass1', role: 'user' };
            
            (User.findOne as jest.Mock)
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce({ username: 'admin', role: 'admin' }); 

            (User.findOneAndDelete as jest.Mock)
            .mockResolvedValueOnce(mockUser)

            const response = await request(app).delete('/users/testuser')

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("User deleted successfully!");
        });
        
        it('should return 404 if user to delete not found', async () => {
            const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com', password: 'pass1', role: 'user' };
            (User.findOne as jest.Mock)
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({ username: 'admin', role: 'admin' }); 

            (User.findOneAndDelete as jest.Mock)
            .mockResolvedValueOnce(mockUser)
            const response = await request(app).delete('/users/testuser')
            
            expect(response.body.message).toBe("User not found!");
            expect(response.status).toBe(404);
        });
    });
    
    describe('updateUserProfile', () => {
        let mockUser: any;
        let User: { findOne: jest.Mock };
        beforeEach(() =>{
            jest.mock('bcryptjs', () => ({
                compare: jest.fn().mockResolvedValue(true),
                hash: jest.fn().mockResolvedValue('newhashedpassword')
            }));
            mockUser = { 
                _id: '1', 
                username: 'testuser', 
                password: 'hashedoldpass',
                email: 'test@example.com',
                role: 'user',
                save: jest.fn().mockResolvedValue(true)
            };
            User = {
                findOne: jest.fn()
            } as { findOne: jest.Mock };

            (User.findOne as jest.Mock)
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce({ username: 'admin', role: 'admin' });
          
            jest.mock('../../src/models/User', () => User);
        })
        it('should update a user profile if authorized', async () => {
            const app = require('../../src/app').default;
            
            const response = await request(app)
                .put('/users/testuser')
                .send({ 
                    newPassword: 'newpassword', 
                    newPasswordAgain: 'newpassword', 
                    oldPassword: 'oldpassword' 
                });
                
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Profile updated successfully!");
        });
        
        it('should return 400 if passwords do not match', async () => {     
            const app = require('../../src/app').default;
            
            const response = await request(app)
                .put('/users/testuser')
                .send({ 
                    newPassword: 'newpass', 
                    newPasswordAgain: 'differentpass', 
                    oldPassword: 'oldpass' 
                });
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Passwords don't match!");
        });
        
        it('should return 400 if old password is incorrect', async () => {
            jest.mock('bcryptjs', () => ({
                compare: jest.fn().mockResolvedValue(false),
                hash: jest.fn().mockResolvedValue('newhashedpassword')
            }));
            
            const app = require('../../src/app').default;
            const response = await request(app)
                .put('/users/testuser')
                .send({ 
                    newPassword: 'newpass', 
                    newPasswordAgain: 'newpass', 
                    oldPassword: 'wrongoldpass' 
                });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Incorrect old password!");
        });
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
});