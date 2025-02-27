import request from 'supertest';
import app from '../../src/app';
import Pipeline from '../../src/models/Pipeline';
import Project from '../../src/models/Project';
import User from '../../src/models/User';
import jenkins from '../../src/utils/jenkinsClient';
import { generatePipelineScript } from '../../src/utils/generatePipelineScript';
import xml2js from 'xml2js';
import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

jest.mock('../../src/models/Pipeline');
jest.mock('../../src/models/Project');
jest.mock('../../src/models/User');
jest.mock('../../src/utils/jenkinsClient');
jest.mock('../../src/utils/generatePipelineScript');
jest.mock('xml2js');
jest.mock('jsonwebtoken');

describe('Pipeline Controller', () => {
  let token: string;

  beforeEach(() => {
    process.env.JWT_Token = "secret_key";

    (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
      callback(null, { username: "testuser" });
    });

    token = 'mockedToken';
  });

  describe('createPipeline', () => {
    it('should create a new pipeline successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });
      (Project.findOne as jest.Mock).mockResolvedValue({ framework: 'NodeJS', repositoryUrl: 'https://github.com/test/repo' });
      (Pipeline.findOne as jest.Mock).mockResolvedValue(null);
      (jenkins.view.exists as jest.Mock).mockResolvedValue(false);
      (jenkins.view.create as jest.Mock).mockResolvedValue(undefined);
      (jenkins.job.create as jest.Mock).mockResolvedValue(undefined);
      (jenkins.view.add as jest.Mock).mockResolvedValue(undefined);
      Pipeline.prototype.save = jest.fn().mockResolvedValue({ pipelineName: 'test-pipeline' });
      (generatePipelineScript as jest.Mock).mockReturnValue('pipeline script');
      
      const res = await request(app)
        .post('/pipelines/testProject')
        .set('Authorization', `Bearer ${token}`)
        .send({ gitBranch: 'main' });

      console.log("Response status:", res.status);
      console.log("Response body:", res.body);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Pipeline created successfully');
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
