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
                script {
                    try {
                        checkout scm: [
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[
                                url: "${GIT_REPO}",
                                credentialsId: 'github-credentials' 
                            ]]
                        ]
                    } catch (Exception e) {
                        error "Échec du checkout: ${e.message}"
                    }
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

        stage('Security Scan with Trivy') {
            steps {
                script {
                    try {
                        sh "trivy fs --exit-code 1 --severity HIGH,CRITICAL . || true"
                    } catch (Exception e) {
                        error "Échec du scan Trivy: ${e.message}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        sh "docker build -t ${IMAGE_NAME}:latest ."
                    } catch (Exception e) {
                        error "Échec du build Docker: ${e.message}"
                    }
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        try {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            sh "docker push ${IMAGE_NAME}:latest"
                        } catch (Exception e) {
                            error "Échec du push Docker: ${e.message}"
                        }
                    }
                }
            }
        }

        stage('GitOps Update') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'gitops-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        try {
                            sh "git clone ${GITOPS_REPO} temp-repo"
                            dir('temp-repo') {
                                sh "sed -i 's|imageTag:.*|imageTag: latest|' k8s/deployment.yaml"
                                sh "git config --global user.email 'rihab.haddad@esprit.tn'"
                                sh "git config --global user.name 'Rihab Haddad'"
                                sh "git add ."
                                sh "git commit -m 'Update image tag to latest'"
                                sh "git push origin main"
                            }
                        } catch (Exception e) {
                            error "Échec de la mise à jour du repo GitOps: ${e.message}"
                        }
                    }
                }
            }
        }

        stage('Sync ArgoCD') {
            steps {
                script {
                    try {
                        sh "argocd app sync my-app --grpc-web"
                        sh "argocd app wait my-app --sync-status Synced --operation-state Healthy"
                    } catch (Exception e) {
                        error "Échec de la synchronisation ArgoCD: ${e.message}"
                    }
                }
            }
        }
    }
}
