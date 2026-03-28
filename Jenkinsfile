pipeline {
    agent { label 'jenkins-agent' }

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-creds')
    }

    stages {

        stage('Test with Docker Compose') {
            steps {
                script {
                    try {
                        // build and start containers
                        sh 'docker-compose up -d --build'

                        // wait a few seconds for containers to stabilize
                        sleep(10)

                        // check if all containers are running (no exited/error state)
                        def result = sh(
                            script: "docker-compose ps --status exited | grep -c 'exited' || true",
                            returnStdout: true
                        ).trim()

                        if (result != '0') {
                            error("One or more containers exited with error!")
                        }

                        echo "✅ All containers running fine!"

                    } finally {
                        // always bring down containers whether pass or fail
                        sh 'docker-compose down'
                    }
                }
            }
        }

        stage('Read Config') {
            steps {
                script {
                    def config = new groovy.json.JsonSlurper().parseText(
                readFile('build-config.json')
            )

                    env.CLIENT_TAG = config.client.tag
                    env.SERVER_TAG = config.server.tag
                    env.BUILD_CLIENT = config.client.build.toString()
                    env.BUILD_SERVER = config.server.build.toString()

                    echo "Client tag: ${env.CLIENT_TAG} | build: ${env.BUILD_CLIENT}"
                    echo "Server tag: ${env.SERVER_TAG} | build: ${env.BUILD_SERVER}"
                }
            }
        }

        stage('Build & Push Client') {
            when { expression { env.BUILD_CLIENT == 'true' } }
            steps {
                sh """
                    echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                    docker build -t muntaha69/todo-client:${env.CLIENT_TAG} ./client
                    docker push muntaha69/todo-client:${env.CLIENT_TAG}
                """
            }
        }

        stage('Build & Push Server') {
            when { expression { env.BUILD_SERVER == 'true' } }
            steps {
                sh """
                    echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin
                    docker build -t muntaha69/todo-server:${env.SERVER_TAG} ./server
                    docker push muntaha69/todo-server:${env.SERVER_TAG}
                """
            }
        }
    }
}