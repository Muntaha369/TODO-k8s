pipeline {
    agent { label 'jenkins-agent' }

    triggers {
        pollSCM('* * * * *')  // polls every minute
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling latest changes from GitHub...'
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