pipeline {
    agent { label 'jenkins-agent' }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling latest changes from GitHub...' // just a trial
                checkout scm
            }
        }
    }

    post {
        success {
            echo 'Successfully pulled latest changes!'
        }
        failure {
            echo 'Failed to pull changes!'
        }
    }
}

pipeline {
    agent { label 'jenkins-agent' }

        triggers {
        pollSCM('* * * * *')  // polls every minute
    }

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')  // set in Jenkins credentials
        CLIENT_IMAGE = 'muntaha69/todo-client'
        SERVER_IMAGE = 'muntaha69/todo-server'
    }

    stages {

        stage('Detect Changes') {
            steps {
                script {
                    // detect which folders changed
                    def changes = sh(
                        script: "git diff --name-only HEAD~1 HEAD",
                        returnStdout: true
                    ).trim()

                    env.BUILD_CLIENT = changes.contains('client/') ? 'true' : 'false'
                    env.BUILD_SERVER = changes.contains('server/') ? 'true' : 'false'

                    echo "Build client: ${env.BUILD_CLIENT}"
                    echo "Build server: ${env.BUILD_SERVER}"
                }
            }
        }

        stage('Test Client') {
            when {
                expression { env.BUILD_CLIENT == 'true' }
            }
            steps {
                dir('client') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false'   // runs and exits
                }
            }
        }

        stage('Test Server') {
            when {
                expression { env.BUILD_SERVER == 'true' }
            }
            steps {
                dir('server') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false'
                }
            }
        }

        stage('Get Next Version') {
            steps {
                script {
                    // get latest semver tag from dockerhub and bump patch version
                    if (env.BUILD_CLIENT == 'true') {
                        def latestClient = sh(
                            script: """
                                curl -s "https://hub.docker.com/v2/repositories/muntaha69/todo-client/tags/?page_size=100" \
                                | python3 -c "
import sys, json, re
tags = json.load(sys.stdin)['results']
versions = [t['name'] for t in tags if re.match(r'^\d+\.\d+\.\d+$', t['name'])]
versions.sort(key=lambda v: list(map(int, v.split('.'))))
print(versions[-1] if versions else '1.0.0')
"
                            """,
                            returnStdout: true
                        ).trim()

                        def parts = latestClient.tokenize('.')
                        env.CLIENT_NEW_TAG = "${parts[0]}.${parts[1]}.${parts[2].toInteger() + 1}"
                        echo "New client version: ${env.CLIENT_NEW_TAG}"
                    }

                    if (env.BUILD_SERVER == 'true') {
                        def latestServer = sh(
                            script: """
                                curl -s "https://hub.docker.com/v2/repositories/muntaha69/todo-server/tags/?page_size=100" \
                                | python3 -c "
import sys, json, re
tags = json.load(sys.stdin)['results']
versions = [t['name'] for t in tags if re.match(r'^\d+\.\d+\.\d+$', t['name'])]
versions.sort(key=lambda v: list(map(int, v.split('.'))))
print(versions[-1] if versions else '1.0.0')
"
                            """,
                            returnStdout: true
                        ).trim()

                        def parts = latestServer.tokenize('.')
                        env.SERVER_NEW_TAG = "${parts[0]}.${parts[1]}.${parts[2].toInteger() + 1}"
                        echo "New server version: ${env.SERVER_NEW_TAG}"
                    }
                }
            }
        }

        stage('Build & Push Client') {
            when {
                expression { env.BUILD_CLIENT == 'true' }
            }
            steps {
                dir('client') {
                    sh """
                        echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                        docker build -t ${CLIENT_IMAGE}:${env.CLIENT_NEW_TAG} .
                        docker push ${CLIENT_IMAGE}:${env.CLIENT_NEW_TAG}
                    """
                }
            }
        }

        stage('Build & Push Server') {
            when {
                expression { env.BUILD_SERVER == 'true' }
            }
            steps {
                dir('server') {
                    sh """
                        echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                        docker build -t ${SERVER_IMAGE}:${env.SERVER_NEW_TAG} .
                        docker push ${SERVER_IMAGE}:${env.SERVER_NEW_TAG}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline succeeded! ArgoCD image updater will pick up new tags."
        }
        failure {
            echo "❌ Pipeline failed! No images were pushed."
        }
    }
}
```

---

## Step 3 — Jenkins Credentials Setup

In Jenkins UI → **Manage Jenkins → Credentials → Add:**

| ID | Type | Value |
|---|---|---|
| `dockerhub-creds` | Username/Password | DockerHub username + password |

---

## Step 4 — Create Jenkins Pipeline Job

1. Jenkins UI → **New Item → Pipeline**
2. Set **Pipeline script from SCM**
3. Point to your GitHub repo
4. Script path: `Jenkinsfile`
5. Add GitHub webhook trigger

---

## Step 5 — GitHub Webhook

In your GitHub repo → **Settings → Webhooks → Add webhook:**
```
Payload URL: http://<jenkins-ip>:8081/github-webhook/
Content type: application/json
Events: Just the push event
```

---

## Full Flow After Setup
```
You push code to GitHub
        ↓
GitHub webhook triggers Jenkins
        ↓
Jenkins checks what changed
        ↓
Only changed service gets tested → built → pushed
        ↓
ArgoCD image updater detects new semver tag
        ↓
Updates kustomization.yaml in GitHub
        ↓
ArgoCD syncs → new pod deployed ✅
```

---

## Updated Cheat Sheet Addition

Add after step 8 (push images):
```
8.5 Setup Jenkins
  - Install Jenkins via Docker
  - Add DockerHub credentials
  - Create pipeline job pointing to repo
  - Add Jenkinsfile to repo root
  - Add GitHub webhook