import React, { Component } from "react";
import "./Farmer.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class CropsStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crops: [],
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
      account_contract = await loadBlockchainData("Crops");
    })().then(() => {
      console.log(account_contract);
      this.setState({ account: account_contract[0] });
      this.setState({ contract: account_contract[1] });
      this.rendertable();
    });
  }

  async rendertable() {
    console.log("in render table");

    this.state.contract.methods
      .getFarmerCrops(this.props.match.params.publickey)
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
                  this.setState(
                    {
                      crops: this.state.crops.concat([cropData]),
                    },
                    () => {
                      console.log(this.state.crops);
                    }
                  );
                }
              });
            });
        });
        console.log("active funding crops:", this.state.crops);
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    let firstHyphen = record.cropId.indexOf("-", 44);

    return (
      <tr className="active-row" key={record.cropId}>
        <td>{record.cropId.slice(firstHyphen + 1)}</td>
        <td>{record.cropType}</td>
        <td>{record.cropVariant}</td>
        <td>{record.agroConsultantId}</td>
        <td>{record.keyPhrase}</td>
        <td>{record.cropStatus}</td>
        <td> X </td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <h1>This is the list of all crops under you account</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Crop Id</th>
              <th>Crop Variant</th>
              <th>Crop Type</th>
              <th>AgroConsultant Id</th>
              <th>Key phrase</th>
              <th>Crop status</th>
              <th>Current funds</th>
            </tr>
          </thead>
          <tbody>{this.state.crops.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
