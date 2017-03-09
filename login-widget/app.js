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

					var widget = widgetManager.getWidget();

					widget.renderEl(
					    { el: element.children()[1] },

						function(transaction) {
							if(transaction.status === "SUCCESS") {
								// Success
								console.log(transaction);
								$window.localStorage["auth"] = angular.toJson({
									"session" : transaction.session,
									"user" : transaction.user
								});
								scope.widget = false;

								// Set session with Okta
								transaction.session.setCookieAndRedirect(
									$location.protocol() + "://" + location.host + "/#");
							}
						}
					)
				});
			}
		}
});

//	Renders Home view
HomeController.$inject = ["$scope", "$window", "$location", "widgetManager"];
function HomeController($scope, $window, $location, widgetManager) {
	
	// Get widget for helper methods
	var widget = widgetManager.getWidget();

	// Get auth object from LocalStorage
	var auth = angular.isDefined($window.localStorage["auth"]) ? JSON.parse($window.localStorage["auth"]) : undefined;

	// Redirect if user is not authenticated
	if (angular.isUndefined(auth)) {
		$location.path("/login");
	}

	$scope.session = true;
	$scope.auth = auth;

	// Refreshes the current session if active	
	$scope.refreshSession = function() {
		widget.session.refresh(function(success) {
			// Show session object
			$scope.sessionObject = success;
		});
	};

	// Closes the current live session
	$scope.closeSession = function() {
		widget.session.close(function(){
			$scope.session = undefined;
		});
	};

	//	Clears the localStorage saved in the web browser and scope variables
	function clearStorage() {
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	}

	//	Signout of organization
	$scope.signout = function() {
		widget.session.exists(function(exists) {
			if(exists) {
				widget.signOut();
				clearStorage();
				$location.path("/login");
			}
		});
	};
}

// Renders login view if session does not exist
LoginController.$inject = ["$window", "$location", "$scope", "widgetManager"];
function LoginController($window, $location, $scope, widgetManager) {
	var widget = widgetManager.getWidget();

	widget.session.exists(function(exists) {
		if(exists) {
			widget.signOut();
			$window.localStorage.clear();
			$scope = $scope.$new(true);
		}
	});
}




