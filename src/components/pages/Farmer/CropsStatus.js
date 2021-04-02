import React, { Component } from "react";
import "./Farmer.css";
import Web3 from "web3";
import Scm from "../../../abis/Scm.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

export default class CropsStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      crops: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
  }

  async componentDidMount() {
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
    console.log(this.props.match.params.publickey);
    const accounts = await web3.eth.getAccounts();
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
                      crops: this.state.crops.concat([
                        cropData,
                      ]),
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
        <h1>
          This is the list of all crops under you account
        </h1>
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
          <tbody>
            {this.state.crops.map(this.renderTableData)}
          </tbody>
        </table>
      </div>
    );
  }
}
