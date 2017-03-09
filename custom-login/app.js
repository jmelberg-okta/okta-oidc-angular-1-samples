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
	
	// Get authClient for helper methods
	var oktaAuth = authClient.getClient();

	// Get auth object from LocalStorage
	var auth = angular.isDefined($window.localStorage["auth"]) ? JSON.parse($window.localStorage["auth"]) : undefined;

	// Token manager
	var tokenManager = oktaAuth.tokenManager;

	// Redirect user if not authenticated
	if (angular.isUndefined(auth)) {
		$location.path("/login");
	};

	$scope.session = true;
	$scope.auth = auth;

	// Refresh the current session
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

	$scope.closeSession = function() {
		oktaAuth.session.close();
		$scope.session = undefined;
	};

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

	/** Decode idToken showing header, claims, and signature */
	$scope.decode = function(idToken) {
		var decodedToken = oktaAuth.token.decode(idToken);
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

	//	Clears the localStorage saved in the web browser and scope variables
	function clearStorage() {
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	}

	/** Signout method called via button selection */
	$scope.signout = function() {
		oktaAuth.session.close();
		clearStorage();
		$location.url("/login");
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$scope", "authClient"];
function LoginController($window, $scope, authClient) {
	var oktaAuth = authClient.getClient()
	
	oktaAuth.session.exists(function(exists) {
		oktaAuth.session.close();
	});

	// Handles authentication
	$scope.authenticate = function(user) {
		oktaAuth.signIn({ username: user.email, password: user.password })
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
	}
}
