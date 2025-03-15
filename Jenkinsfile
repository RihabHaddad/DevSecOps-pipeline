pipeline {
    agent any

    environment {
        IMAGE_NAME = "rihab26/nodejs-app"
        REGISTRY = "docker.io"
        GIT_REPO = "https://github.com/RihabHaddad/DevSecOps-pipeline.git"
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
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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
    }

   
}
