//simple express server to run frontend production build;
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "build"), {
	setHeaders: (res, filePath) => {
		if (filePath.endsWith(".html")) {
			res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
			res.setHeader("Pragma", "no-cache");
			res.setHeader("Expires", "0");
		}
	}
}));

app.get("/*", function (req, res) {
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	res.setHeader("Pragma", "no-cache");
	res.setHeader("Expires", "0");
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(3250);

