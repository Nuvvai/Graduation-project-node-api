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

type ProjectServiceResult =
    | { success: true; project: IProject }
    | { success: false; statusCode: number; message: string };

/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new project
 */
export const createProjectService = async (
  data: CreateProjectData, 
  currentUsername: string
): Promise<ProjectServiceResult> => {
    const {
        projectName, 
        username, 
        repositoryUrl, 
        framework, 
        description 
    } = data;
    
    if (!projectName || !username || !repositoryUrl || !framework) {
        return {success:false, statusCode: 400, message: "All required fields must be provided!"};
    }
    
    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        return {success:false, statusCode: 404, message: "User not found!"};
    }
    
    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        return {success:false, statusCode: 404, message: "Current user not found!"};
    }
    
    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        return {success:false, statusCode: 403, message: "Unauthorized action!"};
    }

    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (projectExists) {
        return {success:false, statusCode: 400, message: "Project with the same name already exists!"};
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
    return {success: true, project: newProject};
};