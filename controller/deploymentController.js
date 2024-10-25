const Deployment = require('../models/Deployment');
const Project = require('../models/Project');

const deploymentController = {
    async createDeployment(req, res) {
        try {
            const { projectName, status='Waiting', startTime= new Date()} = req.body;

            //to check if the project exists using project name
            const projectExists = await Project.findOne({ projectName })
            if (!projectExists){
                return res.status(404).json({message: "Project not found!"})
            }

            const deployment = new Deployment({
                projectName,
                status,
                startTime
            });

            await deployment.save();
            res.status(201).json(deployment)
        }catch(error){
            res.status(500).json({
                error: error.message,
                message: "Error creating deployment!"
            })
        }
    },

    async getAllDeployments(req, res) {
        try{
            const deployments = Deployment.find().sort({startTime: -1}); //starting from the recent deployment
            res.status(200).json(deployments)

        }catch(error){
            res.status(500).json({
                error: error.message,
                message: "Error finding deployments!"
            });
        };
    },

    async getDeploymentsByProject(req, res){
        try{
            const {projectName} = req.params;
            const projectExists = await Project.findOne({ projectName })
            if (!projectExists){
                return res.status(404).json({message: "Project not found!"})
            }
            const deployments = Deployment.find({projectName}).sort({startTime: -1});
            if (!deployments.length){
                return res.status(404).json({message: "Deployments not found for this project!"})
            }
            res.status(200).json(deployments)

        }catch(error){
            res.status(500).json({
                message: "Error fetching deployments!",
                error: error.message
            })
        }
    },

    async getDeploymentById(req, res){
        try{
            const deployment = await Deployment.findById(req.params.id)
            if (!deployment){
                return res.status(404).json({message: "Deployment not found!"})
            }
            res.status(200).json(deployment)

        }catch(error){
            res.status(500).json({
                message: "Error fetching deployment!",
                error: error.message
            })
        }
    },

    async deleteDeployment(req, res){
        try{
            const deployment = Deployment.findById(req.params.id);
            if(!deployment){
                return res.status(404).json({message: "Deployment not found!"})
            }
            await deployment.remove()
            res.status(200).json({message: "Deployment deleted successfully!"})
        }catch(error){
            res.status(500).json({
                message: "Error deleting deployment!",
                error: error.message
            })
        }
    }
}
// TODO: implement getDeploymentStats and updateDeploymentStatus
module.exports = deploymentController;