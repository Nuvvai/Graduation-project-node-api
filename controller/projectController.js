const Project = require('../models/Project');

// to create a new project
const projectController = {
    async createProject (req, res){
        try{
        const { projectName, repositoryUrl } = req.body;
        if (!projectName) {
            return res.status(400).json({
              message: 'Project name is required',
            });
        }
        const newProject = new Project({
            projectName, 
            repositoryUrl 
            //uncomment when username is ready
            //  username: req.user.id 
        });
        await newProject.save();
        res.status(201).json(newProject);
        }catch(error){
            if (error.code === 11000) {
                //duplicate key error
                return res.status(400).json({
                  message: 'Project with the same name already exists',
                  error: error.message,
                });
            }else {
                res.status(500).json({
                  message: 'Error creating project',
                  error: error.message,
                });
            }
        }
    },

    // to get all projects from a user
    async getAllProjects (req, res){
        try{
            const projects = await Project.find({username: req.user.id})
            res.status(200).json(projects);

        }catch(error){
            res.status(500).json({
                message: "Error finding your projects!",
                error: message.error
            })
        }
    }
}

module.exports = projectController;