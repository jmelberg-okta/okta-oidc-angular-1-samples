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

var app = angular.module("app", ["ngRoute", "OktaAuthClient"]);

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

app.value("widget", undefined);
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

// Directive to launch the widget
app.directive('myWidget',
	function($location, $window, $timeout, widgetManager) {
		return {
			restrict:  'E',
			replace: true,
			multiElement: true,
			link: function(scope, element, attr) {
				var button = element.children()[0];
				angular.element(button).on("click", function() {
					scope.$apply(function(){
						scope.widget = true;
					});
					var widget = widgetManager.getWidget()
			  		widget.renderEl(
				        { el: element.children()[1]},
				        function(res){
				           	 if (res.status === "SUCCESS") {
				           	 	$window.localStorage["idToken"] = angular.toJson({
				           	 		"idToken" : res.idToken,
				           	 		"claims" : res.claims
				           	 	});
				           	 	// Redirect home
				           	 	$timeout(function(){
				           	 		$location.path("/");
				           	 	}, 100);
				            } else {
				            	console.error(res);
				            }
				        }, function(err) {
				        	// Error
				        }
				        
					);				
				});
			}
		}
});

//	Renders Home view
app.controller("HomeController", function($scope, $window, $location,
	$timeout, $route, $anchorScroll, widgetManager) {
	var token = angular.isDefined($window.localStorage["idToken"]) ? JSON.parse($window.localStorage["idToken"]) : undefined;
	
	$scope.session = angular.isDefined(token) ? true : undefined;
	$scope.auth = token;

	// Refreshes the current session if active **/	
	$scope.refreshSession = function() {
		var response = widgetManager.refreshSession();
		response.then(function(result){
			$window.localStorage["sessionObject"] = angular.isDefined(result) ? angular.toJson(result) : undefined;
			$scope.sessionObject = JSON.parse($window.localStorage["sessionObject"]);
		}, function(err) {
			// Error
		})
	};

	// 	Closes the current live session
	$scope.closeSession = function() {
		var response = widgetManager.closeSession();
		response.then(function(result){
			$scope.session = undefined;
		}, function(err) {
			// Error
		});
	};

	// Renews the current idToken
	$scope.renewIdToken = function() {
		var response = widgetManager.renewIdToken(token.idToken);
		response.then(function(result) {
			$window.localStorage["idToken"] = angular.toJson(
				{
			        "idToken" : result.idToken,
			        "claims" : result.claims
			     });
			token = angular.isDefined($window.localStorage["idToken"]) ? JSON.parse($window.localStorage["idToken"]) : undefined;
			$scope.auth = token;
		}, function(error) {
			// Error
		});
	}

	//	Clears the localStorage saved in the web browser and scope variables
	function clearStorage(){
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	}

	//	Signout method called via button selection
	$scope.signout = function() {
		var logout = widgetManager.logoutWidget();
		logout.then(function(res){
			clearStorage();
			$location.path("/login");
		}, function(err){
			// Error
		});
	};
});

app.controller("LoginController", function($window, $location, $scope, widgetManager) {
	var session = widgetManager.checkSession();
	session.then(function(loggedIn){
		$location.path("/");
	}, function(loggedOut) {
		// Clear existing scope
		$window.localStorage.clear();
		$scope = $scope.$new(true);
	});
});




