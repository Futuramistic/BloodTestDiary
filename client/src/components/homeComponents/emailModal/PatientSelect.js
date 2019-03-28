import React from "react";
import styled from "styled-components";

import SearchBar from "./SearchBar";
import TitleTab from "./TitleTab";
import Label from "../../Label";
import Switch from "../../switch/Switch";
import PatientBox from "./PatientBox";
import ScrollBox from "../calendarComponents/ScrollBox";
import { WaveLoading } from "styled-spinkit";
import dateformat from "dateformat";
import TextRadioButton from "../editTest/TextRadioButton";

const Hr = styled.hr`
  border: 0;
  margin-left: 5%;
  clear: both;
  display: block;
  width: 90%;
  background-color: #839595;
  height: 1px;
`;
const Container = styled.div`
  position: relative;
  top: -20px;
  ${props => (props.direction === "left" ? "left: -0px;" : "")}
  height: 72%;
  width: ${props => (props.direction === "center" ? "100%" : "49.8%")};

  background: white;
  float: ${props => props.direction};
  ${props =>
    props.direction === "right" ? "border-left: #f5f5f5f5 1px solid;" : ""};
`;
const ShowID = styled.div`
  height: 5%;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export default class PatientSelect extends React.Component {
  state = {
    showID: true,
    patients: this.props.patients.slice(0, 30),
    selectedPatientIDs: [],
    update: false
  };

  filter = value => {
    this.setState({
      patients: this.props.patients
        .filter(
          patient =>
            patient.name.includes(value) ||
            dateformat(new Date(patient.dueDate), "d mmm yyyy").includes(value)
        )
        .slice(0, 30)
    });
  };
  render() {
    if (!this.state.updated && this.props.patients) {
      this.setState({
        updated: true,
        patients: this.props.patients.slice(0, 30)
      });
    }
    return (
      <Container direction={this.props.direction}>
        <TitleTab color="#0b999d">
          {this.props.notified
            ? "Recently notified"
            : this.props.direction === "center"
            ? `Failed to send ${this.props.stat} emails`
            : "Not notified"}
        </TitleTab>
        <br />
        <SearchBar onChange={value => this.filter(value)} />

        <ShowID
          checked={this.state.showID}
          onChange={() => this.setState({ showID: !this.state.showID })}
        >
          <Label
            style={{
              position: "relative",
              transform: "translate(0,0)",
              margin: "0rem 1rem",
              color: "rgba(0,0,0,0.7)"
            }}
          >
            Show details
          </Label>
          <Switch checked="checked" />
        </ShowID>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TextRadioButton
            text="Select all"
            checked={
              this.props.patients.every((
                patient //This is true iff all patients of that section are within selected
              ) => this.props.selected.find(p => p.id === patient.id)) &&
              this.props.patients.length !== 0
            }
            onCheck={checked => {
              if (checked) {
                this.setState({
                  selectedPatientIDs: this.props.patients.map(
                    patient => patient.id
                  )
                });
              } else {
                this.setState({
                  selectedPatientIDs: []
                });
              }
              this.props.selectAll(this.props.notified, checked);
            }}
          />
        </div>
        <Hr />
        <ScrollBox
          style={{
            width: "100%",
            height: "50%"
          }}
        >
          <br />
          {this.props.patients && this.state.updated ? (
            <>
              {this.state.patients.map(patient => (
                <PatientBox
                  failed={
                    this.props.direction === "center"
                      ? this.props.response.failedBoth.includes(patient.id)
                        ? "Failed to contact patient and hospital"
                        : this.props.response.failedHospital.includes(
                            patient.id
                          )
                        ? "Failed to contact hospital"
                        : "Failed to contact patient"
                      : false
                  }
                  key={patient.id}
                  patientName={patient.name}
                  lastReminder={patient.lastReminder}
                  patientID={patient.id}
                  dueDate={patient.dueDate}
                  showID={this.state.showID}
                  selected={this.state.selectedPatientIDs.includes(patient.id)}
                  onSelectClick={id => {
                    this.setState({
                      selectedPatientIDs: this.state.selectedPatientIDs.includes(
                        patient.id
                      )
                        ? this.state.selectedPatientIDs.filter(
                            pid => pid !== id
                          )
                        : [...this.state.selectedPatientIDs, id]
                    });
                    this.props.onSelectClick(
                      id,
                      this.state.selectedPatientIDs.includes(patient.id)
                    );
                  }}
                />
              ))}
              <div
                style={{
                  textAlign: "center",
                  opacity: "0.4",
                  fontSize: "110%"
                }}
              >
                To see more patients, use the search functionality above.
              </div>
            </>
          ) : (
            <div
              style={{
                width: "100%",

                textAlign: "center"
              }}
            >
              <WaveLoading />
              <Label
                style={{
                  position: "relative",
                  transform: "translate(0,0)",
                  margin: "auto"
                }}
              >
                Fetching patients...
              </Label>
            </div>
          )}
        </ScrollBox>
      </Container>
    );
  }
}
