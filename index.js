const express = require("express");
const axios = require("axios");
const port = process.env.PORT || 8080;

const config = require("./config");

const { clientID, clientSecret } = config;

const app = express();
app.set("view engine", "ejs");
app.listen(port, function() {
	console.log(`listening to port ${port}`);
});

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/projects", (req, res) => {
	var jiraId = req.query.id;
	var accessToken = req.query.at;
	var appUrl = "https://api.atlassian.com/ex/jira/" + jiraId + "/rest/api/3/project?expand=lead,description";
	var config = {
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	console.log(`jiraId ${jiraId}`);
	console.log(`accessToken ${accessToken}`);
	axios
		.get(appUrl, config)
		.then(function(response) {
			console.log(`project response ${response.data}`);
			console.log(`response2 ${JSON.stringify(response.data)}`);
			res.render("project", {
				response: response.data
			});
		})
		.catch(function(error) {
			console.log(`project ERROR:  ${error}`);
		});
});

app.get("/api/accessible-resources", (req, res) => {
	const accessToken = req.query.at;
	let config = {
		headers: {
			Authorization: "Bearer " + accessToken
		}
	};
	axios
		.get("https://api.atlassian.com/oauth/token/accessible-resources", config)
		.then(function(response) {
			console.log(`accessible-resources response ${response.data}`);
			console.log(`response2 ${JSON.stringify(response.data)}`);
			console.log(`response ID ${JSON.stringify(response.data[0].id)}`);
			res.render("object", {
				response: response.data,
				accessToken: accessToken
			});
		})
		.catch(function(error) {
			console.log(`accessible-resources ERROR:  ${error}`);
		});
});

app.get("/oauth/redirect", (req, res) => {
	const requestToken = req.query.code;
	console.log("requestToken " + requestToken);
	const data = {
		grant_type: "authorization_code",
		client_id: clientID,
		client_secret: clientSecret,
		code: requestToken,
		redirect_uri: "http://localhost:8080/oauth/redirect"
	};
	axios
		.post("https://auth.atlassian.com/oauth/token", data)
		.then(function(response) {
			const accessToken = response.data.access_token;
			console.log(`accessToken ${accessToken}`);
			res.render("welcome", {
				accessToken: accessToken
			});
		})
		.catch(function(error) {
			console.log(error);
		});
});
