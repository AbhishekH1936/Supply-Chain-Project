import React, { Component } from "react";
import "./Farmer.css";
import * as Utils from "web3-utils";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class BookConsultant extends Component {
  constructor(props) {
    super(props);

    this.state = {
      AgroConsultants: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

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
      this.rendertable();
    });
  }

  async rendertable() {
    console.log("in render table");

    this.state.contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((users) => {
        let usernames = [...new Set(users)];
        // eslint-disable-next-line array-callback-return
        usernames.map((username) => {
          this.state.contract.methods
            .get_signup(username)
            .call({ from: this.state.account })
            .then((ipfs_hash) => {
              ipfs.cat(ipfs_hash, (error, result) => {
                if (result !== undefined) {
                  let userData = JSON.parse(result.toString());
                  console.log("ipfs result data", userData);
                  if (userData["Role"] === "AgroConsultant") {
                    this.setState(
                      {
                        AgroConsultants: this.state.AgroConsultants.concat([
                          userData,
                        ]),
                      },
                      () => {
                        console.log("res ", this.state.AgroConsultants);
                      }
                    );
                  }
                }
              });
            });
        });
        console.log("Agro consultants are :", this.state.AgroConsultants);
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    return (
      <tr className="active-row" key={record.PublicKey}>
        <td>
          {record.First_Name}&nbsp;{record.Last_Name}
        </td>
        <td>{record.PublicKey}</td>
        <td>{record.Address}</td>
        <td>{record.Email}</td>
        <td>{record.ContactNo}</td>
        <td>{record.Qualification}</td>
        <td>{record.CollegeName}</td>

        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.sendRequest(record.PublicKey)}
          >
            CONSULT
          </button>
        </td>
      </tr>
    );
  }

  sendRequest(agroPublicKey) {
    let farmerPublicKey = this.props.match.params.publickey;
    console.log("farmer pub key : ", farmerPublicKey, this.state.account);
    let sendPublicKey = farmerPublicKey.slice(0, 42);
    console.log("swndPublic key  : ", sendPublicKey);

    var r = window.confirm("Are you sure you want to consult" + agroPublicKey);
    if (r === true) {
      let farmerKey = Math.floor(Math.random() * 87000 + 12547);
      let agroKey = Math.floor(Math.random() * 87000 + 12547);
      let keyValue = farmerPublicKey +"*"+ agroPublicKey +"*"+ farmerKey +"*"+ agroKey;

      this.state.contract.methods
        .bookFarmerAgroContract(
          keyValue,
          agroPublicKey,
          farmerPublicKey,
          agroKey,
          farmerKey
        )
        .send(
          {
            from: this.state.account,
            value: Utils.toWei("0.015", "ether"),
          },
          () => {
            alert(
              "Your consultant " +
                agroPublicKey +
                "is booked and your keyPhrase is " +
                farmerKey
            );
          }
        );
    } else {
      alert("try other consultants");
    }
  }

  render() {
    return (
      <div>
        <h1>consultant</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Name</th>
              <th>Public key</th>
              <th>Address</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Qualification</th>
              <th>College Name </th>
              <th>Consult</th>
            </tr>
          </thead>
          <tbody>{this.state.AgroConsultants.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
