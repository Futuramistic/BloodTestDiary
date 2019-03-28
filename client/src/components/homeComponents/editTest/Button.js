import styled from "styled-components";

export default styled.button`
  border: none;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.fontColor || "white"};
  text-align: center;
  text-decoration: none;
  font-size: 130%;
  border-radius: 10px;
  margin-left: 1%;
  margin-right: 1%;
  height: 44px;
  min-width: 100px;

  :hover {
    background-color: ${props => props.hoverColor};
    color: ${props => props.fontColor || "white"};
    border-radius: 10px;
  }
  outline: none;
`;