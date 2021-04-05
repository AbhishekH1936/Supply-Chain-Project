import React, { Component } from "react";
import "./Farmer.css";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class ApproveCrops extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeFundingCrops: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.finalize = this.finalize.bind(this);
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
                  if (cropData["cropStatus"] === "Waiting On Funds") {
                    this.setState(
                      {
                        activeFundingCrops: this.state.activeFundingCrops.concat(
                          [cropData]
                        ),
                      },
                      () => {
                        console.log(this.state.activeFundingCrops);
                      }
                    );
                  }
                }
              });
            });
        });
        console.log("active funding crops:", this.state.activeFundingCrops);
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
        <td>{record.cropStatus}</td>
        <td> X </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.finalize(record)}
          >
            FINALIZE
          </button>
        </td>
      </tr>
    );
  }

  finalize(cropData) {
    var r = window.confirm(
      "Are you sure you want to stop receiving funds on " + cropData.cropId
    );
    if (r === true) {
      console.log("you pressed ok");
      cropData.cropStatus = "In feild";
      let CropData = JSON.stringify(cropData);
      console.log("CropData:  ", CropData);

      let ipfs_cropData = Buffer(CropData);
      console.log("Submitting file to ipfs...");

      ipfs.add(ipfs_cropData, (error, result) => {
        console.log("Ipfs result", result);
        if (error) {
          console.error(error);
          return;
        } else {
          console.log("sending hash to contract");
          this.state.contract.methods
            .setFarmerCrops(
              this.props.match.params.publickey,
              result[0].hash,
              cropData.cropId,
              cropData.agroConsultantId,
              cropData.keyPhrase
            )
            .send({ from: this.state.account }, () => {
              alert(cropData.cropId + " will not receive any funds here after");
            });
        }
      });
    } else {
      alert("Try another crop ....!");
    }
  }

  render() {
    return (
      <div>
        <h1>
          This is the list of Proposed and Unapproved crops still open for
          funding
        </h1>
        <h1> Click on "Finalize" button to stop funding</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Crop Id</th>
              <th>Crop Variant</th>
              <th>Crop Type</th>
              <th>AgroConsultant Id</th>
              <th>Crop status</th>
              <th>Current funds</th>
              <th>Finalize</th>
            </tr>
          </thead>
          <tbody>
            {this.state.activeFundingCrops.map(this.renderTableData)}
          </tbody>
        </table>
      </div>
    );
  }
}
