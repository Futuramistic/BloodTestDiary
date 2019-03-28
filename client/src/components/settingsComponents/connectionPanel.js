import React, { Component } from 'react';
import styled from "styled-components";

import Cookies from 'universal-cookie';
import { getServerConnect } from '../../serverConnection';
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

const Container = styled.div`
  height: auto;
  width: 100%;
  padding-bottom: 20px;
  background: white;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;


  color: #646464;


  .connectionTitle {
    font-size: 140%;
    margin: 15px;
    margin-bottom: 5px;
  }

`;


const InputSection = styled.div`
  width: 75%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  border: solid 1px #b3b3b3;
  border-radius: 5px;
  margin: 10px;
  padding: 5px;
  padding-left: 8px;

  font-size: 120%;

  .connectionInput {
    width: 100%;
    color: #0b999d;
  }

  &:focus-within {
    border: solid 1px #0b999d;
  }

`;

const ConnectionLabel = styled.div`
  width: auto;
  margin-right: 8px;
  color: #646464;
  white-space: nowrap;
`;

const RestartLabel = styled.p`
  width: auto;
  color: #646464;
  white-space: nowrap;
  cursor: pointer;

  animation: opac 0.6s linear 1;

  &:hover {
    color: #0b999d;
  }

  @keyframes opac {
      0% {
          opacity: 0;

      }
      100% {
          opacity: 1;
      }
  }

`;

let oldIp = "";
let oldPort = "";

function refresh(serverConfig){
  ipcRenderer.send('catch_on_main', serverConfig)
  window.location.reload(true)
}

export default class ConnectionPanel extends Component {

  constructor(props){
      super(props);
      ipcRenderer.send('update')
      ipcRenderer.on('sendToRenderer', this.handleRenderer)
      this.state = {
        ip: "",
        port: ""
      };
      this.serverConnect = getServerConnect();


  }

  handleRenderer = (event, data) => {
    this.setState({
      ip: data.ip,
      port: data.port,
    }, () => {
      oldIp = this.state.ip;
      oldPort = this.state.port;
    });

  }

  handleChange = (event) => {
    event.preventDefault();
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  updateServerConfig = () => {
    const ip = this.state.ip;
    const port = this.state.port;

  }

  onSubmit = event => {
    event.preventDefault();
    let config = {ip: this.state.ip, port: this.state.port}
    refresh(config);
  }


  render(){
    return (
      <Container>
        <p className="connectionTitle" >Connection details</p>
        <InputSection>
          <ConnectionLabel>IP:</ConnectionLabel>
          <input id="ipInput" type="text" name="ip" className="connectionInput" value={this.state.ip} onChange={this.handleChange} onBlur={this.updateServerConfig}/>
        </InputSection>
        <InputSection>
          <ConnectionLabel>Port:</ConnectionLabel>
          <input id="portInput" type="text" name="port" className="connectionInput" value={this.state.port} onChange={this.handleChange} onBlur={this.updateServerConfig}/>
        </InputSection>

      {(oldIp !== this.state.ip || oldPort !== this.state.port) ?
          <RestartLabel onClick={this.onSubmit} id="restart-button">Restart now</RestartLabel>
        :
          <>
          </>
      }
      </Container>
    )
  }
}
