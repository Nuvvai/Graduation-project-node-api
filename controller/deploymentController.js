const path = require('path');
const Deployment = require(path.join(__dirname, '..', 'models', 'Deployment'));
const Project = require(path.join(__dirname, '..', 'models', 'Project'));
const User = require(path.join(__dirname, '..', 'models', 'User'));

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

// get all deployments of a specific user
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

// get all deployments of a specific project
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

// delete all deployments from a specific project
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