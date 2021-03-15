import React, { Component } from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";
import "./login.css";
import Scm from "../../../abis/Scm.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});
//https://gateway.ipfs.io/ipfs/

const publickeyRegex = RegExp(/^[0-9A-Za-z]{42}-[a-zA-Z0-9]+$/);

const passRegex = RegExp(
  // eslint-disable-next-line no-useless-escape
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
);

const formValid = (state) => {
  //console.log("form err:", state.publickey.length, state);
  if (state.publickey.length === 0 || state.password.length === 0) {
    return false;
  }
  return true;
};

export default class login extends Component {
  async componentWillMount() {
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
      password: "",
      publickey: "",
      role: "Farmer",
      filled: false,
      formErrors: {
        password: "",
        publickey: "",
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("login submitting");
    if (formValid(this.state)) {
      console.log("sdcsc");

      if (this.state.role === "Governing Authority") {
        this.state.contract.methods
          .validateAdmindetails(this.state.publickey, this.state.password)
          .call({ from: this.state.account })
          .then((valid) => {
            if (valid) {
              this.props.history.push(`/main/GoverningAuthority`);
            } else {
              alert("You are not authorized");
            }
          });
      } else {
        this.state.contract.methods.get_usernames
          .call({ from: this.state.account })
          .then((r) => {
            console.log("User  :", r, "length", r.length);
          });

        console.log("public key", this.state.publickey);

        this.state.contract.methods
          .match_usernames(this.state.publickey)
          .call({ from: this.state.account })
          .then((r) => {
            console.log("username match :", r);

            if (r) {
              // fetch record from ipfs and compare password and role
              this.state.contract.methods
                .get_signup(this.state.publickey)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  console.log("hash from solidity", ipfs_hash);
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if(result === undefined){
                      alert("There is an issue with your credentials");
                      return
                    }
                    let userData = JSON.parse(result.toString());
                    console.log("ipfs result", userData);
                    if (
                      this.state.publickey === userData["PublicKey"] &&
                      this.state.password === userData["Password"] &&
                      this.state.role === userData["Role"]
                    ) {
                      if(userData["Verified"] === "not verified"){
                        alert("Your credentials are right, but you are still not verified")
                      }else{
                        this.props.history.push(`/main/${this.state.role}`);
                      }
                      
                    } else {
                      alert(
                        "Credentials submitted do not match to any legit record"
                      );
                    }
                  });
                });
            } else {
              alert(`${this.state.publickey} doesn't have an account`);
            }
          });
      }
    } else {
      console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
      alert("Please fill all the fields");
    }
  };

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };
    switch (name) {
      case "publickey":
        formErrors.publickey = publickeyRegex.test(value)
          ? ""
          : "Please enter proper username in the excpected format";
        break;

      case "password":
        formErrors.password = passRegex.test(value)
          ? ""
          : "password format not correct";
        break;

      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  setRole = (e) => {
    console.log(e, "c dsczxd ");
    this.setState(
      {
        role: e.target.value,
      },
      () => {
        console.log(this.state);
      }
    );
  };

  render() {
    const { formErrors } = this.state;
    let roles = [
      "Farmer",
      "Agro Consultant",
      "Seller",
      "Distributor",
      "Storage",
      "Transporter",
      "retailer",
      "Investor",
      "Governing Authority",
    ];

    return (
      <div className="wrapper_login">
        <div className="form-wrapper_login">
          <div className="backside">
            <h1 className="h1_login">Login</h1>
          </div>
          <br></br>
          <form onSubmit={this.handleSubmit} className="form_login" noValidate>
            <div className="publickey_login">
              <span className="label_login" htmlFor="email">
                Username
              </span>
              <input
                className="input_login"
                placeholder="Enter Public key-username"
                type="publickey_login"
                name="publickey"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.publickey.length > 0 && (
                <span className="errorMessage_login">
                  {formErrors.publickey}
                </span>
              )}
            </div>

            <div className="password_login">
              <span htmlFor="password_login">Password</span>
              <input
                className="input_login"
                placeholder={`Enter your password for ${this.state.publickey}`}
                type="password_login"
                name="password"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.password.length > 0 && (
                <span className="errorMessage_login">
                  {formErrors.password}
                </span>
              )}
            </div>
            <div className="d-flex">
              <span className="label_login" htmlFor="password_login">
                Your Role : {this.state.role}
              </span>
              <select
                id="dropdown-basic-button"
                title="Select your role"
                variant="dark"
                onChange={this.setRole}
              >
                {roles.map((eachRole) => (
                  <option value={eachRole} key={eachRole}>
                    {eachRole}
                  </option>
                ))}
              </select>
            </div>
            <div className="createAccount_login">
              <button disabled={this.state.filled} type="submit">
                Login Through This Public Key
              </button>
              <Link to={{ pathname: "/" }}>
                <small>Don't Have an Account?</small>
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
