# Cumulus Suite Actions

> This GitHub organization and the Actions contained within are _experimental, alpha-stage automation_. Please do not use these Actions against real projects until they are formally released.

## Action Tiering Structure

These Actions are organized into three tiers of functionality. Your application may choose Actions that best suit the level of customization you wish to perform.

At the highest tier, your application can consume predefined workflows from `cumulusci-actions/standard-workflows`. These workflows offer easy onboarding and don't require any customization of the YAML to create a complete pipeline for a 1GP or 2GP project. The standard workflows include definitions of dependencies between jobs, ensuring that (for example) a Beta Test job runs after an Upload Beta job.

We recommend cloning the `cumulusci-actions/standard-workflows` repository into your org. This repository is a central control console for all of your applications using the shared workflows, making it easy to introduce (for example) new feature test-level jobs across all repos without individually updating those repos' configurations.

---

If you prefer to construct your own workflows, consume job-based Actions:

- `cumulusci/release-beta-1gp`
- `cumulusci/release-beta-2gp`
- `cumulusci/beta-test`
- `cumulusci/release-production-1gp`
- `cumulusci/release-production-2gp`
- `cumulusci/release-test`
- `cumulusci/build-unlocked-test-package`
- `cumulusci/build-feature-test-package`
- `cumulusci/feature-test`
- `cumulusci/feature-test-2gp`
- `cumulusci/feature-test-namespaced`
- `cumulusci/feature-test-robot`
- `cumulusci/feature-test-robot-2gp`

For examples of how to apply these actions, review the standard workflows. Each Action accepts version parameters (see Version Pinning). Each Action that creates a scratch org accepts the `dev-hub-auth-url` parameter (required) and the `org-name` parameter (defaulted). Each Action that interacts with a packaging org (1GP only) accepts the `packaging-org-auth-url` parameter. (TODO: clean up parameters)

---

All job-based Actions that create scratch orgs consume the `cumulusci/execute-flow-scratch` or `cumulusci/execute-robot-flow-scratch` base scratch org Actions. 

`cumulusci/execute-flow-scratch`

`cumulusci/execute-robot-flow-scratch` accepts the parameters `dev-hub-auth-url`, `org-name`, and `setup-flow`. The latter two options are required. The Action will create an org from the configuration `org-name` and execute `setup-flow` against it before running Robot Framework tests. It stores Robot results as an artifact.

---

Finally, we also provide a suite of primitive Actions that underlie the base scratch org Actions and all persistent-org Actions.

`cumulusci-actions/default-package-versions`

`cumulusci-actions/setup-cumulus`

`cumulusci-actions/authorize-org`

`cumulusci-actions/run-flow`

`cumulusci-actions/run-task`

## Version Pinning

All Actions that run CumulusCI operations accept two optional parameters, `cumulusci-version` and `sfdx-version`. If these inputs are supplied, the Actions will ensure that the specified versions of the tools are installed.

If the inputs are not populated, the Action will source a default version for each tool from `cumulusci-actions/default-package-versions@main`. Note that we do not pin a tag on `default-package-versions`: the default CumulusCI and SFDX versions may be changed without publishing a new Action tag, provided that the overall behavior of the Action is not altered. We use this flexibility to ensure that we pin stable versions, and reserve the right to roll back the default in case of unexpected regressions.

## Authorizing Orgs
