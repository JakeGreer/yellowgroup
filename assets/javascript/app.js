$(document).ready(function()
{
	// hide directory screen
	$("#directory").hide()
	$("#login-div").hide()
	$("#register-div").hide()
	$(".loading").hide();
	$("#logout").hide();

	//for the animate.css library
    $.fn.extend({
        animateCss: function(animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).removeClass('animated ' + animationName);
            });
            return this;
        }
    });
	// main function for running app
	function MainProgram()
	{	
		// Initialize Firebase
			var config = {};
			// Variable to reference the database
			var database;		
			// variable for storing zipcode
			var zipcode;
			//array of event locations
			var locations = [];
			//array of food locations
			var foodLocations = [];
			//Number of returned events
			var numOfMeetups = 10;
			//number of returned food places
			var numOfFood = 20;
			//Initial Lat
			var lat;
			//Initial Long
			var lng;

			var email;

			var password;

			var auth;

			//ajax call to the google maps api
			const var apiKey = "AIzaSyAVeD_VRihMVTcxvIM6mwH6WSEZ-s1kqRo";

			var queryUrl;

			//firebase configuration
			config = 
			{
				apiKey: "AIzaSyDrsI6iSQqpK66S3C_SDd3UIzGaECV6tqY",
			    authDomain: "whatsgood-f9823.firebaseapp.com",
			    databaseURL: "https://whatsgood-f9823.firebaseio.com",
			    projectId: "whatsgood-f9823",
			    storageBucket: "whatsgood-f9823.appspot.com",
			    messagingSenderId: "905439758172"
			};

			firebase.initializeApp(config);

			database = firebase.database();
		// end firebase initializing


		// on clicking confirm button on main screen
		$("#confirmZip").click(function(event)
		{
			//prevent page refresh
			event.preventDefault();


			//Error check the zip input to make sure the zipcode is valid length
			if($("#zip-input").val() == "" || $("#zip-input").val().length != 5) {
				$("#zipError").empty();
				$("#zipError").append("<div class='alert alert-danger text-center'><strong>Please enter a 5 digit zipcode.</strong></div>");
				console.log($("#zip-input").val().length);
			}
			//If zipcode is 5 digits long then proceed...
			else {

				$("#start").hide();
				$("#directory").show();
				$("#zipError").empty();

				

				//value taken from user input
				zipcode = $("#zip-input").val();
				queryUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zipcode + "&key=" + apiKey;

				$.ajax(
				{
					url: queryUrl,
					method: "GET"
				}).done(function(response)
				{
					console.log(response);

					//center the map over the zipcode input
					lat = response.results[0].geometry.location.lat;
					lng = response.results[0].geometry.location.lng;

					console.log(lat);
					console.log(lng);

					initMap(lat, lng);

				});//end of ajax call

			}//end of else statement

		});//end of onclick
		
		//meetup on click runs getevents function and appends the events from the ajax call to the map
		$("#meetupBtn").on("click", function() {

			$("#directory").hide();
			$(".loading").show();

			//call the getEvents function that runs an ajax call to the meetups api
			getEvents(lat, lng, zipcode, locations, numOfMeetups);
		});

		//food on click runs getfood function and appends the events from the ajax call to the map
		$("#foodBtn").on("click", function() {

			$("#directory").hide();
			$(".loading").show();

			//call the getFood function that runs an ajax call to the local google api
			getFood(zipcode, lat, lng, foodLocations, numOfFood);
		});

		email = $("#email").val();
		password = $("#password").val();
		auth = firebase.auth();

		$("#login").click(function()
		{
			//Sign in
			promise = auth.signInWithEmailAndPassword(email, pass);
			promise.catch(function(e)
			{
				alert(e.message);
			})
		})

		$("#register").click(function()
		{
			//TODO: validate that both the email and password fields are valid
			promise = auth.createInWithEmailAndPassword(email, pass);
			promise.catch(function(e)
			{
				alert(e.message);
			})
		})

		firebase.auth().onAuthStateChanged(function(firebaseUser)
		{
			if(firebaseUser)
			{
				$("#logout").show();
			}
			else
			{
				$("#logout").hide();
			}
		});

		$("#logout").click(function(e)
		{
			firebase.auth().signOut();
		})

	} //end of main



