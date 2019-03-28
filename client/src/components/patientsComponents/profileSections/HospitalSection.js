/**
 * Class renders hospital section of patient.
 *
 * @author Jakub Cerven
 */

import React from "react";
import InputCell from "./profileCells/InputCell";
import SectionContainer from "./SectionContainer";

class HospitalSection extends React.Component {

    constructor(props) {
        super(props);

        this.onInputChange = this.onInputChange.bind(this);
    }

    /**
     * Stores values of input fields.
     */
    onInputChange() {
        const hospitalName = document.getElementById("hospital_name").value;
        const hospitalEmail = document.getElementById("hospital_email").value;
        const hospitalPhone = document.getElementById("hospital_phone").value;

        this.props.onChange({hospitalName, hospitalEmail, hospitalPhone});
    }

    render() {
        const content = (
            <>
                <InputCell
                    field={"Name:"}
                    value={this.props.hospitalName}
                    id={"hospital_name"}
                    disabled={this.props.localHospital}
                    onChange={this.onInputChange}
                    placeholder={"(optional)"}
                />

                <InputCell
                    field={"Email:"}
                    value={this.props.hospitalEmail}
                    id={"hospital_email"}
                    disabled={this.props.localHospital}
                    onChange={this.onInputChange}
                />

                <InputCell
                    field={"Phone:"}
                    value={this.props.hospitalPhone}
                    id={"hospital_phone"}
                    disabled={this.props.localHospital}
                    onChange={this.onInputChange}
                    placeholder={"(optional)"}
                />

                <InputCell
                    field={"This is our patient:"}
                    value={this.props.localHospital}
                    id={"is_local"}
                    type={"checkbox"}
                    onChange={this.props.onHospitalClick}
                />
            </>
        );
        return (
            <SectionContainer
                title={"Hospital details"}
                content={content}
            />
        );
    }
}

export default HospitalSection;
