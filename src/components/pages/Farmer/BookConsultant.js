import React, { Component } from "react";
import Web3 from "web3";
import Scm from "../../../abis/Scm.json";
import "./Farmer.css";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

export default class BookConsultant extends Component {
  constructor(props) {
    super(props);

    this.state = {
      AgroConsultants: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.rendertable();
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
    console.log("web3  :", window.web3);
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    //console.log("web3:", web3);
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = Scm.networks[networkId];
    if (networkData) {
      const contract = web3.eth.Contract(Scm.abi, networkData.address);
      this.setState({ contract });
      console.log("block chain data loaded");
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }

  async rendertable() {
    console.log("in render table");

    this.state.contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((usernames) => {
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
    console.log(this.state.UnverifiedData);
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
            onClick={() => this.sendRequest}
          >
            CONSULT
          </button>
        </td>
      </tr>
    );
  }

  sendRequest(){
      
  }

  render() {
    return (
      <div>
        <h1>consultant</h1>
        <table className="styled-table-farmer">
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
