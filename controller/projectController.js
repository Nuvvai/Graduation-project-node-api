const Project = require('../models/Project');
const project = require('../models/Project');

// to create a new project
const createProject = async (req, res) =>{
    const { name, repositoryUrl } = req.body;
    const newProject = new Project({
         name, 
         repositoryUrl 
        //uncomment when username is ready
        //  username: req.user.id 
        });
    try{
        await newProject.save();
        res.status(201).json(newProject);
    }catch(error){
        res.status(500).json({ error: "Error creating project!" });
    }
}

// to get all projects from a user
const getProjects = async (req, res) =>{
    try{
        const projects = await Project.find({username: req.user.id})
        res.status(200).json(projects);

    }catch(error){
        res.status(500).json({error: "Error finding your projects!"})
    }
}

module.exports = {createProject, getProjects};