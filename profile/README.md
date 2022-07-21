# Cumulus Suite Actions

> This GitHub organization and the Actions contained within are _experimental, alpha-stage automation_. Please do not use these Actions against real projects until they are formally released.

## Action Tiering Structure

These Actions are organized into three tiers of functionality. Your application may choose Actions that best suit the level of customization you wish to perform.

### Predefined Workflows

At the highest tier of abstraction, your application can consume predefined workflows from `cumulus-actions/standard-workflows`. These workflows offer easy onboarding and don't require any customization of the YAML to create a complete pipeline for a 1GP or 2GP project. The standard workflows include definitions of dependencies between jobs, ensuring that (for example) a Beta Test job runs after an Upload Beta job.

We recommend cloning the `cumulus-actions/standard-workflows` repository and pushing it into your org. (Do not fork the repository; GitHub Actions currently does not consume reusable workflows from a fork). This repository is a central control console for all of your applications using the shared workflows, making it easy to introduce (for example) new feature test-level jobs across all repos without individually updating those repos' configurations. We reserve the right to change `cumulus-actions/standard-workflows` at any time without notice and without tagging a new version to support this control-console use case; this is the reason we encourage cloning the repository to support your own standard workflow usage.

We provide the following standard workflows:

- `beta-1gp`, expected to run on the main branch, executes Release Beta (1GP) followed by Beta Test.
- `production-1gp`, expected to run on the main branch, executes Release Production (1GP) followed by Release Test.
- `feature-2gp`, expected to run on `feature/**` branches, executes Feature Test, Feature Test - Robot, Build Feature Test Package, Feature Test - 2GP, and Feature Test - Robot 2GP.
- `feature-namespaced`, expected to run on `feature/**` branches, executes Feature Test and Feature Test - Namespaced.

To consume a standard workflow, create a file in your repository under `.github/workflows`. Name the file `<workflow name>.yml`, using your preferred workflow name. Populate the file like this, for a `feature-2gp` use case:

```
name: Feature Test
on:
  push:
    branches:
      - feature/**
      - main
jobs:
  feature-test:
    name: "Feature Test"
    # Replace this URL with your forked repo.
    uses: cumulus-actions/standard-workflows/.github/workflows/feature-2gp.yml@main
    secrets:
      dev-hub-auth-url: '${{ secrets.DEV_HUB_AUTH_URL }}'
```

Tailor the triggers to the specific needs of your project, and make sure that the named secret matches the secret you created to store your Dev Hub auth URL.

You can choose whether or not to pin to a version tag in your cloned `standard-workflows` repo. In many use cases, it makes the most sense _not_ to do so, as this allows you to use your `standard-workflows` repo as a central control console to instantly update workflow definitions across repos.

### Job-Based Actions

If you prefer to construct your own workflows, consume job-based Actions:

- `cumulus-actions/release-beta-1gp`
- `cumulus-actions/release-beta-2gp`
- `cumulus-actions/beta-test`
- `cumulus-actions/release-production-1gp`
- `cumulus-actions/release-production-2gp`
- `cumulus-actions/release-test`
- `cumulus-actions/build-unlocked-test-package`
- `cumulus-actions/build-feature-test-package`
- `cumulus-actions/feature-test`
- `cumulus-actions/feature-test-2gp`
- `cumulus-actions/feature-test-namespaced`
- `cumulus-actions/feature-test-robot`
- `cumulus-actions/feature-test-robot-2gp`

For examples of how to apply these actions, review the standard workflows. Each Action accepts version parameters (see Version Pinning). Each Action that creates a scratch org accepts the `dev-hub-auth-url` parameter (required) and the `org-name` parameter (defaulted). Each Action that interacts with a packaging org (1GP only) accepts the `packaging-org-auth-url` parameter.

### Scratch Org Base Actions

All job-based Actions that create scratch orgs consume the `cumulus-actions/run-flow-scratch` or `cumulus-actions/run-robot-flow-scratch` base scratch org Actions. 

`cumulus-actions/run-flow-scratch` creates a scratch org on a given configuration (`org-name`), runs a given flow (`flow-name`) on that org, and then disposes the org. Optionally, it extracts information from the job log that matches a regex (`commit-status-regex`) and stores that information as the description on a new commit status (`commit-status-name`), prefixed by `commit-status-description-prefix`. This optional feature is used to support jobs that create per-commit package versions. The action also accepts version-pinning options (see Tool Version Pinning).

