import request from 'supertest';
import app from '../../src/app';
import User from '../../src/models/User';
import mongoose from 'mongoose';


jest.mock('../../src/models/User');

describe('User Controller - getAllUsers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all users excluding passwords', async () => {
    const mockUsers = [
      { _id: '1', username: 'user1', email: 'user1@example.com' },
      { _id: '2', username: 'user2', email: 'user2@example.com' }
    ];

    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUsers),
    });

    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUsers);
    expect(User.find).toHaveBeenCalledTimes(1);
  });

  it('should handle errors properly', async () => {
    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    const response = await request(app).get('/users');

    expect(response.status).toBe(500);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

