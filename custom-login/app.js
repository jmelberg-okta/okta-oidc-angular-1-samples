/* 	Author: Jordan Melberg */
/** Copyright © 2016, Okta, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var app = angular.module("app", ["ngRoute", "OktaAuthClient", "OktaConfig"]);
app.config(function ($routeProvider) {
	$routeProvider
	.when("/", {
		templateUrl: "views/home.html",
		controller: "HomeController"
	})
	.when("/login", {
		templateUrl: "views/login.html",
		controller: "LoginController"
	})
	.otherwise({redirectTo: "/"});
});

/** Set up controllers */
app.controller("HomeController", HomeController);
app.controller("LoginController", LoginController);

/**	Global variable oktaAuth */
app.value("oktaAuth", undefined);
app.run(function(authClient, CONFIG){
	// Init OktaAuth from configuration file
	oktaAuth = authClient.init(CONFIG.options);
});

HomeController.$inject = ["$scope", "$window", "$location", "$http", "authClient", "CONFIG"];
function HomeController($scope, $window, $location, $http, authClient, CONFIG) {
	
	// Get auth object from LocalStorage
	var auth = angular.isDefined($window.localStorage["auth"]) ? JSON.parse($window.localStorage["auth"]) : undefined;

	// Token manager
	var tokenManager = authClient.getClient().tokenManager;

	// Redirect user if not authenticated
	if (angular.isUndefined(auth)) {
		$location.path("/login");
	};

	$scope.session = true;
	$scope.auth = auth;

	// Refresh the current session
	$scope.refreshSession = function() {
		authClient.getClient().session.refresh()
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

	$scope.closeSession = function() {
		authClient.getClient().session.close();
		$scope.session = undefined;
	};

	$scope.getTokens = function(auth) {
		var tokenOptions = {
			'sessionToken' : auth.sessionToken,
			'responseType' : ['id_token', 'token'], // Requires list for multiple inputs
			'scopes' : CONFIG.options.authParams.scope
		};
		authClient.getClient()
		.idToken.authorize(tokenOptions)
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

	$scope.renewIdToken = function() {
		authClient.getClient()
		.idToken.refresh(
			{'scopes' : CONFIG.options.authParams.scope}
		)
		.then(function(result) {
			tokenManager.refresh('idToken', result);
			$scope.$apply(function(){
				$scope.idToken = tokenManager.get('idToken');
			});
		}, function(error){
			console.error(error);
		});
	};

	/** Decode idToken showing header, claims, and signature */
	$scope.decode = function(idToken) {
		var decodedToken = authClient.getClient().idToken.decode(idToken);
		$scope.decodedIdToken = decodedToken;
	};

	/** External API Call using accessToken */
	$scope.apiCall = function(token) {
		// Calls external server to return Gavatar image url and name
		$http({
			method : "GET",
			url : CONFIG.apiUrl,
			headers : {
				"Content-Type" : undefined,
				"Authorization" : "Bearer " + token
			}
		})
		.then(function(response){
			if(response.data.Error){
				console.error(response.data.Error);
			} else {
				$scope.$apply(function() {
					$scope.img = response.data.image;
					$scope.imgName = response.data.name;
				});
			}
		});
	};

	/**	Clears the localStorage saved in the web browser and scope variables */
	function clearStorage(){
		$window.localStorage.clear();
		authClient.getClient().tokenManager.clear();
		$scope = $scope.$new(true);
	}

	/** Signout method called via button selection */
	$scope.signout = function() {
		authClient.getClient().session.close();
		clearStorage();
		$location.url("/login");
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$location", "$scope", "authClient"];
function LoginController($window, $location, $scope, authClient) {
	authClient.getClient()
	.session.exists(function(exists) {
		if(exists) {
			$location.path("/");
		} else {
			// Clear scope and localStorage
			$window.localStorage.clear();
			$scope = $scope.$new(true);
		}
	});

	// Handles authentication
	$scope.authenticate = function(user) {
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
	}
}
