/**
 * This compoenent represents a single appointment box, a single test in the dashboard.
 * The box shows a status circle, name and surname of the patient and two buttons for either complete the test or edit it.
 * This compoenent also provides a handy right click menu to access more features or shortcuts.
 * 
 * This compoenent is a DRAG SOURCE. This component can be dragged and dropped in any canedar card of the dashboard, 
 * exception made for the overdue section. 
 * @module AppointmentBox
 * @author Alvaro Rausell, Jacopo Madaluni
 * @version 0.0.2
 */

import React from "react";
import styled from "styled-components";
import StatusCircle from "./StatusCircle";
import AppointmentInfo from "./AppointmentInfo";
import IconSet from "./IconSet";
import TimePill from "./TimePill";
import {getServerConnect} from "../../../serverConnection.js";
import {isPastDate} from "../../../lib/calendar-controller.js";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {openAlert} from "../../Alert.js";
import { formatDatabaseDate } from "./../../../lib/calendar-controller.js";
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import ColorPicker from "./ColorPicker";
import dateformat from "dateformat";

const serverConnect = getServerConnect();
const Container = styled.div`
  opacity: ${props => props.isDragging ? 0 : 1}
  display: block;
  position: relative;
  background-color: ${props => (props.test_colour ? props.test_colour : (props.patient_colour ? props.patient_colour : props.default_colour))};

  margin-top: 3.5%;
  margin-bottom: 3.5%;

  padding-top: 5px;
  padding-bottom: 5px;

  height: 35px;
  width: auto;
  border: solid 1px rgb(100, 100, 100, 0);
  border-radius: 3px;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  //box-shadow: 0 1px 1px rgba(0,0,0,0.16), 0 1px 1px rgba(0,0,0,0.16);


  z-index: 3;
  & .pill {
    opacity: 0;
    transition: opacity 150ms;
  }
  ${props =>
    props.tentative
      ? ``
      : `&:hover {
        border: solid 1px rgb(100, 100, 100, 0.4);
        font-weight: bold;
    }`}

  ${props =>
    props.tentative
      ? `
      & *{
        background-color: ${props => (props.tentative ? `grey` : `white`)};
        color: white!important;
        transition-property:none;

        &:hover {
          opacity:1 !important;
        }
      }
      &:hover {
        & .pill {
          opacity:1;
        }
      }

        `
      : ``}


      .status {
        margin-left: 7px;
        margin-right: 7px;
      }
      .info {
        flex-grow: 1;
        flex-shrink: 1;
        overflow: scroll;
      }
      .iconsSet {
        margin-left: 7px;
        margin-right: 7px;
      }

`;


const Test = styled.div`
  &:hover {
    background-color: red;
  }
`;

/**
 * This function asks the server to send a reminder to the patient of this test
 * @param {JSON} test 
 */
function sendReminder(test){
  let text = test.last_reminder ? `This patient was last contacted on ${dateformat(test.last_reminder, "dS mmm yyyy")}. Do you want to send another email?`
                                 : `This patient was never contacted about this test. Do you want to send an email?`;
  openAlert(text, "optionAlert",
            "No", () => {return},
            "Yes", () => {
              if (isPastDate(test.dueDate)){
                serverConnect.sendOverdueReminders(test.test_id, res => {
                  if (!res.success){
                    openAlert("An error occurred during email sending", "confirmationAlert", "Ok", () => {return});
                  }
                });
              }else{
                serverConnect.sendNormalReminders(test.test_id, res => {
                  if (!res.success){
                    openAlert("An error occurred during email sending", "confirmationAlert", "Ok", () => {return});
                  }
                });
              }
            });
}

/**
 * Right click menu component
 * @param {REACT props} props 
 */
