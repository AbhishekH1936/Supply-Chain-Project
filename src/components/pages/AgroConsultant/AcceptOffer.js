import React, { Component } from "react";
import "./AgroConsultant.css";
import { loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class AcceptOffer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      record: [],
    };
    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
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

    this.state.contract.methods.getAllKeyValue
      .call({ from: this.state.account })
      .then((keyValues) => {
        // eslint-disable-next-line array-callback-return
        keyValues.map((keyValue) => {
          this.state.contract.methods
            .getAgroFarmer(keyValue)
            .call({ from: this.state.account })
            .then((contractStruct) => {
              if (
                contractStruct.agroPublicKey ===
                this.props.match.params.publickey
              ) {
                this.setState(
                  {
                    record: this.state.record.concat([contractStruct]),
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
        <td>{record.farmerPublicKey}</td>
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
