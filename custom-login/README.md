# AngularJS Custom Login Example
Single-Page Web Application (SPA) sample using a custom login interface

### Configure the Sample Application
Update the `config.js` file:
```javascript
angular
.module("OktaConfig", [])
.constant("CONFIG", {
    options : {
	    url: "https://example.oktapreview.com",
	    clientId: "ViczvMucBWT14qg3lAM1",
      redirectUri: "http://localhost:8080",
  	  authParams: {
    	  responseType: "id_token, token",
    	  responseMode: "okta_post_message",
    	  scope : [
      		"openid",
      		"email",
      		"profile",
      		"address",
      		"phone"
    	  ]
  	  }
    },
    apiUrl : "http://localhost:9000/protected"
});
```

**Note:** The `apiUrl` is for requesting a protected resource using the `accessToken`. See [custom claims/scopes](http://openid.net/specs/openid-connect-core-1_0.html#AdditionalClaims):

The `apiUrl` connects the sample application to `server.js` to verify the access token.


###Authentication
Using the [Okta AuthSDK](http://developer.okta.com/docs/guides/okta_auth_sdk), a is authenticated by `username` and `password` on the login form by calling the following function.
```javascript
authClient.signIn(user.email, user.password)
.then(function(success) {
	// Success
	$window.localStorage["auth"] = success;

	// Redirect on success
	var client = authClient.getClient();
	client.session.setCookieAndRedirect(JSON.parse(success).sessionToken,
	client.options.redirectUri+"/#");

}, function(error) {
	console.error(error);
});
```

Handling the transaction status is performed inside of `okta-angular.js`, which is injected inside of your Angular application.


###Get Tokens
Once a user is authenticated, the option to retrieve an `idToken` and `accessToken` are granted. The following example illustrates **requesting both the accessToken and idToken** To return **only** the `idToken` or `accessToken`, specify it as a String. The tokens are stored inside of Okta's TokenManager.

```javascript
$scope.getTokens = function(auth) {
	var tokenOptions = {
		'sessionToken' : auth.sessionToken,
		'responseType' : ['id_token', 'token'],
		'scopes' : CONFIG.options.authParams.scope
	};

	authClient.getClient()
	.idToken.authorize(tokenOptions)
	.then(function(success) {
		// Success in order requested
		tokenManager.add('idToken', success[0]);
		tokenManager.add('accessToken', success[1]);
		});

	}, function(error) {
		// Error
		console.error(error);
	});
};
```
###Refresh Session
Updates the current session object

```javascript
$scope.refreshSession = function() {
	authClient.getClient().session.refresh()
	.then(function(success){
		if(success.status === "ACTIVE") {
			// Refreshed Session
		}
	}, function(error) {
		// Error
	});
};
```

###Close Session
Easily terminate the current session object

```javascript
$scope.closeSession = function() {
	authClient.getClient().session.close();
};
```

###Renew Id Token
If the current session is valid, returns a new ID Token and placed inside the TokenManager

```javascript
$scope.renewIdToken = function() {
	authClient.getClient()
	.idToken.refresh(
		{'scopes' : CONFIG.options.authParams.scope}
	)
	.then(function(result) {
		// Success
		tokenManager.refresh('idToken', result);
	}, function(error){
		// Error
	});
};
```

###Decode ID Token
Decodes raw ID Token and stores to a variable

```javascript
$scope.decode = function(idToken) {
	var decodedToken = authClient.getClient().idToken.decode(idToken);
	};
```

###Call External API
Returns JSON object with [Gavatar](https://en.gravatar.com/site/implement/) URL and name from [custom claim](http://openid.net/specs/openid-connect-core-1_0.html#AdditionalClaims). Requires the `accessToken` to be passed under the Authorization Header.

```javascript
$scope.apiCall = function(token) {
	// Calls external server to return Gavatar image url and name
	$http({
		method : "GET",
		url : CONFIG.apiUrl,
		headers : {
			"Authorization" : "Bearer " + token
		}
	})
	.then(function(response){
		if(response.data.Error){
			// Error
			console.error(response.data.Error);
		} else {
			// Success
			// response.data.image;
			// response.data.name;
		}
	});
};
```

####Example response
```json
{
	"image" : "www.gravatar.com/avatar/<image_hash>",
	"name" 	: "example@okta.com"
}
```


