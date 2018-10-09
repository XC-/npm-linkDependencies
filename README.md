# npm-linkDependencies
[![Build Status](https://travis-ci.com/XC-/npm-linkDependencies.svg?branch=master)](https://travis-ci.com/XC-/npm-linkDependencies)
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

```
{
  "installPeerDependencies": false,
  "dependencies": [...list of package names] or { object with relative paths }
}
```
