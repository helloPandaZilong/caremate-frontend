pipeline {
    agent any

    // ── Jenkins Credentials에 미리 등록해야 할 항목 ─────────────────────────
    // ID: dockerhub-creds  → Kind: Username with password (DockerHub ID/PW)
    // ID: github-pat       → Kind: Username with password (GitHub ID / PAT)
    // ─────────────────────────────────────────────────────────────────────────

    environment {
        DOCKERHUB_ID = 'pagnit'                          // DockerHub 아이디
        IMAGE_FE     = "${DOCKERHUB_ID}/caremate-fe"
        IMAGE_TAG    = "${BUILD_NUMBER}"
    }

    stages {

        // 1. 소스 체크아웃
        stage('Git Checkout') {
            steps {
                git credentialsId: 'github-pat',
                    url: 'https://github.com/likelion-caremate/caremate-frontend.git',
                    branch: 'develop'
            }
        }

        // 2. npm 빌드
        stage('npm Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        // 3. Docker 이미지 빌드
        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_FE}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_FE}:${IMAGE_TAG} ${IMAGE_FE}:latest"
            }
        }

        // 4. DockerHub 푸시
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${IMAGE_FE}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_FE}:latest"
                }
            }
        }

        // 5. Kubernetes 배포
        stage('Deploy to K8s') {
            steps {
                sh "kubectl set image deployment/caremate-fe caremate-fe=${IMAGE_FE}:${IMAGE_TAG} -n caremate"
                sh "kubectl rollout status deployment/caremate-fe -n caremate --timeout=120s"
            }
        }
    }

    post {
        success {
            echo "✅ FE 배포 성공 — ${IMAGE_FE}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ 파이프라인 실패 — 빌드 로그를 확인하세요"
            sh "kubectl rollout undo deployment/caremate-fe -n caremate || true"
        }
        always {
            sh "docker rmi ${IMAGE_FE}:${IMAGE_TAG} || true"
        }
    }
}
