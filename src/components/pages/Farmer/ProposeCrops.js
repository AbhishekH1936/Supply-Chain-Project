import React, { Component } from "react";
import "./Farmer.css";
import {
  ipfs,
  loadWeb3,
  loadBlockchainData,
  formValid,
} from "../Web3/web3Component";

const publickeyRegex = RegExp(/^[0-9A-Za-z]{42}-[a-zA-Z0-9]+$/);
const cropIdRegex = RegExp(/^[a-zA-Z0-9]{6}$/);
const cropTypeRegex = RegExp(/^[a-zA-Z]+$/);
const cropVariantRegex = RegExp(/^[a-zA-Z0-9]+/);
const keyPharseRegex = RegExp(/^[0-9]{5}$/);
const fundAmountRegex = RegExp(/^[0-9]+$/);

export default class ProposeCrops extends Component {
  async componentWillMount() {
    let account_contract;
    (async function () {
      await loadWeb3();
    })();
    (async function () {
      account_contract = await loadBlockchainData();
    })().then(() => {
      console.log(account_contract);
      this.setState({ account: account_contract[0] });
      this.setState({ contract: account_contract[1] });
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      cropId: null,
      cropType: null,
      cropVariant: null,
      funding: "NO",
      cropDuration: null,
      agroConsultantId: null,
      keyPhrase: null,
      fundAmount: null,
      formErrors: {
        cropId: "",
        cropType: "",
        cropVariant: "",
        funding: "",
        cropDuration: "",
        agroConsultantId: "",
        keyPhrase: "",
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
    let contractMatch = false;
    let keyUsed = false;

    this.state.contract.methods
      .getAllKeyValue()
      .call({ from: this.state.account })
      .then((keys) => {
        let farmerPublicKey;
        let agroPublicKey;
        let farmerKey;
        let agroKey;
        // eslint-disable-next-line array-callback-return
        keys.map((key) => {
          let splitKey = key.split("*");
          // eslint-disable-next-line no-unused-vars
          farmerPublicKey = splitKey[0];
          agroPublicKey = splitKey[1];
          farmerKey = splitKey[2];
          // eslint-disable-next-line no-unused-vars
          agroKey = splitKey[3];
          console.log(
            farmerPublicKey,
            " ",
            agroPublicKey,
            " ",
            farmerKey,
            " ",
            agroKey
          );
          if (
            this.state.agroConsultantId === agroPublicKey &&
            this.state.keyPhrase === farmerKey
          ) {
            contractMatch = true;
          }
        });
        console.log("contractMatch", contractMatch);
        
      });

    this.state.contract.methods
      .getAllUsedKeys()
      .call({ from: this.state.account })
      .then((usedKeys) => {
        console.log("keys",usedKeys)
        // eslint-disable-next-line array-callback-return
        usedKeys.map((key) => {
          if(parseInt(this.state.keyPhrase) === parseInt(key._hex)){
            keyUsed = true;
          }
        })
        console.log("key New", keyUsed);
      });
      

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
            if (contractMatch && !keyUsed) {
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
                keyPhrase: this.state.keyPhrase,
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
                      this.props.match.params.publickey +
                        "-" +
                        this.state.cropId,
                      this.state.agroConsultantId,
                      this.state.keyPhrase
                    )
                    .send({ from: this.state.account }, () => {
                      alert("Crop inserted. crop Id :  " + this.state.cropId);
                    });
                }
              });
            } else {
              alert(
                "Your consultant credentials are wrong or may already be used for other crop. Please cross verify"
              );
            }
          } else {
            alert("This crop Id is not available for usage, Try another one.");
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
        formErrors.keyPhrase = keyPharseRegex.test(value)
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
    let choice = ["NO", "YES"];

    return (
      <div id="bg1">
        <div className="wrapper_crop1">
          <div className="form-wrapper_pro">
            <div className="backside_crop_pro">
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
                  type="number"
                  name="keyPhrase"
                  min="10000"
                  max="99999"
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.keyPhrase.length < 5 && (
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
