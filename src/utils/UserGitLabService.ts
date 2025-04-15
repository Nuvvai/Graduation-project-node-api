import axios from "axios";

/**
 * Interface for the UserGitLabService class.
 * 
 * @HazemSabry
 */
interface IUserGitLabService {
    /**
     * Fetches the list of repositories from GitLab for the authenticated user.
     *
     * @returns {Promise<unknown[]>} A promise that resolves to an array of repository objects.
     * @throws {Error} Throws an error if the request to fetch repositories fails.
     *
     * @remarks
     * This method currently contains a placeholder implementation and needs to be updated
     * with the actual API call to GitLab. Ensure that the `GitLabAccessToken` is properly
     * set before making the request.
     *
     * @example
     * ```typescript
     * const userGitLabService = new UserGitLabService(username, accessToken);
     * const repos = await userGitLabService.getGitLabRepos();
     * console.log(repos);
     * ```
     * @HazemSabry
     */
    getRepos (): Promise<unknown[]>

    /**
     * Generates a repository token for GitLab.
     * 
     * This method is intended to create a fine-grained token for accessing a specific GitLab repository.
     * The implementation is currently incomplete and returns `void`.
     * 
     * @returns A promise that resolves to an object containing the `repoToken` string, or `void` if the token generation fails.
     * @throws Logs an error to the console if an exception occurs during token generation.
     * @HazemSabry
     */
    generateRepoToken(repoName: string): Promise<{ repoToken: string } | void>;

    /**
     * Creates a webhook for a specified GitLab repository.
     * 
     * This method is responsible for configuring and sending a request to GitLab's API
     * to create a webhook for a repository. The webhook can be used to receive events
     * from the repository, such as push events or merge requests.
     * 
     * @throws {Error} If an error occurs while creating the webhook, it logs the error
     * and rethrows it for further handling.
     * 
     * @returns {Promise<void>} A promise that resolves when the webhook creation process
     * is complete. If successful, the webhook is created; otherwise, an error is logged.
     * @HazemSabry
     */
    createWebhook(repoFullName: string): Promise<{ message: string } | void>;
}

/**
 * Service class for interacting with GitLab APIs on behalf of a user.
 * 
 * @HazemSabry
 */
class UserGitLabService implements IUserGitLabService {
    /**The URL of the Jenkins server for receiving webhook payloads.*/
    private JENKINS_URL: string;
    /**The GitLab username of the user.*/
    private username: string;
    /**The GitLab personal access token for authentication.*/
    private accessToken: string;

    constructor(username:string, accessToken: string, JENKINS_URL: string = process.env.JENKINS_URL || 'http://localhost:8080') {
        this.username = username;
        this.accessToken = accessToken;
        this.JENKINS_URL = JENKINS_URL;
    }

    async getRepos (): Promise<unknown[]> {
        try {
            // const response = await axios.get("https://", { headers: { Authorization: `token ${this.GitLabAccessToken}` } });
            // return response.data; // Array of repo objects

            return []; // Placeholder for actual implementation
            
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching GitLab repos:", error.response?.data || error.message);
            } else {
                console.error("Error fetching GitLab repos:", error);
            }
            throw new Error("Failed to fetch GitLab repositories");
        }
    };

    async generateRepoToken ( /*repoName:string*/): Promise<{repoToken:string} | void> {
        try {
            /**Fine-Grained Token*/
            // const tokenResponse = await axios.post("https://",{},{ headers: { Authorization: `token ${this.GitLabAccessToken}` } });
            // return {repoToken: tokenResponse.data.token };

            return;
        } catch (error: unknown) {
            console.error("❌ Error generating GitLab repo token:", error);
            return;
        }
    }
    
    async createWebhook(/*repoFullName: string*/) {
        /**Configuration for the GitLab webhook.*/
        // const webhookConfig = {};
        
        try {
            /**
             * Response of create a webhook for the specified repository.
             */
            // const response = await axios.post(`https://`,webhookConfig,{ headers: { Authorization: `token ${this.GitLabAccessToken}` } });
            // if (response.status === 200) {
            //     return({ message: "Webhook created" });
            // } else {
            //     console.error("❌ Error creating webhook:", response.statusText);
            //     throw new Error(response.statusText);
            // }
            
            return;

        } catch (error) {
            console.error("❌ Error creating webhook:", error);
            return;
        }
    }
}

export default UserGitLabService;