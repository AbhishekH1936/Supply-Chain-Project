import React, { Component } from "react";
import "./Farmer.css";
import Web3 from "web3";
import Scm from "../../../abis/Scm.json";

const publickeyRegex = RegExp(/^[0-9A-Za-z]{42}-[a-zA-Z0-9]+$/);
const cropIdRegex = RegExp(/^[a-zA-Z0-9]{6}$/);
const cropTypeRegex = RegExp(/^[a-zA-Z]+$/);
const cropVariantRegex = RegExp(/^[a-zA-Z0-9]+/);
const keyPharseRegex = RegExp(/^[0-9]{5}$/);
const fundAmountRegex = RegExp(/^[0-9]+$/);

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

const formValid = ({ formErrors, ...rest }) => {
  let valid = true;

  // validate form errors being empty
  Object.values(formErrors).forEach((val) => {
    val.length > 0 && (valid = false);
  });

  // validate the form was filled out
  Object.values(rest).forEach((val) => {
    val === null && (valid = false);
  });

  return valid;
};

export default class ProposeCrops extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    console.log("web3:", web3);
    console.log(this.props.match.params.publickey);
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Scm.networks[networkId];
    if (networkData) {
      const contract = web3.eth.Contract(Scm.abi, networkData.address);
      this.setState({ contract });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      cropId: null,
      cropType: null,
      cropVariant: null,
      funding: false,
      cropDuration: null,
      agroConsultantId: null,
      keyPharse: null,
      fundAmount: null,
      formErrors: {
        cropId: "",
        cropType: "",
        cropVariant: "",
        funding: "",
        cropDuration: "",
        agroConsultantId: "",
        keyPharse: "",
        fundAmount: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getInputFunding = this.getInputFunding.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "crop form submitting",
      this.props.match.params.publickey + "-" + this.state.cropId
    );

    this.state.contract.methods
      .match_cropId(this.props.match.params.publickey + "-" + this.state.cropId)
      .call({ from: this.state.account })
      .then((match) => {
        console.log("cropId match", match);
        if (formValid(this.state)) {
          let status = "Waiting On Funds";
          if (this.state.funding === "NO") {
            status = "In feild";
          }
          if (!match) {
            let crop_info = {
              cropId:
                this.props.match.params.publickey + "-" + this.state.cropId,
              cropType: this.state.cropType,
              cropVariant: this.state.cropVariant,
              funding: this.state.funding,
              cropDuration: this.state.cropDuration,
              agroConsultantId: this.state.agroConsultantId,
              cropStatus: status,
              FarmerPublicKey: this.props.match.params.publickey,
              keyPharse: this.state.keyPharse,
              fundAmount: this.state.fundAmount,
            };

            console.log("crop info:  ", crop_info);
            let crop_string = JSON.stringify(crop_info);

            let ipfs_crop = Buffer(crop_string);
            console.log("Submitting file to ipfs...");

            ipfs.add(ipfs_crop, (error, result) => {
              console.log("Ipfs result", result);
              if (error) {
                console.error(error);
                alert(
                  "contact administrator, IPFS is down, Error message : ",
                  error
                );
                return;
              } else {
                console.log("sending crop hash to contract");
                this.state.contract.methods
                  .setFarmerCrops(
                    this.props.match.params.publickey,
                    result[0].hash,
                    this.props.match.params.publickey + "-" + this.state.cropId
                  )
                  .send({ from: this.state.account }, () => {
                    alert("Crop inserted. crop Id :  " + this.state.cropId);
                  });
              }
            });
          } else {
            alert("This crop Id is not available for usage, Try another one");
            return;
          }
        } else {
          console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
          alert("Please fill all the fields");
        }
      });
  };

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case "cropId":
        formErrors.cropId = cropIdRegex.test(value)
          ? ""
          : "invalid crop Id, should be exactly 6 alphanumeric characters";
        break;

      case "cropType":
        formErrors.cropType = cropTypeRegex.test(value)
          ? ""
          : "invalid crop Type";
        break;

      case "cropVariant":
        formErrors.cropVariant = cropVariantRegex.test(value)
          ? ""
          : "invalid crop Variant";
        break;

      case "agroConsultantId":
        formErrors.agroConsultantId = publickeyRegex.test(value)
          ? ""
          : "invalid username";
        break;

      case "keyPhrase":
        formErrors.keyPharse = keyPharseRegex.test(value)
          ? ""
          : "Enter 5 digit number";
        break;

      case "fundAmount":
        formErrors.fundAmount = fundAmountRegex.test(value)
          ? ""
          : "Enter in ethers properly";
        break;

      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  setfundingChoice = (e) => {
    this.setState(
      {
        funding: e.target.value,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  getInputFunding = (e) => {
    if (this.state.funding === "YES") {
      return (
        <>
          <span className="label_crop" htmlFor="cropDuration">
            What is the maximum funding you want ? (enter in ethers)
          </span>
          <input
            className="input_crop"
            placeholder="Enter fund amount"
            type="number"
            name="fundAmount"
            noValidate
            onChange={this.handleChange}
          />
          {this.state.formErrors.fundAmount.length > 0 && (
            <span className="errorMessage_cropDuration">
              {this.state.formErrors.fundAmount}
            </span>
          )}
        </>
      );
    }
  };

  render() {
    const { formErrors } = this.state;
    let choice = ["YES", "NO"];

    return (
      <div id="bg1">
        <div className="wrapper_crop1">
          <div className="form-wrapper_pro">
            <div className="backside_crop">
              <h1 className="h1_crop">New Crop Details</h1>
              <h6>
                {" "}
                (look in instructions page for directions regarding feild's
                expected value format)
              </h6>
            </div>
            <br></br>
            <form onSubmit={this.handleSubmit} className="form_crop" noValidate>
              <div className="cropId">
                <span className="label_crop" htmlFor="cropId">
                  Enter Id
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter cropId"
                  type="text"
                  name="cropId"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.cropId.length > 0 && (
                  <span className="errorMessage_cropId">
                    {formErrors.cropId}
                  </span>
                )}
                <p className="label_1" htmlFor="cropId">
                  Final Crop Id : {this.props.match.params.publickey}-
                  {this.state.cropId}
                </p>
              </div>

              <div className="cropType">
                <span className="label_crop" htmlFor="cropType">
                  Enter Crop Type
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter cropType"
                  type="text"
                  name="cropType"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.cropType.length > 0 && (
                  <span className="errorMessage_cropType">
                    {formErrors.cropType}
                  </span>
                )}
              </div>

              <div className="cropVariant">
                <span className="label_crop" htmlFor="cropVariant">
                  Crop Variant of {this.state.cropType}
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter cropVariant"
                  type="text"
                  name="cropVariant"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.cropVariant.length > 0 && (
                  <span className="errorMessage_cropVariant">
                    {formErrors.cropVariant}
                  </span>
                )}
              </div>

              <div className="cropVariant">
                <span className="label_crop" htmlFor="password_login">
                  Funding Required : {this.state.funding}
                </span>
                <select
                  id="dropdown-basic-button"
                  title="Select your choice"
                  onChange={this.setfundingChoice}
                >
                  {choice.map((eachRole) => (
                    <option value={eachRole} key={eachRole}>
                      {eachRole}
                    </option>
                  ))}
                </select>
              </div>
              <br></br>
              <div className="agroConsultantId">{this.getInputFunding()}</div>

              <div className="agroConsultantId">
                <span className="label_crop" htmlFor="cropDuration">
                  Estimated Crop Duration in months (1 to 60)
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter cropDuration"
                  type="number"
                  name="cropDuration"
                  min="1"
                  max="60"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.cropDuration.length > 0 && (
                  <span className="errorMessage_cropDuration">
                    {formErrors.cropDuration}
                  </span>
                )}
              </div>

              <div className="cropDuration">
                <span className="label_crop" htmlFor="agroConsultantId">
                  Agro - ConsultantId
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter agroConsultantId"
                  type="text"
                  name="agroConsultantId"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.agroConsultantId.length > 0 && (
                  <span className="errorMessage_agroConsultantId">
                    {formErrors.agroConsultantId}
                  </span>
                )}
              </div>

              <div className="cropDuration">
                <span className="label_crop" htmlFor="agroConsultantId">
                  Your Key Phrase
                </span>
                <input
                  className="input_crop"
                  placeholder="Enter agroConsultantId"
                  type="text"
                  name="keyPhrase"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.agroConsultantId.length > 0 && (
                  <span className="errorMessage_agroConsultantId">
                    {formErrors.agroConsultantId}
                  </span>
                )}
              </div>

              <div className="createAccount_crop">
                <button type="submit">Announce this crop</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
