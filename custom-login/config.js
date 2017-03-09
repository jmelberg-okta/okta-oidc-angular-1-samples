angular
.module("OktaConfig", [])
.constant("CONFIG", {
    options : {
	    url: "https://example.oktapreview.com",
	    clientId: "8p10aJwClXD61oFx3SNT",
      redirectUri: "http://localhost:8080",
  	  authParams: {
    	  responseType: ["id_token", "token"],
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