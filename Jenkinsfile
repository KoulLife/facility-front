node {
    stage('Clone repository') {
        git branch: 'main', credentialsId: 'github_access_token', url: 'https://github.com/KoulLife/facility-front.git'
    }

    stage('Build image') {
       dockerImage = docker.build("dcplife/facility_front:v1.0")
    }

    stage('Push image') {
        withDockerRegistry([ credentialsId: "docker-access", url: "" ]) {
        dockerImage.push()
        }
    }
}
