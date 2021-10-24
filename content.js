$(document).ready(function () {
	console.log("requesting start");
	analyzeImage();

});

//function that detect and analyze a image that we hover on
function analyzeImage(){
	$('img').mouseover(function() {
	console.log("analyze image ...");
	console.log("image: " + this.src);

	var sourceImageUrl = this.src;
	var subscriptionKey = "" // add your key here
	var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";

	var params = {
		visualFeatures: "Description",
		details: "",
		language: "en",
	};
		 					 
	$.ajax({
		url: uriBase + "?" + $.param(params),
		beforeSend: function(xhrObj){
		 	xhrObj.setRequestHeader("Content-Type","application/json");
		 	xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
		},

		type: "POST",
		data: '{"url": ' + '"' + sourceImageUrl + '"}',
	})
	.done(function(data){
		console.log(data);
		var obj = JSON.parse(JSON.stringify(data, null, 2));
		textToSpeech(obj.description.captions[0].text);
		console.log(obj.description.captions[0].text);
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
		errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
		});
	});
};

//function that converts the result from CV API into speech
function textToSpeech(analyzeResult){
	var apiKey = ""; //add your key here
	var params = {};
	var tokenURL = 'https://oxford-speech.cloudapp.net/token/issueToken';
	var audioURL = "https://speech.platform.bing.com/synthesize";
	var token = "default";
	var textToSpeak = analyzeResult;
	var language = 'en-us';
	var nameLanguage = 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)';
	var sendString = "<speak version='1.0' xml:lang='" + language + "'><voice xml:lang='" + language + "' xml:gender='Female' name='" + nameLanguage + "'>" + textToSpeak + "</voice></speak>"
	var context = new AudioContext();
	var speechBuffer = null;

	$.ajax({
		url: "https://api.cognitive.microsoft.com/sts/v1.0/issueToken?" + $.param(params),
		beforeSend: function(xhrObj){
			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","subscriptionKey");
		},

		type: "POST",
		data: "{body}",
	})
	.done(function(data) {
		console.log(JSON.stringify(data));
		token = data;
		sendAudioRequest();
		let ssml = "<speak version=1.0 xml:lang=en-us><voice name=Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)<xml:lang=en-us> xml:gender=Female> This is a demo to call Microsoft text to speech service.</voice></speak>"
		console.log(ssml)
	})
	.fail(function() {
		alert("error");
	});

	function sendAudioRequest(){
		sendString = "<speak version='1.0' xml:lang='" + language + "'><voice xml:lang='" + language + "' xml:gender='Female' name='" + nameLanguage+"'>" + textToSpeak + "</voice></speak>";
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4 && xhttp.status == 200){
				context.decodeAudioData(xhttp.response, function(buffer){
					speechBuffer = buffer;
					console.info(speechBuffer);
					playAudio(speechBuffer);
				});
		}};
				
		xhttp.open("POST", audioURL, true);
		xhttp.setRequestHeader("Content-type", 'application/ssml+xml');
		xhttp.setRequestHeader("Authorization", 'Bearer ' + token);
		xhttp.setRequestHeader("X-Microsoft-OutputFormat", 'riff-16khz-16bit-mono-pcm');
		xhttp.setRequestHeader("X-Search-AppId", '07D3234E49CE426DAA29772419F436CA');
		xhttp.setRequestHeader("X-Search-ClientID", '1ECFAE91408841A480F00935DC390960');
		xhttp.responseType = 'arraybuffer'
		xhttp.send(sendString);
	}

	function playAudio(){
		var context = new AudioContext();
		var source = context.createBufferSource();
		source.buffer = speechBuffer;
		source.connect(context.destination);
		source.start(0);
	}

};
