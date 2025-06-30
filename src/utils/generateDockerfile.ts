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
        
        const dockerfileContent = `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${this.username}.
# The stage is: production.

# Stage 1: Use a lightweight Nginx web server(Alpine version)
# - Set working directory
# - Remove default files safely
# - Copy static files (HTML, CSS, JS) with correct permissions
# - Switch to a non-root user for security
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --chown=nginx:nginx . .
USER nginx

# - Expose port 80 inside the container (Nginx runs on port 80)
EXPOSE 80

# - Start Nginx
CMD ["nginx", "-g", "daemon off;"]`;
        
        return dockerfileContent;
    };

    async apacheStaticWebServer (): Promise<string | void> {
        const { projectName }: IDockerfileRequestBody = this.req.body;
        if (!projectName) {
            this.res.status(406).json({ error: 'Project name is required' });
            return;
        };

        const dockerfileContent = `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${this.username}.
# The stage is: production.

# Stage 1: Use a lightweight Apache web server (Alpine version)
# - Set working directory
# - Remove default files safely
# - Copy static files (HTML, CSS, JS) with correct permissions
# - Switch to a non-root user for security
FROM httpd:alpine AS production
WORKDIR /usr/local/apache2/htdocs/
RUN rm -rf ./*
COPY --chown=www-data:www-data . .
USER www-data

# - Expose port 80 inside the container (Apache runs on port 80)
EXPOSE 80

# - Start Apache in foreground mode
CMD ["httpd", "-D", "FOREGROUND"]`;
    
        return dockerfileContent;
    };

    async apachePHPWebServer (): Promise<string | void> {
        const { projectName, VERSION: PHP_VERSION, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PHP_VERSION ) {
            this.res.status(406).json({ error: 'Project name and PHP version are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a PHP application For the Application Owner ${this.username}
# and an Apache server. The stages are: composer and production.

# Stage 1: Use Composer for dependency management if composer.json exists
# - Sets the working directory to /usr/src/app
# - Only copy composer files if they exist (prevents Docker COPY failure)
# - Only run Composer if composer.json is present
FROM composer:latest AS composer
WORKDIR /usr/src/app
COPY composer.json composer.lock ./ || true
RUN test -f composer.json && composer install --no-dev --optimize-autoloader || echo "No composer.json found, skipping install"

# Stage 2: PHP with Apache
# - Sets the working directory to /var/www/html
# - Install necessary PHP extensions
# - Copy project files
# - Only copy vendor if composer.json exists
# - Set correct permissions && Change user Owner
FROM php:${PHP_VERSION}-apache AS production
WORKDIR /var/www/html
RUN docker-php-ext-install mysqli pdo pdo_mysql
COPY . .
RUN test -f composer.json && cp -r vendor /var/www/html/vendor || echo "No vendor folder found"
RUN chmod -R 755 /var/www/html && \\ 
    chown -R www-data:www-data /var/www/html
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose 80 port\n
EXPOSE 80
# - Start Apache
CMD ["apache2-foreground"]`;
    
        return dockerfileContent;
    };
    
    async angular (): Promise<string | void> {
        const { projectName, APP_NAME, VERSION: NODE_VERSION, buildCommand, publishDirectory, envVars }: IAngularDockerfileRequestBody = this.req.body;
        if (!projectName || !APP_NAME || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };
        let dockerfileContent = '';
        dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Angular application For the Application Owner ${this.username}
# and an Nginx server. The stages are: build and production.

# Stage 1: Base image for Node.js
# - Sets the working directory to /usr/src/app
# - Copy only package.json & package-lock.json first (Better Caching)
# - Install dependencies
# - Copy the rest of the project files
# - Build the Angular application (Production Mode)
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN ${buildCommand}

# Stage 2: Deploy with Nginx
# - Set an argument for app name (optional)
# - Copy the built application from the build stage to the nginx html directory
# - Set correct ownership for security
FROM nginx:alpine AS production
COPY --from=build /usr/src/app/${publishDirectory}/${APP_NAME} /usr/share/nginx/html\n
RUN chown -R nginx:nginx /usr/share/nginx/html
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose port 80
EXPOSE 80

# - Switch to non-root user
USER nginx

# - Run the application
CMD ["nginx", "-g", "daemon off;"]`;
    
        return dockerfileContent;
    };

    async react (): Promise<string | void> {
        const { projectName, VERSION: NODE_VERSION, buildCommand, envVars, publishDirectory }: IFrontendDockerfileRequestBody = this.req.body.inputsObject;
        if (!projectName || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };

        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a React application For the Application Owner ${this.username}
# and an Nginx server. The stages are: base, dependencies, and production.
# Stage 1: Base image for Node.js
# - Sets the working directory to /usr/src/app
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# Stage 2: Install dependencies
# - Uses the baseImage as the starting point
# - Copies package.json and package-lock.json (if exists) to the working directory
# - Installs project dependencies using npm
# - Utilizes Docker build cache for faster builds
FROM base AS dependencies
COPY package*.json* ./
RUN --mount=type=cache,target=/usr/src/app/.npm \\ 
    npm set cache / usr / src / app /.npm && \\
    npm install--only = production

# Stage 3: Build the application
# - Uses the dependencies stage as the starting point
# - Copies the entire project to the working directory
# - Runs the build script
FROM dependencies AS build
COPY . .
RUN ${ buildCommand}

# Stage 4: Nginx production
# - Copies the Nginx configuration file
# - Copies the built application from the build stage
# - Ensure proper permissions for Nginx
FROM nginx:alpine AS production
COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose port 80
EXPOSE 80

# - Switch to non-root user
USER nginx

# - Run the application
CMD ["nginx", "-g", "daemon off;"]`;
    
        return dockerfileContent;
    };

    async vue (): Promise<string | void> {
        const { projectName, VERSION: NODE_VERSION, buildCommand, envVars, publishDirectory }: IFrontendDockerfileRequestBody = this.req.body;
        if (!projectName || !NODE_VERSION || !buildCommand || !publishDirectory) {
            this.res.status(406).json({ error: 'Project name, Node version, Build Command, and Publish Directory are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Vue.js application For the Application Owner ${this.username}
# and an Nginx server. The stages are: base, dependencies, and production.

# Stage 1: Base image for Node.js
# - Sets the working directory to /usr/src/app
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# Stage 2: Install dependencies
# - Uses the baseImage as the starting point
# - Copies package.json and package-lock.json (if exists) to the working directory
# - Installs project dependencies using npm
# - Utilizes Docker build cache for faster builds
FROM base AS dependencies
COPY package*.json* ./
RUN --mount=type=cache,target=/usr/src/app/.npm \\
    npm set cache /usr/src/app/.npm && \\
    npm install --only=production

# Stage 3: Build the application
# - Uses the dependencies stage as the starting point
# - Copies the entire project to the working directory
# - Runs the build script
FROM dependencies AS build
COPY . .
RUN ${buildCommand}

# Stage 4: Nginx production
# - Copies the Nginx configuration file
# - Copies the built application from the build stage
# - Ensure proper permissions for Nginx
FROM nginx:alpine AS production
COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /usr/share/nginx/html
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose port 80
EXPOSE 80

# - Switch to non-root user
USER nginx

# - Run the application
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
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Node.js application For the Application Owner ${this.username}
# The stages are: base, dependencies, and production.

# Stage 1: Base Image
# - Sets the working directory to /usr/src/app
# - Copies package.json and package-lock.json (if exists) to the working directory
FROM node:${NODE_VERSION}-slim AS build
WORKDIR /usr/src/app

# Stage 2: Dependencies 
# - Uses the baseImage as the starting point
# - Installs project dependencies using npm
# - Utilizes Docker build cache for faster builds
FROM base AS dependencies
COPY package*.json* ./
ENV NODE_ENV production
# RUN --mount=type=cache,target=/usr/src/app/.npm \\
    npm set cache /usr/src/app/.npm && \\
    npm install --only=production

# Stage 3: Production
# - Uses the base stage as the starting point
# - Sets the NODE_ENV environment variable to production
# - Copy the dependencies from the dependencies stage
# - Switch to non-root user
FROM base AS production
ENV NODE_ENV production
# COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# COPY --chown=node:node ./src/ .
USER node
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# Exposes port ${port} for the application
EXPOSE ${port}

# Sets the default command to run the production server
CMD ${runCommand}`;
    
        return dockerfileContent;
    };

    async django (): Promise<string | void> {
        const { projectName, VERSION: PYTHON_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PYTHON_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Python version, and port are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${this.username}
# The stages are: production.

# Stage 1: Base image for Python
# - Disable output buffering
# - Set the working directory to /usr/src/app
# - Create a non-root user for security
# - Copies requirements.txt to the working directory
# - Install any needed packages specified in requirements.txt
# - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing
# - Collect static files and run migrations
# - Change ownership to the non-root user
# - Switch to non-root user
FROM python:${PYTHON_VERSION}-slim AS production
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app\n
RUN addgroup --system django && adduser --system --ingroup django django
COPY requirements.txt  .
RUN pip install --no-cache-dir -r requirements.txt && \\
    if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi
COPY . .
RUN python manage.py collectstatic --noinput && \\
    python manage.py migrate
RUN chown -R django:django /usr/src/app
USER django
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose ${port} port
EXPOSE ${port}

# - Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project.wsgi:application"]`;
    
        return dockerfileContent;
    };

    async flask (): Promise<string | void> {
        const { projectName, VERSION: PYTHON_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PYTHON_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Python version, and port are required' });
            return;
        };
        let dockerfileContent =  `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${this.username}
# The stages are: production.

# Stage 1: Base image for Python
# - Disable output buffering
# - Set the working directory to /usr/src/app
# - Create a non-root user for security
# - Copies requirements.txt to the working directory
# - Install any needed packages specified in requirements.txt
# - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing\n
# - Collect static files and run migrations
# - Change ownership to the non-root user
# - Switch to non-root user
FROM python:${PYTHON_VERSION}-slim AS production
ENV PYTHONUNBUFFERED=1
WORKDIR /usr/src/app
RUN addgroup --system flask && adduser --system --ingroup flask flask
COPY requirements.txt  .
RUN pip install --no-cache-dir -r requirements.txt && \\ 
    if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi
COPY . .
RUN chown -R flask:flask /usr/src/app
USER flask
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose ${port} port
EXPOSE ${port}

# - Use Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]\n`;
    
        return dockerfileContent;
    };

    async golang (): Promise<string | void> {
        const { projectName, VERSION: GOLANG_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !GOLANG_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, Golang version, and port are required' });
            return;
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Golang application For the Application Owner ${this.username}
# The stages are: build and production.

# Stage 1: Build the Go application
# - Set working directory
# - Enable static binary build
# - Copy Go module files
# - Download dependencies
# - Copy the source code
# - Build the application
FROM golang:${ GOLANG_VERSION} -slim AS build
WORKDIR /build
ENV CGO_ENABLED=0
COPY go.* .
RUN go mod download
COPY . .
RUN go build -o /build/bin/app

# Stage 2: Create a minimal final image
# - Set working directory
# - Copy the compiled binary from the build stage
FROM gcr.io/distroless/static AS production
WORKDIR /app
COPY --from=build /build/bin/app /app/bin

# - Run as a non-root user for security
USER nonroot
`;

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose ${port} port
EXPOSE ${port}

# - Start the application
CMD ["/app/bin"]`;
    
        return dockerfileContent;
    };

    async laravel (): Promise<string | void> {
        const { projectName, VERSION: PHP_VERSION, port, envVars }: IBackendDockerfileRequestBody = this.req.body;
        if (!projectName || !PHP_VERSION || !port) {
            this.res.status(406).json({ error: 'Project name, PHP version, and port are required' });
            return '';
        };
        let dockerfileContent = `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Laravel application For the Application Owner ${this.username}
# and an Apache server. The stages are: composer and production.

# Stage 1: Composer Dependencies
# - Sets the working directory to /usr/src/app
# - Copy only dependency files to optimize caching
# - Install dependency for production.
FROM composer:2.2 AS composer
WORKDIR /usr/src/app
COPY composer.json composer.lock .
RUN composer install --no-dev --no-interaction --prefer-dist

# Stage 2: Laravel Application
# - Set environment variables
# - Enable Apache mod_rewrite (required by Laravel)
# - Install system dependencies && clean up cache and reduce image size
# - Install PHP extensions needed by Laravel
# - Set the working directory
# - Copy pre-installed vendor folder from the composer stage
# - Copy the rest of the Laravel application
# - Set the correct file permissions
FROM php:${PHP_VERSION}-apache AS production
ENV DEBIAN_FRONTEND=noninteractive
RUN a2enmod rewrite
RUN apt-get update && apt-get install -y --no-install-recommends \\
    git \\
    curl \\
    zip \\
    unzip \\
    && rm -rf /var/lib/apt/lists/*
RUN docker-php-ext-install pdo pdo_mysql
WORKDIR /var/www/html
COPY --from=composer /app/vendor /var/www/html/vendor
COPY . /var/www/html
RUN chmod -R 755 /var/www/html \\
    && chown -R www-data:www-data /var/www/html
`

        if (envVars) {
            envVars.forEach((env) => {
                dockerfileContent += `ENV ${env.key}=${env.value}\n`;
            });
            dockerfileContent += "\n";
        }

        dockerfileContent += `# - Expose ${port} port
EXPOSE ${port}

# - Set Apache DocumentRoot to Laravel's public directory
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# - Start Laravel
CMD ["sh", "-c", "cp .env.example .env && php artisan key:generate && php artisan migrate --force && apache2-foreground"]`;
    
        return dockerfileContent;
    };

    async technologyPath(path: string, webServer: string = 'nginx'): Promise<string | void> {
        
        switch (path) {
            case 'vanilla-jS':
                if ( webServer === 'nginx') {
                    return await this.nginxStaticWebServer();
                } else if (webServer === 'apache') {
                    return await this.apacheStaticWebServer();
                } else {
                    throw new Error(`Unknown Dockerfile name: ${name}`);
                }
            case 'php':
                return await this.apachePHPWebServer();
            case 'react':
                return await this.react();
            case 'angular':
                return await this.angular();
            case 'vue':
                return await this.vue();
            case 'svelte':
                return await this.svelte();
            case 'nodejs':
                return await this.nodeJS();
            case 'django':
                return await this.django();
            case 'flask':
                return await this.flask();
            case 'golang':
                return await this.golang();
            case 'laravel':
                return await this.laravel();
            default:
                throw new Error(`Unknown Dockerfile name: ${name}`);
        }
    };
}

export default GenerateDockerFile;