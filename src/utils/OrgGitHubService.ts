import { Octokit } from "@octokit/rest";

/**
 * A service class to interact with GitHub's API using Octokit.
 * @HazemSabry
 */
interface IOrgGitHubService {

    /**
     * Creates a new private repository inside an organization.
     * @param org - The name of the organization.
     * @param repoName - The name of the repository to create.
     * @returns The URL of the created repository.
     * 
     * @HazemSabry
     */
    createPrivateRepo(org: string, repoName: string): Promise<string>;

    /**
     * Gets the latest commit SHA of the default branch (e.g., main).
     * @param org - The name of the organization.
     * @param repoName - The name of the repository.
     * @param branch - The name of the branch (default is "main").
     * @returns The SHA of the latest commit.
     * 
     * @HazemSabry
     */
    getLatestCommitSha(org: string, repoName: string, branch?: string): Promise<string>;

    /**
     * Creates a new branch from a given commit SHA.
     * @param org - The name of the organization.
     * @param repoName - The name of the repository.
     * @param newBranch - The name of the new branch to create.
     * @param baseSha - The SHA of the commit to base the new branch on.
     * 
     * @HazemSabry
     */
    createBranch(org: string, repoName: string, newBranch: string, baseSha: string): Promise<void>;

    /**
     * Adds a file to the specified branch.
     * @param org - The name of the organization.
     * @param repoName - The name of the repository.
     * @param branch - The name of the branch to add the file to.
     * @param filePath - The path of the file to add.
     * @param content - The content of the file to add.
     * @HazemSabry
     */
    addFileToBranch(org: string, repoName: string, branch: string, filePath: string, content: string): Promise<void>;

    /**
     * Orchestrates the process: creates a repo, branch, and adds files.
     * @param org - The name of the organization.
     * @param repoName - The name of the repository to create.
     * @param branchName - The name of the branch to create.
     * @param files - An array of objects containing file paths and contents to add.
     * @returns The URL of the created repository or void if an error occurs.
     * 
     * @HazemSabry
     */
    setupRepoWithFiles(org: string, repoName: string, branchName: string, files: Array<{ path: string, content: string }>): Promise<string | void>;
}


/**
 * A service class to interact with GitHub's API using Octokit.
 * @HazemSabry
 */

class OrgGitHubService implements IOrgGitHubService{

    /**
     * An instance of the Octokit library used to interact with the GitHub API.
     * This is used to perform various operations such as fetching repository data,
     * managing issues, and other GitHub-related tasks.
     */
    private octokit: Octokit;

    /**
     * Creates an instance of GitHubService.
     * @param authToken - The authentication token for GitHub API.
     * @HazemSabry
     */
    constructor(authToken: string | undefined = process.env.GITHUB_API_Access_Token) {
        this.octokit = new Octokit({ auth: authToken });
    }

    async createPrivateRepo(org: string, repoName: string): Promise<string>{
        try {
            const response = await this.octokit.request("POST /orgs/{org}/repos", {
                org,
                name: repoName,
                private: true,
                description: "Private repo created via API",
            });

            console.log(`✅ Repository created: ${response.data.html_url}`);
            return response.data.html_url;
        } catch (error) {
            console.error("❌ Error creating repository:", error);
            throw error;
        }
    }

    async getLatestCommitSha(org: string, repoName: string, branch: string = "main") {
        try {
            const { data } = await this.octokit.request("GET /repos/{owner}/{repo}/branches/{branch}", {
                owner: org,
                repo: repoName,
                branch,
            });
            return data.commit.sha;
        } catch (error) {
            console.error("❌ Error getting latest commit SHA:", error);
            throw error;
        }
    }

    async createBranch(org:string, repoName:string, newBranch:string, baseSha:string): Promise<void> {
        try {
            await this.octokit.request("POST /repos/{owner}/{repo}/git/refs", {
                owner: org,
                repo: repoName,
                ref: `refs/heads/${newBranch}`,
                sha: baseSha,
            });
            console.log(`✅ New branch created: ${newBranch}`);
        } catch (error) {
            console.error("❌ Error creating branch:", error);
            throw error;
        }
    }

    async addFileToBranch(org: string, repoName: string, branch: string, filePath: string, content: string): Promise<void>{
        try {
            await this.octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: org,
                repo: repoName,
                path: filePath,
                message: `Add ${filePath} to ${branch}`,
                content: Buffer.from(content).toString("base64"), // Convert to Base64
                branch,
            });
            console.log(`✅ File added: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error adding file (${filePath}):`, error);
            throw error;
        }
    }

    async setupRepoWithFiles(org: string, repoName: string, branchName: string, files: Array<{path:string, content: string}>): Promise<string | void> {
        try {
            // Step 1: Create the private repository
            const repoURL:string = await this.createPrivateRepo(org, repoName);

            // Step 2: Get the latest commit SHA from the default branch
            const latestCommitSha = await this.getLatestCommitSha(org, repoName);

            // Step 3: Create a new branch from the latest commit
            await this.createBranch(org, repoName, branchName, latestCommitSha);

            // Step 4: Add each file to the new branch
            for (const file of files) {
                await this.addFileToBranch(org, repoName, branchName, file.path, file.content);
            }

            console.log("🎉 All files have been added successfully!");
            return repoURL;
        } catch (error) {
            console.error("❌ Setup process failed:", error);
            throw error;
        }
    }
}

export default OrgGitHubService;
