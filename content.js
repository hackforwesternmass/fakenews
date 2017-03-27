function sendToServer(obj) {
  var promiseToken = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…
  var getToken = new XMLHttpRequest();
		  var turl = "http://www.fakenewsfitness.org/restws/session/token";
		  getToken.onload = function () {
			  var tStatus = getToken.status;
			  console.log(tStatus);
			  var tData = getToken.responseText;
			  console.log(tData);
			    if (tStatus == 200) {
				resolve(tData);
				}
				else {
				reject(Error("It broke"));
				}
		  }
		  getToken.open("GET", turl, true);
		  getToken.setRequestHeader("Accept", "application/json");
		  getToken.send(null);
});

promiseToken.then(function(result) {
  var promiseUser = new Promise(function(resolve, reject) {
  var getUser = new XMLHttpRequest();
	  var uurl = "http://www.fakenewsfitness.org/user?mail="+obj.name;
	  getUser.onload = function () {
		  var uStatus = getUser.status;
		  var uData = JSON.parse(getUser.response);
		  if (uData.list[0] == undefined) {
			  alert("Email not related to valid FakeNewsFitness user");
		  } else {
		    if (uStatus == 200) {
		    resolve(uData.list[0].uid);
			    }
		    else {
            reject(Error(console.log("User promise broke")));
		    }
		  }
	  }
	  getUser.open("GET", uurl, true);
	  getUser.setRequestHeader("Accept", "application/json");
	  sessionToken = result;
	  getUser.setRequestHeader("X-CSRF-Token", sessionToken);
	  getUser.send(null);
  });
  promiseUser.then(function(result) {
    if (result == null) {
		alert("There was a problem retrieving your FakeNewsFitness User");
	} else {
	var url = "http://www.fakenewsfitness.org/node"
	var postData = JSON.stringify({"type":"test_no_group","author":{"id":result},"field_url":{"url":obj.url}});
	var postRequest = new XMLHttpRequest();
	postRequest.onload = function () {
	  console.log(postData);
	  var status = postRequest.status; // HTTP response status, e.g., 200 for "200 OK"
	  console.log(status);
      var data = postRequest.responseText; // Returned data, e.g., an HTML document.
	  console.log(data);
  }
  postRequest.open("POST", url, true);
  postRequest.setRequestHeader("Content-Type", "application/json");
  postRequest.setRequestHeader("X-CSRF-Token", sessionToken);
  postRequest.send(postData);
	
  }}, function(err) {
    console.log(err); // Error: "It broke"
    }
  );
  
}, function(err) {
  console.log(err); // Error: "It broke"
});
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	
    // If the received message has the expected format...
    if (msg.text === 'build_form_filled') {
        var thisURL = controller.getURL();
        var formFields = [
        //f = fixed rows; v = variable rows
            ["name","Email Address as User Name","","f"],
            ["url","Page URL", thisURL, "f"]
            ];
        //Build the form
        makeForm(formFields);
        // Call the specified callback, passing
        // the web-page's DOM content as argument
    }

    else if (msg.text === 'build_form_blank') {
        var formFields = [
            ["name","Email Address as User Name","","f"],
            ["url","Page URL","","f"]
            ];
        //Build the form
        makeForm(formFields);
    }
});

//flow controller revealing module - contains various page parsing methods
var controller = (function(){

  // get domain from active tab
   function getURL() {
     var href = window.location.href.split('?');
     return href[0];	 
   }; 

  //return public methods
  return {
	getURL : getURL
  };
})();

//cancel button - now that we have multiple pages could/should be made generic

function makeForm(fields) {
    // Move Body Down
	document.getElementsByTagName("BODY")[0].style.marginTop="420px";

    // Create Form Object Page 1
	var formDiv = document.createElement("div");
	formDiv.setAttribute('id', "FakeNewsForm");
    var formName = document.createElement("form");

    // Create Input Elements	
	for(var i = 0; i < fields.length; i++){

		// Create Label
		var labelElement = document.createElement("label");
		labelElement.setAttribute("for", fields[i][0]);
		var labelText = document.createTextNode(fields[i][1]+": ");
		labelElement.appendChild(labelText);
		formName.appendChild(labelElement);

		// Create Input
		var inputElement = document.createElement("input"); //input element, text
		inputElement.setAttribute('type',"text");
		inputElement.setAttribute("id",fields[i][0]);
		inputElement.value = fields[i][2];
		formName.appendChild(inputElement);
    }
	
     // Create Submit Element	

	var submitElement = document.createElement("input"); //input element, Submit button
	submitElement.setAttribute('type',"button");
	submitElement.setAttribute('value',"Submit Data");
	submitElement.setAttribute('id',"submit");
	submitElement.addEventListener("click", function() {
		sendToServer({
		/* use Jquery with a form serialization library */
		name: document.getElementById("name").value,
        url: document.getElementById("url").value
		})
		}, false)
	formName.appendChild(submitElement);
	formDiv.appendChild(formName);
	
	if (document.getElementById('FakeNewsForm')) {
		document.getElementById('FakeNewsForm').replaceWith(formDiv);
		}
		else {
		document.getElementsByTagName('body')[0].appendChild(formDiv);
	};
};
