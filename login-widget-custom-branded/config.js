/*  Author: Jordan Melberg */
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

/** Configuration file for login-widget-custom-branded
 *
 *  Reference http://developer.okta.com/docs/api/resources/okta_signin_widget.html#example-of-a-customized-sign-in-widget
 */
angular
.module("WidgetConfig", [])
.constant("CONFIG", {
    options : {
        baseUrl: "https://example.oktapreview.com",
        clientId: "8p10aJwClXD61oFx3SNT",
        redirectUri: "http://localhost:8080",
        logo: 'images/acme_logo.png',
        labels: {
            "primaryauth.title": "Acme Partner Login",
            "primaryauth.username": "Partner ID",
            "primaryauth.username.tooltip": "Enter your @example.com username",
            "primaryauth.password": "Password",
            "primaryauth.password.tooltip": "Super secret password"
        }
    }
});