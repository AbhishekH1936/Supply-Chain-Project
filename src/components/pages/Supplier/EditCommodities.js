import React, { Component } from "react";
import "./Supplier.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class EditCommodities extends Component {
  constructor(props) {
    super(props);

    this.state = {
      specialization: [],
      record: null,
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.removeCommodity = this.removeCommodity.bind(this);
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

    this.state.userData_contract.methods
      .get_signup(this.props.match.params.publickey)
      .call({ from: this.state.account })
      .then((userDetailsHash) => {
        ipfs.cat(userDetailsHash, (error, result) => {
          if (result !== undefined) {
            let userDetails = JSON.parse(result.toString());
            console.log("ipfs result data", userDetails["Specialisation"]);
            this.setState(
              {
                specialization: userDetails["Specialisation"].split(","),
                record: userDetails,
              },
              () => {
                console.log(this.state.specialization);
              }
            );
          }
        });
      });
  }

  renderTableData(value, index) {
    console.log("in render table data");
    return (
      <tr className="active-row" key={value}>
        <td>{value}</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() =>
              this.removeCommodity(value, this.props.match.params.publickey)
            }
          >
            Remove Commodity
          </button>
        </td>
      </tr>
    );
  }

  removeCommodity(value, username) {
    var r = window.confirm(
      "Are you sure you want to remove " + value + " from commodity list"
    );
    if (r === true) {
      let supplierModified = this.state.record;
      let array = supplierModified["Specialisation"].split(",");
      let alteredArray = array.filter((item, index) => {
        return value !== item;
      });
      supplierModified["Specialisation"] = alteredArray.join(",");
      console.log("object", supplierModified);
      let string = JSON.stringify(supplierModified);

      let ipfs_modified = Buffer(string);
      console.log("Submitting file to ipfs...");

      ipfs.add(ipfs_modified, (error, result) => {
        console.log("Ipfs result", result);
        if (error) {
          console.error(error);
          return;
        } else {
          console.log("sending hash to contract");
          this.state.userData_contract.methods
            .set_signup(username, result[0].hash)
            .send({ from: this.state.account }, (res) => {
              if (res === false) {
                alert(value + " removed from the commodity list");
              }
            });
        }
      });
    }
  }

  render() {
    return (
      <div>
        <h1>List of Commodities</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Commodity Name</th>
              <th>Remove Commodity</th>
            </tr>
          </thead>
          <tbody>{this.state.specialization.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
