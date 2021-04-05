import React, { Component } from "react";

import {
  ipfs,
  loadWeb3,
  loadBlockchainData,
  formValid,
} from "../Web3/web3Component";

export default class RateCrops extends Component {
  async componentWillMount() {
    let account_contract_ratings;
    let account_contract_crops;
    (async function () {
      await loadWeb3();
    })();

    (async function () {
      account_contract_crops = await loadBlockchainData("Crops");
    })().then(() => {
      console.log(account_contract_crops);
      this.setState({ account: account_contract_crops[0] });
      this.setState({ crops_contract: account_contract_crops[1] });
    });

    (async function () {
      account_contract_ratings = await loadBlockchainData("Ratings");
    })().then(() => {
      console.log(account_contract_ratings);
      this.setState({ ratings_contract: account_contract_ratings[1] });
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      cropid: null,
      stage: "Pre-Harvest",
      question1: "0",
      question2: "0",
      question3: "0",
      question4: "0",
      question5: "0",
      formErrors: {
        cropid: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let len;
    if(this.state.cropid === null){
      alert("Please fill all the fields");
      return;
    }

    this.state.ratings_contract.methods
      .getCropRatings(this.state.cropid)
      .call({ from: this.state.account })
      .then((ratingHashes) => {
        let hashes = [...new Set(ratingHashes)];
        console.log("hashes of :",ratingHashes);
        len = hashes.length;
        console.log("length :", len);
        if (len === 0) {
          if (this.state.stage !== "Pre-Harvest") {
            alert(
              "You have not submitted ratings for Pre-Harvest Stage, Please submit rating for Pre-Harvest Stage"
            );
            return;
          }
         
          
        } else if (len === 1) {
          if (this.state.stage !== "Harvest") {
            alert(
              "You have already submitted ratings for Pre-Harvest Stage, Please submit rating for Harvest Stage"
            );
            return;
          }
          
          
        } else if (len === 2) {
          if (this.state.stage !== "Post-Harvest") {
            alert(
              "You have already submitted ratings for Harvest Stage, Please submit rating for Post-Harvest Stage"
            );
            return;
          }
         
          
        } else if (len > 2) {
          alert("You have submitted ratings for all Stages");
          return;
        }

        if (
          this.state.question1 === "0" ||
          this.state.question2 === "0" ||
          this.state.question3 === "0" ||
          this.state.question4 === "0" ||
          this.state.question5 === "0"
        ) {
          alert("Please answer all the questions");
          return;
        }

        let cropValid = false;
        this.state.crops_contract.methods
          .getAgroCrops(this.props.match.params.publickey)
          .call({ from: this.state.account })
          .then((cropIds) => {
            let Ids = [...new Set(cropIds)];
            // eslint-disable-next-line array-callback-return
            Ids.map((id) => {
              console.log("id :", id);
              if (this.state.cropid === id) {
                cropValid = true;
              }
            });
            if (cropValid === false) {
              alert(
                "CropId " +
                  this.state.cropid +
                  " is not under your consultation"
              );
            } else {
              console.log(`--SUBMITTING-- : `);

              if (formValid(this.state)) {
                let ratingsJson = {
                  Crop_Id: this.state.cropid,
                  Crop_Stage: this.state.stage,
                  Question1: this.state.question1,
                  Question2: this.state.question1,
                  Question3: this.state.question1,
                  Question4: this.state.question1,
                  Question5: this.state.question1,
                };
                console.log("ratingsJson:  ", ratingsJson);
                let ratingsJson_string = JSON.stringify(ratingsJson);

                let ipfs_ratingsJson = Buffer(ratingsJson_string);
                console.log("Submitting file to ipfs...");

                ipfs.add(ipfs_ratingsJson, (error, result) => {
                  console.log("Ipfs result", result);
                  if (error) {
                    console.error(error);
                  } else {
                    console.log("sending hash to contract");
                    this.state.ratings_contract.methods
                      .setCropRatings(this.state.cropid, result[0].hash)
                      .send({ from: this.state.account }, (res) => {
                        if (res === false) {
                          alert(
                            "Crop Rating for "+
                            this.state.cropid+
                            " and stage "+
                            this.state.stage+
                            " is submitted"
                          );
                        }
                      });
                  }
                });
              } else {
                console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
                alert("Please fill all the fields");
              }
            }
          });
      });
  };

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };
    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  setRatingStage = (e) => {
    this.setState(
      {
        stage: e.target.value,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  render() {
    const { formErrors } = this.state;
    const choice = ["Pre-Harvest", "Harvest", "Post-Harvest"];

    return (
      <div className="wrapper">
        <div className="form-wrapper">
          <h1>Rate The Crop</h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="firstName">
              <label htmlFor="firstName">Enter Crop Id</label>
              <input
                className={formErrors.cropid.length > 0 ? "error" : null}
                placeholder="Crop Id"
                type="text"
                name="cropid"
                noValidate
                onChange={this.handleChange}
              />
            </div>
            <div className="cropVariant">
              <span className="label_crop" htmlFor="password_login">
                Select Crop Life Cycle Stage : {this.state.stage}
              </span>
              <select
                id="dropdown-basic-button"
                title="Select your choice"
                onChange={this.setRatingStage}
              >
                {choice.map((eachRole) => (
                  <option value={eachRole} key={eachRole}>
                    {eachRole}
                  </option>
                ))}
              </select>
            </div>

            <div className="c_storage">
              <label className="l1">Question 1 </label>
              <div>
                <input
                  className="l2"
                  type="radio"
                  value="1"
                  name="question1"
                  onChange={this.handleChange}
                />{" "}
                1
                <input
                  className="l2"
                  type="radio"
                  value="2"
                  name="question1"
                  onChange={this.handleChange}
                />{" "}
                2
                <input
                  className="l2"
                  type="radio"
                  value="3"
                  name="question1"
                  onChange={this.handleChange}
                />{" "}
                3
                <input
                  className="l2"
                  type="radio"
                  value="4"
                  name="question1"
                  onChange={this.handleChange}
                />{" "}
                4
                <input
                  className="l2"
                  type="radio"
                  value="5"
                  name="question1"
                  onChange={this.handleChange}
                />{" "}
                5
              </div>
            </div>
            <div className="c_storage">
              <label className="l1">Question 2 </label>
              <div>
                <input
                  className="l2"
                  type="radio"
                  value="1"
                  name="question2"
                  onChange={this.handleChange}
                />{" "}
                1
                <input
                  className="l2"
                  type="radio"
                  value="2"
                  name="question2"
                  onChange={this.handleChange}
                />{" "}
                2
                <input
                  className="l2"
                  type="radio"
                  value="3"
                  name="question2"
                  onChange={this.handleChange}
                />{" "}
                3
                <input
                  className="l2"
                  type="radio"
                  value="4"
                  name="question2"
                  onChange={this.handleChange}
                />{" "}
                4
                <input
                  className="l2"
                  type="radio"
                  value="5"
                  name="question2"
                  onChange={this.handleChange}
                />{" "}
                5
              </div>
            </div>
            <div className="c_storage">
              <label className="l1">Question 3 </label>
              <div>
                <input
                  className="l2"
                  type="radio"
                  value="1"
                  name="question3"
                  onChange={this.handleChange}
                />{" "}
                1
                <input
                  className="l2"
                  type="radio"
                  value="2"
                  name="question3"
                  onChange={this.handleChange}
                />{" "}
                2
                <input
                  className="l2"
                  type="radio"
                  value="3"
                  name="question3"
                  onChange={this.handleChange}
                />{" "}
                3
                <input
                  className="l2"
                  type="radio"
                  value="4"
                  name="question3"
                  onChange={this.handleChange}
                />{" "}
                4
                <input
                  className="l2"
                  type="radio"
                  value="5"
                  name="question3"
                  onChange={this.handleChange}
                />{" "}
                5
              </div>
            </div>
            <div className="c_storage">
              <label className="l1">Question 4 </label>
              <div>
                <input
                  className="l2"
                  type="radio"
                  value="1"
                  name="question4"
                  onChange={this.handleChange}
                />{" "}
                1
                <input
                  className="l2"
                  type="radio"
                  value="2"
                  name="question4"
                  onChange={this.handleChange}
                />{" "}
                2
                <input
                  className="l2"
                  type="radio"
                  value="3"
                  name="question4"
                  onChange={this.handleChange}
                />{" "}
                3
                <input
                  className="l2"
                  type="radio"
                  value="4"
                  name="question4"
                  onChange={this.handleChange}
                />{" "}
                4
                <input
                  className="l2"
                  type="radio"
                  value="5"
                  name="question4"
                  onChange={this.handleChange}
                />{" "}
                5
              </div>
            </div>
            <div className="c_storage">
              <label className="l1">Question 5 </label>
              <div>
                <input
                  className="l2"
                  type="radio"
                  value="1"
                  name="question5"
                  onChange={this.handleChange}
                />{" "}
                1
                <input
                  className="l2"
                  type="radio"
                  value="2"
                  name="question5"
                  onChange={this.handleChange}
                />{" "}
                2
                <input
                  className="l2"
                  type="radio"
                  value="3"
                  name="question5"
                  onChange={this.handleChange}
                />{" "}
                3
                <input
                  className="l2"
                  type="radio"
                  value="4"
                  name="question5"
                  onChange={this.handleChange}
                />{" "}
                4
                <input
                  className="l2"
                  type="radio"
                  value="5"
                  name="question5"
                  onChange={this.handleChange}
                />{" "}
                5
              </div>
            </div>
            <div className="createAccount">
              <button type="submit">Submit Ratingt</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}