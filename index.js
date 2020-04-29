const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

const wait = function (seconds) {
    return new Promise((resolve, reject) => {
        if (typeof (seconds) !== 'number') {
            throw new Error('seconds not a number');
        }

        setTimeout(() => resolve(), seconds * 1000)
    });
}

async function run() {
    try {
        const tag = github.context.ref.replace('refs/tags/', '');
        const jenkinsHost = core.getInput('jenkins_host');
        const jenkinsBasicAuthToken = core.getInput('jenkins_basic_auth_token');
        const jenkinsJob = core.getInput('jenkins_job');
        const sleepDuration = core.getInput('sleep_duration');
        
        core.info(`Waiting ${sleepDuration} seconds ...`);
        await wait(parseInt(sleepDuration));

        core.info(`Getting CSRF Token to interact with Jenkins...`);
        const { crumb, crumbRequestField } = await axios.get(`${jenkinsHost}/crumbIssuer/api/json`, {
            headers: {
                Authorization: `Basic ${jenkinsBasicAuthToken}`
            },
            withCredentials: true,
            jar: cookieJar
        });

        core.info(`Triggering the job`);
        await axios.post(`${jenkinsHost}/job/${jenkinsJob}/view/tags/job/${tag}/build?build?delay=0sec`, {
            headers: {
                Authorization: `Basic ${jenkinsBasicAuthToken}`,
                [crumbRequestField]: crumb
            },
            withCredentials: true,
            jar: cookieJar
        });

        core.info(`Done!`);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
