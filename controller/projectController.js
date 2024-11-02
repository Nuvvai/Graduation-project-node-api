const Project = require('../models/Project');
const User = require('../models/User')

// to create a new project

const createProject = async (req, res) => {
    try {
        const { projectName, username, repositoryUrl } = req.body;
        if (!projectName) {
            return res.status(400).json({
                message: 'Project name is required',
            });
        }
        if (!username) {
            return res.status(400).json({
                message: 'username is required',
            });
        }
        if (!repositoryUrl) {
            return res.status(400).json({
                message: 'repository url is required',
            });
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }

        const newProject = new Project({
            projectName,
            repositoryUrl,
            username
        });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating project',
            error: error.message,
        });
    }
}

// to get all projects from a user
const getAllProjects = async (req, res) => {
    try {
        const { username } = req.params
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const projects = await Project.find({ username })
        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({
            message: "Error finding your projects!",
            error: message.error
        })
    }
}

// delete a project from a specific user
const deleteProject = async (req, res) => {
    try {
        const { username, projectName } = req.body;
        if (!username) {
            return res.status(400).json({ message: "username is required!" })
        }
        if (!projectName) {
            return res.status(400).json({ message: "project name is required!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const projectExists = await Project.findOne({ projectName });
        if (!projectExists) {
            return res.status(404).json({
                message: 'Project not found!'
            })
        }
        // const isOwner = projectExists.username === userExists.name;
        // const isAdmin = userExists.role === 'admin';
        // if(!isOwner && !isAdmin){
        //     return res.status(403).json({message: "You are not authorized to delete this project!"})
        // }
        await Project.findOneAndDelete(projectName);
        res.status(200).json({ message: "Project deleted successfully!" })

    } catch (error) {
        res.status(500).json({
            message: "Error deleting project!",
            error: error.message
        })
    }
}

// to delete all projects from a specfic user
const deleteAllProjects = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(username)
        if (!username) {
            return res.status(400).json({ message: "username is required!" })
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        // const isOwner = projectsExist.username === userExists.name;
        // const isAdmin = userExists.role === 'admin';
        // if(!isOwner && !isAdmin){
        //     return res.status(403).json({message: "You are not authorized to delete this project!"})
        // }
        const projectsDeleted = await Project.deleteMany({ username });
        if (projectsDeleted.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found for this user'
            });
        }
        res.status(200).json({ message: "All projects deleted successfully!" })

    } catch (error) {
        res.status(500).json({
            message: "Error deleting projects!",
            error: error.message
        })
    }
}


module.exports = { createProject, getAllProjects, deleteProject, deleteAllProjects };