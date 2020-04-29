const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const https = require('https');

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

        const instance = axios.create({
            jar: cookieJar,
            withCredentials: true,
            httpsAgent: new https.Agent({ rejectUnauthorized: false, requestCert: true, keepAlive: true })
        });

        core.info(`Getting CSRF Token to interact with Jenkins...`);
        const csrfResult = await instance.get(`${jenkinsHost}/crumbIssuer/api/json`, {
            headers: {
                Authorization: `Basic ${jenkinsBasicAuthToken}`
            }
        });
        const { crumb, crumbRequestField } = csrfResult.data;

        core.info(`Triggering the job`);
        await instance.post(`${jenkinsHost}/job/${jenkinsJob}/view/tags/job/${tag}/build?build?delay=0sec`, {
            headers: {
                Authorization: `Basic ${jenkinsBasicAuthToken}`,
                [crumbRequestField]: crumb
            }
        });

        core.info(`Done!`);
    } catch (error) {
        core.setFailed(error.message);
        core.debug(`The following values may help you debugging.`);
        core.debug(`tag: ${tag}`);
        core.debug(`jenkins_host: ${jenkinsHost}`);
        core.debug(`jenkins_basic_auth_token: ${jenkinsBasicAuthToken}`);
        core.debug(`jenkins_job: ${jenkinsJob}`);
        core.debug(`sleep_duration: ${sleepDuration}`);
        core.debug(`crumb: ${crumb}`);
        core.debug(`crumbRequestField: ${crumbRequestField}`);
        core.error(JSON.stringify(error))
    }
}

run();
