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
    /**
     * The name of the project
     */
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
    /**
     * The version of the technology to be used in the Dockerfile.
     */
    VERSION: string,
    /**
     * Optional array of environment variables to be included in the Dockerfile.
     */
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
    /**
     * The command used to build the frontend project.
     */
    buildCommand: string,
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
    /**
     * The port number on which the backend service will run.
     */
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
    /**
     * The name of the Angular application
     */
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
    /**
     * The command to run the Node.js application.
     */
    runCommand: string
}


/**
 * Generates a Dockerfile for an Nginx static web server.
 * 
 * This function creates a Dockerfile content for a single-stage build of an Nginx server
 * to serve static files for a given project and application owner.
 * 
 * @param username - The name of the application owner.
 * @param body - An object containing the project details.
 * @param body.projectName - The name of the project.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateNginxStaticWebServerDockerfile = async ( username: string, body: IDockerfileRequestBody): Promise<string> => {
    const { projectName } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${username}.\n
                        # The stage is: production.\n\n`;

    dockerfileContent += `# Stage 1: Use a lightweight Nginx web server (Alpine version)\n
                        # - Set working directory\n
                        # - Remove default files safely\n
                        # - Copy static files (HTML, CSS, JS) with correct permissions\n
                        # - Switch to a non-root user for security`;
    dockerfileContent += `FROM nginx:alpine AS production\n`;
    dockerfileContent += `WORKDIR /usr/share/nginx/html\n`;
    dockerfileContent += `RUN rm -rf ./*\n`;
    dockerfileContent += `COPY --chown=nginx:nginx . .\n`;
    dockerfileContent += `USER nginx\n\n`;

    dockerfileContent += `# - Expose port 80 inside the container (Nginx runs on port 80)\n`
    dockerfileContent += `EXPOSE 80\n\n`

    dockerfileContent += `# - Start Nginx\n`
    dockerfileContent += `CMD ["nginx", "-g", "daemon off;"]\n`;
    
    return dockerfileContent;
};

/**
 * Generates a Dockerfile for an Apache static web server.
 * 
 * This function creates a Dockerfile content string that sets up an Apache web server
 * using the Alpine version of the httpd image. It configures the server to serve static
 * files for a given project and user.
 * 
 * @param username - The name of the application owner.
 * @param body - An object containing the project details.
 * @param body.projectName - The name of the project.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateApacheStaticWebServerDockerfile = async ( username: string, body: IDockerfileRequestBody): Promise<string> => {
    const { projectName } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used a single-stage to build ${projectName} a Nginx server For the Application Owner ${username}.\n
                        # The stage is: production.\n\n`;

    dockerfileContent += `# Stage 1: Use a lightweight Apache web server (Alpine version)\n
                        # - Set working directory\n
                        # - Remove default files safely\n
                        # - Copy static files (HTML, CSS, JS) with correct permissions\n
                        # - Switch to a non-root user for security`;
    dockerfileContent += `FROM httpd:alpine AS production\n`;
    dockerfileContent += `WORKDIR /usr/local/apache2/htdocs/\n`;
    dockerfileContent += `RUN rm -rf ./*\n`;
    dockerfileContent += `COPY --chown=www-data:www-data . .\n`;
    dockerfileContent += `USER www-data\n\n`;

    dockerfileContent += `# - Expose port 80 inside the container (Apache runs on port 80)\n`
    dockerfileContent += `EXPOSE 80\n\n`

    dockerfileContent += `# - Start Apache in foreground mode\n`
    dockerfileContent += `CMD ["httpd", "-D", "FOREGROUND"]\n`;
    
    return dockerfileContent;
};


/**
 * Generates a Dockerfile for a PHP application with an Apache web server.
 * The Dockerfile is built in two stages: 
 * 1. Composer stage for dependency management.
 * 2. Production stage with PHP and Apache.
 * 
 * @param username - The name of the application owner.
 * @param body - The request body containing details for the Dockerfile.
 * @param body.projectName - The name of the project.
 * @param body.VERSION - The PHP version to use.
 * @param body.port - The port number to expose.
 * @param body.envVars - An array of environment variables to set in the Dockerfile.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateApachePHPWebServerDockerfile = async ( username: string, body: IBackendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: PHP_VERSION, port, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a PHP application For the Application Owner ${username}\n
                        # and an Apache server. The stages are: composer and production.\n\n`;

    dockerfileContent += `# Stage 1: Use Composer for dependency management if composer.json exists\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Only copy composer files if they exist (prevents Docker COPY failure)\n
                        # - Only run Composer if composer.json is present\n`;
    dockerfileContent += `FROM composer:latest AS composer\n`
    dockerfileContent += `WORKDIR /usr/src/app\n`
    dockerfileContent += `COPY composer.json composer.lock ./ || true\n`
    dockerfileContent += `RUN test -f composer.json && composer install --no-dev --optimize-autoloader || echo "No composer.json found, skipping install"\n\n`

    dockerfileContent += `# Stage 2: PHP with Apache\n
                        # - Sets the working directory to /var/www/html\n
                        # - Install necessary PHP extensions\n
                        # - Copy project files\n
                        # - Only copy vendor if composer.json exists\n
                        # - Set correct permissions && Change user Owner\n`;
    dockerfileContent += `FROM php:${PHP_VERSION}-apache AS production\n`;
    dockerfileContent += `WORKDIR /var/www/html\n`;
    dockerfileContent += `RUN docker-php-ext-install mysqli pdo pdo_mysql\n`;
    dockerfileContent += `COPY . .\n`;
    dockerfileContent += `RUN test -f composer.json && cp -r vendor /var/www/html/vendor || echo "No vendor folder found"\n`;
    dockerfileContent += `RUN chmod -R 755 /var/www/html && \\ \n
                        chown -R www-data:www-data /var/www/html\n`;

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose ${port} port\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent += `# - Start Apache\n`;
    dockerfileContent += `CMD ["apache2-foreground"]\n`;
    
    return dockerfileContent;
};

/**
 * Generates a Dockerfile for an Angular application with a multi-stage build.
 * The Dockerfile includes a build stage using Node.js and a production stage using Nginx.
 *
 * @param username - The name of the application owner.
 * @param body - The request body containing details for generating the Dockerfile.
 * @param body.projectName - The name of the Angular project.
 * @param body.APP_NAME - The name of the application.
 * @param body.VERSION - The version of Node.js to use.
 * @param body.buildCommand - The command to build the Angular application.
 * @param body.envVars - An array of environment variables to set in the Dockerfile.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateAngularDockerfile = async ( username: string, body: IAngularDockerfileRequestBody): Promise<string> => {
    const { projectName, APP_NAME, VERSION: NODE_VERSION, buildCommand, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Angular application For the Application Owner ${username}\n
                        # and an Nginx server. The stages are: build and production.\n\n`;
    
    dockerfileContent += `# Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copy only package.json & package-lock.json first (Better Caching)\n
                        # - Install dependencies\n
                        # - Copy the rest of the project files\n
                        # - Build the Angular application (Production Mode)\n`;
    dockerfileContent = `FROM node:${NODE_VERSION}-alpine AS build\n`;
    dockerfileContent += 'WORKDIR /usr/src/app\n';
    dockerfileContent += 'COPY package*.json ./\n';
    dockerfileContent += 'RUN npm install --legacy-peer-deps\n';
    dockerfileContent += 'COPY . .\n';
    dockerfileContent += `RUN ${buildCommand}\n\n`;

    dockerfileContent += `# Stage 2: Deploy with Nginx\n
                        # - Set an argument for app name (optional)\n
                        # - Copy the built application from the build stage to the nginx html directory\n
                        # - Set correct ownership for security\n`;
    dockerfileContent += 'FROM nginx:alpine AS production\n';
    dockerfileContent += `COPY --from=build /usr/src/app/dist/${APP_NAME} /usr/share/nginx/html\n`;
    dockerfileContent += 'RUN chown -R nginx:nginx /usr/share/nginx/html\n\n';

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose port 80\n`;
    dockerfileContent += `EXPOSE 80\n\n`;

    dockerfileContent += `# - Switch to non-root user\n`;
    dockerfileContent += `USER nginx\n\n`;

    dockerfileContent += `# - Run the application\n`;
    dockerfileContent += 'CMD ["nginx", "-g", "daemon off;"]';
    
    return dockerfileContent;
};

/**
 * Generates a multi-stage Dockerfile for a React application and an Nginx server.
 * The stages include: base, dependencies, build, and production.
 * 
 * @param username - The application owner's username.
 * @param body - The request body containing Dockerfile generation parameters.
 * @param body.projectName - The name of the project.
 * @param body.VERSION - The Node.js version to use.
 * @param body.buildCommand - The command to build the React application.
 * @param body.envVars - Optional environment variables to set in the Dockerfile.
 * 
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateReactDockerfile = async ( username: string, body: IFrontendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: NODE_VERSION, buildCommand, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a React application For the Application Owner ${username}\n
                        # and an Nginx server. The stages are: base, dependencies, and production.\n\n`;

    dockerfileContent += `# Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n`
    dockerfileContent = `FROM node:${NODE_VERSION}-alpine AS base\n`;
    dockerfileContent += 'WORKDIR /usr/src/app\n\n';


    dockerfileContent +=`# Stage 2: Install dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n`;
    dockerfileContent += 'FROM base AS dependencies\n';
    dockerfileContent += 'COPY package*.json* ./\n';
    dockerfileContent += 'RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n' +
                        'npm set cache /usr/src/app/.npm && \\ \n' +
                        'npm install --only=production\n\n';
    
    dockerfileContent += `# Stage 3: Build the application\n
                        # - Uses the dependencies stage as the starting point
                        # - Copies the entire project to the working directory
                        # - Runs the build script`;
    dockerfileContent += 'FROM dependencies AS build';
    dockerfileContent += 'COPY . .\n';
    dockerfileContent += `RUN ${buildCommand}\n\n`;

    dockerfileContent += `# Stage 4: Nginx production\n
                        # - Copies the Nginx configuration file\n
                        # - Copies the built application from the build stage\n
                        # - Ensure proper permissions for Nginx\n`;
    dockerfileContent += 'FROM nginx:alpine AS production\n';
    dockerfileContent += `COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html\n`;
    dockerfileContent += 'RUN chown -R nginx:nginx /usr/share/nginx/html\n\n';

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose port 80\n`;
    dockerfileContent += `EXPOSE 80\n\n`;

    dockerfileContent += `# - Switch to non-root user\n`;
    dockerfileContent += `USER nginx\n\n`;

    dockerfileContent += `# - Run the application\n`;
    dockerfileContent += 'CMD ["nginx", "-g", "daemon off;"]';
    
    return dockerfileContent;
};

/**
 * Generates a Dockerfile for a Vue.js application with a multi-stage build process.
 * The Dockerfile includes stages for base image setup, dependency installation, application build, and Nginx production server configuration.
 *
 * @param username - The username of the application owner.
 * @param body - The request body containing the project details and Dockerfile configuration.
 * @param body.projectName - The name of the project.
 * @param body.VERSION - The Node.js version to use in the base image.
 * @param body.buildCommand - The command to build the Vue.js application.
 * @param body.envVars - Optional environment variables to set in the Dockerfile.
 * 
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateVueDockerfile = async ( username: string, body: IFrontendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: NODE_VERSION, buildCommand, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Vue.js application For the Application Owner ${username}\n
                        # and an Nginx server. The stages are: base, dependencies, and production.\n\n`;

    dockerfileContent += `# Stage 1: Base image for Node.js\n
                        # - Sets the working directory to /usr/src/app\n`
    dockerfileContent = `FROM node:${NODE_VERSION}-alpine AS base\n`;
    dockerfileContent += 'WORKDIR /usr/src/app\n\n';


    dockerfileContent +=`# Stage 2: Install dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n`;
    dockerfileContent += 'FROM base AS dependencies\n';
    dockerfileContent += 'COPY package*.json* ./\n';
    dockerfileContent += 'RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n' +
                        'npm set cache /usr/src/app/.npm && \\ \n' +
                        'npm install --only=production\n\n';
    
    dockerfileContent += `# Stage 3: Build the application\n
                        # - Uses the dependencies stage as the starting point
                        # - Copies the entire project to the working directory
                        # - Runs the build script`;
    dockerfileContent += 'FROM dependencies AS build';
    dockerfileContent += 'COPY . .\n';
    dockerfileContent += `RUN ${buildCommand}\n\n`;

    dockerfileContent += `# Stage 4: Nginx production\n
                        # - Copies the Nginx configuration file\n
                        # - Copies the built application from the build stage\n
                        # - Ensure proper permissions for Nginx\n`;
    dockerfileContent += 'FROM nginx:alpine AS production\n';
    dockerfileContent += `COPY --link --from=build /usr/src/app/dist /usr/share/nginx/html\n`;
    dockerfileContent += 'RUN chown -R nginx:nginx /usr/share/nginx/html\n\n';

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose port 80\n`;
    dockerfileContent += `EXPOSE 80\n\n`;

    dockerfileContent += `# - Switch to non-root user\n`;
    dockerfileContent += `USER nginx\n\n`;

    dockerfileContent += `# - Run the application\n`;
    dockerfileContent += 'CMD ["nginx", "-g", "daemon off;"]';
    
    return dockerfileContent;
};

/**
 * Generates a multi-stage Dockerfile for a Node.js application.
 * 
 * @param username - The username of the application owner.
 * @param body - The request body containing the details for the Dockerfile.
 * @param body.projectName - The name of the project.
 * @param body.VERSION - The Node.js version to use.
 * @param body.port - The port number the application will listen on.
 * @param body.runCommand - The command to run the application.
 * @param body.envVars - Optional environment variables to set in the Dockerfile.
 * 
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateNodeJSDockerfile = async ( username: string, body: INodeJSDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: NODE_VERSION, port, runCommand, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Node.js application For the Application Owner ${username}\n
                        # The stages are: base, dependencies, and production.\n\n`;

    dockerfileContent += `# Stage 1: Base Image\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copies package.json and package-lock.json (if exists) to the working directory\n`;
    dockerfileContent = `FROM node:${NODE_VERSION}-slim AS build\n`;
    dockerfileContent += 'WORKDIR /usr/src/app\n\n';
    dockerfileContent += 'FROM base AS dependencies\n';
    dockerfileContent += 'COPY package*.json* ./\n';

    dockerfileContent += `# Stage 2: Dependencies\n
                        # - Uses the baseImage as the starting point\n
                        # - Installs project dependencies using npm\n
                        # - Utilizes Docker build cache for faster builds\n`;
    dockerfileContent += `FROM base AS dependencies\n`;
    dockerfileContent += `ENV NODE_ENV production`;
    dockerfileContent += `RUN --mount=type=cache,target=/usr/src/app/.npm \\ \n
                        npm set cache /usr/src/app/.npm && \\ \n
                        npm install --only=production\n\n`;

    dockerfileContent += `# Stage 3: Production\n
                        # - Uses the base stage as the starting point\n
                        # - Sets the NODE_ENV environment variable to production\n
                        # - Copy the dependencies from the dependencies stage\n
                        # - Switch to non-root user\n`;
    dockerfileContent += `FROM base AS production\n`;
    dockerfileContent +=`ENV NODE_ENV production\n`;
    dockerfileContent += `COPY --from=dependencies /usr/src/app/node_modules ./node_modules`;
    dockerfileContent += `COPY --chown=node:node ./src/ .`;
    dockerfileContent += `USER node\n\n`; 

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# Exposes port ${port} for the application\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent +=`# Sets the default command to run the production server\n`;
    dockerfileContent += `CMD ${runCommand}\n`;
    
    return dockerfileContent;
};

/**
 * Generates a Dockerfile for a Django application.
 *
 * @param username - The name of the application owner.
 * @param body - The request body containing details for the Dockerfile.
 * @param body.projectName - The name of the Django project.
 * @param body.VERSION - The Python version to use.
 * @param body.port - The port number to expose.
 * @param body.envVars - An array of environment variables to set in the Dockerfile.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateDjangoDockerfile = async ( username: string, body: IBackendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: PYTHON_VERSION, port, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${username}\n
                        # The stages are: production.\n\n`;

    dockerfileContent += `# Stage 1: Base image for Python\n
                        # - Disable output buffering\n
                        # - Set the working directory to /usr/src/app\n
                        # - Create a non-root user for security\n
                        # - Copies requirements.txt to the working directory\n
                        # - Install any needed packages specified in requirements.txt\n
                        # - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing\n
                        # - Collect static files and run migrations\n
                        # - Change ownership to the non-root user\n
                        # - Switch to non-root user\n`;
    dockerfileContent = `FROM python:${PYTHON_VERSION}-slim AS production\n`;
    dockerfileContent += 'ENV PYTHONUNBUFFERED=1\n';
    dockerfileContent += 'WORKDIR /usr/src/app\n';
    dockerfileContent += 'RUN addgroup --system django && adduser --system --ingroup django django\n';
    dockerfileContent += 'COPY requirements.txt  .\n';

    dockerfileContent += `RUN pip install --no-cache-dir -r requirements.txt && \\ \n
                        if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi\n`;
    dockerfileContent += `COPY . .\n`;
    dockerfileContent += `RUN python manage.py collectstatic --noinput && \\ \n
                        python manage.py migrate\n`;
    dockerfileContent += `RUN chown -R django:django /usr/src/app\n`;
    dockerfileContent += `USER django\n\n`;

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

        dockerfileContent += `\n# - Expose ${port} port\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent += `# - Use Gunicorn for production\n`;
    dockerfileContent += `CMD ["gunicorn", "--bind", "0.0.0.0:8000", "project.wsgi:application"]\n`;
    
    return dockerfileContent;
};

/**
 * Generates a Dockerfile for a Flask application.
 * 
 * @param username - The username of the application owner.
 * @param body - The request body containing details for the Dockerfile.
 * @param body.projectName - The name of the project.
 * @param body.VERSION - The version of Python to use.
 * @param body.port - The port number the application will run on.
 * @param body.envVars - An array of environment variables to set in the Dockerfile.
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateFlaskDockerfile = async ( username: string, body: IBackendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: PYTHON_VERSION, port, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a single-stage Docker image for ${projectName} a Django application For the Application Owner ${username}\n
                        # The stages are: production.\n\n`;

    dockerfileContent += `# Stage 1: Base image for Python\n
                        # - Disable output buffering\n
                        # - Set the working directory to /usr/src/app\n
                        # - Create a non-root user for security\n
                        # - Copies requirements.txt to the working directory\n
                        # - Install any needed packages specified in requirements.txt\n
                        # - Copies the entire project to the working directory && Ensure Gunicorn is installed if it's missing\n
                        # - Collect static files and run migrations\n
                        # - Change ownership to the non-root user\n
                        # - Switch to non-root user\n`;
    dockerfileContent = `FROM python:${PYTHON_VERSION}-slim AS production\n`;
    dockerfileContent += 'ENV PYTHONUNBUFFERED=1\n';
    dockerfileContent += 'WORKDIR /usr/src/app\n';
    dockerfileContent += 'RUN addgroup --system flask && adduser --system --ingroup flask flask\n';
    dockerfileContent += 'COPY requirements.txt  .\n';

    dockerfileContent += `RUN pip install --no-cache-dir -r requirements.txt && \\ \n
                        if ! command -v gunicorn &> /dev/null; then pip install gunicorn; fi\n`;
    dockerfileContent += `COPY . .\n`;
    dockerfileContent += `RUN chown -R flask:flask /usr/src/app\n`;
    dockerfileContent += `USER flask\n\n`;

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose ${port} port\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent += `# - Use Gunicorn for production\n`;
    dockerfileContent += `CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]\n`;
    
    return dockerfileContent;
};

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
 * @returns A promise that resolves to the generated Dockerfile content as a string.
 * 
 * @HazemSabry
 */
