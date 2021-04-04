import React, { Component } from "react";
import "./AgroConsultant.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class AcceptOffer extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      record: [],
      crops: [],
      pairs: [],
    };
    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.getCropId = this.getCropId.bind(this);
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
      this.getCropId();
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
                  }
                );
              }
            });
        });

        this.state.contract.methods
          .getAgroCrops(this.props.match.params.publickey)
          .call({ from: this.state.account })
          .then((cropIds) => {
            let Ids = [...new Set(cropIds)];
            // eslint-disable-next-line array-callback-return
            Ids.map((id) => {
              this.state.contract.methods
                .getCropByCropId(id)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if (result !== undefined) {
                      let cropData = JSON.parse(result.toString());
                      // eslint-disable-next-line array-callback-return
                      this.state.record.map((entry) => {
                        if (
                          parseInt(entry.farmerKey._hex) ===
                          parseInt(cropData["keyPhrase"])
                        ) {
                          let key = parseInt(entry.agroKey._hex);
                          let obj = [key, cropData["cropId"]];
                          this.state.pairs.push(obj);
                          //this.state.record[index]["cropId"] = cropData["cropId"];
                          //console.log(this.state.pairs)
                        }
                      });
                    }
                  });
                });
            });
          });
        console.log(this.state.record);
      });
  }

  async getCropId(agroKey) {
    console.log("pairs", this.state.pairs);
  }

  renderTableData(record, index) {
    console.log("in render table data");
    console.log("pairs =",this.state.pairs);
    return (
      <tr className="active-row" key={record.agroKey}>
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
              <th>Crop Id</th>
            </tr>
          </thead>
          <tbody>{this.state.record.map(this.renderTableData)}</tbody>
        </table>
        
      </>
    );
  }
}
