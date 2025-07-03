import axios from "axios";

/**
 * Interface for the UserGitHubService class.
 * 
 * @HazemSabry
 */
interface IUserGitHubService {
    /**
     * Fetches a list of GitHub repositories for the authenticated user.
     *
     * @throws {Error} Throws an error if the request to fetch repositories fails.
     * 
     * @returns {Promise<unknown[]>} A promise that resolves to an array of repository objects.
     *
     * @example
     * const userGitHubService = new UserGitHubService();
     * const repos = await userGitHubService.getGitHubRepos();
     * console.log(repos);
     * 
     * @HazemSabry
     */
    getRepos(): Promise<unknown[]>
}

/**
 * Service class for interacting with GitHub APIs on behalf of a user.
 * 
 * @HazemSabry
 */
class UserGitHubService implements IUserGitHubService {
    /**The URL of the Jenkins server for receiving webhook payloads.*/
    private JENKINS_URL: string;
    /**The GitHub username of the user.*/
    private githubUsername: string;
    /**The GitHub personal access token for authentication.*/
    private accessToken: string;

    /**
     * Creates an instance of the UserGitHubService.
     *
     * @param githubUsername - The GitHub username of the user.
     * @param accessToken - The personal access token for authenticating with GitHub.
     * @param JENKINS_URL - The URL of the Jenkins server. Defaults to the value of the `JENKINS_URL` environment variable or 'http://localhost:8080' if not provided.
     */
    constructor(githubUsername: string, accessToken: string, JENKINS_URL: string | undefined = process.env.JENKINS_URL) {
        if (!JENKINS_URL) {
            throw new Error("Jenkins URL is required.");
        }
        this.githubUsername = githubUsername;
        this.accessToken = accessToken;
        this.JENKINS_URL = JENKINS_URL;
    }

    async getRepos(): Promise<unknown[]> {
        try {
            const response = await axios.get("https://api.github.com/user/repos", {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    Accept: "application/vnd.github+json"
                },
                params: {
                    visibility: "all", // optional: 'all', 'public', or 'private'
                    affiliation: "owner", // optional: 'owner', 'collaborator', etc.
                    per_page: 100 // optional: number of repos per page (max 100)
                }
            });

            return response.data; // Array of repo objects
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching GitHub repos:", error.response?.data || error.message);
            } else {
                console.error("Error fetching GitHub repos:", error);
            }
            throw new Error("Failed to fetch GitHub repositories");
        }
    };

    async getRepoUrl(repoName: string): Promise<string> {
        return `https://github.com/repos/${this.githubUsername}/${repoName}`;
    }
}

export default UserGitHubService;