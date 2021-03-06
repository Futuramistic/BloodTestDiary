import React from "react";
import styled from "styled-components";

import RadioButton from "./RadioButton";
import Label from "../../Label";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  align-items: center;
  margin: 1rem 1rem 0 .4rem;

  & > p {
    margin-left: 5px;
  }
`;
const RadioLabel = styled(Label)`
  position: relative;
  transform: translate(0, 0);
  color: ${props => (!props.checked ? "#0d4e56" : "#0b999d")};
`;

const TextRadioButton = props => {
  return (
    <Container>
      <RadioButton checked={props.checked} onCheck={props.onCheck} />
      <RadioLabel checked={props.checked}>{props.text.charAt(0).toUpperCase() + props.text.slice(1)}</RadioLabel>
    </Container>
  );
};

export default TextRadioButton;