/********************************************************************************
****************************** Button Functions *********************************
********************************************************************************/

	function getEvents(lat, lng, zip, locations, numOfMeetups) {

		//Jake API Key
		var key = "4f561e404155b324d1b791c124f6221";

		//Corey API Key
	    //var key = "7e44766f4e7d46533d222a4d7f477b";

		var queryUrl = "https://api.meetup.com/find/groups?key=" + key + "&zip=" + zip + "&only=zip,name,lon,lat,link,description";


		//ajax call to the meetups api to grab local events
		$.ajax(
		{
			url: queryUrl,
			method: "GET"
		}).done(function(response)
		{
			console.log(response);
			

			//loop through the response and retrieve the latitudes and longitudes and extra info and store into an object
			for(var i = 0; i < numOfMeetups; i++) {
				locations[i] = { name: response[i].name, lat: response[i].lat, lon: response[i].lon, link: response[i].link,  description: response[i].description};
			}

			console.log(locations);
			$(".loading").hide();
			$("#directory").show();

			//initialize the map with the results from the ajax call 
			initEvents(lat, lng, locations, numOfMeetups);

		});
	}

	function getFood(zip, lat, lng, foodLocations, numOfFood) {

		//Jake API Key
		var key = "AIzaSyDt-FgJ-CQjtvVVNO5lAC04H21BH4MPSTs";

		var queryUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lat + "," + lng + "&radius=10000&type=food&type=restaurant&type=cafe&type=meal_delivery&type=meal_takeaway&key=" + key;

		$.ajax(
		{
			url: queryUrl,
			method: "GET"
		}).done(function(response)
		{
			console.log(response);

			
			//loop through the response and retrieve the latitudes and longitudes and extra info and store into an object
			for(var i = 0; i < numOfFood; i++) {
	
				foodLocations[i] = { name: response.results[i].name, lat: response.results[i].geometry.location.lat, lon: response.results[i].geometry.location.lng,  open: response.results[i].opening_hours.open_now, photos: response.results[i].photos[0].html_attributions[0]};

				if(foodLocations[i].open == true) {
					foodLocations[i].open = "Yes";
				}
				else {
					foodLocations[i].open = "No";
				}
			}
			console.log(foodLocations);
			$(".loading").hide();
			$("#directory").show();

			//initialize the map with the results from the ajax call
			initFood(lat, lng, foodLocations, numOfFood);

		});


	}


	/********************************************************************************
	****************************** Map Functions ************************************
	********************************************************************************/

	//Append the body with a script tag essential for the google maps api
	$("body").append('<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAuXTlZpy0_PBxrTVDc9p7S_XDpdX0i7po&callback=initMap"></script>');

	var map;

	//initializes map and location based off of the zipcode input
	window.initMap = function(lat, lng) {
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: new google.maps.LatLng(lat, lng),
			mapTypeId: 'roadmap'

		});
	}

	window.initEvents = function(lat, lng, locations, numOfMeetups) {
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 10,
			center: new google.maps.LatLng(lat, lng),
			mapTypeId: 'roadmap'

		});

		var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
		var icons = {
			parking: {
				icon: iconBase + 'parking_lot_maps.png'
			},
			library: {
				icon: iconBase + 'library_maps.png'
			},
			info: {
				icon: iconBase + 'info-i_maps.png'
			}
		};

		var features = [];

		for(var i = 0; i < numOfMeetups; i++) {


			features[i] = {
			position: new google.maps.LatLng(locations[i].lat, locations[i].lon),
			type: 'info',
			name: locations[i].name,
			contentString: "<div id='content'>" +
						   "<div id='siteNotice'>" + 
						   "<h5 id='firstHeading' class='firstHeading'>" + String(locations[i].name) + "</h5>" +
						   "<div id='bodyContent'>" + 
						   "<p>" + String(locations[i].description) + "</p>" +
						   "Link: <a href='" + String(locations[i].link) + "'>" + String(locations[i].link) + "</a>" + 
						   "</div>" + 
						   "</div>"
			};

		}

				// Create markers.
		features.forEach(function(feature) {


			var InfoWindow = new google.maps.InfoWindow({
				content: feature.contentString
			});


			var marker = new google.maps.Marker({
				position: feature.position,
				icon: icons[feature.type].icon,
				map: map
			});
			marker.addListener('click', function() {
				InfoWindow.open(map, marker);
			})

		
		});



		
	}

	window.initFood = function(lat, lng, locations, numOfFood) {

			map = new google.maps.Map(document.getElementById('map'), {
				zoom: 10,
				center: new google.maps.LatLng(lat, lng),
				mapTypeId: 'roadmap'

			});

			var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
			var icons = {
				parking: {
					icon: iconBase + 'parking_lot_maps.png'
				},
				library: {
					icon: iconBase + 'library_maps.png'
				},
				info: {
					icon: iconBase + 'info-i_maps.png'
				}
			};

			var features = [];

			for(var i = 0; i < numOfFood; i++) {


				features[i] = {
				position: new google.maps.LatLng(locations[i].lat, locations[i].lon),
				type: 'info',
				name: locations[i].name,
				contentString: "<div id='content'>" +
							   "<div id='siteNotice'>" + 
							   "<h5 id='firstHeading' class='firstHeading'>" + String(locations[i].name) + "</h5>" +
							   "<div id='bodyContent'>" +
							   "<p>Open: " + String(locations[i].open) + "</p>" +
							   /*"<div>" + String(locations[i].photos) + "</div>" + */
							   "</div>" +
							   "</div>"
				};

		}

		// Create markers.
		features.forEach(function(feature) {


			var InfoWindow = new google.maps.InfoWindow({
				content: feature.contentString
			});


			var marker = new google.maps.Marker({
				position: feature.position,
				icon: icons[feature.type].icon,
				map: map
			});
			marker.addListener('click', function() {
				InfoWindow.open(map, marker);
			})

		
		});



		
	}



	/********************************************************************************
	****************************** Function Calls ***********************************
	********************************************************************************/

	MainProgram();

	$(document).ajaxError(function(){
	    $(".loading").hide()
	    $("#loadError").append("<div class='alert alert-danger text-center'><strong>Oops! Something went wrong!</strong></div>");
	    setTimeout(loadError, 2000)
	    function loadError(){
	    	window.location.reload();
	    }
	});	

});
