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

var app = angular.module("app", ["ngRoute", "OktaAuthClient", "WidgetConfig"]);

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

// Set up controllers
app.controller("HomeController", HomeController);
app.controller("LoginController", LoginController);

// Global variable "widget"
app.value("widget", undefined);
app.run(function(widgetManager, CONFIG){

	// Initialize Widget from configuration file
	widget = widgetManager.initWidget( CONFIG.options );
});

// Directive to launch the widget
app.directive("myWidget",
	function($window, widgetManager, $location, $timeout) {
		return {
			restrict: "E",
			replace: true,
			link: function(scope, element, attr) {
				var button = element.children()[0];
				angular.element(button).on("click", function() {
					scope.$apply(function() {
						scope.widget = true;
					});
					widgetManager.renderWidget(element.children()[1])
					.then(function(success) {
						$window.localStorage["auth"] = angular.toJson({
							"session" : success.session,
							"user" : success.user
						});
						// Set session with Okta
						success.session.setCookieAndRedirect($location.protocol() + "://" + location.host + "/#");
					}, function(error) {
						console.error(error);
					});				
				});
			}
		}
});

//	Renders Home view
HomeController.$inject = ["$scope", "$window", "$location", "widgetManager"];
function HomeController($scope, $window, $location, widgetManager) {
	
	// Get auth object from LocalStorage
	var auth = angular.isDefined($window.localStorage["auth"]) ? JSON.parse($window.localStorage["auth"]) : undefined;
	console.log("here");
	// Redirect if user is not authenticated
	if (angular.isUndefined(auth)) {
		$location.path("/login");
	}

	$scope.session = true;
	$scope.auth = auth;

	// Refreshes the current session if active	
	$scope.refreshSession = function() {
		widgetManager.refreshSession()
		.then(function(success) {
			// Show session object
			$scope.sessionObject = success;
		}, function(err) {
			// Error
		});
	};

	// Closes the current live session
	$scope.closeSession = function() {
		widgetManager.closeSession()
		.then(function(success) {
			$scope.session = undefined;
		}, function(err) {
			// Error
		});
	};

	//	Clears the localStorage saved in the web browser and scope variables
	function clearStorage() {
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	}

	//	Signout of organization
	$scope.signout = function() {
		widgetManager.logoutWidget()
		.then(function(success) {
			clearStorage();
			$location.path("/login");
		}, function(err) {
			// Error
		});
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$location", "$scope", "widgetManager"];
function LoginController($window, $location, $scope, widgetManager) {
	widgetManager.checkSession()
	.then(function(loggedIn) {
		$location.path("/");
	}, function(loggedOut) {
		// Clear existing scope
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	});
}




