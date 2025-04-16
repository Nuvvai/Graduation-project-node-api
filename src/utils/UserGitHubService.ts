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
     * @async
     * @function
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
    getRepos (): Promise<unknown[]>

    /**
     * Generates a fine-grained GitHub repository token for a specific user and repository.
     *
     * @param username - The GitHub username of the repository owner.
     * @param userAccessToken - The user's personal access token for authentication.
     * @param repoName - The name of the repository for which the token is being generated.
     * @returns A promise that resolves to an object containing the repository token (`repoToken`) 
     *          or void if an error occurs.
     *
     * @throws Will log an error message to the console if the token generation fails.
     * 
     * @HazemSabry
     */
    generateRepoToken(username: string, userAccessToken: string, repoName: string): Promise<{ repoToken: string } | void>;
    
    /**
     * Creates a GitHub webhook for a specified repository.
     *
     * @param repoFullName - The full name of the repository (e.g., "username/repo").
     * @param githubToken - The GitHub personal access token with the necessary permissions.
     * @returns A promise that resolves to an object containing a success message and webhook details,
     *          or undefined if an error occurs.
     *
     * @remarks
     * The webhook is configured to listen to "push" events and sends payloads to the specified URL.
     * Ensure that the `GITHUB_WEBHOOK_SECRET` environment variable is set for securing the webhook.
     *
     * @throws An error if the request to create the webhook fails.
     * 
     * @HazemSabry
     */
    createWebhook(repoFullName: string, githubToken: string): Promise<{ message: string } | void>;
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
    private username: string;
    /**The GitHub personal access token for authentication.*/
    private accessToken: string;

    constructor(username:string, accessToken: string, JENKINS_URL: string = process.env.JENKINS_URL || 'http://localhost:8080') {
        this.username = username;
        this.accessToken = accessToken;
        this.JENKINS_URL = JENKINS_URL;
    }

    async getRepos (): Promise<unknown[]> {
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

    async generateRepoToken ( repoName:string): Promise<{repoToken:string} | void> {
        try {

            /**
             *  Fine-Grained Token
             */
            const tokenResponse = await axios.post(
                "https://api.github.com/user/repos",
                {
                    owner: this.username,
                    repo: repoName,
                    permissions: { contents: "write" }, // Allow Jenkins checkout
                },
                { headers: { Authorization: `Bearer ${this.accessToken}` } }
            );

            return {repoToken: tokenResponse.data.token };
        } catch (error: unknown) {
            console.error("❌ Error generating GitHub repo token:", error);
            return;
        }
    }
    
    async createWebhook(repoFullName: string) {
        /**
         * Configuration for the GitHub webhook.
         */
        const webhookConfig = {
            name: "web",
            active: true,
            events: ["push"],
            config: {
                url: this.JENKINS_URL,
                content_type: "json",
                secret: process.env.GITHUB_WEBHOOK_SECRET,
            },
        };

        try {
            /**
             * Response of create a webhook for the specified repository.
             */
            const response = await axios.post(
                `https://api.github.com/repos/${repoFullName}/hooks`,
                webhookConfig,
                { headers: { Authorization: `token ${this.accessToken}` } }
            );
            if (response.status === 200) {
                return({ message: "Webhook created" });
            } else {
                console.error("❌ Error creating webhook:", response.statusText);
                throw new Error(response.statusText);
            }

        } catch (error) {
            console.error("❌ Error creating webhook:", error);
            return;
        }
    }
}

export default UserGitHubService;