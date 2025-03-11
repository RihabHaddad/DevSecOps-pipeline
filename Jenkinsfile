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
                git branch: 'main', url: "${GIT_REPO}"
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
    withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
        sh "sonar-scanner -Dsonar.projectKey=nodejs-app -Dsonar.sources=. -Dsonar.login=$SONAR_TOKEN"
    }
}
            }
        }

        stage('Security Scan with Trivy') {
            steps {
                sh "trivy fs --exit-code 1 --severity HIGH,CRITICAL . || true"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withDockerRegistry([credentialsId: 'docker-hub-cred', url: "https://${REGISTRY}"]) {
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        
    }
}
}