/**
 * This compoenent represents the left column of the main dashboard.
 * This section shows all the outstanding tests in the database, sorted from most overdue
 * to least overdue.
 * @module overduePatients
 * @author Alvaro Rausell, Jacopo Madaluni
 * @version 0.0.2
 */

import React from "react";
import styled from "styled-components";

import WeekDaySection from "./calendarComponents/WeekDaySection";
import ScrollBox from "./calendarComponents/ScrollBox";
import AppointmentSection from "./calendarComponents/AppointmentSection";
import Icon from "./calendarComponents/Icon";
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";

const Wrapper = styled.div`
  border: #839595 0px solid;

  margin-right: 1%;

  padding-top: 10px;
  padding-bottom: 0.5%;
  padding-left: 0.5%;
  padding-right: 0.5%;


  background-color: white;

  min-width: 15rem;
  width: 20vw;
  max-width: 320px;

  overflow: hidden;

  flex-grow: 1;
  flex-shrink: 2;
  align-self: stretch;

  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
 
`;

const Container = styled.div`
  margin: 3px;
  padding: 0;
  width: auto;
  height: 100%;
  overflow: hidden;
`;

const ScrollBoxCustom = styled(ScrollBox)`
  ::-webkit-scrollbar:vertical {
      display: initial;
    }
`;

class OverduePatients extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      notificationNumber: props.notificationNumber,
      appointments: props.anytimeAppointments
    };
  }

  render() {
    return (
      <>
      <Wrapper>
        <Container>
          <WeekDaySection
            notificationNumber={
              this.props.notificationNumber
                ? this.props.notificationNumber
                : "0"
            }
            dayName={"Outstanding"}
          >
            <Tooltip title="Send overdue test reminders" position="top" trigger="mouseenter">
              <Icon
                icon="envelope"
                onClick={this.props.openEmailModal}
                style={{
                  position: "absolute",
                  transform: "translate(-50%,-50%)",
                  right: "2%",
                  top: "50%"
                }}
              />
            </Tooltip>
          </WeekDaySection>
          <ScrollBoxCustom>
              {this.props.anytimeAppointments.map( group => {
                  if(group.tests.length !== 0){
                      return (
                          <AppointmentSection
                              key={group.class}
                              type = {group.class}
                              section={"overdue"}
                              color = {"rgb(255,226,102, 0.8)"}
                              appointments = {group.tests}
                              editTest={this.props.editTest}
                              editPatient={this.props.editPatient}
                              handleError={this.props.handleError}
                          />
                      )
                }
            })}
            <div style={{ width: "100%", height: "45px" }} />
          </ScrollBoxCustom>
        </Container>
      </Wrapper>  
      </>
    );
  }
}
export default OverduePatients;
