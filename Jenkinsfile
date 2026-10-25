pipeline {
  agent any
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Test API') { steps { sh 'npm test' } }
  }
}
