const path = require('path');
const Pipeline = require(path.join(__dirname, '..', 'models', 'Pipeline'));
const Project = require(path.join(__dirname, '..', 'models', 'Project'));
const User = require(path.join(__dirname, '..', 'models', 'User'));
const jenkins = require(path.join(__dirname, '..', 'utils', 'jenkinsClient'))
const { create } = require('xmlbuilder2');


/**
 * Creates a new Jenkins pipeline for a given user and project.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username of the user.
 * @param {string} req.params.projectName - The name of the project.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.pipelineName - The name of the pipeline to be created.
 * @param {string} req.body.gitUsername - The Git username for repository access.
 * @param {string} req.body.gitPassword - The Git password for repository access.
 * @param {string} req.body.gitBranch - The Git branch to be used in the pipeline.
 * @param {Object} res - The response object.
 * 
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * 
 * @throws {Error} - Throws an error if there is an issue creating the pipeline.
 */
const createPipeline = async (req, res) =>{
    try{
        const { username, projectName } = req.params;
        const { pipelineName, gitBranch } = req.body;
        // const { gitUsername, gitPassword } = req.body;
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({message: 'User not found!'})
        }
        const projectExists = await Project.findOne({ username, projectName });
        if (!projectExists) {
            return res.status(404).json({
                message: 'Project not found!'
            })
        }
        const existingPipeline = await Pipeline.findOne({ username, projectName});
        if (existingPipeline) {
            return res.status(400).json({ message: 'Pipeline already exists!' });
        }
        const repoUrl = projectExists.repositoryUrl;
        const newPipeline = new Pipeline({
            pipelineName,
            username,
            projectName
        });

        // not tested yet-------------------------------------------------------
        // const credentialId = `${username}-${projectName}-credentials`;
        // const credentialsOptions = {
        //   id: credentialId,
        //   type: 'usernamePassword',
        //   username: gitUsername,
        //   password: gitPassword,
        //   description: `Credentials for ${username}'s project: ${projectName}`,
        // };
        // await jenkins.credentials.create(credentialsOptions);
        //------------------------------------------------------------------------
        const pipelineScript = `pipeline {
            agent any
            stages {
              stage('Checkout') {
                steps {
                    git branch: '${gitBranch}', 
                    url: '${repoUrl}'
                }
              }
              stage('Build') {
                steps {
                  sh 'echo "Building the project..."'
                }
              }
              stage('Deploy') {
                steps {
                  sh 'echo "Deploying the project..."'
                }
              }
            }
        }`;
      
        const pipelineJobXML = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('flow-definition', { plugin: 'workflow-job@2.40' })
              .ele('description').txt(`Pipeline for project: ${projectName}`).up()
              .ele('keepDependencies').txt('false').up()
              .ele('properties').up()
              .ele('definition', { class: 'org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition', plugin: 'workflow-cps@2.94' })
                .ele('script').txt(pipelineScript).up()
                .ele('sandbox').txt('true').up() //for security
              .up()
              .ele('triggers').up()
              .ele('disabled').txt('false').up()
            .end({ prettyPrint: true });

        await jenkins.job.create(pipelineName, pipelineJobXML);
        await newPipeline.save();
        res.status(201).json({ message: 'Pipeline created successfully', pipeline: newPipeline });   
    }catch(error){
        res.status(500).json({
            message: "Error creating pipeline!",
            error: error.message
        })
    }
}

const triggerBuild = async (req, res) =>{
  try{
    const { username, projectName, pipelineName } = req.params;
    const userExists = await User.findOne({ name: username });
    if (!userExists) {
        return res.status(404).json({message: 'User not found!'})
    }
    const projectExists = await Project.findOne({ username, projectName });
    if (!projectExists) {
        return res.status(404).json({
            message: 'Project not found!'
        })
    }
    const existingPipeline = await Pipeline.findOne({ username, projectName, pipelineName});
    if (!existingPipeline) {
        return res.status(404).json({ message: 'Pipeline not found!' });
    }
    await jenkins.job.build(pipelineName);
    existingPipeline.lastBuildNumber += 1;
    existingPipeline.lastBuildTime  = Date.now();
    await existingPipeline.save();
    res.status(201).json({ message: `Build triggered for pipeline: ${pipelineName}`, existingPipeline });
  }catch(error){
    res.status(500).json({
      message: "Error triggering Build!",
      error: error.message
    })
  }
}

const getBuildStatus = async (req, res) => {
  try{
    const {username, projectName, pipelineName, buildNumber} = req.params;
    const userExists = await User.findOne({ name: username });
    if (!userExists) {
        return res.status(404).json({message: 'User not found!'})
    }
    const projectExists = await Project.findOne({ username, projectName });
    if (!projectExists) {
        return res.status(404).json({
            message: 'Project not found!'
        })
    }
    const existingPipeline = await Pipeline.findOne({ username, projectName, pipelineName});
    if (!existingPipeline) {
        return res.status(404).json({ message: 'Pipeline not found!' });
    }
    if (existingPipeline.lastBuildNumber === 0){
      return res.status(400).json({message: "There are no builds for this pipeline!"})
    }
    if (existingPipeline.lastBuildNumber < buildNumber){
      return res.status(400).json({message: "There is no build with this number!"})
    }
    const build  = await jenkins.build.get(pipelineName, buildNumber);
    res.status(200).json({status: build.result, build})
  }catch(error){
    res.status(500).json({
      message: "Error getting build status!",
      error: error.message
    })
  }
}

const deletePipeline = async (req, res) =>{
  try{
    const{username, projectName, pipelineName} =  req.params;
    const userExists = await User.findOne({ name: username });
    if (!userExists) {
        return res.status(404).json({message: 'User not found!'})
    }
    const projectExists = await Project.findOne({ username, projectName });
    if (!projectExists) {
        return res.status(404).json({
            message: 'Project not found!'
        })
    }
    const existingPipeline = await Pipeline.findOne({ username, projectName, pipelineName});
    if (!existingPipeline) {
        return res.status(404).json({ message: 'Pipeline not found!' });
    }
    await jenkins.job.destroy(pipelineName);
    await Pipeline.findOneAndDelete(pipelineName);
    res.status(200).json({message: "Pipeline deleted successfully!"});
  }catch{
    res.status(500).json({
      message: "Error deleting pipeline!",
      error: error.message
    })
  }

}
// //TODO: implement getBuildLogs, updatePipeline, stopBuild

module.exports = { createPipeline, triggerBuild, getBuildStatus, deletePipeline }