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
      uses: exportarts/jenkins-build-tag-action@1.0.0
      with:
        jenkins_host: https://my.jenkins.io
        jenkins_basic_auth_token: ${{secrets.JENKINS_BASIC_AUTH_TOKEN}}
        jenkins_job: my-job
```