const RightClickMenu = props => {
    return(
        <Menu id={props.id} style={{position: "absolute", zIndex: "11", fontSize: "1rem"}}>
        <Test>
           <Item onClick={() => {props.editTest(props.testId)}}>Edit</Item>
           </Test>
           <Item onClick={() => {props.editPatient(props.patientNo)}}>Patient profile</Item>
           <Separator />
           <Item disabled={props.completed} onClick={() => sendReminder(props.test)}>Send reminder</Item>
           <Separator />
           <Submenu label="Patient colour">
             <Submenu label="Choose colour">
                <ColorPicker handleError={props.handleError} id={props.patientNo} type={"patient"}/>
             </Submenu>
             <Item  onClick={() => {serverConnect.changePatientColour(props.patientNo, null, res => {if(!res.success){props.handleError(res)}})}}>Remove colour</Item>
           </Submenu>
           <Submenu label="Test colour">
             <Submenu label="Choose colour">
                <ColorPicker handleError={props.handleError} id={props.testId} type={"test"}/>
             </Submenu>
             <Item onClick={() => {serverConnect.changeTestColour(props.testId, null, res => {if(!res.success){props.handleError(res)}})}}>Remove colour</Item>
           </Submenu>

        </Menu>
    );
}

const mapping = {
    "yes":"completed",
    "no": "pending",
    "in review": "inReview"
}

// ------------------------- DRAG & DROP CONFIGURATIONS -----------------------------------
const spec = {
  beginDrag(props){
    return {
      type: 'appointment',
      test_id: props.id,
      completed_status: props.type,
      patient_name: props.name,
      dueDate: props.dueDate,
      default_colour: props.default_colour,
      patient_colour: props.patient_colour,
      test_colour: props.test_colour
    };
  },
  endDrag(props, monitor, component){
    if (monitor.didDrop()){
      const newDate = monitor.getDropResult().newDate;
      if (newDate){
        serverConnect.changeTestDueDate(props.id, monitor.getDropResult().newDate, res => {
            if (!res.success){
                props.handleError(res, "Somebody is already editing this test.")    }
        });
      }
    }
  },
  canDrag(props, monitor){
    return (props.section !== "overdue");
  }
}

function collect(connect, monitor){
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()

  }
}
// ------------------------------------------------------------

class AppointmentBox extends React.Component {
  constructor(props) {
    super(props);
    this.serverConnect = getServerConnect();
  }

  /**
   * Disappears if being dragged to only show as a drag preview
   */
  componentDidMount(){
    const {connectDragPreview} = this.props;
    if (connectDragPreview){
      connectDragPreview(getEmptyImage(), {captureDraggingState: true});
    }
  }


  formatStatus(status, date){
      if (status === "no" && isPastDate(date)){
          return "late";
      }
      if (status === "completed" || status === "inReview" || status === "late"){
         return status;
     } else {
         return mapping[status];
     }

  }

  onStatusClick = status => {
    this.serverConnect.changeTestStatus(this.props.id, status, res => {
        if (res.success){
            if (res.response.insertId != undefined){
                openAlert(`A new test was automatically scheduled on ${formatDatabaseDate(res.response.new_date)}.`, "confirmationAlert", "OK");
            }
        }else{
            this.props.handleError(res, "Somebody is already editing this test.")
        }
    });
  };

  render() {
    const {isDragging, connectDragSource} = this.props;
    const menuId = `${this.props.id}_${this.props.section}`; //MUST BE UNIQUE
    return connectDragSource(
      <div>
      <RightClickMenu 
        handleError={this.props.handleError}
        editPatient={this.props.editPatient} 
        test={this.props.test} 
        id={menuId} 
        patientNo={this.props.patient_no} 
        testId={this.props.id} 
        completed={this.props.type !== "no"} 
        openColorPicker={this.props.openColorPicker} 
        editTest={this.props.editTest}/>
      <MenuProvider id={menuId}>
        <Container default_colour={this.props.default_colour} patient_colour={this.props.patient_colour} test_colour={this.props.test_colour} isDragging={isDragging} tentative={this.props.tentative}>
          {this.props.tentative ? <TimePill status={this.props.type}>Tentative</TimePill> : ``}
          <StatusCircle
            type={this.props.tentative ? "tentative" : this.formatStatus(this.props.type,  this.props.dueDate)}
          />
          <AppointmentInfo name={this.props.name} />
          <IconSet
              onStatusClick={this.props.tentative ? () => {} : this.onStatusClick}
              editTest={this.props.editTest}
              testId={this.props.id}
              handleError={this.props.handleError}
          />

        </Container>
        </MenuProvider>

      </div>
    );
  }
}

export default DragSource("appointment", spec, collect)(AppointmentBox);