`cumulus-actions/run-robot-flow-scratch` accepts the parameters `dev-hub-auth-url`, `org-name`, and `setup-flow`. The latter two options are required. The Action will create an org from the configuration `org-name` and execute `setup-flow` against it before running Robot Framework tests. It stores Robot results as an artifact. The action also accepts version-pinning options (see Tool Version Pinning).

### Primitive Actions

Finally, we also provide a suite of primitive Actions that underlie the base scratch org Actions and all persistent-org Actions.

`cumulus-actions/default-package-versions` accepts as input user-supplied `cumulusci-version` and `sfdx-version` values. If these values are non-empty, they are returned; otherwise, default values are returned. The outputs have the same names as the inputs.

`cumulus-actions/setup-cumulus` installs CumulusCI and SFDX. It accepts optional `cumulusci-version` and `sfdx-version` inputs and uses `cumulus-actions/default-package-versions@main` to populate them if not supplied (see below under Tool Version Pinning).

`cumulus-actions/authorize-org` accepts an `auth-url` and `org-name`, and ingests that org authorization into the SFDX and CumulusCI keychains. If the optional `dev-hub` input is set to `true`, it assigns this org as the default Dev Hub.

`cumulus-actions/run-flow` executes a given flow (`flow-name`) against a given org (`org-name`). The org must be available in the keychain, or be a scratch org configuration, and CumulusCI and SFDX must already be set up.

`cumulus-actions/run-task` executes a given task (`task-name`) against a given org (`org-name`). The org must be available in the keychain, or be a scratch org configuration, and CumulusCI and SFDX must already be set up.

## Tool Version Pinning

All non-primitive Actions that run Cumulus operations accept two optional parameters, `cumulusci-version` and `sfdx-version`. If these inputs are supplied, the Actions will ensure that the specified versions of the tools are installed.

If the inputs are not populated, the Action will source a default version for each tool from `cumulusci-actions/default-package-versions@main`. Note that we do not pin a tag on `default-package-versions`: the default CumulusCI and SFDX versions may be changed without publishing a new Action tag, provided that the overall behavior of the Action is not altered. We use this flexibility to ensure that we pin stable versions, and reserve the right to roll back the default in case of unexpected regressions.

The Cumulus Suite Actions **require CumulusCI 3.61.1 or greater** for any operation that references a packaging org.

## Environment Setup and Org Authorization

All Actions that interact with persistent orgs authorize those orgs using SFDX Auth URLs. These URLs are obtained via by first authorizing an org to the CLI:

`sfdx auth:web:login -a packaging`

and then retrieving the auth URL from the JSON output of the command

`sfdx force:org:display --json --verbose` 

under the key `sfdxAuthUrl` under `result`. 

If you have `jq` installed, you can do `sfdx force:org:display -u packaging-gh --json --verbose | jq -r .result.sfdxAuthUrl`.

This auth URL should be stored in GitHub Secrets. As shown in the standard workflows, we recommend creating a GitHub Environment called `packaging` and adding the auth URL as a secret under that environment. You can then configure required approvers for the environment, as well as branch limitations, to ensure that rogue Actions cannot disclose this sensitive credential.

Auth URLs are provided to Actions in the inputs `dev-hub-auth-url` and `packaging-org-auth-url`. Internally, every Action uses the `cumulus-actions/authorize-org` primitive Action, which ingests the auth URL into the SFDX keychain and imports it into CumulusCI.

If you'd like 1GP beta builds to run automatically on commits to `main`, without individual approval, but require approvals on production releases, you can set up two environments: `packaging` and `packaging-prod`. Configure required approvers on `packaging-prod`, but not on `packaging`, and set the auth URL secret for your packaging org on both environments. Ensure that `packaging` is configured to build only on commits to `main`, and that you're using branch protection to require review before merge to `main`, to guard against disclosure of the secret.

For 2GP, you may wish to use two different integration users against your Dev Hub: one with a Limited Access license permissioned to only be able to create scratch orgs, which is safe to use in any build, and a separate user permissioned to execute package uploads. You can secure the auth URL for the latter using environment configuration.

## Concurrency Protection

All Actions other than package uploads are safe to run in parallel, because they run against independent scratch orgs. Package uploads, however, are generally serialized (other than per-commit test package versions). 

In GitHub Actions, concurrency protection takes place at the level of the workflow, not the individual Action. We recommend following the pattern shown in `cumulusci/standard-workflows` by ensuring that package-upload Actions are run in a job with the key `concurrency` set to `packaging`. This ensures that GitHub Actions serializes execution of jobs against the packaging org. Note that this concurrency setup is independent of your decisions around environment setup (described above).
