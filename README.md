# AngularJS Okta Sign-In Widget 
Single-Page Web Application (SPA) sample using the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

### Configure the Sample Application
Update the **baseUrl**, **clientId**, **redirectUri**, and **scopes** preceeding `login-widget-oidc` in your `login-widget-oidc/app.js` file:
```javascript
app.run(function(widgetManager){
  // Configuration for App
  widget = widgetManager.initWidget(
    {
      baseUrl: "https://example.oktapreview.com",
        clientId: "ViczvMucBWT14qg3lAM1",
        redirectUri: "http://localhost:8080",
        scheme: "OAUTH2",
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
  );
});
```

### ID Token
Configured into the `oktaSignIn` object is the `responseType: 'id_token'`. Using [Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2), an `idToken` is returned when authenticated

### Renew ID Token
Exchanges the current `id_token` for a new one

```javascript
$scope.renewIdToken = function() {
    var response = widgetManager.renewIdToken(oldToken);
    response.then(function(result) {
      // result.idToken
      // result.claims
    }, function(error) {
      // error
    });
  }
```

###Refresh Session
Updates the current session object using the [Sign-in Widget SDK](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

```javascript
$scope.refreshSession = function() {
    var response = widgetManager.refreshSession();
    response.then(function(result){
      // result
    }, function(err) {
      // Error
    });
  }
```

###Close Session
Terminates the current session object

```javascript
$scope.closeSession = function() {
    var response = widgetManager.closeSession();
    response.then(function(result){
      // result
    }, function(err) {
      // error
    });
  }
```
