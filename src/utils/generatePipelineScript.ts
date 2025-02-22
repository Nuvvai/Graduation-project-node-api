import { getInstallCommand, getBuildCommand } from "./commandHelpers";

/**
 * @author: Mennatallah Ashraf
 * @description: Generate a Jenkins pipeline script.
 * @param frontendFramework: The frontend framework used in the project.
 * @param backendFramework: The backend framework used in the project.
 * @param username: The username of the project owner.
 * @param projectName: The name of the project.
 * @param gitBranch: The git branch to be used in the pipeline.
 * @param repositoryUrl: The URL of the project's repository.
 * @returns: A string representing the Jenkins pipeline script.
 */
export const generatePipelineScript = (frontendFramework: string, backendFramework: string, username: string, projectName: string, gitBranch: string, repositoryUrl: string): string => {
  return `
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: '${gitBranch}', 
                url: '${repositoryUrl}'
            }
        }
        
        stage('Install Dependencies - Frontend') {
            steps {
                script {
                    sh '${getInstallCommand(frontendFramework, "frontend")}'
                }
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                script {
                    sh '${getInstallCommand(backendFramework, "backend")}'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    sh '${getBuildCommand(frontendFramework, "frontend")}'
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    sh '${getBuildCommand(backendFramework, "backend")}'
                }
            }
        }

        stage('Docker Build and Push') {
            steps {
                script {
                    sh 'docker build -t ${username}/${projectName}-frontend:latest -f Dockerfile.frontend .'
                    sh 'docker build -t ${username}/${projectName}-backend:latest -f Dockerfile.backend .'
                    sh 'docker push ${username}/${projectName}-frontend:latest'
                    sh 'docker push ${username}/${projectName}-backend:latest'
                }
            }
        }
    }
}
`;
};
