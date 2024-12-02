const path = require('path');
const Project = require(path.join(__dirname, '..', 'models', 'Project'));
const User = require(path.join(__dirname, '..', 'models', 'User'));

/**
 * Creates a new project for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username of the user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.projectName - The name of the project.
 * @param {string} req.body.repositoryUrl - The URL of the project's repository.
 * @param {string} req.body.frontendFramework - The frontend framework used in the project.
 * @param {string} req.body.backendFramework - The backend framework used in the project.
 * @param {string} req.body.database - The database used in the project.
 * @param {string} [req.body.description] - The description of the project.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the project is created.
 */
const createProject = async (req, res) => {
    try {
        const { username } = req.params;
        const { projectName, repositoryUrl, frontendFramework, backendFramework, database, description } = req.body;
        if (!projectName) {
            return res.status(400).json({
                message: 'Project name is required',
            });
        }
        if (!username) {
            return res.status(400).json({
                message: 'Username is required',
            });
        }
        if (!repositoryUrl) {
            return res.status(400).json({
                message: 'Repository url is required',
            });
        }
        if (!frontendFramework) {
            return res.status(400).json({
                message: 'Frontend framework is required',
            });
        }
        if (!backendFramework) {
            return res.status(400).json({
                message: 'Backend framework is required',
            });
        }
        if (!database) {
            return res.status(400).json({
                message: 'Database is required',
            });
        }
        const userExists = await User.findOne({ name: username });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const projectExists = await Project.findOne({ username, projectName });
        if (projectExists) {
            return res.status(403).json({ message: "Project with the same name already exists!" })
        }
        const newProject = new Project({
            projectName,
            username,
            repositoryUrl,
            frontendFramework,
            backendFramework,
            database,
            description
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


/**
 * Retrieves all projects for a given user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
const getAllProjects = async (req, res) => {
    try {
        const { username } = req.params;
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


/**
 * Deletes a project based on the provided username and project name.
 * 
 * @async
 * @function deleteProject
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.username - The username of the user.
 * @param {string} req.body.projectName - The name of the project to be deleted.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {Error} - If there is an error during the deletion process.
 */
const deleteProject = async (req, res) => {
    try {
        const { username, projectName } = req.params;
        if (!username) {
            return res.status(400).json({ message: "Username is required!" })
        }
        if (!projectName) {
            return res.status(400).json({ message: "Project name is required!" })
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


/**
 * Deletes all projects associated with a specific user.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.username - The username of the user whose projects are to be deleted.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @throws {Error} - If there is an error during the deletion process.
 */
const deleteAllProjects = async (req, res) => {
    try {
        const { username } = req.params;
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