export const generateGolangDockerfile = async ( username: string, body: IBackendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: GOLANG_VERSION, port, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Golang application For the Application Owner ${username}\n
                        # The stages are: build and production.\n\n`;

    dockerfileContent += `# Stage 1: Build the Go application\n
                        # - Set working directory\n
                        # - Enable static binary build\n
                        # - Copy Go module files\n
                        # - Download dependencies\n
                        # - Copy the source code\n
                        # - Build the application\n`
    dockerfileContent += `FROM golang:${GOLANG_VERSION}-slim AS build\n`
    dockerfileContent += `WORKDIR /build\n`
    dockerfileContent += `ENV CGO_ENABLED=0\n`
    dockerfileContent += `COPY go.* .\n`
    dockerfileContent += `RUN go mod download\n`
    dockerfileContent += `COPY . .\n`
    dockerfileContent += `RUN go build -o /build/bin/app\n\n`;

    dockerfileContent += `# Stage 2: Create a minimal final image\n
                        # - Set working directory\n
                        # - Copy the compiled binary from the build stage\n`;
    dockerfileContent += `FROM gcr.io/distroless/static AS production\n`
    dockerfileContent += `WORKDIR /app\n`
    dockerfileContent += `COPY --from=build /build/bin/app /app/bin\n\n`;

    dockerfileContent += `# - Run as a non-root user for security\n`
    dockerfileContent += `USER nonroot\n\n`;

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose ${port} port\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent += `# - Start the application\n`;
    dockerfileContent += `CMD ["/app/bin"]\n`;
    
    return dockerfileContent;
};

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
 * @returns A string containing the complete Dockerfile content
 * 
 * @HazemSabry
 */
