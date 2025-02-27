/**
 * @author Mennatallah Ashraf, Nagham Mohamed
 * @description Generate a Jenkins pipeline script.
 * @param framework: The framework used in the project.
 * @param username: The username of the project owner.
 * @param gitBranch: The git branch to be used in the pipeline.
 * @param repositoryUrl: The URL of the project's repository.
 * @returns A string representing the Jenkins pipeline script.
 */
export const generatePipelineScript = (
    framework: string,
    username: string,
    gitBranch: string,
    repositoryUrl: string
): string => {
    return `
            pipeline {
                agent any

                tools {
                    nodejs 'nodejs-23.7.0'
                    go 'go-1.24.0'
                }

                environment {

                    // for build & push image stage
                    DOCKER_HUB_REPO = "${username}"
                    GIT_REPO_URL = "${repositoryUrl}"
                    IMAGE_TYPE = "${framework}"
                    BRANCH_TYPE = "${gitBranch}"
                    TECHNOLOGY = "${framework}"

                }
                
                stages {
                    
                    stage('Checkout Code') {
                        steps {
                            script {
                                git branch: BRANCH_TYPE , credentialsId: 'github_token', url: "\${GIT_REPO_URL}"
                                // Set GIT_COMMIT variable
                                env.GIT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                                sh "echo Checked out commit: \${env.GIT_COMMIT}"
                            }
                        }
                    }

                    stage('Installing Dependencies') {
                        options { timestamps() }
                        steps {
                            script {
                                switch (env.TECHNOLOGY) {
                                    case 'nodejs':
                                    case 'angular':
                                    case 'react':
                                    case 'svelte':
                                    case 'vuejs':
                                        sh 'npm install --no-audit'
                                        break
                                    
                                    case 'django':
                                    case 'flask':
                                        sh 'pip install --no-cache-dir -r requirements.txt'
                                        break
                                    
                                    case 'golang':
                                        sh 'go mod download'
                                        break
                                    
                                    //case 'sqlite':
                                    //    sh 'pip3 install --no-cache-dir sqlite-web'
                                    //    break
                                    
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

                    stage('OWASP Dependency Check') {
                        steps {
                                    // check of all vulnerabilities (high, low, medium, critical)
                                    dependencyCheck additionalArguments: '''
                                        --scan \'./\' 
                                        --out \'./\'  
                                        --format \'ALL\' 
                                        --disableYarnAudit \
                                        --prettyPrint''', odcInstallation: 'owasp-depcheck-10'

                                    // to fail the build if it found vulnerabilities that exceed the threshold
                                    dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: false

                                    // to publish the HTML report in the UI of blue ocean
                                    publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, keepAll: true, reportDir: './', reportFiles: 'dependency-check-jenkins.html', reportName: 'dependency check HTML Report', reportTitles: '', useWrapperFileDirectly: true])

                                    // to publish the test report in the UI of blue ocean
                                    junit allowEmptyResults: true, keepProperties: true, stdioRetention: '', testResults: 'dependency-check-junit.xml'
                        }
                    }
                    
                    stage('Running Unit Tests') {
                        steps {
                            script {
                                switch (env.TECHNOLOGY.toLowerCase()) {
                                // Angular, React, Svelte, Vue.js, Node.js
                                case 'nodejs':
                                case 'angular':
                                case 'react':
                                case 'svelte':
                                case 'vuejs':
                                    sh 'npm test'  // test using junit
                                break

                                // Django
                                case 'django':
                                    sh 'python manage.py test'
                                break

                                // Flask
                                case 'flask':
                                    sh 'pytest --junitxml=test-results.xml'
                                break

                                // Golang
                                case 'golang':
                                    sh 'go test ./... -v | tee go-test-results.log'
                                break

                                // Laravel (PHPUnit)
                                case 'laravel':
                                    sh 'php artisan test --log-junit test-results.xml'
                                break

                                // PHP (Using PHPUnit framework)
                                case 'php':
                                    sh 'vendor/bin/phpunit --log-junit test-results.xml'
                                break

                                // WordPress (Using WP test framework)
                                case 'wordpress':
                                    sh 'wp test run'
                                break

                                default:
                                    echo "No matching technology found or TECHNOLOGY variable not set. Skipping unit tests."
                                }
                                // to publish the test report in the UI of blue ocean 
                                junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
                            }
                        }
                    }

                stage('Build Docker Images') {
                        steps {
                            script {
                                sh 'printenv'

                                def imageName = "\${DOCKER_HUB_REPO}/\${IMAGE_TYPE}:\${env.GIT_COMMIT}"
                                sh """
                                    docker build -t \${imageName} .
                                    echo "Built Docker image: \${imageName}"
                                """
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
                                    def imageName = "\${DOCKER_HUB_REPO}/\${IMAGE_TYPE}:\${env.GIT_COMMIT}"
                                    sh """
                                    docker push \${imageName}
                                    echo "Pushed Docker image: \${imageName}"
                                    """
                            }
                        }
                    }
                }  
            }  
        `;
};
