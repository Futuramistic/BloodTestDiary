/**
 * 
 * @module AppointmentInfo
 * @author Alvaro Rausell
 * @version 0.0.2
 */

import styled from "styled-components";
import React from "react";

const NameDiv = styled.div`
  width: 100%;
  height: auto;
  color: #646464;
  
  font-size: 130%;
  white-space: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  margin-left: 1%;
  text-align: left;

  &:hover {
    overflow: auto;
  }

`;
export default props => {
  return <NameDiv>{props.name}</NameDiv>;
};
