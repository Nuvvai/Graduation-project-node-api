import express, { Router } from 'express';
import { getAzureDevOpsReposController, getBitbucketReposController, getGithubReposController, getGitLabReposController } from '../controller/providersController';

const router: Router = express.Router();

// access private
router.get('/github/repositories/me', getGithubReposController);

// access private
router.get('/gitlab/repositories/me', getGitLabReposController);

// access private
router.get('/bitbucket/repositories/me', getBitbucketReposController);

// access private
router.get('/azure-devops/repositories/me', getAzureDevOpsReposController);

export default router;