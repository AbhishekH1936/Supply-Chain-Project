import React, { Component } from "react";
import "./main.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

export default class ViewExisting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      VerifiedData: [],
      publickey: "",
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
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

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    this.setState({ [name]: value }, () => console.log(this.state));
  };
  async rendertable() {
    console.log("in render table");
    this.state.VerifiedData = [];
    console.log("contract in unverified users :", this.state.contract);

    this.state.contract.methods
      .get_usernames()
      .call({ from: this.state.account })
      .then((users) => {
        let usernames = [...new Set(users)];
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
                  if (userData["Verified"] === "Verified") {
                    this.setState(
                      {
                        VerifiedData: this.state.VerifiedData.concat([
                          userData,
                        ]),
                      },
                      () => {
                        console.log(this.state.VerifiedData);
                      }
                    );
                    //this.state.VerifiedData.push(userData);
                  }
                }
              });
            });
        });
        console.log("unverified data:", this.state.VerifiedData);
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    console.log(this.state.VerifiedData);
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
            onClick={() => this.deleteUser(record)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }

  deleteUser(record) {
    record["Verified"] = "deleted";
    let CropData = JSON.stringify(record);
    console.log("CropData:  ", CropData);
    console.log("public key",record)

    let ipfs_record = Buffer(CropData);
    ipfs.add(ipfs_record, (error, result) => {
      if (error) {
        console.error(error);
        return;
      } else {
        console.log("sending hash to contract");
        this.state.contract.methods
          .set_signup(record.PublicKey, result[0].hash)
          .send({ from: this.state.account }, (res) => {
            if (res === false) {
              toast(record.PublicKey+" Account was deleted",{position: toast.POSITION.TOP_CENTER, className:"toast"});
            }
          });
      }
    });
  }

  render() {
    return (
      <>
        <h1> This is the list of Verified Existing Users</h1>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Uploaded Documents</th>
              <th>Remove user</th>
            </tr>
          </thead>
          <tbody>{this.state.VerifiedData.map(this.renderTableData)}</tbody>
        </table>
      </>
    );
  }
}
