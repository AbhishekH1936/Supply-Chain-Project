import React, { Component } from "react";
import "./main.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

export default class UnverifiedUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      UnverifiedData: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.acceptUser = this.acceptUser.bind(this);
  }

  async componentWillMount() {
    let account_contract;
    (async function () {
      await loadWeb3();
    })();
    (async function () {
      account_contract = await loadBlockchainData("UserData");
    })().then(() => {
      console.log(account_contract);
      this.setState({ account: account_contract[0] });
      this.setState({ contract: account_contract[1] });
      this.rendertable();
    });
    
  }

  async rendertable() {
    console.log("in render table");
    this.state.UnverifiedData = [];

    this.state.contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((usernames) => {
        
        console.log("User  :", usernames);
        // eslint-disable-next-line array-callback-return
        usernames.map((username) => {
          this.state.contract.methods
            .get_signup(username)
            .call({ from: this.state.account })
            .then((ipfs_hash) => {
              //console.log("hash from solidity", ipfs_hash);
              ipfs.cat(ipfs_hash, (error, result) => {
                if (result !== undefined) {
                  let userData = JSON.parse(result.toString());
                  //console.log("ipfs result", userData);
                  if (userData["Verified"] === "not verified") {
                    this.setState(
                      {
                        UnverifiedData: this.state.UnverifiedData.concat([
                          userData,
                        ]),
                      },
                      () => {
                        console.log(this.state.UnverifiedData);
                      }
                    );
                    //this.state.UnverifiedData.push(userData);
                  }
                }
              });
            });
        });
        console.log("unverified data:", this.state.UnverifiedData);
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    console.log(this.state.UnverifiedData);
    return (
      <tr className="active-row" key={record.PublicKey}>
        <td>
          {record.First_Name}&nbsp;{record.Last_Name}
        </td>
        <td>{record.PublicKey}</td>
        <td>{record.Role}</td>
        <td>
          <a
            href={record.Document}
            // eslint-disable-next-line react/jsx-no-target-blank
            target="_blank"
          >
            View Documents
          </a>
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.acceptUser(record)}
          >
            CONFIRM
          </button>
        </td>
      </tr>
    );
  }

  acceptUser(userData) {
    var r = window.confirm(
      "Are you sure you want to add " + userData.PublicKey + " in the network"
    );
    if (r === true) {
      console.log("you pressed ok");
      userData.Verified = "Verified";
      console.log("Signup info:  ", userData);
      let signup_string = JSON.stringify(userData);

      let ipfs_sign_up = Buffer(signup_string);
      console.log("Submitting file to ipfs...");

      ipfs.add(ipfs_sign_up, (error, result) => {
        console.log("Ipfs result", result);
        if (error) {
          console.error(error);
          return;
        } else {
          console.log("sending hash to contract");
          this.state.contract.methods
            .set_signup(userData.PublicKey, result[0].hash)
            .send({ from: this.state.account }, () => {
              toast(
                userData.First_Name +
                  " " +
                  userData.Last_Name +
                  " is now a legit user",{position: toast.POSITION.TOP_CENTER, className:"toast"}
              );
            });
        }
      });
    } else {
      toast("User not verified ....! Try again");
    }
  }

  render() {
    return (
      <>
        <h1> This is the list of Unverified Users</h1>
        <h1> Click on "Verify" button to add users to network</h1>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Public key</th>
              <th>Role</th>
              <th>Uploaded Docuements</th>
              <th>Verify User</th>
            </tr>
          </thead>
          <tbody>{this.state.UnverifiedData.map(this.renderTableData)}</tbody>
        </table>
      </>
    );
  }
}
