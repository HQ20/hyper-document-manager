# document-manager (hyperledger)
This is the hyperledger code.

### Requirements
* node < 9
* npm 6.4+ or yarn 1.2+

We recomend yarn as it's faster, securer and works offline. And obviously because we provide a *yarn.lock* file.

## Folder structure

* lib
    * the logic code
* models
    * the models defining the business model
* scipts
    * script to deploy

## Development
**Don't forget that** it's necessary have a hyperledger fabric peer running. See more [here](https://hyperledger.github.io/composer/latest/installing/development-tools.html).
```
$ yarn
$ npm run deploy
$ npm run start
```
