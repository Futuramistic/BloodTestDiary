import React, { Component } from 'react';

import '../styles/header.css';

import minimize from "../resources/images/minimize.png"
import maximize from "../resources/images/maximize.png"
import close from "../resources/images/close.png"
import settings from "../resources/images/settings.png"
import OfflineScreen from "./OfflineScreen.js";
import SettingsPanel from "./SettingsPanel.js";
import {openAlert} from "./Alert.js";
import {getServerConnect} from "../serverConnection.js";

import Alert from "./Alert.js"


class Header extends Component {
  constructor(props){
      super(props);
      this.serverConnect = getServerConnect();
      this.state = {
          disabled: true,
          currentPage: undefined,
          admin: undefined,
      }
      this.serverConnect.setOnConnect( () => {
         this.setState({disabled: false});
      });
      this.serverConnect.setOnDisconnect( () => {
         this.setState({disabled: true});
      });
      this.serverConnect.setOnRoomJoin(room => {
         this.setPage(room);
      });
  }

  logout = () => {
    this.serverConnect.logout(res => {
      this.props.history.replace("");
    });
  };

  handleInvalidResponseError = (res, error) => {
    if (res.errorType === "authentication") {
      openAlert(
        "Authentication failed.",
        "confirmationAlert",
        "Go back to login",
        () => {
          this.logout();
        }
      );
    } else {
      openAlert(
        `${error ? error : "Unknown error occurred."}`,
        "confirmationAlert",
        "OK",
        () => {
          return;
        }
      );
    }
  };

  /**
  * @param {String} room : possible rooms: login_page, main_page, patients_page
  */
  setPage = room => {
     this.setState({currentPage: room});
     if (room !== "login_page"){
        this.initUserInfo();
     }
  }

  initUserInfo = () => {
    this.serverConnect.getCurrentUser(res => {
        if (res.success){
          if(res.response[0].isAdmin === "yes"){
            this.setState({admin: true});
          }else{
            this.setState({admin: false});
          }
        }
      });
  }


  safeClose = event => {
      this.serverConnect.logout(res=>{return});
  }

  render() {
    return (
    <>
      <header id="titlebar">
          <div id="window-title">
            <span>Blood Test Diary</span>
          </div>
           <div id="window-controls">
               <div className="dropdown">
                   <div className="button" id="settings-button">
                       <img className={"headerIcon"} src={settings} alt={"Settings Button"}/>
                   </div>
                   <div className="dropdown-content">
                    <SettingsPanel handleError={this.handleInvalidResponseError} isAdmin={this.state.admin} currentPage={this.state.currentPage}/>
                  </div>
               </div>
               <div className="button" id="min-button">
                   <img className={"headerIcon"} src={minimize} alt={"Minimize Button"}/>
               </div>
              <div className="button" id="max-button">
                  <img className={"headerIcon"} src={maximize} alt={"Maximize Button"}/>
              </div>
              <div className="button" id="close-button">
                  <img onClick={this.safeClose} className={"headerIcon"} src={close} alt={"Close Button"}/>
              </div>
          </div>
      </header>
      <OfflineScreen disabled = {this.state.disabled}/>
      <Alert/>
      </>
    );
  }
}

export default Header;
