# Okta's Sign-In Widget and AuthJS SDK with AngularJS
Implementation of Okta's Sign-In Widget and AuthJS using AngularJS 1

###Samples Provided
- [Simple Login Experience Using Okta](https://github.com/jmelberg/okta-widget-angular/tree/master/login-widget)
- [Custom Branded Login Experience](https://github.com/jmelberg/okta-widget-angular/tree/master/login-widget-custom-branded)
- [OpenID Connect / Social Login](https://github.com/jmelberg/okta-widget-angular/tree/master/login-widget-oidc)
- [Custom Login w/ AccessToken]((https://github.com/jmelberg/okta-widget-angular/tree/master/custom-login)

## Running the Sample with your Okta Organization
###Pre-requisites
This sample application was tested with an Okta organization. If you do not have an Okta organization, you can easily [sign up for a free Developer Okta org](https://www.okta.com/developer/signup/).

1. Verify OpenID Connect is enabled for your Okta organization. `Admin -> Applications -> Add Application -> Create New App -> OpenID Connect`
  - If you do not see this option, email [developers@okta.com](mailto:developers@okta.com) to enable it.
2. In the **Create A New Application Integration** screen, click the **Platform** dropdown and select **Single Page App (SPA)**
3. Press **Create**. When the page appears, enter an **Application Name**. Press **Next**.
4. Add **http://localhost:8080** to the list of *Redirect URIs*
5. Click **Finish** to redirect back to the *General Settings* of your application.
6. Copy the **Client ID**, as it will be needed for the Okta AuthSDK client configuration.
7. Enable [CORS access](http://developer.okta.com/docs/api/getting_started/enabling_cors.html) to your Okta organization
8. Finally, select the **People** tab and **Assign to People** in your organization.

## Build Instructions
Once the project is cloned, install [node.js](https://nodejs.org/en/download/) on your machine. Using [npm](https://nodejs.org/en/download/) install [http-server](https://www.npmjs.com/package/http-server).

    $ npm install http-server -g
    

**Usage:** `$ http-server [path] [options]`

Start the web server with `http-server`
    $ http-server [path] [options]
    
`[path]`is the directory of the sample (e.g. `$ http-server path/to/login-widget/`)

**[Navigate](http://localhost:8080/)** to `http://localhost:8080/` to sign in.
