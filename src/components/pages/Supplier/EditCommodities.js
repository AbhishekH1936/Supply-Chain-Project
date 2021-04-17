import React, { Component } from "react";
import "./Supplier.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class EditCommodities extends Component {
  constructor(props) {
    super(props);

    this.state = {
      specialization: [],
      record: null,
      commodity_name: null,
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.removeCommodity = this.removeCommodity.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addCommodity = this.addCommodity.bind(this);
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

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;

    this.setState({ [name]: value }, () => console.log(this.state));
  };
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

  addCommodity(e) {
    e.preventDefault();
    if (
      !(
        this.state.commodity_name === "" ||
        this.state.commodity_name === null ||
        this.state.commodity_name.length < 0
      )
    ) {
      console.log(`--ADDING COMMODITY-- : `);

      let array = this.state.specialization;
      array.push(this.state.commodity_name);
      let supplierModified = this.state.record;
      supplierModified["Specialisation"] = array.join(",")

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
            .set_signup(this.props.match.params.publickey, result[0].hash)
            .send({ from: this.state.account }, (res) => {
              if (res === false) {
                alert(this.state.commodity_name + " added to commodity list");
              }
            });
        }
      });
    } else {
      alert("Please enter proper commodity name");
    }
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

        <div>
          <div className="wrapper_supplier">
            <div className="form-wrapper_pro">
              <h1>Add Commodity</h1>
              <form className="form_login" noValidate>
                <div className="publickey_login">
                  <input
                    className="input_login"
                    placeholder="Enter Commodity Name"
                    type="publickey_login"
                    name="commodity_name"
                    noValidate
                    onChange={this.handleChange}
                  />
                </div>

                <br />
                <br />
                <br />
                <div className="createAccount_SD">
                  <button onClick={this.addCommodity}>Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
