import React, { Component } from "react";
import "./Farmer.css";
import * as Utils from "web3-utils";
import { loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

const amountRegex = RegExp(/^[0-9]+$/);

const formValid = (state) => {
  if (state.security_deposit.length === 0) {
    return false;
  }
  return true;
};

export default class SecurityDeposit extends Component {
  async componentWillMount() {
    let account_contract;
    (async function () {
      await loadWeb3();
    })();
    (async function () {
      account_contract = await loadBlockchainData("SecurityDeposit");
    })().then(() => {
      console.log(account_contract);
      this.setState({ account: account_contract[0] });
      this.setState({ contract: account_contract[1] });
      this.getSecurityDeposit();
    });
  }

  getSecurityDeposit() {
    this.state.contract.methods
      .getSecurityDeposit()
      .call({ from: this.state.account })
      .then((balance) => {
        console.log("balance0", balance);
        this.setState({
          security_deposit_bal: parseInt(balance._hex) / 1000000000000000000,
        });
      });
  }

  constructor(props) {
    super(props);

    this.state = {
      security_deposit: "",
      security_deposit_bal: 0,
      formErrors: {
        security_deposit: "",
        security_deposit_bal: 0,
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
        formErrors.security_deposit = amountRegex.test(value)
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
      this.state.contract.methods.setSecurityDeposit().send(
        {
          from: this.state.account,
          value: Utils.toWei(this.state.security_deposit, "ether"),
        },
        () => {
          window.location.reload();
          console.log("reolad");
        }
      );
    } else {
      console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
      toast("Please fill all the fields");
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
              <h4>
                {" "}
                Current security deposit : {
                  this.state.security_deposit_bal
                }{" "}
                ethers
              </h4>
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
            
          </form>
        </div>
      </div>
    );
  }
}
