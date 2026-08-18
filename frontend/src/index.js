import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { unregister } from './serviceWorker';  // Unregister ServiceWorker to prevent stale build caching

import App from "./App";

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		window.finishProgress();
	}
);

// Desregistrar o service worker para forçar atualização em tempo real
unregister();
