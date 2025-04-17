pipeline {
    agent any

    environment {
        IMAGE_NAME = "rihab26/nodejs-app"
        REGISTRY = "docker.io"
        GIT_REPO = "https://github.com/RihabHaddad/DevSecOps-pipeline.git"
        GITOPS_REPO = "git@github.com:RihabHaddad/GitOps.git"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm: [
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: "${GIT_REPO}",
                        credentialsId: 'github-cred'
                    ]]
                ]
            }
        }

        stage('Prepare') {
            steps {
                script {
                    env.IMAGE_TAG = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    echo "Image tag to be used: ${IMAGE_TAG}"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool name: 'SonarQube Scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                            sh """
                                ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=nodejs-app \
                                -Dsonar.sources=. \
                                -Dsonar.exclusions=**/*.java \
                                -Dsonar.login=$SONAR_TOKEN
                            """
                        }
                    }
                }
            }
        }

        stage('Security Scan with Trivy (FS)') {
            steps {
                sh "trivy fs --exit-code 1 --severity HIGH,CRITICAL . || true"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Scan Docker Image') {
            options {
                timeout(time: 5, unit: 'MINUTES')
            }
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('GitOps Update') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'gitops-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh "rm -rf temp-repo"
                    sh "git clone ${GITOPS_REPO} temp-repo"
                    dir('temp-repo') {
                        sh "sed -i 's|image: .*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' k8s/deployment.yaml"

                        def changes = sh(script: "git status --porcelain", returnStdout: true).trim()
                        if (changes) {
                            sh "git add ."
                            sh "git commit -m 'Update image tag to ${IMAGE_TAG}'"
                            sh "git push origin main"
                        } else {
                            echo "No changes detected, skipping commit."
                        }
                    }
                }
            }
        }

        stage('Sync ArgoCD') {
            steps {
                echo "Simulated ArgoCD sync for ${IMAGE_NAME}:${IMAGE_TAG} (replace with actual command if needed)"
                // Pour exécution réelle :
                // sh "argocd app sync nodejs-app --grpc-web"
            }
        }
    }

    post {
        always {
            script {
                def buildStatus = currentBuild.currentResult
                def subject = "Build ${buildStatus}: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                def body = """
                    Build Status: ${buildStatus}<br>
                    Job: ${env.JOB_NAME}<br>
                    Build Number: ${env.BUILD_NUMBER}<br>
                    URL: <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a>
                """

                emailext (
                    subject: subject,
                    body: body,
                    to: 'rihabhaddad26@gmail.com',
                    from: 'jenkins@example.com',
                    replyTo: 'noreply@example.com',
                    mimeType: 'text/html'
                )
            }
        }
    }
}
