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
    installationId: string;
    deploymentName: string;
    namespace: string;
}

export interface TriggerBuildData {
    username: string;
    projectName: string;
    pipelineName: string;
}

type PipelineServiceResult =
    | { success: true; pipeline: IPipeline }
    | { success: false; statusCode: number; message: string };

/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new pipeline
 */
export const createPipelineService = async (
    data: CreatePipelineData,
    currentUsername: string
): Promise<PipelineServiceResult> => {
    const {
        pipelineName,
        username,
        projectName,
        gitBranch,
        installationId,
        deploymentName,
        namespace
    } = data;

    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        return {success:false, statusCode: 404, message: "User not found!"};
    }
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        return {success:false, statusCode: 404, message: "Current user not found!"};
    }
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        return {success:false, statusCode: 403, message: "Unauthorized action!"};
    }
    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        return {success:false, statusCode: 404, message: "Project not found!"};
    }
    const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName });
    if (existingPipeline) {
        return {success:false, statusCode: 400, message: "Pipeline already exists!"};
    }
    const existingView = await jenkins.view.exists(username);
    if (!existingView) {
        await jenkins.view.create(username, "list");
    }

    const { email } = userExists;
    const { technology, repositoryUrl, orgRepositoryUrl } = projectExists;

    const newPipeline = new Pipeline({
        pipelineName,
        username,
        projectName
    });

    const pipelineScript = generatePipelineScript(
        projectName, 
        technology, 
        username, 
        gitBranch, 
        repositoryUrl, 
        email, 
        orgRepositoryUrl || '', 
        installationId,
        deploymentName,
        namespace
    );

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
    return { success: true, pipeline: newPipeline };
};


/**
 * @author Mennatallah Ashraf
 * @des Service function for triggering a build for an existing pipeline
 */
export const triggerBuildService = async (
    data: TriggerBuildData,
    currentUsername: string
): Promise<PipelineServiceResult> => {
    const {
        pipelineName,
        username,
        projectName,
    } = data;

    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        return {success:false, statusCode: 404, message: "User not found!"};
    }
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        return {success:false, statusCode: 404, message: "Current user not found!"};
    }
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        return {success:false, statusCode: 403, message: "Unauthorized action!"};
    }
    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        return {success:false, statusCode: 404, message: "Project not found!"};
    }
    const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName });
    if (!existingPipeline) {
        return {success:false, statusCode: 404, message: "Pipeline not found!"};
    }
    await jenkins.job.build(pipelineName);
    existingPipeline.lastBuildNumber += 1;
    existingPipeline.lastBuildTime = new Date();
    await existingPipeline.save();

    return { success: true, pipeline: existingPipeline };
};