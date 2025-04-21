pipeline {
    agent any

    environment {
        IMAGE_NAME = "rihab26/nodejs-app"
        REGISTRY = "docker.io"
        GIT_REPO = "https://github.com/RihabHaddad/DevSecOps-pipeline.git"
        GITOPS_REPO = "git@github.com:RihabHaddad/GitOps.git"
        VAULT_SECRET_GITHUB = 'secret/github'
        VAULT_SECRET_DOCKERHUB = 'secret/dockerhub'
        VAULT_SECRET_SONAR = 'secret/sonarqube'
        VAULT_SECRET_GITOPS = 'secret/gitops'
    }

    stages {
        stage('Checkout Code') {
            steps {
                withVault([vaultSecrets: [[path: "${VAULT_SECRET_GITHUB}", secretValues: [[envVar: 'GITHUB_TOKEN', vaultKey: 'token']]]]]) {
                    checkout scm: [
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: "${GIT_REPO}",
                            credentialsId: '', // Plus besoin ici si token géré via Vault
                            credentials: [username: 'rihabhaddad', password: "${GITHUB_TOKEN}"]
                        ]]
                    ]
                }
            }
        }

        stage('Prepare') {
            steps {
                script {
                    env.IMAGE_TAG = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    echo "Image tag: ${IMAGE_TAG}"
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withVault([vaultSecrets: [[path: "${VAULT_SECRET_SONAR}", secretValues: [[envVar: 'SONAR_TOKEN', vaultKey: 'token']]]]]) {
                    script {
                        def scannerHome = tool name: 'SonarQube Scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        withSonarQubeEnv('SonarQube') {
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
                sh 'trivy fs --scanners vuln --no-progress --severity HIGH,CRITICAL --format table --output trivy-fs-report.txt . || true'
                sh 'cat trivy-fs-report.txt'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Scan Docker Image') {
            steps {
                script {
                    def exitCode = sh(
                        script: """
                            trivy image --timeout 10m \
                            --scanners vuln \
                            --no-progress \
                            --severity HIGH,CRITICAL \
                            --format table \
                            --output trivy-report.txt \
                            ${IMAGE_NAME}:${IMAGE_TAG}
                        """,
                        returnStatus: true
                    )
                    sh 'cat trivy-report.txt'
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                withVault([vaultSecrets: [[path: "${VAULT_SECRET_DOCKERHUB}", secretValues: [
                    [envVar: 'DOCKER_USER', vaultKey: 'username'],
                    [envVar: 'DOCKER_PASS', vaultKey: 'password']
                ]]]]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('GitOps Update') {
            steps {
                withVault([vaultSecrets: [[path: "${VAULT_SECRET_GITOPS}", secretValues: [[envVar: 'SSH_KEY', vaultKey: 'key']]]]]) {
                    sh 'rm -rf temp-repo'
                    sh "mkdir -p ~/.ssh && echo \"$SSH_KEY\" > ~/.ssh/id_rsa && chmod 600 ~/.ssh/id_rsa"
                    sh "git clone ${GITOPS_REPO} temp-repo"
                    dir('temp-repo') {
                        sh "sed -i 's|image: .*|image: ${IMAGE_NAME}:${IMAGE_TAG}|' k8s/deployment.yaml"
                        script {
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
        }

        stage('Sync ArgoCD') {
            steps {
                echo "ArgoCD sync would be triggered here (e.g., argocd app sync nodejs-app)"
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

            archiveArtifacts artifacts: '*.txt', fingerprint: true
        }
    }
}
