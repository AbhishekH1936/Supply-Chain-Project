import React, { Component } from "react";
import Web3 from "web3";
import "./AgroConsultant.css";
import Scm from "../../../abis/Scm.json";

export default class AcceptOffer extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
             record :[]
        }
        this.rendertable = this.rendertable.bind(this);
        //this.renderTableData = this.renderTableData.bind(this);
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
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    console.log("web3:", web3);
    const accounts = await web3.eth.getAccounts();
    console.log("accounts", accounts);
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

  async rendertable() {
    console.log("in render table");

    this.state.contract.methods.getAllKeyValue
      .call({ from: this.state.account })
      .then((keyValues) => {
        // eslint-disable-next-line array-callback-return
        keyValues.map((keyValue) => {
            //console.log(keyValue);
          this.state.contract.methods
            .getAgroFarmer(keyValue)
            .call({ from: this.state.account })
            .then((contractStruct) => {
              //console.log("contractStrct", contractStruct);
              /*console.log("agro pub", contractStruct.agroPublicKey);
              console.log("farmer pub", contractStruct.farmerPublicKey);
              console.log("agro key", parseInt(contractStruct.agroKey));
              console.log("farmer pub", parseInt(contractStruct.farmerKey));*/
              if (contractStruct.agroPublicKey === this.props.match.params.publickey) {
                this.setState(
                  {
                    record: this.state.record.concat([
                      contractStruct,
                    ]),
                  },
                  () => {
                    console.log(this.state.record);
                  }
                );
              }
            });
        });
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    return (
      <tr className="active-row" key={record.farmerPublicKey}>
        <td>
          {record.farmerPublicKey}
        </td>
        <td>{parseInt(record.agroKey)}</td>
      </tr>
    );
  }

  render() {
    return (
      <>
        <h1> These are your current customers</h1>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Farmer/ Customer Public Key</th>
              <th>Your key Phrase</th>
            </tr>
          </thead>
          <tbody>{this.state.record.map(this.renderTableData)}</tbody>
        </table>
      </>
    );
  }
}
