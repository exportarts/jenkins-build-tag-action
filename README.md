# jenkins-build-tag-action

A GitHub Action to trigger a tag-based build in Jenkins.

You can find a description of all input parameters in [`action.yml`](./action.yml).

## Example Usage

```yml
name: Build latest release

on:
  push:
    tags:
      - '*'

jobs:
  trigger-build:
    runs-on: ubuntu-latest
    steps:
    - name: Trigger Tag Build
      uses: exportarts/jenkins-build-tag-action@1.0.2
      with:
        jenkins_host: https://my.jenkins.io
        jenkins_basic_auth_token: ${{secrets.JENKINS_BASIC_AUTH_TOKEN}}
        jenkins_job: my-job
```

## Debugging

If the action fails and you want to debug the cause, you can set a secret `ACTIONS_STEP_DEBUG=true`.
More information can be found [here](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md).
If you think the issue is related to this action, please open an issue!
