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
oktaAuth
    .signIn({ username: user.email, password: user.password })
	.then(function(transaction) {
		if(transaction.status === "SUCCESS"){
			$window.localStorage["auth"] = angular.toJson({
				"sessionToken" : transaction.sessionToken,
				"user" : transaction.user
			});
			oktaAuth.session.setCookieAndRedirect(transaction.sessionToken)
			$window.location.href = '/';
		}
	}, function(error) {
		// Error authenticating
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
		'responseType' : ['id_token', 'token'] // Requires list for multiple inputs
	};
	oktaAuth.token.getWithoutPrompt(tokenOptions)
	.then(function(success) {
		// Success in order requested
		tokenManager.add('idToken', success[0]);
		tokenManager.add('accessToken', success[1]);
		
		// Update scope
		$scope.$apply(function(){
			$scope.idToken = tokenManager.get('idToken');
			$scope.accessToken = tokenManager.get('accessToken');
		});
	}, function(error) {
		console.error(error);
	});
};
```
###Refresh Session
Updates the current session object

```javascript
$scope.refreshSession = function() {
	oktaAuth.session.refresh()
	.then(function(success){
		if(success.status === "ACTIVE") {
			$scope.$apply(function(){
				$scope.sessionObject = success;
			});
		} else {
			console.error(success.status);
		}
	}, function(error) {
		console.error(error);
	});
};
```

###Close Session
Easily terminate the current session object

```javascript
$scope.closeSession = function() {
	oktaAuth.session.close();
};
```

###Renew Id Token
If the current session is valid, returns a new ID Token and placed inside the TokenManager

```javascript
$scope.renewIdToken = function() {
	oktaAuth.token.refresh(tokenManager.get('idToken'))
		.then(function(result) {
			tokenManager.refresh('idToken', result);
			$scope.$apply(function(){
				$scope.idToken = tokenManager.get('idToken');
			});
		}, function(error){
			console.error(error);
		});
	};
```

###Decode ID Token
Decodes raw ID Token and stores to a variable

```javascript
$scope.decode = function(idToken) {
	var decodedToken = oktaAuth.token.decode(idToken);
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


