var currentUser;
var ajaxResult;
var competences;
getCurrentUser();

$(document).ready(function() {
	makeWordCloud();
});

function refreshAutocomplete() {
	var dataList = jQuery("#competenceAutocomplete");
	var input = jQuery("#competenceField");
	jQuery.get("../../rest/competence/1.0/autocomplete.json", {
		prefix : input.val()
	}, function(data) {
		console.log("Got data: " + JSON.stringify(data.value));
		dataList.empty();
		data.value.sort().forEach(
				function(item) {
					dataList.append('<option value="' + item + '">' + item
							+ '</option>');
				});
	});
}

function makeWordCloud() {
	if (window.WordCloud) {
		var wordlist = competences;
		console.log(wordlist);
		var list;
		list = Object.keys(wordlist).map(function(value, index) {
			var listItem = [ value, Math.floor(1 + Math.random() * 20) ];
			return listItem;
		});
		console.log(JSON.stringify(list));
		var configuration = {
			fontFamily : 'Times, serif',
			hover : function(item, dimension, event) {
				if (item) {
					console.log('Item hovered: ' + item);
					console.log(item);
				}
			},
			click : function(item, dimension, event) {
				console.log('Item clicked: ' + item);
				craftModal(item, "person");
			},
			weightFactor : function(size) {
				return Math.log(size + 1) * 30;
			},
			list : list
		};
		WordCloud(document.getElementById('tagCloud'), configuration);
	} else {
		setTimeout(makeWordCloud(), 500);
	}
}

function addCompetence() {
	var input = document.getElementById("competenceField").value;
	var inputData = {
		name : input
	};
	$.ajax({
		type : "POST",
		url : "../../rest/competence/1.0/addCompetence/" + currentUser.id,
		data : JSON.stringify(inputData), // Sends CompetenceModel object
		contentType : "application/json",
		success : function(data) {
			if (data != null) {
				competences = data;
				makeWordCloud();
			}
		},
		failure : function(errMsg) {
			alert(errMsg);
		}
	});
}

function addUser() {
	$.ajax({
		type : "POST",
		url : "../../rest/competence/1.0/people/" + currentUser.id,
		data : JSON.stringify(currentUser), // Sends PersonModel object with
											// only id
		contentType : "application/json; charset=utf-8",
		dataType : "json",
		success : function(data) {
			if (data != null) {
				ajaxResult = data;
			}
			getCompetences();
		},
		failure : function(errMsg) {
			alert(errMsg);
		}
	});
}

function getAllUsers() {
	var users = {
		"values" : []
	};
	$.ajax({
		type : "GET",
		url : "../../rest/competence/1.0/people/",
		data : users,
		dataType : "json",
		success : function(data) {
			if (data != null) {
				ajaxResult = data;
			}
		},
		failure : function(errMsg) {
			alert(errMsg);
		}
	});
}

function getCurrentUser() {
	var user = {
		id : "",
		name : "",
		userName : ""
	};
	user.id = AJS.Data.get("remote-user-key");
	$.ajax({
		url : "../../rest/prototype/1/user/current",
		type : 'GET',
		dataType : 'json',
		async : false,
		success : function(data) {
			user.name = data.name;
			user.userName = data.displayName;
			console.log(currentUser);
			console.log(JSON.stringify(currentUser));
		}
	});
	currentUser = user;
	addUser();
}

function getCompetences() {
	$.ajax({
		type : "GET",
		url : "../../rest/competence/1.0/person/competences/" + currentUser.id,
		dataType : "json",
		success : function(data) {
			if (data != null) {
				competences = data;
				makeWordCloud();
			}
		},
		failure : function(errMsg) {
			alert(errMsg);
		}
	});
}

function craftModal(item, type) {
	if (type == "person") {
		var htmlString = item[0];
		$("#modalHeader").html(htmlString);
		var list = [];
		for ( var key in competences) {
			if (key == item[0]) {
				list = competences[key];
			}
		}
		console.log("COMPETENCES: " + JSON.stringify(ajaxResult));
		console.log("COMPETENCES: " + JSON.stringify(list));
		htmlString = "<div>" + "Endosement score: " + list.length + "</div>";
		htmlString += "<div>" + "Endosers: ";
		console.log(list[0]);
		var i = 0;
		var ajaxCall = function() {
			$.ajax({
						type : "GET",
						url : "../../rest/competence/1.0/people/" + list[i],
						dataType : "json",
						success : function(data) {
							if (data != null) {
								//console.log("SUCCESS");
								htmlString += "<a href='../../users/viewuserprofile.action?username="
										+ data.name
										+ "'>"
										+ data.name
										+ "</a>";
								// /users/viewuserprofile.action?username=USERNAME
							}
							if (list[i + 1] != null) {
								i++;
								htmlString += ", ";
								ajaxCall();
							}else{
							htmlString += "</div>";
							$("#modalContent").html(htmlString)
							var hs = "person's competence";
							$("#modalFooter").html(hs);

							AJS.dialog2("#demo-dialog").show();
						}
						},
						failure : function(errMsg) {
							alert(errMsg);
						}
					});

		}
		ajaxCall();
	}
}

function debug() {
	var users = {
		"values" : []
	};
	ajaxRequest("GET", "../../rest/competence/1.0/debug/", "", "json", "");
	setTimeout(function() {
		console.log(ajaxResult);
		console.log(JSON.stringify(ajaxResult));
		alert(JSON.stringify(ajaxResult));
	}, 2000);
}