export const generateLaravelDockerfile = async ( username: string, body: IBackendDockerfileRequestBody):  Promise<string> => {
    const { projectName, VERSION: PHP_VERSION, port, envVars } = body;
    let dockerfileContent = '';
    dockerfileContent += `# This Dockerfile is used to build a multi-stage Docker image for ${projectName} a Laravel application For the Application Owner ${username}\n
                        # and an Apache server. The stages are: composer and production.\n\n`;

    dockerfileContent += `# Stage 1: Composer Dependencies\n
                        # - Sets the working directory to /usr/src/app\n
                        # - Copy only dependency files to optimize caching\n
                        # - Install dependency for production.\n`;
    dockerfileContent += `FROM composer:2.2 AS composer\n`
    dockerfileContent += `WORKDIR /usr/src/app\n`
    dockerfileContent += `COPY composer.json composer.lock .\n`
    dockerfileContent += `RUN composer install --no-dev --no-interaction --prefer-dist\n\n`

    dockerfileContent += `# Stage 2: Laravel Application\n
                        # - Set environment variables\n
                        # - Enable Apache mod_rewrite (required by Laravel)\n
                        # - Install system dependencies && clean up cache and reduce image size\n
                        # - Install PHP extensions needed by Laravel\n
                        # - Set the working directory\n
                        # - Copy pre-installed vendor folder from the composer stage\n
                        # - Copy the rest of the Laravel application\n
                        # - Set the correct file permissions\n`
    dockerfileContent += `FROM php:${PHP_VERSION}-apache AS production\n`
    dockerfileContent += `ENV DEBIAN_FRONTEND=noninteractive\n`
    dockerfileContent += `RUN a2enmod rewrite\n`
    dockerfileContent += `RUN apt-get update && apt-get install -y --no-install-recommends \\ \n
                        git \\ \n
                        curl \\ \n
                        zip \\ \n
                        unzip \\ \n
                        && rm -rf /var/lib/apt/lists/*\n`
    dockerfileContent += `RUN docker-php-ext-install pdo pdo_mysql\n`
    dockerfileContent += `WORKDIR /var/www/html\n`
    dockerfileContent += `COPY --from=composer /app/vendor /var/www/html/vendor\n`
    dockerfileContent += `COPY . /var/www/html\n`
    dockerfileContent += `RUN chmod -R 755 /var/www/html \\ \n
                        && chown -R www-data:www-data /var/www/html\n\n`

    if (envVars) {
        envVars.forEach((env) => {
            dockerfileContent += `ENV ${env.key}=${env.value}\n`;
        });
        dockerfileContent += "\n";
    }

    dockerfileContent += `\n# - Expose ${port} port\n`;
    dockerfileContent += `EXPOSE ${port}\n\n`;

    dockerfileContent += `# - Set Apache DocumentRoot to Laravel's public directory\n`;
    dockerfileContent += `RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf\n\n`;

    dockerfileContent += `# - Start Laravel\n`;
    dockerfileContent += `CMD ["sh", "-c", "cp .env.example .env && php artisan key:generate && php artisan migrate --force && apache2-foreground"]\n`;
    
    return dockerfileContent;
};