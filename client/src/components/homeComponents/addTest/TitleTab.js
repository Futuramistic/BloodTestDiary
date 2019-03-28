import React from "react";
import styled from "styled-components";
import Label from "../../Label";

const TitleDiv = styled.div`
  width: 100%;
  height: ${props => props.height || "12%"};
  background: white;
  background: ${props => props.color || `#0d4e56`};
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  white-space: nowrap;
`;

const TitleLabel = styled(Label)`
  position: absolute;
  top: 60%;
  left: 50%;
  color: white;
  font-size: 280%;
`;

export default props => {
  return (
    <>
      <TitleDiv color={props.color} height={props.height}>
        <TitleLabel>{props.children}</TitleLabel>
      </TitleDiv>
    </>
  );
};
