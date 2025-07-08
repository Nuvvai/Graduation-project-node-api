import Jenkins from 'jenkins';

const jenkins = new Jenkins({
    baseUrl: process.env.JENKINS_URL || 'http://menna:menna@localhost:8080',
    crumbIssuer: false
});

export default jenkins;
