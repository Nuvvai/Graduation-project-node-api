const path = require('path');
const Deployment = require(path.join(__dirname, '..', 'models', 'Deployment'));
const Project = require(path.join(__dirname, '..', 'models', 'Project'));
const User = require(path.join(__dirname, '..', 'models', 'User'));

/**
 * Creates a new deployment.
 * 
 * @async
 * @function createDeployment
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.projectName - The name of the project.
 * @param {string} req.body.username - The name of the user.
 * @param {string} [req.body.status='No status'] - The status of the deployment.
 * @param {Date} [req.body.startTime=new Date()] - The start time of the deployment.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 * @throws {Error} - Throws an error if there is an issue creating the deployment.
 */
const createDeployment = async (req, res) => {
    try {
        const { projectName, username, status = 'No status', startTime = new Date() } = req.body;
        if (!projectName) {
            return res.status(400).json({ message: "Project name is required!" })
        }
        if (!username) {
            return res.status(400).json({ message: "username is required!" })
        }
        //to check if the project exists using project name
        const projectExists = await Project.findOne({ projectName });
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }

        const deployment = new Deployment({
            projectName,
            username,
            status,
            startTime
        });

        await deployment.save();
        res.status(201).json(deployment)
    } catch (error) {
        res.status(500).json({
            message: "Error creating deployment!",
            error: error.message
        })
    }
}


/**
 * Retrieves all deployments for a specific user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username to find deployments for.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 *
 * @throws {Error} - If there is an error finding deployments.
 */
const getAllDeployments = async (req, res) => {
    try {
        const { username } = req.params;
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const deployments = await Deployment.find({ username }).sort({ startTime: -1 }); //starting from the recent deployment
        if (!deployments.length) {
            return res.status(404).json({ message: "Deployments not found for this user!" })
        }
        res.status(200).json(deployments)

    } catch (error) {
        res.status(500).json({
            message: "Error finding deployments!",
            error: error.message
        });
    };
}


/**
 * Retrieves deployments for a specific project and user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username of the user.
 * @param {string} req.params.projectName - The name of the project.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
const getDeploymentsByProject = async (req, res) => {
    try {
        const { username, projectName } = req.params;
        const projectExists = await Project.findOne({ projectName });
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const deployments = await Deployment.find({ username, projectName }).sort({ startTime: -1 });
        if (!deployments.length) {
            return res.status(404).json({ message: "Deployments not found for this project!" })
        }
        res.status(200).json(deployments)

    } catch (error) {
        res.status(500).json({
            message: "Error fetching deployments!",
            error: error.message
        })
    }
}

/**
 * Deletes deployments for a specific user and project.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the request.
 * @param {string} req.params.username - The username of the user.
 * @param {string} req.params.projectName - The name of the project.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const deleteDeployments = async (req, res) => {
    try {
        const { username, projectName } = req.params;
        const projectExists = await Project.findOne({ projectName });
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const deploymentsDeleted = await Deployment.deleteMany({ username, projectName });
        if (deploymentsDeleted.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No deployments found for this project'
            });
        }
        res.status(200).json({ message: "Deployments deleted successfully!" })
    } catch (error) {
        res.status(500).json({
            message: "Error deleting deployment!",
            error: error.message
        })
    }
}

/**
 * Updates the deployment status for a given project and user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.projectName - The name of the project.
 * @param {string} req.body.username - The name of the user.
 * @param {string} req.body.status - The status of the deployment. Must be one of 'No status', 'Failed', or 'Succeeded'.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - Returns a promise that resolves to void.
 */
const updateDeploymentStatus = async (req, res)=>{
    try{
        const {projectName, username, status} = req.body;
        const projectExists = await Project.findOne({ projectName });
        if (!projectExists) {
            return res.status(404).json({ message: "Project not found!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        if(!['No status', 'Failed', 'Succeeded'].includes(status)){
            return res.status(400).json({message: "Invalid status!"})
        }
        const deployment = await Deployment.findOne({projectName, username});
        if(!deployment){
            return res.status(404).json({message: "Deployments not found!"})
        }
        deployment.status = status;
        if(status === "Failed" || status === "Succeeded"){
            deployment.endTime = endTime || new Date();
        }
        const updatedDeployment = await deployment.save();
        res.status(200).json(updatedDeployment);
    }catch(error){
        res.status(500).json({
            message: "Error updating deployment status!",
            error: error.message
        })
    }
}

// TODO: implement getDeploymentStats
module.exports = { createDeployment, getAllDeployments, getDeploymentsByProject, deleteDeployments, updateDeploymentStatus };