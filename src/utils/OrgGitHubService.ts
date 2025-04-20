import { Octokit } from "@octokit/rest";

/**
 * A service class to interact with GitHub's API using Octokit.
 * @HazemSabry
 */
interface IOrgGitHubService {

    /**
     * Creates a new private repository inside an organization.
     * @param repoName - The name of the repository to create.
     * @returns The URL of the created repository.
     * 
     * @HazemSabry
     */
    createPrivateRepo(repoName: string): Promise<string>;

    /**
     * Gets the latest commit SHA of the default branch (e.g., main).
     * @param repoName - The name of the repository.
     * @param branch - The name of the branch (default is "main").
     * @returns The SHA of the latest commit.
     * 
     * @HazemSabry
     */
    getLatestCommitSha(repoName: string, branch?: string): Promise<string>;

    /**
     * Creates a new branch from a given commit SHA.
     * @param repoName - The name of the repository.
     * @param newBranch - The name of the new branch to create.
     * @param baseSha - The SHA of the commit to base the new branch on.
     * 
     * @HazemSabry
     */
    createBranch(repoName: string, newBranch: string, baseSha: string): Promise<void>;

    /**
     * Adds a file to the specified branch.
     * @param repoName - The name of the repository.
     * @param branch - The name of the branch to add the file to.
     * @param filePath - The path of the file to add.
     * @param content - The content of the file to add.
     * @HazemSabry
     */
    addFileToBranch(repoName: string, branch: string, filePath: string, content: string): Promise<void>;

    /**
     * Orchestrates the process: creates a repo, branch, and adds files.
     * @param repoName - The name of the repository to create.
     * @param branchName - The name of the branch to create.
     * @param files - An array of objects containing file paths and contents to add.
     * @returns The URL of the created repository or void if an error occurs.
     * 
     * @HazemSabry
     */
    setupRepoWithFiles(repoName: string, branchName: string, files: Array<{ path: string, content: string }>): Promise<string | void>;
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

    /**The name of the organization to interact with.*/
    private org: string;

    /**
     * Creates an instance of GitHubService.
     * @param authToken - The authentication token for GitHub API.
     * @HazemSabry
     */
    constructor(org: string, authToken: string | undefined = process.env.GITHUB_API_Access_Token) {
        if (!authToken) {
            throw new Error("GitHub API access token is required.");
        }
        this.octokit = new Octokit({ auth: authToken });
        this.org = org;
    }

    async createPrivateRepo( repoName: string): Promise<string>{
        // Step 1: Check if the repository already exists
        try {
            const response = await this.octokit.request("GET /repos/{owner}/{repo}", {
                owner: this.org,
                repo: repoName,
            });
            return response.data.html_url; // Return the existing repository URL
            
        } catch (error: unknown) {
            if ((error as { status?: number }).status === 404) {
                    try {
                        const createResponse = await this.octokit.request("POST /orgs/{org}/repos", {
                            org: this.org,
                            name: repoName,
                            private: true,
                            description: "Private repo created via API",
                        });
                        return createResponse.data.html_url; // Return the newly created repository URL
                    } catch (error) {
                        console.error("❌ Error creating repository:", error);
                        throw error;
                    }

                } else {
                    console.error("❌ Error checking repository existence:", error);
                    throw error;
                }
            }
    }

    async getLatestCommitSha(repoName: string, branch: string = "main") {
        const { data } = await this.octokit.request("GET /repos/{owner}/{repo}/branches/{branch}", {
            owner: this.org,
            repo: repoName,
            branch,
        });
        return data.commit.sha;
    }

    async createBranch( repoName:string, newBranch:string, baseSha:string): Promise<void> {
        try {
            await this.octokit.request("POST /repos/{owner}/{repo}/git/refs", {
                owner: this.org,
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

    async addFileToBranch( repoName: string, branch: string, filePath: string, content: string ): Promise<void>{
        try {
            await this.octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
                owner: this.org,
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

    async setupRepoWithFiles( repoName: string, branchName: string, files: Array<{path:string, content: string}>): Promise<string | void> {
        try {
            // Step 1: Create the private repository
            const repoURL:string = await this.createPrivateRepo( repoName);

            let latestCommitSha: string | undefined;
            try {
                // Step 2: Try to get the latest commit SHA from the default branch
                latestCommitSha = await this.getLatestCommitSha(repoName);
            } catch (error: unknown) {
                if ((error as { status?: number })?.status === 404) {
                    const initialFilePath = "README.md";
                    const initialFileContent = `# Repo For User ${repoName}`;
                    await this.addFileToBranch(repoName, "main", initialFilePath, initialFileContent);
                    latestCommitSha = await this.getLatestCommitSha(repoName); // Retry after creating the initial commit
                } else {
                    throw error;
                }
            }
            
            await this.createBranch( repoName, branchName, latestCommitSha);
            // Step 4: Add each file to the new branch
            for (const file of files) {
                await this.addFileToBranch(repoName, branchName, file.path, file.content);
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
