# NoteAffect Web Client

## Overview

A TypeScript/React/Redux/SASS application for use in browsers that drives the main SPA for users of the platform.

## Requirements

The project requires a specific version of Node (8.10) via [NVM](https://github.com/nvm-sh/nvm).
After cloning down the project, There should be an .nvmrc file in this project, which specifies version 8.10. Ensure you have Node 8.10 via NVM with the command `nvm install 8.10`.

Use the command `nvm use` to read contents of that file, or directly use `nvm use 8.10`. Confirm using Node 8.10 with `node -v`.
** NOTE ** in each terminal, you must run the `nvm use` command to ensure using Node version 8.10.=

## Commands

- Unit tests: run tests with `yarn test`
- Build the CSS and minified application with `yarn build`
- Build the CSS and unminified application with `yarn build:dev`
- Build the CSS and local-use application with `yarn build:local`
- Run in watch mode for local-use dev builds with `yarn watch`

## Setup

\*\* [web-client](https://gitlab.com/noteaffect/web-client) Repo

- In this repo's local code, build the application in local mode: `yarn build:local`
- Start yarn watching with `yarn watch`

\*\* [web-server](https://gitlab.com/noteaffect/web-server) Repo

- Go through all install steps in that repo, namely installing the correct version of .NET 2.2.
- Note you will need [Docker Desktop](https://www.docker.com/products/docker-desktop) and postgres `docker pull postgress 11.3`
  -- `docker run -d --name postgres -p 5432:5432 postgres 11.3`
  -- ensure NoteAffect db is running with `docker exec -it postgres psql -U postgres -w -d noteaffect -c '\dt'` (you should see a List of relations schema in the console output)
  -- You can check if postgres is running with `docker ps`, start it up with `docker start postgres`, and stop it with `docker stop postgres`.
- From your local [web-server](https://gitlab.com/noteaffect/web-server), symlink to this repository's `server_dev` directory:

```bash
cd NoteAffect.WebServer/wwwroot
ln -s ../../../web-client/server_dev dev
```

- In your local [web-server](https://gitlab.com/noteaffect/web-server), copy NoteAffect.WebServer/appsettings.Development.json to a new file NoteAffect.WebServer/appsettings.Local.json
- Update appsettings.Local.json's `Install:Local` value to `true`.

- Run your web-server repository, and it'll use the HTML, JS, and CSS files from this repository's `server_dev` folder.
- Run the ASPNET server with `ASPNETCORE_ENVIRONMENT=Local dotnet run`
- Run a watch task for your local builds with `yarn watch`

### Normal Spin-up

\*\* [web-client](https://gitlab.com/noteaffect/web-client) Repo

- In this repo's local code, build the application in local mode: `yarn build:local`
- Start yarn watching with `yarn watch`

- NOTE \* if hot reloading isn't triggering, you can run a manual build of the local with `yarn build:local`, which is served up from `server_dev`.

- #### NEW - Mock Security Server

  This is the current mock implementation of communication with the Security App.

- Open a new terminal and cd into mockSecurityServer folder
- `npm install`
- `npm start`

\*\* [web-server](https://gitlab.com/noteaffect/web-server) Repo

- cd into NoteAffect.WebServer and run the ASPNET server with `ASPNETCORE_ENVIRONMENT=Local dotnet run`

### Builds

#### Local Builds

This application is served up via the backend (as mentioned in the above section).
The development server serves the contents of `server_dev`.
To create a new local version, run `nvm use` to ensure you're running Node 8.10.0 and then `yarn build:local`.
This will create new non-minified assets in the `server_dev` folder.

#### Prod Builds

To test builds, run `nvm use` and then `yarn build`.
This creates minified assets in the `dist` folder.
When pushing up feature branches to GitLab, only the build step will be tested to ensure there are no errors in the build.
Only certain specified branches in `.gitlab-ci.yml` will be deployed to AWS on pushes and merges to GitLab:

```yml
only:
  - master
  - staging
  - develop
  - ops-test
  - demo
  - tags
```

## Ed-Corp Versioning and Internationalization

Versioning of the text can be done with using format.js and react-intl, which are internationalization libraries to provide multilingual support.
Not all ed vs. corp changes will take this approach, as some features will be version-specific, but this approach wil allow for getting much of this work done. This approach also opens up easier implementation of language translations that can largely feed into the application.

The current application largely has each of the text strings passed in through a class Localizer. The original implementation did not have any functionality hooked up for getting a certain versions text. The project’s current implementation utilizes this service.

### Edu-Only Previous Implementation:

```jsx
// Localizer.js
class Localizer {
  public static get(str: string ) {
    return str;
  }
}
…
// some component
<p>{Localizer.get(‘original text’)}</p> // Outputs: <p>original text</p>
```

### Edu and Corp Implementation

Version Files

- There are `version/corpLanguage.js` and `version/edLanguage.js` files that contain key value pairs of strings in addition to language keys.
- For now, only the `en` version is defined. This can be expanded if other language versions are needed
- keys in the format `’myComponent.section’: ’String’`

```js
...
const edVersionLanguage = {
  en: {
    'coursesComponent.title': 'Your Courses', ...
  },
};
```

#### Determining Version

- The backend web-server passes `window.appEnvironment.lexicon` string that is either `edu` or `corp`.
- The VersionService instantiates before the app, and reads off off the window object.
- This version flag is also pulled into the Redux store and can be read through connected components for lexicon version features.
- The web-client consumes this in the VersionService class, creates a format.js language cache based on the edLanguage.js and corpLanguage.js files
- This service feeds in to the Localizer to allow for calling of format.js formatting methods

#### Formatting Service with Localizer

```jsx
class Localizer {
  public static getFormatted(id:string, defaultMessage?: string) { … }
  public static get() // still in code to allow large implementation effort
}
```

#### Usage in Component

```jsx
<h1>{ Localizer.getFormatted( ‘myComponent.title’, ‘Default Title’ ) }</h1>
```
