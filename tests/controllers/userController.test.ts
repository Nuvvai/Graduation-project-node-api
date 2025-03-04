import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('User Controller', () => {
  let token: string;

  beforeEach(() => {
    process.env.JWT_Token = "secret_key";

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, { username: "admin", role: "admin" });
    });

    token = 'mockedToken';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users excluding passwords', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', email: 'user1@example.com' },
        { _id: '2', username: 'user2', email: 'user2@example.com' }
      ];

      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalledTimes(1);
    });

    it('should handle errors properly', async () => {
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });

  describe('getUserProfile', () => {
    it('should return a user profile if authorized', async () => {
      const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com' };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/testuser')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user if authorized', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: '1', username: 'testuser' });
      (User.findOneAndDelete as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/users/testuser')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully!");
    });
  });

  describe('updateUserProfile', () => {
    it('should update a user profile if authorized', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ _id: '1', username: 'testuser', password: 'hashedpassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');

      const response = await request(app)
        .put('/users/testuser')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'newpass', newPasswordAgain: 'newpass', oldPassword: 'oldpass' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile updated successfully!");
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
