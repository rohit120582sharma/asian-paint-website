
window.fbAsyncInit = function() {
	FB.init({
		appId : '1418108621781085', // Will be changed with live app id
		status : true,
		xfbml : true
	});
};

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


var accessToken = "";
var share_permission = false;


function getFBLoginStatus() {
	if (FB) {
		// Get login status
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				uid = response.authResponse.userID;
				accessToken = response.authResponse.accessToken;
				checkPermission();
			} else if (response.status === 'not_authorized') {
				loginFB();
			} else {
				loginFB();
			}
		});
	} else {
		alert("Facebook SDK not loaded, Please wait for a moment and try again");
		return false;
	}
}

function loginFB() {
	ga('create', 'UA-52354973-9', 'auto');
	ga('send', 'event','button','click','Share on FB',1);
	FB.login(function(response) {
		if (response.authResponse) {
			//Not needed for now
			console.log('Welcome!  Fetching your information.... ');
			FB.api('/me', function(response) {
				console.log('Good to see you, ' + response.name + '.');
			});
			accessToken = response.authResponse.accessToken;
			checkPermission();
		} else {
			console.log('User cancelled login or did not fully authorize.');
		}
	}, {
		scope : 'publish_actions,publish_stream'
	});
}

function checkPermission(permission) {
	FB.api("/me/permissions", "GET", function(response) {
		if (response && !response.error) {
			/* handle the result */
			if (response.data[0] && response.data[0].publish_actions == "1") {
				share_permission = true;
				shareLocalPhotoViaGraphAPI();
			} else {
				share_permission = false;
				loginFB();
			}
		}
	});
}

// Photo upload via Graph API
function shareLocalPhotoViaGraphAPI() {
	if (!(accessToken && share_permission)) {
		loginFB();
	} else {
		var canvas = document.getElementById("glcanvas");
		var imageData = canvas.toDataURL("image/png");
		try {
			blob = dataURItoBlob(imageData);
		} catch (e) {
			console.log(e);
		}

		// file path will be replaced with base64encoded image data 
		//		var file = $(".fileChoosed")[0].files[0];
		var fd = new FormData();
		fd.append("access_token", accessToken);
//		fd.append("source", file);
		fd.append("source", blob);
		fd.append("message","Ezycolour Screentest app: I have visualized my room in various colours using this amazing app from Asian Paints");
		try {
			$.ajax({
				url : "https://graph.facebook.com/" + "me"
						+ "/photos?access_token=" + accessToken,
				type : "POST",
				data : fd,
				processData : false,
				contentType : false,
				cache : false,
				success : function(data) {
					console.log("success " + data);
					alert("Your image shared successfully.");
				},
				error : function(shr, status, data) {
					console.log("error " + data + " Status " + shr.status);
					alert("Error in image sharing. Plese try again later.");
				},
				complete : function() {
					console.log("Ajax Complete");
				}
			});

		} catch (e) {
			console.log(e);
		}
	}
}

//Convert a data URI to blob
function dataURItoBlob(dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for ( var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ ab ], {
		type : 'image/png'
	});
}