import Project, { IProject } from '../models/Project';
import User, { IUser } from '../models/User';

export interface CreateProjectData {
    projectName: string;
    username: string;
    repositoryUrl: string;
    framework: string;
    description?: string;
    orgRepositoryUrl?: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new project
 * @throws Will throw an error with appropriate message and status code
 */
export const createProjectService = async (
  data: CreateProjectData, 
  currentUsername: string
): Promise<IProject> => {
    const {
        projectName, 
        username, 
        repositoryUrl, 
        framework, 
        description 
    } = data;
    
    if (!projectName || !username || !repositoryUrl || !framework) {
        const error = new Error('All required fields must be provided!') as any;
        error.statusCode = 400;
        throw error;
    }
    
    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        const error = new Error('User not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        const error = new Error('Current user not found!') as any;
        error.statusCode = 404;
        throw error;
    }
    
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        const error = new Error('Unauthorized action!') as any;
        error.statusCode = 403;
        throw error;
    }

    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (projectExists) {
        const error = new Error('Project with the same name already exists!') as any;
        error.statusCode = 400;
        throw error;
    }
    
    const newProject = new Project({
        projectName,
        username,
        repositoryUrl,
        framework,
        description,
        orgRepositoryUrl: data.orgRepositoryUrl
    });
    
    await newProject.save();
    return newProject;
};