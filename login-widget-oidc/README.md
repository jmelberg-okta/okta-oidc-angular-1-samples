# AngularJS Okta Sign-In Widget 
Single-Page Web Application (SPA) sample using the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html) with social login.

### Configure the Sample Application
Update the `config.js` file with your organization url. For example, if your organization is *"acme.oktapreview.com"* simply replace *"example.oktapreview.com"* with *"acme.oktapreview.com"*. See [Example OIDC flow](http://developer.okta.com/docs/api/resources/okta_signin_widget.html#oidc-options) for more configuration options.
```javascript
angular
.module("WidgetConfig", [])
.constant("CONFIG", {
    options : {
        baseUrl: "https://example.oktapreview.com",
        clientId: "ViczvMucBWT14qg3lAM1",
        redirectUri: "http://localhost:8080",
        idps: [{
            type: "FACEBOOK",
            id: "0oa5kecjfwuF4HQ4w0h7"
        }],
        authScheme: "OAUTH2",
        authParams: {
            responseType: "id_token",
            responseMode: "okta_post_message",
            scope : [
                "openid",
                "email",
                "profile",
                "address",
                "phone"
            ]
        }
    }
});
```

### ID Token
Specified in the `config.js` file, the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html) returns an `id_token` using the [Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2). Detailed in the `id_token` are claims with decoded `id_token` information.

### Renew ID Token
Exchanges the current `id_token` for a new one

```javascript
$scope.renewIdToken = function() {
    widgetManager.renewIdToken(oldToken)
    .then(function(success) {
      // success.idToken
      // success.claims
    }, function(error) {
      // error
    });
  }
```

###Refresh Session
Updates the current session object using the [Sign-in Widget SDK](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

```javascript
$scope.refreshSession = function() {
    widgetManager.refreshSession()
    .then(function(success){
      // success
    }, function(err) {
      // error
    });
  }
```

###Close Session
Terminates the current session object

```javascript
$scope.closeSession = function() {
    widgetManager.closeSession()
    .then(function(success){
      // success
    }, function(err) {
      // error
    });
  }
```

###Log-Out
Terminates the current session with the organization.

```javascript
$scope.signout = function() {
    widgetManager.logoutWidget()
    .then(function(success) {
      // success
    }, function(err) {
      // error
    });
  };
```
