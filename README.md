# DevSecOps CI/CD Pipeline Repository

This repository contains the source code for our application, the Dockerfile used to containerize it, and the Jenkinsfile that defines our automated Continuous Integration/Continuous Delivery (CI/CD) pipeline. This pipeline integrates security scanning and code quality checks to follow DevSecOps best practices.

## Contents

* **Dockerfile:** Defines the steps to build the Docker image for the application. It uses a multi-stage build process for efficient image creation.
* **Jenkinsfile:** A declarative pipeline script for Jenkins that automates the build, test, security scan (Trivy), static code analysis (SonarQube), Docker image creation, pushing to Docker Hub, and triggering GitOps deployment via ArgoCD.
* **src/:** (Placeholder) This directory would contain the application's source code. The specific structure will depend on the programming language and framework used.
* **Other application-specific files:** Any other configuration or source files required by your application.

## Purpose

This repository serves as the central location for the application's development lifecycle, managed through an automated and secure CI/CD pipeline. Changes to the code in this repository will trigger the pipeline in Jenkins.

## Key Technologies Integrated

* **Docker:** For containerizing the application to ensure consistent environments.
* **Jenkins:** To orchestrate the CI/CD pipeline, automating various stages.
* **Trivy:** For scanning the application's filesystem and the built Docker image for vulnerabilities.
* **SonarQube:** For performing static code analysis to identify bugs, security hotspots, and code smells.
* **HashiCorp Vault:** (Integration handled by Jenkins) For securely managing and retrieving sensitive credentials during the pipeline execution.

## Getting Started 

1.  **Clone this repository:**
    ```bash
    git clone https://github.com/RihabHaddad/DevSecOps-pipeline
    cd DevSecOps-pipeline
    ```

2.  **Develop your application:** Make changes to the code within the `src/` directory.

3.  **Ensure Dockerfile is up-to-date:** If you make significant changes to your application's dependencies or build process, update the `Dockerfile` accordingly.

4.  **Commit and push your changes:** These changes will trigger the Jenkins pipeline.

## CI/CD Pipeline Overview

The Jenkins pipeline defined in the `Jenkinsfile` performs the following stages:

1.  **Checkout Code:** Retrieves the latest source code from Git.
2.  **Prepare:** Sets up environment variables and determines the Docker image tag.
3.  **SonarQube Analysis:** Scans the code for quality and security issues.
4.  **Security Scan with Trivy (FS):** Scans the application's filesystem for vulnerabilities.
5.  **Build Docker Image:** Creates a Docker image of the application.
6.  **Scan Docker Image:** Scans the newly built Docker image for vulnerabilities.
7.  **Push Image to Docker Hub:** Pushes the validated Docker image to the specified Docker Hub repository.
8.  **GitOps Update:** Updates the `GitOps` repository with the new Docker image tag.
9.  **Sync ArgoCD:** Triggers ArgoCD to synchronize the Kubernetes cluster with the updated state in the `GitOps` repository.
