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
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        checkout scm: [
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[
                                url: "${GIT_REPO}",
                                credentialsId: 'github-credentials'
                            ]]
                        ]
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
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sh "trivy fs --exit-code 1 --severity HIGH,CRITICAL . || true"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sh "docker build -t ${IMAGE_NAME}:latest ."
                    }
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            sh "docker push ${IMAGE_NAME}:latest"
                        }
                    }
                }
            }
        }

        stage('GitOps Update') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'gitops-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            sh "rm -rf temp-repo" 
                            sh "git clone ${GITOPS_REPO} temp-repo"
                            dir('temp-repo') {
                                sh "sed -i 's|imageTag:.*|imageTag: latest|' k8s/deployment.yaml"
                                sh "git config --global user.email 'rihab.haddad@esprit.tn'"
                                sh "git config --global user.name 'Rihab Haddad'"

                                sh "git status"
                                def changes = sh(script: "git status --porcelain", returnStdout: true).trim()
                                if (changes) {
                                    sh "git add ."
                                    sh "git commit -m 'Update image tag to latest'"
                                    sh "git push origin main"
                                } else {
                                    echo "Aucune modification détectée, pas de commit."
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Sync ArgoCD') {
            steps {
                script {
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sh "argocd app sync nodejs-app --grpc-web"
                        sh "argocd app wait nodejs-app --sync-status Synced --operation-state Healthy"
                    }
                }
            }
        }
    }
}
