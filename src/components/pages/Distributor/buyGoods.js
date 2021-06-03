import React, { Component } from "react";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import * as Utils from "web3-utils";

export default class buyGoods extends Component {
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
    await this.loadBlockchainData();
  }

  async rendertable() {
    console.log("in render table");

    this.state.contract.methods
      .getAllCropId()
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
                  if (cropData["cropStatus"] === "Ready to sell") {
                    this.setState(
                      {
                        crops: this.state.crops.concat([cropData]),
                      },
                      () => {
                        console.log(this.state.crops);
                      }
                    );
                  }
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
        <td>{record.cropStatus}</td>
        <td> X </td>
        <td>
          {record.quantity === undefined ? "No yeild yet" : record.quantity}
        </td>
        <td>{record.price === undefined ? "No yeild yet" : record.price}</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.buyGoods(record /*,record.kg, record.km*/)}
          >
            Buy this crops
          </button>
        </td>
      </tr>
    );
  }

  async loadBlockchainData(contract) {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts });
    console.log("contract name", contract);
  }

  buyGoods(cropData) {
    let quant = parseInt(prompt("Enter the quantity you want to buy"));
    var cond = window.confirm(
      "are you sure u want to buy it for "+
      (quant * cropData.price) + " ethers"
    );
    if (cond === true && cropData.quantity - quant >= 0) {
      let newCropQuant = cropData.quantity - quant;
      cropData["quantity"] = newCropQuant;
      let CropData = JSON.stringify(cropData);
      console.log("CropData:  ", CropData);

      let ipfs_cropData = Buffer(CropData);
      ipfs.add(ipfs_cropData, (error, result) => {
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
              const web3 = window.web3;

              web3.eth.sendTransaction({
                from: this.state.accounts[0],
                to: cropData.cropId.slice(0, 42),
                value: Utils.toWei("" + quant * cropData.price, "ether"),
              });
              alert(
                "You bought " +
                  cropData.cropId +
                  " for " +
                  quant * cropData.price+" ethers"
              );
            });
        }
      });
    } else {
      alert("Your requested quantity is more than, available quantity");
    }
  }

  render() {
    return (
      <div>
        <h1>This is the list of all crops for sale</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Crop Id</th>
              <th>Crop Variant</th>
              <th>Crop Type</th>
              <th>AgroConsultant Id</th>
              <th>Crop status</th>
              <th>Current funds</th>
              <th>Quanity to sell</th>
              <th>Price per ton</th>
              <th>Buy Goods</th>
            </tr>
          </thead>
          <tbody>{this.state.crops.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
