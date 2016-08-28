# AngularJS Okta Sign-In Widget 
Single-Page Web Application (SPA) sample using the [Okta Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

### Configure the Sample Application
Update the `config.js` file with your organization url. For example, if your organization is *"acme.oktapreview.com"* simply replace *"example.oktapreview.com"* with *"acme.oktapreview.com"*:
```javascript
// config.js

angular
.module("WidgetConfig", [])
.constant("CONFIG", {
    options : {
        baseUrl: "https://example.oktapreview.com"
    }
});
```

###Response Object
[Okta's Sign-In Widget](http://developer.okta.com/docs/api/resources/okta_signin_widget.html) will return a session token and user object. This example uses `$window.localStorage` to hold the authentication object.

```json
// Sample User Response
{
  "id": "00u6yjbti4MYAVDkA0h7",
  "passwordChanged": "2016-07-26T18:39:41.000Z",
  "profile": {
    "login": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "locale": "en_US",
    "timeZone": "America/Los_Angeles"
  }
}

// Sample Session Response
{
  "id": "102O-1bcL3YQzaZJQxoDBRb5A",
  "userId": "00u6yjbti4MYAVDkA0h7",
  "login": "john@example.com",
  "expiresAt": "2016-08-28T03:49:03.000Z",
  "status": "ACTIVE",
  "lastPasswordVerification": "2016-08-28T01:47:38.000Z",
  "lastFactorVerification": null,
  "amr": [
    "pwd"
  ],
  "idp": {
    "id": "00o5ivsvqlJSJVBme0h7",
    "type": "OKTA"
  },
  "mfaActive": false,
  "_links": {
    "self": {
      "href": "https://example.oktapreview.com/api/v1/sessions/me",
      "hints": {
        "allow": [
          "GET",
          "DELETE"
        ]
      }
    },
    "refresh": {
      "href": "https://example.oktapreview.com/api/v1/sessions/me/lifecycle/refresh",
      "hints": {
        "allow": [
          "POST"
        ]
      }
    },
    "user": {
      "name": "John Doe",
      "href": "https://example.oktapreview.com/api/v1/users/me",
      "hints": {
        "allow": [
          "GET"
        ]
      }
    }
  }
}
```

###Refresh Session
Updates the current session object using the [Sign-in Widget SDK](http://developer.okta.com/docs/api/resources/okta_signin_widget.html)

```javascript
$scope.refreshSession = function() {
    widgetManager.refreshSession()
    .then(function(success){
      // success
    }, function(error) {
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
