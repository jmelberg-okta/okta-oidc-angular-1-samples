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
 

/**
 *	Custom Angular Wrapper for the Okta AuthSDK
 *
 *	To Use:
 * 		Inject "OktaAuthClient" into your modules,
 *		followed by "authClient" in your controllers, directives,
 *		etc. if using a custom login form
 */

angular
.module("OktaAuthClient", [])
.factory("authClient", function($q) {
	var auth;

	return {
		init : function(options) {
			/* Okta Authentication biding */
			auth = new OktaAuth(options);
		},
		getClient : function() {
			return auth;
		},
		signIn : function(email, password) {
			var deferred = $q.defer();
			auth.signIn({ username : email, password : password })
			.then(function(transaction) {
				switch(transaction.status) {
					case "SUCCESS":
						deferred.resolve(angular.toJson(transaction));
					default:
						deferred.reject({
							"Error" : "Cannot handle the " + transation.status + " status"
						});
				}
			})
			.fail(function(err) {
				deferred.reject({"Error" : err });
			});
			return deferred.promise;
		}
	}
});