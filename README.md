# npm-linkDependencies

| Branch | build status |
| :----: | :----------: |
| Master | [![Build Status](https://travis-ci.com/XC-/npm-linkDependencies.svg?branch=master)](https://travis-ci.com/XC-/npm-linkDependencies) |
| Development | [![Build Status](https://travis-ci.com/XC-/npm-linkDependencies.svg?branch=development)](https://travis-ci.com/XC-/npm-linkDependencies) |


## Why

In some projects, there are multiple npm packages developed simultaneously and are dependant on each other. The problem is
how to develop and test these. Some options are:
* Linking the packages manually, npm link must be done after each `npm install`
  * post install script can be written
    * but how about production?
    * and if there are many dependencies the script may be long
      * Script could be a bash or node script
* Custom script to do the linking
* `npm package` and then install from local
  * What about production environment?
  
The best option would be that the information on which packages need to be linked would not leave the package space (not 
even with monorepo) to keep the information in proper context and in one place. Whatever the solution is, it should also
take the production deployment/environment into account and use published packages there.


## What

What does it do (or when I'm writing this: what will it do) then?
This module adds support for a new field in `package.json`: linkDependencies. This field is an subobject which works as
a configuration for npm-linkDependencies package. With it the developer can list what packages must linked and takes care
of rollback if the linking fails. It checks whether the packages are already installed and skips those. Since some 
dependencies can be peerDependencies, it also can install those before doing the linking. This way the package developer
can safely use npm-linkDepencies as post install step without breaking things in deployment/production, removes the
need for external tools and information and with post install removes an extra step after `npm install`.
By defining the `dependencies` as an object where key is the package name and value the relative path to it, the 
script also takes care of running `npm link` in the package to be linked.


### linkDependencies

**package.json**:
```
{
  "name": "example-package",
  ...snip...
  "linkDependencies": {
    "installPeerDependencies": false,
    "createLink": false,
    "fallbackToInstall: false,
    "autoOverrideLink": false,
    "environmentKey": "ENVIRONMENT",
    "skipInEnvironments": [
        ...list of environments...
    ]
    "dependencies": [...list of package names] or { object with relative paths }
  }
  ...snip...
}
```

#### Settings
* **autoOverrideLink**: If `createLink` set to `true`, the script will attempt to create a symbolic link to global packages. If the symlink already
                        exists in global node modules, then this property is checked whether it should be overwritten automatically. At the moment
                        when `autoOverrideLink` is set to `false`, the link will not be overwritten/recreated. In the future this will be changed so that
                        user interaction will be required if set to `false`: (**default**: *false*)
* **createLink**: Before linking the dependencies, create an initial link to this package. (**default**: *false*)
* **dependencies**: List of dependencies to be linked. Requires that `npm link` has been done for the package first and that the it is not installed
                    globally from the public registry, but is a symbolic link. If `fallbackToInstall` is set to `true`, then object format should
                    be used where the key is the link name and value is the fallback package with possible version. For example, if the dependencies
                    are `{ "mylocalpkg": "lodash" }`, the script first checks if it can run `npm link mylocalpkg` and if not, then it runs
                    `npm install --no-save lodash` as a fallback option.
* **environmentKey**: The environmental variable that will be used to determine in which environment the script is run. (**default**: *ENVIRONMENT*)
* **fallbackToInstall**: If the link target does not exists in global packages, or it exists but it is not a symbolic link, fall back to npm install.
                         This option is used only if dependencies are defined as an object. (**default**: *false*)
* **installPeerDependencies**: Enabling this flag will install peer dependencies first before linking the packages to the project. (**default**: *false*) *NOT YET IMPLEMENTED*
* **skipInEnvironments**: List of string containing the environments in which the script execution should be skipped. The environment will be determined
                          using the value in the environmental variable defined by `environmentKey`. (**default**: *empty*) 
#### Full example

```
{
  "name": "example-package",
  "version": "0.0.1",
  "description": "example-package",
  "main": " ",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Tomi Teekkari",
  "license": "MIT",
  "linkDependencies": {
    "fallbackToInstall": true,
    "createLink": true,
    "installPeerDependencies": true,
    "autoOverrideLink": true,
    "environmentKey": "MY_ENV",
    "skipInEnvironments": [
        "STAGING", "PRODUCTION", "TESTING"
    ]
    "dependencies": {
      "my-first-dependency": "my-first-dependency@1.2.3",
      "my-second-dependency": "my-second-dependency"
    }
  },
  "dependencies": {
    "lodash": "4.12.3"
  },
  "devDependencies": {
    "jasmine": "*"
  }
}
```

### NodeJS and OS support

npm-linkDependencies has been tested to work with NodeJS 6.x to 10.x in Linux and OSX environments using Travis CI.
It has also been tested on Windows 10 (in Powershell and Git Bash) and the tests pass. However, Windows testing has
not been automated. Travis CI now has windows platform support (released ~2018-10-11), but the tests do not run
there properly and time out.

### Tests

#### Disclaimer
<aside class="warning">
Because the tests make changes to the node environment, run them at your own risk! The developer will not take any responsibility
of problems or errors you cause to your system by running the tests. You have been warned!
</aside>

#### Running the tests

The tests are end-to-end tests that use dummy packages and are currently executed in the default environment. This means that
new links will be created and at the end of the tests the links will be removed with `npm rm --global <pkg>`.

Tests can be executed with `npm test` after `npm install` and use default Jasmine BDD test framework.