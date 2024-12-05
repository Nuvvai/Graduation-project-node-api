const Jenkins = require('jenkins');
const jenkins = new Jenkins({
    baseUrl: "http://menna:menna@localhost:8080",
    crumbIssuer: true
});
module.exports = jenkins;