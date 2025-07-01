import Project, { IProject } from '../models/Project';
import User, { IUser } from '../models/User';
import Pipeline, { IPipeline } from '../models/Pipeline';
import { generatePipelineScript } from "../utils/generatePipelineScript";
import jenkins from '../utils/jenkinsClient';
import { create } from 'xmlbuilder2';

export interface CreatePipelineData {
    pipelineName: string;
    username: string;
    projectName: string;
    gitBranch: string;
}

export interface TriggerBuildData {
    username: string;
    projectName: string;
    pipelineName: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new pipeline
 * @throws Will throw an error with appropriate message and status code
 */
export const createPipelineService = async (
    data: CreatePipelineData,
    currentUsername: string
): Promise<IPipeline> => {
    const {
        pipelineName,
        username,
        projectName,
        gitBranch
    } = data;

    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        const error = new Error('User not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        const error = new Error('Current user not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        const error = new Error('Unauthorized action!') as any;
        error.statusCode = 403;
        throw error;
    }
    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        const error = new Error('Project not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName });
    if (existingPipeline) {
        const error = new Error('Pipeline already exists!') as any;
        error.statusCode = 400;
    }
    const existingView = await jenkins.view.exists(username);
    if (!existingView) {
        await jenkins.view.create(username, "list");
    }

    const { email } = userExists;
    const { framework, repositoryUrl, orgRepositoryUrl } = projectExists;

    const newPipeline = new Pipeline({
        pipelineName,
        username,
        projectName
    });

    const pipelineScript = generatePipelineScript(projectName, framework, username, gitBranch, repositoryUrl, email, orgRepositoryUrl || '');

    const pipelineJobXML = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('flow-definition', { plugin: 'workflow-job@2.40' })
        .ele('description').txt(`Pipeline for project: ${projectName}`).up()
        .ele('keepDependencies').txt('false').up()
        .ele('properties').up()
        .ele('definition', { class: 'org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition', plugin: 'workflow-cps@2.94' })
        .ele('script').txt(pipelineScript).up()
        .ele('sandbox').txt('true').up()
        .up()
        .ele('triggers').up()
        .ele('disabled').txt('false').up()
        .end({ prettyPrint: true });

    await jenkins.job.create(pipelineName, pipelineJobXML);
    await jenkins.view.add(username, pipelineName);
    await newPipeline.save();
    return newPipeline;
};


/**
 * @author Mennatallah Ashraf
 * @des Service function for triggering a build for an existing pipeline
 * @throws Will throw an error with appropriate message and status code
 */
export const triggerBuildService = async (
    data: TriggerBuildData,
    currentUsername: string
): Promise<IPipeline> => {
    const {
        pipelineName,
        username,
        projectName,
    } = data;

    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        const error = new Error('User not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        const error = new Error('Current user not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        const error = new Error('Unauthorized action!') as any;
        error.statusCode = 403;
        throw error;
    }
    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        const error = new Error('Project not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName });
    if (!existingPipeline) {
        const error = new Error('Pipeline not found!') as any;
        error.statusCode = 400;
        throw error;
    }
    await jenkins.job.build(pipelineName);
    existingPipeline.lastBuildNumber += 1;
    existingPipeline.lastBuildTime = new Date();
    await existingPipeline.save();

    return existingPipeline;
};