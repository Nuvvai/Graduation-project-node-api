import { Request, response, Response } from 'express';

/**
 * Represents an environment variable with a key and value.
 * @interface IEnvVar
 * @property {string} key - The name of the environment variable.
 * @property {string} value - The value of the environment variable.
 * 
 * @HazemSabry
 */
interface IEnvVar {
    /**
     * The name of the environment variable
     */
    key: string;
    /**
     * The value of the environment variable
     */
    value: string;
}


/**
 * Interface representing the request body for generating a Dockerfile.
 * @interface DockerfileRequestBody
 * @property {string} projectName - The name of the project.
 * 
 * @HazemSabry
*/
interface IDockerfileRequestBody {
    /**The name of the project*/
    projectName: string,
}

/**
 * Interface representing the request body for generating a Dockerfile for a specific technology.
 * Extends the `IDockerfileRequestBody` interface.
 * 
 * @interface ITechnologyDockerfileRequestBody
 * @extends {IDockerfileRequestBody}
 * 
 * @property {string} VERSION - The version of the technology to be used in the Dockerfile.
 * @property {IEnvVar[]} [envVars] - Optional array of environment variables to be included in the Dockerfile.
 * 
 * @HazemSabry
 */
interface ITechnologyDockerfileRequestBody extends IDockerfileRequestBody { 
    /**The version of the technology to be used in the Dockerfile.*/
    VERSION: string,
    /**Optional array of environment variables to be included in the Dockerfile.*/
    envVars?: IEnvVar[]
}

/**
 * Interface representing the request body for generating a Dockerfile for a frontend project.
 * Extends the ITechnologyDockerfileRequestBody interface.
 * 
 * @interface IFrontendDockerfileRequestBody
 * @extends {ITechnologyDockerfileRequestBody}
 * 
 * @property {string} buildCommand - The command used to build the frontend project.
 * 
 * @HazemSabry
 */
interface IFrontendDockerfileRequestBody extends ITechnologyDockerfileRequestBody {
    /**The command used to build the frontend project.*/
    buildCommand: string,
    /**The directory where the application will be published*/
    publishDirectory: string,
}

/**
 * Interface representing the request body for generating a Dockerfile for a backend service.
 * Extends the ITechnologyDockerfileRequestBody interface.
 * 
 * @interface IBackendDockerfileRequestBody
 * @extends {ITechnologyDockerfileRequestBody}
 * 
 * @property {number} port - The port number on which the backend service will run.
 * 
 * @HazemSabry
 */
interface IBackendDockerfileRequestBody extends ITechnologyDockerfileRequestBody {
    /**The port number on which the backend service will run.*/
    port: number,
}

/**
 * Interface representing the request body for generating a Dockerfile for an Angular application.
 * Extends the IFrontendDockerfileRequestBody interface.
 * 
 * @interface IAngularDockerfileRequestBody
 * @extends {IFrontendDockerfileRequestBody}
 * 
 * @property {string} APP_NAME - The name of the Angular application.
 * 
 * @HazemSabry
 */
interface IAngularDockerfileRequestBody extends IFrontendDockerfileRequestBody {
    /**The name of the Angular application*/
    APP_NAME: string,
}

/**
 * Interface representing the request body for generating a Dockerfile for a Node.js backend.
 * 
 * @extends IBackendDockerfileRequestBody
 * 
 * @property {string} runCommand - The command to run the Node.js application.
 * 
 * @HazemSabry
 */
interface INodeJSDockerfileRequestBody extends IBackendDockerfileRequestBody {
    /**The command to run the Node.js application.*/
    runCommand: string
}

interface IGenerateDockerfile { 
    /**
     * Generates a Dockerfile for an Nginx static web server.
     * 
     * This function creates a Dockerfile content for a single-stage build of an Nginx server
     * to serve static files for a given project and application owner.
     * 
     * @param body - An object containing the project details.
     * @param body.projectName - The name of the project.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.
     * 
     * @HazemSabry
     */
    nginxStaticWebServer(): Promise<string | void>;

