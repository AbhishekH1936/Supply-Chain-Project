import React, { Component } from "react";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class BuySupplies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      Suppliers: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  async componentWillMount() {
    let account_contract_userdata;

    (async function () {
      await loadWeb3();
    })();

    (async function () {
      account_contract_userdata = await loadBlockchainData("UserData");
    })().then(() => {
      console.log(account_contract_userdata);
      this.setState({ account: account_contract_userdata[0] });
      this.setState({ userData_contract: account_contract_userdata[1] });
      this.rendertable();
    });
  }

  async rendertable() {
    console.log("in render table");

    this.state.userData_contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((users) => {
        let usernames = [...new Set(users)];
        // eslint-disable-next-line array-callback-return
        usernames.map((username) => {
          this.state.userData_contract.methods
            .get_signup(username)
            .call({ from: this.state.account })
            .then((ipfs_hash) => {
              ipfs.cat(ipfs_hash, (error, result) => {
                if (result !== undefined) {
                  let userData = JSON.parse(result.toString());
                  console.log("ipfs result data", userData);
                  if (userData["Role"] === "Supplier") {
                    this.setState(
                      {
                        Suppliers: this.state.Suppliers.concat([userData]),
                      },
                      () => {
                        console.log("res ", this.state.Suppliers);
                      }
                    );
                  }
                }
              });
            });
        });
        console.log("Suppliers are :", this.state.Suppliers);
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
        <td>{record.Specialisation}</td>

        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.sendRequest(record.PublicKey)}
          >
            Buy
          </button>
        </td>
      </tr>
    );
  }

  sendRequest() {
    
  }

  render() {
    return (
      <div>
        <h1>Suppliers</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Name</th>
              <th>Public key</th>
              <th>Address</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Specialisation</th>
              <th>Buy</th>
            </tr>
          </thead>
          <tbody>{this.state.Suppliers.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
