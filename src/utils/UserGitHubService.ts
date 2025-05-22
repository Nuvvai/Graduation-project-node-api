import axios from "axios";
import jwt from "jsonwebtoken";

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
    getRepos (): Promise<unknown[]>

    /**
     * Generates a fine-grained GitHub repository token for a specific user and repository.
     *
     * @param repoName - The name of the repository for which the token is being generated.
     * @returns A promise that resolves to an object containing the repository token (`repoToken`) 
     *          or void if an error occurs.
     *
     * @throws Will log an error message to the console if the token generation fails.
     * 
     * @HazemSabry
     */
    generateRepoToken(repoName: string): Promise<{ repoToken: string } | void>;
    
    /**
     * Creates a GitHub webhook for a specified repository.
     *
     * @param repoName - The name of the repository.
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
    createWebhook(repoName: string): Promise<{ message: string } | void>;
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

    async generateRepoToken(repoName: string): Promise<{ repoToken: string } | void> {
        try {
            // Step 1: Generate a JWT for the GitHub App
            const appId = process.env.GITHUB_APP_ID!;
            const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!;
            const jwtToken = jwt.sign(
                {
                    iat: Math.floor(Date.now() / 1000), // Issued at time
                    exp: Math.floor(Date.now() / 1000) + 600, // Expiration time (10 minutes)
                    iss: appId, // GitHub App ID
                },
                privateKey,
                { algorithm: "RS256" }
            );

            // Step 2: Get the installation ID for the repository
            const installationResponse = await axios.get(
                `https://api.github.com/repos/${this.githubUsername}/${repoName}/installation`,
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                }
            );
            const installationId = installationResponse.data.id;

            // Step 3: Generate an installation access token
            const tokenResponse = await axios.post(
                `https://api.github.com/app/installations/${installationId}/access_tokens`,
                {},
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                }
            );

            return { repoToken: tokenResponse.data.token };
        } catch (error: unknown) {
            console.error("❌ Error generating GitHub repo token:", error);
            return;
        }
    }
    
    async createWebhook(repoName: string) {
        /**Configuration for the GitHub webhook.*/
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
            /**Response of create a webhook for the specified repository.*/
            const response = await axios.post(
                `https://api.github.com/repos/${this.githubUsername}/${repoName}/hooks`,
                webhookConfig,
                { headers: { Authorization: `token ${this.accessToken}` } }
            );
            if (response.status === 200 || response.status === 201) {
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