    /**
     * Generates a Dockerfile for an Apache static web server.
     * 
     * This function creates a Dockerfile content string that sets up an Apache web server
     * using the Alpine version of the httpd image. It configures the server to serve static
     * files for a given project and user.
     * 
     * @param body - An object containing the project details.
     * @param body.projectName - The name of the project.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.
     * 
     * @HazemSabry
     */
    apacheStaticWebServer(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a PHP application with an Apache web server.
     * The Dockerfile is built in two stages: 
     * 1. Composer stage for dependency management.
     * 2. Production stage with PHP and Apache.
     * 
     * @param body - The request body containing details for the Dockerfile.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The PHP version to use.
     * @param body.port - The port number to expose.
     * @param body.envVars - An array of environment variables to set in the Dockerfile.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, PHP_VERSION` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.
     * 
     * @HazemSabry
     */
    apachePHPWebServer(): Promise<string | void>;

    /**
     * Generates a Dockerfile for an Angular application with a multi-stage build.
     * The Dockerfile includes a build stage using Node.js and a production stage using Nginx.
     *
     * @param body - The request body containing details for generating the Dockerfile.
     * @param body.projectName - The name of the Angular project.
     * @param body.APP_NAME - The name of the application.
     * @param body.VERSION - The version of Node.js to use.
     * @param body.buildCommand - The command to build the Angular application.
     * @param body.envVars - An array of environment variables to set in the Dockerfile.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, APP_NAME, NODE_VERSION, buildCommand, publishDirectory` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    angular(): Promise<string | void>;

    /**
     * Generates a multi-stage Dockerfile for a React application and an Nginx server.
     * The stages include: base, dependencies, build, and production.
     * 
     * @param body - The request body containing Dockerfile generation parameters.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The Node.js version to use.
     * @param body.buildCommand - The command to build the React application.
     * @param body.envVars - Optional environment variables to set in the Dockerfile.
     * 
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, NODE_VERSION, buildCommand, publishDirectory` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    react(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a Vue.js application with a multi-stage build process.
     * The Dockerfile includes stages for base image setup, dependency installation, application build, and Nginx production server configuration.
     *
     * @param body - The request body containing the project details and Dockerfile configuration.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The Node.js version to use in the base image.
     * @param body.buildCommand - The command to build the Vue.js application.
     * @param body.envVars - Optional environment variables to set in the Dockerfile.
     * 
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, NODE_VERSION, buildCommand, publishDirectory` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    vue(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a Svelte application.
     * 
     * @returns A promise that resolves to a string containing the Dockerfile content,
     *          or void if the operation is not supported.
     * @throws This method currently returns a 501 status code indicating that
     *         Svelte support is not yet implemented.
     * @HazemSabry
     */
    svelte(): Promise<string | void>

    /**
     * Generates a multi-stage Dockerfile for a Node.js application.
     * 
     * @param body - The request body containing the details for the Dockerfile.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The Node.js version to use.
     * @param body.port - The port number the application will listen on.
     * @param body.runCommand - The command to run the application.
     * @param body.envVars - Optional environment variables to set in the Dockerfile.
     * 
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, NODE_VERSION, port, runCommand` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */ 
    nodeJS(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a Django application.
     *
     * @param body - The request body containing details for the Dockerfile.
     * @param body.projectName - The name of the Django project.
     * @param body.VERSION - The Python version to use.
     * @param body.port - The port number to expose.
     * @param body.envVars - An array of environment variables to set in the Dockerfile.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, PYTHON_VERSION, port` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    django(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a Flask application.
     * 
     * @param username - The username of the application owner.
     * @param body - The request body containing details for the Dockerfile.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The version of Python to use.
     * @param body.port - The port number the application will run on.
     * @param body.envVars - An array of environment variables to set in the Dockerfile.
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, PYTHON_VERSION, port` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    flask(): Promise<string | void>;

    /**
     * Generates a multi-stage Dockerfile for a Golang application.
     * 
     * @param username - The name of the application owner.
     * @param body - The request body containing details for the Dockerfile.
     * @param body.projectName - The name of the project.
     * @param body.VERSION - The version of Golang to use.
     * @param body.port - The port number the application will expose.
     * @param body.envVars - An array of environment variables to set in the Dockerfile.
     * 
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, GOLANG_VERSION, port` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    golang(): Promise<string | void>;

    /**
     * Generates a Dockerfile for a Laravel application with Apache server.
     * 
     * Creates a multi-stage build process with composer dependencies and production stages.
     * 
     * @param username - The username of the application owner to be included in Dockerfile comments
     * @param body - Configuration options for the Laravel Dockerfile
     * @param body.projectName - The name of the project to be included in Dockerfile comments
     * @param body.VERSION - The PHP version to use for the image
     * @param body.port - The port number to expose in the container
     * @param body.envVars - Optional array of environment variables to include in the Dockerfile
     * @returns {Promise<string | void>} A promise that resolves to the generated Dockerfile content as a string.
     *                                   If the `projectName, PHP_VERSION, port` is not provided in the request body, it sends a 406
     *                                   HTTP response with an error message and returns `void`.     * 
     * @HazemSabry
     */
    laravel(): Promise<string | void>;

    /**
     * Generates a Dockerfile configuration based on the provided technology name.
     * 
     * @param name - The name of the technology for which the Dockerfile should be generated.
     *               Supported values include:
     *               - 'Vanilla JS': Generates a Dockerfile for a static web server using Nginx or Apache.
     *               - 'PHP': Generates a Dockerfile for a PHP web server.
     *               - 'React': Generates a Dockerfile for a React application.
     *               - 'Angular': Generates a Dockerfile for an Angular application.
     *               - 'Vue': Generates a Dockerfile for a Vue application.
     *               - 'Svelte': Generates a Dockerfile for a Svelte application.
     *               - 'Node.js': Generates a Dockerfile for a Node.js application.
     *               - 'Django': Generates a Dockerfile for a Django application.
     *               - 'Flask': Generates a Dockerfile for a Flask application.
     *               - 'Golang': Generates a Dockerfile for a Go application.
     *               - 'Laravel': Generates a Dockerfile for a Laravel application.
     * @param webServer - The web server to be used (e.g., 'nginx' or 'apache').
     * 
     * @returns A promise that resolves to a string containing the generated Dockerfile content
     *          or void if no content is generated.
     * 
     * @throws An error if the provided technology name is not recognized or if the web server is not supported.
     */
    technologyPath(name: string, webServer: string): Promise<string | void>
}

/**
 * The `GenerateDockerFile` class provides methods to dynamically generate Dockerfiles
 * for various technologies and frameworks. It supports both single-stage and multi-stage
 * Dockerfile generation, depending on the requirements of the target application.
 *
 * @implements {IGenerateDockerfile}
 *
 * @remarks
 * This class is designed to handle HTTP requests and responses, extracting necessary
 * information from the request body to generate Dockerfiles tailored to specific
 * technologies such as Nginx, Apache, PHP, React, Angular, Vue, Node.js, Django, Flask,
 * Golang, Laravel, and more.
 *
 * @example
 * ```typescript
 * const generator = new GenerateDockerFile(req, res, username);
 * const dockerfile = await generator.react();
 * console.log(dockerfile);
 * ```
 *
 * @param req - The HTTP request object containing the necessary data for Dockerfile generation.
 * @param res - The HTTP response object used to send error messages if required fields are missing.
 * @param username - The username of the application owner, used for personalization in the Dockerfile.
 */
class GenerateDockerFile implements IGenerateDockerfile {
    /**The request object.*/
    private req: Request;
    /**The response object.*/
    private res: Response;
    /**The username of the application owner.*/
    private username: string;

    /**
     * Initializes a new instance of the class.
     *
     * @param req - The HTTP request object.
     * @param res - The HTTP response object.
     * @param username - The username associated with the request.
     */
    constructor(req: Request, res: Response, username: string) {
        this.req = req;
        this.res = res;
        this.username = username;
    }

    async nginxStaticWebServer (): Promise<string | void> {
        const { projectName }: IDockerfileRequestBody = this.req.body;
        if (!projectName) {
            this.res.status(406).json({ error: 'Project name is required' });
            return;
        };
        
        const dockerfileContent = `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${this.username}.\n
                        # The stage is: production.\n\n
                        # Stage 1: Use a lightweight Nginx web server(Alpine version) \n
                        # - Set working directory\n
                        # - Remove default files safely\n
                        # - Copy static files (HTML, CSS, JS) with correct permissions\n
                        # - Switch to a non-root user for security\n
                        FROM nginx:alpine AS production\n
                        WORKDIR /usr/share/nginx/html\n
                        RUN rm -rf ./*\n
                        COPY --chown=nginx:nginx . .\n
                        USER nginx\n\n
                        # - Expose port 80 inside the container (Nginx runs on port 80)\n
                        EXPOSE 80\n\n
                        # - Start Nginx\n
                        CMD ["nginx", "-g", "daemon off;"]\n`;
        
        return dockerfileContent;
    };

    async apacheStaticWebServer (): Promise<string | void> {
        const { projectName }: IDockerfileRequestBody = this.req.body;
        if (!projectName) {
            this.res.status(406).json({ error: 'Project name is required' });
            return;
        };

        const dockerfileContent = `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${this.username}.\n
                        # The stage is: production.\n\n
                        # Stage 1: Use a lightweight Apache web server (Alpine version)\n
                        # - Set working directory\n
                        # - Remove default files safely\n
                        # - Copy static files (HTML, CSS, JS) with correct permissions\n
                        # - Switch to a non-root user for security\n
                        FROM httpd:alpine AS production\n
                        WORKDIR /usr/local/apache2/htdocs/\n
                        RUN rm -rf ./*\n
                        COPY --chown=www-data:www-data . .\n
                        USER www-data\n\n
                        # - Expose port 80 inside the container (Apache runs on port 80)\n
                        EXPOSE 80\n\n
                        # - Start Apache in foreground mode\n
                        CMD ["httpd", "-D", "FOREGROUND"]\n`;
    
        return dockerfileContent;
    };

    async apachePHPWebServer (): Promise<string | void> {
        const { projectName, VERSION: PHP_VERSION, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PHP_VERSION ) {
            this.res.status(406).json({ error: 'Project name and PHP version are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a PHP application For the Application Owner ${this.username}\n
                        # and an Apache server. The stages are: composer and production.\n\n
                        # Stage 1: Use Composer for dependency management if composer.json exists\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Only copy composer files if they exist (prevents Docker COPY failure)\n
                        # - Only run Composer if composer.json is present\n
                        FROM composer:latest AS composer\n
                        WORKDIR /usr/src/app\n
                        COPY composer.json composer.lock ./ || true\n
                        RUN test -f composer.json && composer install --no-dev --optimize-autoloader || echo "No composer.json found, skipping install"\n\n
                        # Stage 2: PHP with Apache\n
                        # - Sets the working directory to /var/www/html\n
                        # - Install necessary PHP extensions\n
                        # - Copy project files\n
                        # - Only copy vendor if composer.json exists\n
                        # - Set correct permissions && Change user Owner\n
                        FROM php:${PHP_VERSION}-apache AS production\n
                        WORKDIR /var/www/html\n
                        RUN docker-php-ext-install mysqli pdo pdo_mysql\n
                        COPY . .\n
                        RUN test -f composer.json && cp -r vendor /var/www/html/vendor || echo "No vendor folder found"\n
                        RUN chmod -R 755 /var/www/html && \\ \n
                        chown -R www-data:www-data /var/www/html\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose 80 port\n
                        EXPOSE 80\n\n
                        # - Start Apache\n
                        CMD ["apache2-foreground"]\n`;
    
        return dockerfileContent;
    };
    
    async angular (): Promise<string | void> {
        const { projectName, APP_NAME, VERSION: NODE_VERSION, buildCommand, publishDirectory, envVars }: IAngularDockerfileRequestBody = this.req.body;
        if (!projectName || !APP_NAME || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };
        let dockerfileContent = '';
        dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Angular application For the Application Owner ${this.username}\n
                        # and an Nginx server. The stages are: build and production.\n\n
                        # Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copy only package.json & package-lock.json first (Better Caching)\n
                        # - Install dependencies\n
                        # - Copy the rest of the project files\n
                        # - Build the Angular application (Production Mode)\n
                        FROM node:${NODE_VERSION}-alpine AS build\n
                        WORKDIR /usr/src/app\n
                        COPY package*.json ./\n
                        RUN npm install --legacy-peer-deps\n
                        COPY . .\n
                        RUN ${buildCommand}\n\n
                        # Stage 2: Deploy with Nginx\n
                        # - Set an argument for app name (optional)\n
                        # - Copy the built application from the build stage to the nginx html directory\n
                        # - Set correct ownership for security\n
                        FROM nginx:alpine AS production\n
                        COPY --from=build /usr/src/app/${publishDirectory}/${APP_NAME} /usr/share/nginx/html\n
                        RUN chown -R nginx:nginx /usr/share/nginx/html\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose port 80\n
                        EXPOSE 80\n\n
                        # - Switch to non-root user\n
                        USER nginx\n\n
                        # - Run the application\n
                        CMD ["nginx", "-g", "daemon off;"]`;
    
        return dockerfileContent;
    };

    async react (): Promise<string | void> {
        const { projectName, VERSION: NODE_VERSION, buildCommand, envVars, publishDirectory }: IFrontendDockerfileRequestBody = this.req.body;
        if (!projectName || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };

        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a React application For the Application Owner ${this.username}\n
                        # and an Nginx server. The stages are: base, dependencies, and production.\n\n
                        # Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n
                        FROM node:${NODE_VERSION}-alpine AS base\n
                        WORKDIR /usr/src/app\n\n
                        # Stage 2: Install dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n
                        FROM base AS dependencies\n
                        COPY package*.json* ./\n
                        RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n
                        npm set cache / usr / src / app /.npm && \\ \n'
                        npm install--only = production\n\n
                        # Stage 3: Build the application\n
                        # - Uses the dependencies stage as the starting point
                        # - Copies the entire project to the working directory
                        # - Runs the build script
                        FROM dependencies AS build
                        COPY. .\n
                        RUN ${ buildCommand} \n\n
                        # Stage 4: Nginx production\n
                        # - Copies the Nginx configuration file\n
                        # - Copies the built application from the build stage\n
                        # - Ensure proper permissions for Nginx\n
                        FROM nginx:alpine AS production\n
                        COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html\n
                        RUN chown -R nginx:nginx /usr/share/nginx/html\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose port 80\n
                        EXPOSE 80\n\n
                        # - Switch to non-root user\n
                        USER nginx\n\n
                        # - Run the application\n
                        CMD ["nginx", "-g", "daemon off;"]`;
    
        return dockerfileContent;
    };

    async vue (): Promise<string | void> {
        const { projectName, VERSION: NODE_VERSION, buildCommand, envVars, publishDirectory }: IFrontendDockerfileRequestBody = this.req.body;
        if (!projectName || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Vue.js application For the Application Owner ${this.username}\n
                        # and an Nginx server. The stages are: base, dependencies, and production.\n\n
                        # Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n
                        FROM node:${NODE_VERSION}-alpine AS base\n
                        WORKDIR /usr/src/app\n\n
                        # Stage 2: Install dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n
                        FROM base AS dependencies\n
                        COPY package*.json* ./\n
                        RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n
                        npm set cache /usr/src/app/.npm && \\ \n
                        npm install --only=production\n\n
                        # Stage 3: Build the application\n
                        # - Uses the dependencies stage as the starting point
                        # - Copies the entire project to the working directory
                        # - Runs the build script
                        FROM dependencies AS build
                        COPY . .\n
                        RUN ${buildCommand}\n\n
                        # Stage 4: Nginx production\n
                        # - Copies the Nginx configuration file\n
                        # - Copies the built application from the build stage\n
                        # - Ensure proper permissions for Nginx\n
                        FROM nginx:alpine AS production\n
                        COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html\n
                        RUN chown -R nginx:nginx /usr/share/nginx/html\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose port 80\n
                        EXPOSE 80\n\n
                        # - Switch to non-root user\n
                        USER nginx\n\n
                        # - Run the application\n
                        CMD ["nginx", "-g", "daemon off;"]`;
    
        return dockerfileContent;
    };

    async svelte(): Promise<string | void> {
        response.status(501).json({ error: 'Svelte is not supported yet' });
        return;
    }

    async nodeJS (): Promise<string | void> {
        const { projectName, VERSION: NODE_VERSION, port, runCommand, envVars }: INodeJSDockerfileRequestBody = this.req.body;
        if (!projectName || !NODE_VERSION || !port || !runCommand) {
            this.res.status(406).json({ error: 'Project name, Node version, Port, and Run Command are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Node.js application For the Application Owner ${this.username}\n
                        # The stages are: base, dependencies, and production.\n\n
                        # Stage 1: Base Image\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n
                        FROM node:${NODE_VERSION}-slim AS build\n
                        WORKDIR /usr/src/app\n\n
                        FROM base AS dependencies\n
                        COPY package*.json* ./\n
                        # Stage 2: Dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n
                        FROM base AS dependencies\n
                        ENV NODE_ENV production
                        RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n
                        npm set cache /usr/src/app/.npm && \\ \n
                        npm install --only=production\n\n
                        # Stage 3: Production\n
                        # - Uses the base stage as the starting point\n
                        # - Sets the NODE_ENV environment variable to production\n
                        # - Copy the dependencies from the dependencies stage\n
                        # - Switch to non-root user\n
                        FROM base AS production\n
                        ENV NODE_ENV production\n
                        COPY --from=dependencies /usr/src/app/node_modules ./node_modules\n
                        COPY --chown=node:node ./src/ .
                        USER node\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# Exposes port ${port} for the application\n
                        EXPOSE ${port}\n\n
                        # Sets the default command to run the production server\n
                        CMD ${runCommand}\n`;
    
        return dockerfileContent;
    };

    async django (): Promise<string | void> {
        const { projectName, VERSION: PYTHON_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PYTHON_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Python version, and port are required' });
            return;
        };
        let dockerfileContent = '';
        dockerfileContent += `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${this.username}\n
                        # The stages are: production.\n\n
                        # Stage 1: Base image for Python\n
                        # - Disable output buffering\n
                        # - Set the working directory to /usr/src/app\n
                        # - Create a non-root user for security\n
                        # - Copies requirements.txt to the working directory\n
                        # - Install any needed packages specified in requirements.txt\n
                        # - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing\n
                        # - Collect static files and run migrations\n
                        # - Change ownership to the non-root user\n
                        # - Switch to non-root user\n
                        FROM python:${PYTHON_VERSION}-slim AS production\n
                        ENV PYTHONUNBUFFERED=1\n
                        WORKDIR /usr/src/app\n
                        RUN addgroup --system django && adduser --system --ingroup django django\n
                        COPY requirements.txt  .\n
                        RUN pip install --no-cache-dir -r requirements.txt && \\ \n
                        if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi\n
                        COPY . .\n
                        RUN python manage.py collectstatic --noinput && \\ \n
                        python manage.py migrate\n
                        RUN chown -R django:django /usr/src/app\n
                        USER django\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose ${port} port\n
                        EXPOSE ${port}\n\n
                        # - Use Gunicorn for production\n
                        CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project.wsgi:application"]\n`;
    
        return dockerfileContent;
    };

    async flask (): Promise<string | void> {
        const { projectName, VERSION: PYTHON_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PYTHON_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Python version, and port are required' });
            return;
        };
        let dockerfileContent = '';
        dockerfileContent += `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${this.username}\n
                        # The stages are: production.\n\n
                        # Stage 1: Base image for Python\n
                        # - Disable output buffering\n
                        # - Set the working directory to /usr/src/app\n
                        # - Create a non-root user for security\n
                        # - Copies requirements.txt to the working directory\n
                        # - Install any needed packages specified in requirements.txt\n
                        # - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing\n
                        # - Collect static files and run migrations\n
                        # - Change ownership to the non-root user\n
                        # - Switch to non-root user\n
                        FROM python:${PYTHON_VERSION}-slim AS production\n
                        ENV PYTHONUNBUFFERED=1\n
                        WORKDIR /usr/src/app\n
                        RUN addgroup --system flask && adduser --system --ingroup flask flask\n
                        COPY requirements.txt  .\n
                        RUN pip install --no-cache-dir -r requirements.txt && \\ \n
                        if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi\n
                        COPY . .\n
                        RUN chown -R flask:flask /usr/src/app\n
                        USER flask\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose ${port} port\n
                        EXPOSE ${port}\n\n
                        # - Use Gunicorn for production\n
                        CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]\n`;
    
        return dockerfileContent;
    };

    async golang (): Promise<string | void> {
        const { projectName, VERSION: GOLANG_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !GOLANG_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Golang version, and port are required' });
            return;
        };
        let dockerfileContent = '';
        dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Golang application For the Application Owner ${this.username}\n
                        # The stages are: build and production.\n\n
                        # Stage 1: Build the Go application\n
                        # - Set working directory\n
                        # - Enable static binary build\n
                        # - Copy Go module files\n
                        # - Download dependencies\n
                        # - Copy the source code\n
                        # - Build the application\n
                        FROM golang:${ GOLANG_VERSION} -slim AS build\n
                        WORKDIR /build\n
                        ENV CGO_ENABLED=0\n
                        COPY go.* .\n
                        RUN go mod download\n
                        COPY . .\n
                        RUN go build -o /build/bin/app\n\n
                        # Stage 2: Create a minimal final image\n
                        # - Set working directory\n
                        # - Copy the compiled binary from the build stage\n
                        FROM gcr.io/distroless/static AS production\n
                        WORKDIR /app\n
                        COPY --from=build /build/bin/app /app/bin\n\n
                        # - Run as a non-root user for security\n
                        USER nonroot\n\n`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose ${port} port\n
                        EXPOSE ${port}\n\n
                        # - Start the application\n
                        CMD ["/app/bin"]\n`;
    
        return dockerfileContent;
    };

    async laravel (): Promise<string | void> {
        const { projectName, VERSION: PHP_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PHP_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, PHP version, and port are required' });
            return '';
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Laravel application For the Application Owner ${this.username}\n
                        # and an Apache server. The stages are: composer and production.\n\n
                        # Stage 1: Composer Dependencies\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copy only dependency files to optimize caching\n
                        # - Install dependency for production.\n
                        FROM composer:2.2 AS composer\n
                        WORKDIR /usr/src/app\n
                        COPY composer.json composer.lock .\n
                        RUN composer install --no-dev --no-interaction --prefer-dist\n\n
                        # Stage 2: Laravel Application\n
                        # - Set environment variables\n
                        # - Enable Apache mod_rewrite (required by Laravel)\n
                        # - Install system dependencies && clean up cache and reduce image size\n
                        # - Install PHP extensions needed by Laravel\n
                        # - Set the working directory\n
                        # - Copy pre-installed vendor folder from the composer stage\n
                        # - Copy the rest of the Laravel application\n
                        # - Set the correct file permissions\n
                        FROM php:${PHP_VERSION}-apache AS production\n
                        ENV DEBIAN_FRONTEND=noninteractive\n
                        RUN a2enmod rewrite\n
                        RUN apt-get update && apt-get install -y --no-install-recommends \\ \n
                        git \\ \n
                        curl \\ \n
                        zip \\ \n
                        unzip \\ \n
                        && rm -rf /var/lib/apt/lists/*\n
                        RUN docker-php-ext-install pdo pdo_mysql\n
                        WORKDIR /var/www/html\n
                        COPY --from=composer /app/vendor /var/www/html/vendor\n
                        COPY . /var/www/html\n
                        RUN chmod -R 755 /var/www/html \\ \n
                        && chown -R www-data:www-data /var/www/html\n\n`

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `\n# - Expose ${port} port\n
                        EXPOSE ${port}\n\n
                        # - Set Apache DocumentRoot to Laravel's public directory\n
                        RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf\n\n
                        # - Start Laravel\n
                        CMD ["sh", "-c", "cp .env.example .env && php artisan key:generate && php artisan migrate --force && apache2-foreground"]\n`;
    
        return dockerfileContent;
    };

    async technologyPath(path: string, webServer: string): Promise<string | void> {
        
        switch (path) {
            case 'vanilla-jS':
                if ( webServer === 'nginx') {
                    return await this.nginxStaticWebServer();
                } else if (webServer === 'apache') {
                    return await this.apacheStaticWebServer();
                } else {
                    throw new Error(`Unknown Dockerfile name: ${name}`);
                }
            case 'PHP':
                return await this.apachePHPWebServer();
            case 'React':
                return await this.react();
            case 'Angular':
                return await this.angular();
            case 'Vue':
                return await this.vue();
            case 'Svelte':
                return await this.svelte();
            case 'Node.js':
                return await this.nodeJS();
            case 'Django':
                return await this.django();
            case 'Flask':
                return await this.flask();
            case 'Golang':
                return await this.golang();
            case 'Laravel':
                return await this.laravel();
            default:
                throw new Error(`Unknown Dockerfile name: ${name}`);
        }
    };
}

export default GenerateDockerFile;