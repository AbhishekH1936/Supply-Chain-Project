import React, { Component } from "react";
import {
  ipfs,
  loadWeb3,
  loadBlockchainData,
  formValid,
} from "../Web3/web3Component";

export default class RateFarmer extends Component {
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
      cropid: null,
      farmerid: null,
      question1: "0",
      question2: "0",
      question3: "0",
      question4: "0",
      question5: "0",
      formErrors: {
        cropid: "",
        farmerid: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    let len;

    if (this.state.cropid === null || this.state.farmerid === null) {
      alert("Please fill all the fields");
      return;
    }

    this.state.contract.methods
      .getCropRatings(this.state.cropid)
      .call({ from: this.state.account })
      .then((ratingHashes) => {
        let hashes = [...new Set(ratingHashes)];
        console.log("hashes of :", ratingHashes);
        len = hashes.length;
        console.log("length :", len);
        if (len !== 3) {
          alert("Please finish ratings for all the stages for this crop");
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
        this.state.contract.methods
          .getAgroCrops(this.props.match.params.publickey)
          .call({ from: this.state.account })
          .then((cropIds) => {
            let Ids = [...new Set(cropIds)];
            // eslint-disable-next-line array-callback-return
            Ids.map((id) => {
              console.log("id :", id);
              let secondHyphen = this.state.cropid.indexOf("-", 44);
              console.log("slicing", this.state.cropid.slice(0, secondHyphen));

              if (
                this.state.cropid === id &&
                this.state.farmerid === this.state.cropid.slice(0, secondHyphen)
              ) {
                cropValid = true;
              }

              console.log("cropValid :", cropValid);
            });
            if (cropValid === false) {
              alert(
                "Something is wrong with your Farmer Id or Crop Id, Please Check!"
              );
            } else {
              console.log(`--SUBMITTING-- : `);

              if (formValid(this.state)) {
                let ratingsJson = {
                  FarmerId: this.state.farmerid,
                  CropId: this.state.cropid,
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
                    this.state.contract.methods
                      .setFarmerRatings(this.state.cropid, result[0].hash)
                      .send({ from: this.state.account }, (res) => {
                        if (res === false) {
                          alert(
                            "Rating for the farmer with Farmer Id " +
                              this.state.farmerid +
                              " and crop with Crop Id " +
                              this.state.cropid +
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

  render() {
    return (
      <div className="wrapper">
        <div className="form-wrapper">
          <h1>Rate The Crop</h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="firstName">
              <label htmlFor="firstName">Enter Farmer Id</label>
              <input
                placeholder="Farmer Id"
                type="text"
                name="farmerid"
                noValidate
                onChange={this.handleChange}
              />
            </div>

            <div className="firstName">
              <label htmlFor="firstName">Enter Crop Id</label>
              <input
                placeholder="Crop Id"
                type="text"
                name="cropid"
                noValidate
                onChange={this.handleChange}
              />
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
