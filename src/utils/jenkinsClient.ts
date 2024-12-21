import Jenkins from 'jenkins';

const jenkins = new Jenkins({
    baseUrl: "http://menna:menna@localhost:8080",
    crumbIssuer: true
});

export default jenkins;
