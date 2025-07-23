# Nuvvai's Backend Repository

This repo contains the backend of the Nuvvai web application, a Platform-as-a-Service (PaaS) solution that automates the complete DevOps lifecycle, from project creation to production deployment. Built with TypeScript, Express.js, and MongoDB, it integrates seamlessly with GitHub, Jenkins, and Kubernetes, and supports multiple technology stacks through dynamic code and infrastructure generation.

---

## Purpose

This backend empowers development teams to adopt DevOps without deep infrastructure knowledge by automating:

- CI/CD pipeline creation and execution
- Code, Dockerfile, and Kubernetes manifest generation
- Multi-stack deployment (Node.js, Python, Golang, PHP, React, Angular)
- GitHub repository management and Jenkins job orchestration
- Secure, role-based access for multiple users

---

## System Architecture

The backend follows a **layered architecture** built with **Express.js**:

- **Route Layer**: RESTful APIs for projects, pipelines, deployments, and users
- **Middleware Layer**: Authentication, authorization, monitoring, and security
- **Service Layer**: Integration with Jenkins, GitHub, Kubernetes, and email
- **Persistence Layer**: MongoDB-based storage with Mongoose

---

## Tech Stack

| Category        | Tools/Libraries                           |
|----------------|--------------------------------------------|
| Backend         | Node.js 22.x, TypeScript, Express.js      |
| Database        | MongoDB, Mongoose                         |
| Auth & Security | JWT, GitHub OAuth, bcryptjs, helmet, cors |
| DevOps          | Jenkins, Kubernetes, Docker               |
| Metrics         | Prometheus (`prom-client`)                |
| Email Service   | Nodemailer                                |
| GitHub API      | @octokit/rest                             |
| Jenkins Client  | jenkins (npm)                             |

---

## Authentication & Authorization

- **JWT-based Auth**: Secured APIs with token-based access
- **GitHub OAuth**: Used for login and repo access
- **Role-Based Access Control (RBAC)**:
  - Regular users: manage own projects and deployments
  - Admins: system-wide control via `/api/admin`

---

## API Structure

| Endpoint             | Purpose                       | Access Level     |
|----------------------|-------------------------------|------------------|
| `/api/auth`          | Auth, GitHub OAuth            | Public           |
| `/api/projects`      | Project management            | Authenticated    |
| `/api/pipelines`     | Pipeline creation & status    | Authenticated    |
| `/api/deploy`        | Trigger full deployment       | Authenticated    |
| `/api/deployments`   | Deployment tracking           | Authenticated    |
| `/api/users`         | User profile and VCS config   | Authenticated    |
| `/api/providers`     | GitHub/GitLab/Azure DevOps    | Authenticated    |
| `/api/admin`         | System-wide admin actions     | Admin only       |

---

## Key Features

### 1. **CI/CD Pipeline Automation**
- Jenkinsfile generation based on project type
- Stages: install → build → test → scan → deploy
- Tools: SonarQube, Trivy, Prometheus

### 2. **Multi-Stack Support**
| Stack         | Build Tool       | Testing        | Containerization    |
|---------------|------------------|----------------|---------------------|
| Node.js       | npm              | Jest           | Multi-stage Docker  |
| Python/Django | pip              | pytest         | Python base image   |
| Golang        | go build         | go test        | Alpine image        |
| React/Angular | npm              | Jest/Cypress   | Nginx               |
| PHP/Laravel   | composer          | PHPUnit        | PHP-FPM + Nginx     |

### 3. **Dynamic Code & Infra Generation**
- Dockerfile generation based on project type
- Kubernetes manifests for Deployments, Services, PVCs
- Jenkins pipeline scripts customized per project

### 4. **External Integrations**
- **GitHub**: Repo creation, OAuth login, webhooks
- **Jenkins**: Job creation, build triggering, monitoring
- **Kubernetes**: Namespace mgmt, rolling updates
- **Prometheus**: App-level metrics via `/metrics`
- **Slack & Email**: Notifications and reports

### 5. **Security & Compliance**
- Helmet.js security headers
- CORS restricted to frontend domain
- Secrets via environment variables
- Integrated security scanners: SonarQube & Trivy

---
## Development Setup

### 1. Clone & Install

```bash
git clone https://github.com/Nuvvai/graduation-project-node-api.git
cd graduation-project-node-api
npm install
```
### 2. Configure Environment
Create a .env file:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/nuvvai
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FRONTEND_DOMAIN_NAME=http://localhost:5000
```
### 3. Run the App
```bash
npm run dev
```
---
## Testing

Run unit tests:
```bash
npm run test:unit
```

Run integration tests:
```bash
npm run test:integration
```

Run both:
```bash
npm test
```


## License  
This project is licensed under the [MIT License](LICENSE).


