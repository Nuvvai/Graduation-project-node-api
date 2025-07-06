def slackNotificationMethod(String buildStatus = 'STARTED', String PROJECT_NAME, String SLACK_CHANNEL) {
    buildStatus = buildStatus ?: 'SUCCESS'

    def color

    if (buildStatus == 'SUCCESS') {
        color = '#47ec05'
    } else if (buildStatus == 'UNSTABLE') {
        color = '#d5ee0d'
    } else {
        color = '#ec2805'
    }

    def msg = "${buildStatus}: ${PROJECT_NAME} - ${env.JOB_NAME} #${env.BUILD_NUMBER}:\n${env.BUILD_URL}"

    slackSend(channel: SLACK_CHANNEL, color: color, message: msg)
}

pipeline { 
    agent{
        label 'agent'
    }

environment {
    GIT_REPO_URL = 'https://github.com/Nuvvai/Graduation-project-node-api.git' // github repo where the app exist
    BRANCH_NAME = "main" // the name of the branch where the app exist
    PROJECT_NAME = "nuvvai_backend" // used in the image name
    DOCKER_HUB_REPO = 'nuvvai' // name of dockerhub repo
    SONAR_SCANNER_HOME = tool 'sonarqube-scanner702' // sonar scanner server
    SONAR_PROJECT_KEY = 'test2' // sonar scanner project name
    USER_NAME = "mennauser"
    EMAIL_RECIPIENTS = "mennaa619@gmail.com" // email of the user
    SLACK_CHANNEL = "#nuvvai-app-build-status" // name of slack channel
    }

options {
        timestamps() // for full log traceability
        disableResume() // Prevents the pipeline from resuming after a Jenkins restart or crash
        // If a new build starts while another is already running, the previous build is aborted to prevent conflicts
        disableConcurrentBuilds abortPrevious: true
    }

stages {
    stage('Set Image Variable') {
            options {
              retry(2) // retry this stage up to 2 more times if it fails
            }
            steps {
                script {
                    //deleteDir()  // Clears workspace before checking out repo
                    // Set GIT_COMMIT variable
                    //env.GIT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    //sh "echo Checked out commit: ${env.GIT_COMMIT}"
                    // Set IMAGE_NAME variable
                    env.IMAGE_NAME = "${DOCKER_HUB_REPO}/${PROJECT_NAME}:latest"
                    sh "echo Global Image Name: ${env.IMAGE_NAME}"
                }
            }
        }
    
    stage('Install Project Dependencies') {
        options { 
            retry(2) // retry this stage up to 2 more times if it fails
            timeout(time: 10, unit: 'MINUTES')
        }
        steps {
           sh '''
              npm install
              echo "[DONE] Dependencies installed successfully"
            '''
           }
        }

    stage('Build Application Artifacts') {
            steps {
                sh 'npm run build'
            }
    }
    
    stage('Unit Testing') {
      options {
            retry(2) // retry this stage up to 2 more times if it fails
         }
      steps {
        catchError(buildResult: 'SUCCESS', message: 'Oops! it will be fixed in future releases', stageResult: 'UNSTABLE') {
            // Run tests and output results in JUnit format
            sh 'npm run test:unit'
        }
      }
    }

    stage('Build Docker Image') {
            options {
              retry(2) // retry this stage up to 2 more times if it fails
              timeout(time: 15, unit: 'MINUTES')
            }
            steps {
                script {
                    sh """
                        docker build -t ${env.IMAGE_NAME} .
                        echo "Built Docker image: ${env.IMAGE_NAME}"
                    """
                }
            }
    }

   stage('Parallel Run Scans') {
           parallel {
               stage('Static Code Analysis with SonarQube') {
                 options { 
                    timeout(time: 15, unit: 'MINUTES')
                 }
                 steps {
                    script {
                     withSonarQubeEnv('sonarqube-server') {
                         sh """
                           $SONAR_SCANNER_HOME/bin/sonar-scanner \
                               -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                               -Dsonar.sources=. 
                         """
                         echo "[DONE] SonarQube scan completed"
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

                stage('Trivy Vulnerability Scanner') { 
                    steps {
                      sh  """ 
                        trivy image ${env.IMAGE_NAME} \
                           --severity LOW,MEDIUM,HIGH \
                           --exit-code 0 \
                           --quiet \
                           --format json -o trivy-image-MEDIUM-results.json

                        trivy image ${env.IMAGE_NAME} \
                           --severity CRITICAL \
                           --exit-code 0 \
                           --quiet \
                           --format json -o trivy-image-CRITICAL-results.json
                     """
                     echo "[DONE] Trivy scan completed."
                     }
                }
           }
   }
    
    stage('Login to Docker Hub') {
              options {
              retry(2) // retry this stage up to 2 more times if it fails
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'nuvvai_dockerhub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                            docker login -u "$DOCKER_USER" --password "$DOCKER_PASS"
                        '''
                    }
                }
            }
    }

    stage('Push Docker Images to Docker Hub') {
             options {
              retry(2) // retry this stage up to 2 more times if it fails
              timeout(time: 15, unit: 'MINUTES')
           }
            steps {
                script {
                        sh """
                           docker push ${env.IMAGE_NAME}
                           echo "[DONE] Image pushed successfully: ${env.IMAGE_NAME}"
                        """
                }
            }
    }
    stage('Deploy to Kubernetes') {
        options {
            retry(2) // retry this stage up to 2 more times if it fails
            timeout(time: 15, unit: 'MINUTES')
        }
        steps {
            script {
                sh """
                    echo "Ensuring namespace 'nuvvai' exists..."
                    kubectl create namespace nuvvai --dry-run=client -o yaml | kubectl apply -f -
    
                    echo "Waiting for namespace 'nuvvai' to become available..."
                    for i in {1..10}; do
                      kubectl get namespace nuvvai >/dev/null 2>&1 && break
                      echo "Namespace not ready yet. Retrying in 2s..."
                      sleep 2
                    done
    
                    if ! kubectl get deployment nuvvai-backend-deployment -n nuvvai >/dev/null 2>&1; then
                        echo "Deployment not found. Applying manifests..."
                        kubectl apply -f .
                    else
                    
                    echo "Applying all Kubernetes manifests in the current directory..."
                    kubectl apply -f .
    
                    echo "Forcing a rolling restart of the deployment..."
                    kubectl rollout restart deployment nuvvai-backend-deployment -n nuvvai
                    kubectl rollout status deployment nuvvai-backend-deployment -n nuvvai
    
                    echo "Deployment complete and all resources updated."
                """
            }
        }
    }
 }

    post {
      always {
        sh '''
            trivy convert \
                --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                --output trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.json 

            trivy convert \
                --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                --output trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.json         
        '''
        // convert reports from HTML to pdf
        sh '''
           wkhtmltopdf trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.pdf
           wkhtmltopdf trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.pdf
           wkhtmltopdf --enable-local-file-access coverage/lcov-report/index.html coverage-report.pdf
           wkhtmltopdf test-results/test-report.html test-report.pdf
        '''

       // Parallel notifications
       script {
         parallel (
          slack_notify: {
            // Slack Message
            slackNotificationMethod("${currentBuild.result}", env.PROJECT_NAME, env.SLACK_CHANNEL)

            slackUploadFile(
                 channel: SLACK_CHANNEL,
                 filePath: "trivy-image-MEDIUM-results.pdf",
                 initialComment: "Trivy Medium Vulnerability Report for Build #${env.BUILD_NUMBER}"
            )

            slackUploadFile(
                 channel: SLACK_CHANNEL,
                 filePath: "trivy-image-CRITICAL-results.pdf",
                 initialComment: "Trivy Critical Vulnerability Report for Build #${env.BUILD_NUMBER}"
            )

            slackUploadFile(
                 channel: SLACK_CHANNEL,
                 filePath: "test-report.pdf",
                 initialComment: "JUnit Test Report for Build #${env.BUILD_NUMBER}"
            )

            slackUploadFile(
                 channel: SLACK_CHANNEL,
                 filePath: "coverage-report.pdf",
                 initialComment: "Code Coverage Report for Build #${env.BUILD_NUMBER}"
            )

        },

     send_email: {
      // Send Email Notification
      emailext( 
        subject: "Nuvvai Security, Code Coverage, and Test Report - Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """
           <h2>Security Scan, Code Coverage, and Test Report - Build ${currentBuild.result}</h2>
           <p>Dear Development Team,</p>
           <p>The Trivy vulnerability scan, code coverage analysis, and test execution for the latest build of the <strong>Nuvvai</strong> application <strong>"Node-API part"</strong> have been completed.</p>
           <p>Please review the attached reports for detailed information regarding detected vulnerabilities, code coverage results, and test outcomes.</p>
           <ul>
             <li><strong>Job:</strong> ${env.JOB_NAME}</li>
             <li><strong>Build Number:</strong> ${env.BUILD_NUMBER}</li>
           </ul>
           <p><strong>Security Scan Report:</strong></p>
           <p>The vulnerability scan has identified critical and high-severity issues that require immediate attention:</p>
           <ul>
             <li><strong>CRITICAL</strong> and <strong>HIGH</strong> severity vulnerabilities have been detected and need to be addressed promptly.</li>
           </ul>
           <p><strong>Code Coverage Report:</strong></p>
           <p>The code coverage report is attached for your review. Please ensure that all major areas of the codebase are sufficiently tested and covered to maintain application quality.</p>
           <p><strong>Test Report:</strong></p>
           <p>The test execution report is also attached, providing detailed results of the test cases run against this build. Please review any failed or unstable tests and take necessary actions.</p>
           <p>If you have any questions or need assistance, feel free to reach out to the DevOps team.</p>
           <p>Best regards,</p>
           <p><strong>DevOps Team - Nuvvai</strong></p>
        """,
        to: EMAIL_RECIPIENTS,
        mimeType: 'text/html',
        attachmentsPattern: 'trivy-image-MEDIUM-results.pdf,trivy-image-CRITICAL-results.pdf,coverage-report.pdf,test-report.pdf'
      )
         }
      )
    }
        
        // Clean up Docker images
        script {
        echo "Cleaning up Docker images to free disk space..."
        // Remove the image built in this pipeline
        sh "docker rmi -f ${env.IMAGE_NAME} || true"
        // Remove dangling images that don’t have a tag (their tag shows as <none>)
        sh "docker image prune -f"
        }

      }
    }


}
