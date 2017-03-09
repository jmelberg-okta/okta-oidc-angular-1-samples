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
	function($window, widgetManager) {
		return {
			restrict: "E",
			replace: true,
			link: function(scope, element, attr) {
				var button = element.children()[0];
				angular.element(button).on("click", function() {
					scope.$apply(function() { scope.widget = true });

					var widget = widgetManager.getWidget();

					widget.renderEl(
						{ el: element.children()[1] },
						function(tokens) {
							if (tokens.status === "SUCCESS" ) {
								angular.forEach(tokens, function(token) {
									// Token response sent in two element array
									// based on request order ['idToken', 'token']
									if ("idToken" in token) {
										widget.tokenManager.add("idToken", token);
									}
									if ("accessToken" in token) {
										widget.tokenManager.add("accessToken", token);
									}
							    });
								// Hide widget
								scope.widget = false;
								$window.location.href = '/';
							}
						}
					);			
				});
			}
		}
});

//	Renders Home view
HomeController.$inject = ["$scope", "$window", "$location", "widgetManager"];
function HomeController($scope, $window, $location, widgetManager) {
	
	// Get the widget to handle functions
	var widget = widgetManager.getWidget()

	// Get idToken and accessToken from tokenManger
	var idToken = widget.tokenManager.get("idToken");
	var accessToken = widget.tokenManager.get("accessToken");
	
	
	// Redirect if there is no idToken
	if (angular.isUndefined(idToken)) {
		$location.path("/login")
	}

	$scope.session = true
	$scope.token = idToken
	$scope.accessToken = accessToken

	// Refreshes the current session if active	
	$scope.refreshSession = function() {
		widget.session.refresh(function(res) {
			if(res.status === "INACTIVE") {
				// Redirect to login
				$location.path("/login")
			} else { $scope.sessionObject = res }
		})
	};

	// Closes the current live session
	$scope.closeSession = function() {
		widget.session.close(function() {
			$scope.session = undefined
		})
	};

	// Renews the current idToken
	$scope.renewIdToken = function() {
		widget.idToken.refresh(idToken, function(newToken) {
			widget.tokenManager.add("idToken", newToken);
			$scope.token = success;
	    })
	}

	//	Signout of organization
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
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$location", "$scope", "widgetManager"];
function LoginController($window, $location, $scope, widgetManager) {
	var widget = widgetManager.getWidget()
	widget.session.exists(function(exists) {
		// Session exists in Okta
		// need to log out
		if(exists){
			widget.signOut();
			widget.tokenManager.clear();
			$scope = $scope.$new(true);
		}
	});
}




