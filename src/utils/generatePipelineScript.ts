/**
 * @author Mennatallah Ashraf, Nagham Mohamed
 * @description Generate a Jenkins pipeline script.
 * @param framework: The framework used in the project.
 * @param username: The username of the project owner.
 * @param gitBranch: The git branch to be used in the pipeline.
 * @param repositoryUrl: The URL of the project's repository.
 * @param email: The email of the project owner.
 * @returns A string representing the Jenkins pipeline script.
 */
export const generatePipelineScript = (
    framework: string,
    username: string,
    gitBranch: string,
    repositoryUrl: string,
    email: string
): string => {
    return `def slackNotificationMethod(String buildStatus = 'STARTED') {
    buildStatus = buildStatus ?: 'SUCCESS'

    def color

    if (buildStatus == 'SUCCESS') {
        color = '#47ec05'
    } else if (buildStatus == 'UNSTABLE') {
        color = '#d5ee0d'
    } else {
        color = '#ec2805'
    }

    def msg = "\${buildStatus}: \${env.JOB_NAME} #\${env.BUILD_NUMBER}:\\n\${env.BUILD_URL}"

    slackSend(color: color, message: msg)
}

pipeline { 
    agent any
    
    tools {
        nodejs 'nodejs-23.7.0'
        go 'go-1.24.0'
    }

    environment {
        DOCKER_HUB_REPO = 'mennahaggag' // name of dockerhub repo
        GIT_REPO_URL = '${repositoryUrl}' // github repo where the app exist
        IMAGE_TYPE = "solar-app" // the image name 
        BRANCH_TYPE = "${gitBranch}" // the name of the branch where the app exist
        TECHNOLOGY = '${framework}' // the technology name (e.g., "nodejs", "django", "golang", etc.)
        DOCKERFILES_REPO = 'https://github.com/Nagham94/Dockerfiles2.git' // name of the dockerfile repo
        SONAR_SCANNER_HOME = tool 'sonarqube-scanner702' // sonar scanner server
        SONAR_PROJECT_KEY = 'test1' // sonar scanner project name 
        SLACK_CHANNEL = "#grad-project" // name of slack channel
        USER_NAME = "${username}" // name of the user (for email)
        EMAIL_RECIPIENTS = "${email}" // email of the user
    }

    options {
        disableResume() // Prevents the pipeline from resuming after a Jenkins restart or crash
        // If a new build starts while another is already running, the previous build is aborted to prevent conflicts
        disableConcurrentBuilds abortPrevious: true
    }

    stages {
        stage('Checkout Application Repository') {
            steps {
                script {
                   // deleteDir()  // Clears workspace before checking out repo
                    git branch: BRANCH_TYPE, credentialsId: 'github_token', url: GIT_REPO_URL
                    // Set GIT_COMMIT variable
                    env.GIT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    sh "echo Checked out commit: \${env.GIT_COMMIT}"
                    // Set IMAGE_NAME variable
                    env.IMAGE_NAME = "\${DOCKER_HUB_REPO}/\${IMAGE_TYPE}:\${env.GIT_COMMIT}"
                    sh "echo Global Image Name: \${env.IMAGE_NAME}"
                }
            }
        }

        stage('Installing Dependencies') {
            options { timestamps() }
            steps {
                script {
                    switch (env.TECHNOLOGY.toLowerCase()) {
                        case 'nodejs':
                        case 'angular':
                        case 'react':
                        case 'svelte':
                        case 'vuejs':
                            sh 'npm install --no-audit'
                            break
                        
                        case 'django':
                        case 'flask':
                            sh '''
	                           python3 -m venv venv
	                           . venv/bin/activate
                               pip install --upgrade pip
                               pip install --no-cache-dir -r requirements.txt
                            '''
                            break
                        
                        case 'golang':
                            sh 'go mod download'
                            break
    
                        case 'laravel':
                        case 'php':
                        case 'wordpress':
                            sh 'composer install --no-interaction --prefer-dist'
                            break
                        
                        default:
                            echo "No matching technology found or TECHNOLOGY variable not set. Skipping dependency installation."
                    }
                } 
            }
        }

        stage('Build Application') {
            steps {
                script {
                    switch (env.TECHNOLOGY.toLowerCase()) {
                        case 'angular':
                        case 'react':
                        case 'svelte':
                        case 'vuejs':
                            sh 'npm run build'
                            break

                        case 'golang':
                            sh 'go build -o app'
                            break

                        case 'nodejs':
                        case 'php':
                        case 'django':
                        case 'flask':
                            echo "No build step required for \${env.TECHNOLOGY} before SonarQube analysis."
                            break

                        default:
                            echo "No specific build step for \${env.TECHNOLOGY}."
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                   def sonarLanguage = ''
                   def sonarExclusions = ''

                   switch (env.TECHNOLOGY.toLowerCase()) {
                            case 'nodejs':
                            case 'angular':
                            case 'react':
                            case 'svelte':
                            case 'vuejs':
                                sonarLanguage = 'js'
                                sonarExclusions = '**/node_modules/**,**/*.test.js,**/dist/**'
                                break

                            case 'python':
                                sonarLanguage = 'py'
                                sonarExclusions = '**/venv/**,**/__pycache__/**'
                                break

                            case 'golang':
                                sonarLanguage = 'go'
                                sonarExclusions = '**/vendor/**'
                                break

                            case 'php':
                                sonarLanguage = 'php'
                                sonarExclusions = '**/vendor/**'
                                break

                            default:
                                sonarLanguage = ''
                                sonarExclusions = ''
        }

                timeout(time: 5, unit: 'MINUTES') {
                    withSonarQubeEnv('sonarqube-server') {
                        sh """
                            $SONAR_SCANNER_HOME/bin/sonar-scanner \\
                                -Dsonar.projectKey=\${SONAR_PROJECT_KEY} \\
                                -Dsonar.sources=. \\
                                -Dsonar.language=\${sonarLanguage} \\
                                -Dsonar.sourceEncoding=UTF-8 \\
                                -Dsonar.exclusions=\${sonarExclusions} \\
                        """
                    }
                }
                    // Quality Gate check but does NOT stop the pipeline on failure
                    script {
                        def qualityGate = waitForQualityGate()
                        if (qualityGate.status != 'OK') {
                            echo "WARNING: SonarQube Quality Gate failed, but continuing pipeline..."
                        }
                    }
                    
                }
            }
        }

        stage('Checkout Dockerfiles Repository') {
            steps {
                script {
                    dir('dockerfiles_repo') {
                        git branch: BRANCH_TYPE, credentialsId: 'github_token', url: DOCKERFILES_REPO
                    }
                    // Copy Dockerfile to Application Repo
                    sh """
                        cp dockerfiles_repo/\${TECHNOLOGY}/Dockerfile .
                        echo "Copied Dockerfile for \${TECHNOLOGY} to project root"
                    """
                    // Delete Dockerfiles Repository
                    sh """
                        rm -rf dockerfiles_repo
                        echo "Deleted dockerfiles_repo after copying Dockerfile"
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t \${env.IMAGE_NAME} .
                        echo "Built Docker image: \${env.IMAGE_NAME}"
                    """
                }
            }
        }

        stage('Trivy Vulnerability Scanner') { 
            steps {
                sh  """ 
                    trivy image \${env.IMAGE_NAME} \\
                        --severity LOW,MEDIUM,HIGH \\
                        --exit-code 0 \\
                        --quiet \\
                        --format json -o trivy-image-MEDIUM-results.json

                    trivy image \${env.IMAGE_NAME} \\
                        --severity CRITICAL \\
                        --exit-code 1 \\
                        --quiet \\
                        --format json -o trivy-image-CRITICAL-results.json
                """
            }

            post {
                always {
                    sh '''
                        trivy convert \\
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \\
                            --output trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.json 

                        trivy convert \\
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \\
                            --output trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.json

                        trivy convert \\
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \\
                            --output trivy-image-MEDIUM-results.xml  trivy-image-MEDIUM-results.json 

                        trivy convert \\
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \\
                            --output trivy-image-CRITICAL-results.xml trivy-image-CRITICAL-results.json          
                    '''
                    junit allowEmptyResults: true, stdioRetention: '', testResults: 'trivy-image-CRITICAL-results.xml'

                    junit allowEmptyResults: true, stdioRetention: '', testResults: 'trivy-image-MEDIUM-results.xml'

                    publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './', reportFiles: 'trivy-image-CRITICAL-results.html', reportName: 'Trivy Image Critical Vul Report', reportTitles: '', useWrapperFileDirectly: true])

                    publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './', reportFiles: 'trivy-image-MEDIUM-results.html', reportName: 'Trivy Image Medium Vul Report', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    }
                }
            }
        }

        stage('Push Docker Images to Docker Hub') {
            steps {
                script {
                        sh """
                           docker push \${env.IMAGE_NAME}
                           echo "Pushed Docker image: \${env.IMAGE_NAME}"
                        """
                }
            }
        }
    }

    post {
      always {
        // Slack Message
        slackNotificationMethod("\${currentBuild.result}")
        // Upload Trivy Reports to Slack
        sh 'wkhtmltopdf trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.pdf'
        sh 'wkhtmltopdf trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.pdf'

        slackUploadFile(
             channel: SLACK_CHANNEL,
             filePath: "trivy-image-MEDIUM-results.pdf",
             initialComment: "Trivy Medium Vulnerability Report for Build #\${env.BUILD_NUMBER}"
        )

        slackUploadFile(
             channel: SLACK_CHANNEL,
             filePath: "trivy-image-CRITICAL-results.pdf",
             initialComment: "Trivy Critical Vulnerability Report for Build #\${env.BUILD_NUMBER}"
        )
        // Send Email Notification
        emailext(
           subject: "Nuvvai Security Scan Report - Jenkins Build \${currentBuild.result}: \${env.JOB_NAME} #\${env.BUILD_NUMBER}",
           body: """
              <h2>Security Scan Report - Build \${currentBuild.result}</h2>
              <p>Dear \${env.USER_NAME},</p>
              <p>The Trivy vulnerability scan for your recent build has been completed. Please find the attached reports for detailed insights.</p>
              <ul>
              <li><strong>Job:</strong> \${env.JOB_NAME}</li>
              <li><strong>Build Number:</strong> \${env.BUILD_NUMBER}</li>
              </ul>
              <p>We recommend reviewing the findings and addressing any critical or high-severity vulnerabilities as soon as possible.</p>
              <p>For any questions or further assistance, feel free to reach out.</p>
              <p>Best regards,</p>
              <p><strong>Nuvvai Team</strong></p>
            """,
            to: EMAIL_RECIPIENTS,
            mimeType: 'text/html',
            attachmentsPattern: 'trivy-image-MEDIUM-results.pdf,trivy-image-CRITICAL-results.pdf'
        )

      }
    }
}
`;}