import { Request, Response, NextFunction } from 'express';
import Pipeline, {IPipeline} from '../models/Pipeline';
import Project, {IProject} from '../models/Project';
import User, { IUser } from '../models/User';
import jenkins from '../utils/jenkinsClient';
import { error } from 'console';
import xml2js from 'xml2js';
import { createPipelineService, triggerBuildService } from '../services/pipelineService';

interface CreatePipelineRequestParams {
    username: string;
    projectName: string;
}

interface CreatePipelineRequestBody {
    pipelineName: string;
    installationId: string;
    inputsObject: {
        branch: string;
        testCommand?: string;
        testDirectory?: string;
    };
}

interface TriggerBuildRequestParams {
    username: string;
    projectName: string;
    pipelineName: string;
}

interface GetBuildStatusRequestParams {
    username: string;
    projectName: string;
    pipelineName: string;
    buildNumber: string;
}

interface DeletePipelineRequestParams {
    username: string;
    projectName: string;
    pipelineName: string;
}

interface StopBuildRequestParams {
    username: string;
    projectName: string;
    pipelineName: string;
    buildNumber: string;
}

interface UpdatePipelineScriptRequestParams {
    username: string;
    projectName: string;
    pipelineName: string;
}

interface UpdatePipelineScriptRequestBody {
    newScript: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for creating a new pipeline for a project.
 * @route POST /pipelines/:username/:projectName
 * @access private
 */
export const createPipeline = async (
    req: Request<CreatePipelineRequestParams, {}, CreatePipelineRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName } : CreatePipelineRequestParams= req.params;
    const { branch, testCommand, testDirectory } = req.body.inputsObject;
    const namespace = `${username}-${projectName}`;
    const pipelineName = `${namespace}-pipeline`
    const deploymentName = `${namespace}-deployment`;
    const user = req.user as IUser;
    try {
        const newPipeline = await createPipelineService(
            {
                projectName,
                username,
                pipelineName,
                gitBranch: branch || 'main',
                installationId: req.body.installationId, 
                deploymentName, 
                namespace,
                testCommand: testCommand || '',
                testDirectory: testDirectory || '',
            },
            user.username
        );
        if (!newPipeline.success) {
            res.status(newPipeline.statusCode).json({ message: newPipeline.message });
            return;
        }
        res.status(201).json({ message: 'Pipeline created successfully', newPipeline: newPipeline.pipeline });   
    }catch(error){
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for triggering build for a pipeline.
 * @route POST /pipelines/:username/:projectName/:pipelineName
 * @access private
 */
export const triggerBuild = async (
    req: Request<TriggerBuildRequestParams>,
    res: Response,
    next: NextFunction
):  Promise<void> => {
    const { username, projectName, pipelineName } : TriggerBuildRequestParams = req.params;
    const user = req.user as IUser;
    try {
        const existingPipeline = await triggerBuildService(
            {
                projectName,
                username,
                pipelineName,
            },
            user.username
        );
        if (!existingPipeline.success) {
            res.status(existingPipeline.statusCode).json({ message: existingPipeline.message });
            return;
        }
        res.status(201).json({ message: `Build triggered for pipeline: ${pipelineName}`, existingPipeline: existingPipeline.pipeline });
    }catch(error){
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for getting build status for a pipeline.
 * @route GET /pipelines/:username/:projectName/:pipelineName/:buildNumber/status
 * @access private
 */
export const getBuildStatus = async (
    req: Request<GetBuildStatusRequestParams>,
    res: Response,
    next: NextFunction
):  Promise<void> => {
    const {username, projectName, pipelineName} : GetBuildStatusRequestParams = req.params;
    const buildNumber = parseInt(req.params.buildNumber);
    const user = req.user as IUser;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (!projectExists) {
            res.status(404).json({message: 'Project not found!'})
            return;
        }
        const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName, pipelineName});
        if (!existingPipeline) {
            res.status(404).json({ message: 'Pipeline not found!' });
            return;
        }
        if (existingPipeline.lastBuildNumber === 0){
          res.status(400).json({message: "There are no builds for this pipeline!"})
          return;
        }
        if (existingPipeline.lastBuildNumber < buildNumber){
          res.status(400).json({message: "There is no build with this number!"})
          return;
        }
        const build  = await jenkins.build.get(pipelineName, buildNumber);
        res.status(200).json({status: build.result, build})
    }catch(error){
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting a pipeline.
 * @route  DELETE /pipelines/:username/:projectName/:pipelineName
 * @access private
 */
export const deletePipeline = async (
    req: Request<DeletePipelineRequestParams>,
    res: Response,
    next: NextFunction
):  Promise<void> => {
    const{username, projectName, pipelineName} : DeletePipelineRequestParams =  req.params;
    const user = req.user as IUser;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (!projectExists) {
            res.status(404).json({message: 'Project not found!'})
            return;
        }
        const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName, pipelineName});
        if (!existingPipeline) {
            res.status(404).json({ message: 'Pipeline not found!' });
            return;
        }
        await jenkins.job.destroy(pipelineName);
        await Pipeline.findOneAndDelete<IPipeline>({ username, projectName, pipelineName });
        res.status(200).json({message: "Pipeline deleted successfully!"});
    }catch{
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for updating pipeline script.
 * @route PUT /pipelines/:username/:projectName/:pipelineName
 * @access admin
 */
export const updatePipelineScript = async (
    req: Request<UpdatePipelineScriptRequestParams, {}, UpdatePipelineScriptRequestBody>,
    res: Response,
    next: NextFunction
):  Promise<void> => {
    const { username, projectName, pipelineName } :UpdatePipelineScriptRequestParams = req.params;
    const { newScript } : UpdatePipelineScriptRequestBody = req.body;
    const user = req.user as IUser;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (!projectExists) {
            res.status(404).json({message: 'Project not found!'})
            return;
        }
        const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName, pipelineName});
        if (!existingPipeline) {
            res.status(404).json({ message: 'Pipeline not found!' });
            return;
        }

