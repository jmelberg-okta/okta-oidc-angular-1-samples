# AngularJS Okta Sign-In Widget 
Single-Page Web Application (SPA) sample using the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html) with custom organization branding.

### Configure the Sample Application
Update the `config.js` file with your organization url. For example, if your organization is *"acme.oktapreview.com"* simply replace *"example.oktapreview.com"* with *"acme.oktapreview.com"*. See [Example of a Customized Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html#example-of-a-customized-sign-in-widget) for more configuration options.

```javascript
//config.js

angular
.module("WidgetConfig", [])
.constant("CONFIG", {
    options : {
        baseUrl: "https://example.oktapreview.com",
        clientId: "ViczvMucBWT14qg3lAM1",
        redirectUri: "http://localhost:8080",
        logo: 'images/acme_logo.png',
        labels: {
            "primaryauth.title": "Acme Partner Login",
            "primaryauth.username": "Partner ID",
            "primaryauth.username.tooltip": "Enter your @example.com username",
            "primaryauth.password": "Password",
            "primaryauth.password.tooltip": "Super secret password"
        }
    }
});
```

### ID Token
By default, the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html) returns an `id_token` using the [Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2). 

### Renew ID Token
Exchanges the current `id_token` for a new one

```javascript
$scope.renewIdToken = function() {
    widget.idToken.refresh(idToken, function(newToken) {
        widget.tokenManager.add("idToken", newToken);
    })
  }
```

###Refresh Session
Updates the current session object using the [Sign-in Widget SDK](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

```javascript
$scope.refreshSession = function() {
    widget.session.refresh(function(res) {
        if(res.status === "INACTIVE") {
            // Redirect to login
            $location.path("/login")
        } else { $scope.sessionObject = res }
    })
  }
```

###Close Session
Terminates the current session object

```javascript
$scope.closeSession = function() {
    widget.session.close(function() {
        $scope.session = undefined
    })
  }
```

###Log-Out
Terminates the current session with the organization.

```javascript
$scope.signout = function() {
    widget.session.exists(function(exists) {
        // Session exists in Okta
        // need to log out
        if(exists){
            widget.signOut();
            widget.tokenManager.clear()
            $location.path("/login");
        }
    });
```
