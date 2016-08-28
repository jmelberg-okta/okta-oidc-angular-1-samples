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
 
angular
.module("OktaAuthClient", [])

.factory("widgetManager", function($q) {
	var widget;

    return {
        getWidget: function () {
            return widget;
        },
        initWidget: function(options){
        	// Create widget
        	var createWidget = new OktaSignIn(options);
			widget = createWidget; 
        },
        renderWidget: function(element) {
            // Render widget
            var deferred = $q.defer();
            widget.renderEl(
                { el: element },
                function(result) {
                    if (result.status === "SUCCESS" ) {
                        //Success
                        deferred.resolve(result);
                    } else {
                        deferred.reject(result);
                    }
                });
            return deferred.promise;
        },
        refreshSession : function(){
        	var deferred = $q.defer();
        	widget.session.refresh(function(res) {
        		if(res.status === "INACTIVE"){
        			deferred.reject(res);
        		} else {	deferred.resolve(res);  }
        	});
        	return deferred.promise;
        },
        closeSession : function() {
        	var deferred = $q.defer();
			widget.session.close(function(){
				deferred.resolve("Closed Session");
			});
			return deferred.promise;
        },
        renewIdToken : function(token) {
        	var deferred = $q.defer();
        	widget.idToken.refresh(token,
        		function(newToken){
					deferred.resolve(newToken);
			});
			return deferred.promise;
        },
        checkSession : function() {
        	var deferred = $q.defer();
        	widget.session.exists(function(exists){
        		if(exists){
        			deferred.resolve(exists);
        		} else {
        			deferred.reject(false);
        		}
        	});
        	return deferred.promise;
        },
        logoutWidget: function () {
        	var deferred = $q.defer();
			widget.session.exists(function(exists){
				if(exists){
					widget.signOut();
					deferred.resolve("Signed out");
				} else {
					deferred.reject("Already Signed Out");
				}
			});
			return deferred.promise;
        }
    };
});