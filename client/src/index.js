import React from "react";
import ReactDOM from "react-dom";
import Login from "./components/login.js";
import Home from "./components/home.js";
import Header from "./components/header.js";
import Patients from "./components/Patients.js";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

import { HashRouter, Route } from "react-router-dom";

const root =  window.location.toString();

const routing = (

  <HashRouter basename={root}>
      <div className={"routes"}>
      <Route path="/" component={Header} />
      <Route exact path="/" component={Login} />
      <Route path="/home" component={Home} />
      <Route path={"/Patients"} component={Patients} />
    </div>
  </HashRouter>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service worskers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