        const jobConfigXML = await jenkins.job.config(pipelineName);
        const configJson = await xml2js.parseStringPromise(jobConfigXML);
        if (newScript) {
          configJson['flow-definition']['definition'][0]['script'][0] = newScript;
        }
        //convert updated json back to XML
        const updatedJobConfigXML = new xml2js.Builder().buildObject(configJson);

        await jenkins.job.config(pipelineName, updatedJobConfigXML);

        res.status(200).json({message: 'Pipeline updated successfully!'});

    }catch{
        next(error)
    }
}


// not tested yet------------------------------------------------------------------

/**
 * @author Mennatallah Ashraf
 * @des Controller function for stopping a build.
 * @route POST /pipelines/:username/:projectName/:pipelineName/:buildNumber
 * @access private
 */
export const stopBuild = async (
    req: Request<StopBuildRequestParams>,
    res: Response,
    next: NextFunction
):  Promise<void> => {
    const { username, projectName, pipelineName} : StopBuildRequestParams= req.params;
    const buildNumber = parseInt(req.params.buildNumber);
    const user = req.user as IUser;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (!projectExists) {
            res.status(404).json({message: 'Project not found!'})
            return;
        }
        const existingPipeline = await Pipeline.findOne<IPipeline>({ username, projectName, pipelineName});
        if (!existingPipeline) {
            res.status(404).json({ message: 'Pipeline not found!' });
            return;
        }
        if (existingPipeline.lastBuildNumber === 0){
            res.status(400).json({message: "There are no builds for this pipeline!"})
            return;
        }
        if (existingPipeline.lastBuildNumber < buildNumber){
            res.status(400).json({message: "There is no build with this number!"})
            return;
        }
        await jenkins.build.stop(pipelineName, buildNumber); // error here
        res.status(200).json({message: "Build is stopped successfully!"})

    }catch(error){
        next(error);
    }
}
