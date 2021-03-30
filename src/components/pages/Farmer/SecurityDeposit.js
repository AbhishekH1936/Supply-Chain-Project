import React, { Component } from "react";
import "./Farmer.css";
import Web3 from "web3";
import * as Utils from 'web3-utils';
import Scm from "../../../abis/Scm.json";

const publickeyRegex = RegExp(/^[0-9]+$/);

const formValid = (state) => {
  //console.log("form err:", state.publickey.length, state);
  if (state.security_deposit.length === 0) {
    return false;
  }
  return true;
};

export default class SecurityDeposit extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.getSecurityDeposit();
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

  getSecurityDeposit() {
    this.state.contract.methods
          .getSecurityDeposit()
          .call({ from: this.state.account })
          .then((balance) => {
            console.log("balance0",balance)
            this.setState({
              security_deposit_bal : parseInt(balance._hex)/1000000000000000000
            })
          })
  }

  constructor(props) {
    super(props);

    this.state = {
      security_deposit: "",
      security_deposit_bal: 0,
      formErrors: {
        security_deposit: "",
        security_deposit_bal:0
      },
    };

    this.handleChange = this.handleChange.bind(this);
    this.addSecurityDeposit = this.addSecurityDeposit.bind(this);
  }

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };
    switch (name) {
      case "security_deposit":
        formErrors.security_deposit = publickeyRegex.test(value)
          ? ""
          : "Number should be at least 1 digit";
        break;

      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  addSecurityDeposit(e) {
    e.preventDefault();
    console.log(`--SUBMITTING-- : `);

    if (formValid(this.state)) {
      console.log(this.state.account, this.state.security_deposit);
      this.state.contract.methods.setSecurityDeposit()
      .send({
        from: this.state.account,
        value: Utils.toWei(this.state.security_deposit, "ether"),
      },()=>{
        
        window.location.reload();
        console.log("reolad")
      })
    } else {
      console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
      alert("Please fill all the fields");
    }
    
  }

  withdrawSecurityDeposit() {}

  render() {
    const { formErrors } = this.state;

    return (
      <div className="wrapper_login">
        {/* {this.props.match.params.publickey}*/}
        <div className="form-wrapper_SD">
          <div className="backside">
            <h1 className="h1_login">Add Security Deposit</h1>
            
          </div>
          <br></br>
          <form onSubmit={this.handleSubmit} className="form_login" noValidate>
            <div className="publickey_login">
              <span className="label_login" htmlFor="email">
                Security Deposit
              </span>
              <h4> Current security deposit : {this.state.security_deposit_bal} ethers</h4>
              <input
                className="input_login"
                placeholder="Enter Number Of Ethers"
                type="publickey_login"
                name="security_deposit"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.security_deposit.length > 0 && (
                <span className="errorMessage_login">
                  {formErrors.security_deposit}
                </span>
              )}
            </div>

            <div className="createAccount_SD">
              <button onClick={this.addSecurityDeposit}>Deposit Ethers</button>
            </div>
            <div className="createAccount_SD1">
              <button onClick={this.withdrawSecurityDeposit}>
                Withdraw Ethers
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
