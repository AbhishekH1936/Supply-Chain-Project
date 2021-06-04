import React, { Component } from "react";
import "./Farmer.css";
import QRCode from "react-qr-code";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

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
        <td>
        <QRCode
            ref={this.myRef}
            level="Q"
            style={{ width: 128 }}
            value={JSON.stringify(record)}
          />
        </td>
        <td>{record.cropId.slice(firstHyphen + 1)}</td>
        <td>{record.cropType}</td>
        <td>{record.cropVariant}</td>
        <td>{record.agroConsultantId}</td>
        <td>{record.keyPhrase}</td>
        <td>{record.cropStatus}</td>
        <td> X </td>
        <td>
          {record.quantity === undefined ? "No yeild yet" : record.quantity}
        </td>
        <td>{record.price === undefined ? "No yeild yet" : record.price}</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.addQuantity(record)}
          >
            Quantity
          </button>
        </td>
      </tr>
    );
  }

  addQuantity(crop) {
    if (crop.cropStatus === "Ready to sell") {
      if (crop.quantity === undefined) {
        let quant = parseInt(prompt("Enter the quantity of yeild in tons"));
        let price = parseInt(prompt("Enter price per ton"));
        this.state.contract.methods
          .getCropByCropId(crop.cropId)
          .call({ from: this.state.account })
          .then((ipfs_hash) => {
            ipfs.cat(ipfs_hash, (error, result) => {
              let cropData = JSON.parse(result.toString());
              cropData["quantity"] = quant;
              cropData["price"] = price;
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
                      toast(
                        crop.cropId +
                          " has been updatec with quantity of " +
                          quant,{position: toast.POSITION.TOP_CENTER, className:"toast"}
                      );
                    });
                }
              });
            });
          });
      } else {
        toast("quantity already added");
      }
    } else {
      toast(
        "You cant add yeild quantity until you reach 'Ready to sell' state"
      );
    }
  }

  render() {
    return (
      <div>
        <h1>This is the list of all crops under you account</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Qr Code</th>
              <th>Crop Id</th>
              <th>Crop Variant</th>
              <th>Crop Type</th>
              <th>AgroConsultant Id</th>
              <th>Key phrase</th>
              <th>Crop status</th>
              <th>Current funds</th>
              <th>Yeild Quantity on tons</th>
              <th>Price per ton</th>
              <th>Update Quantity of yeild</th>
            </tr>
          </thead>
          <tbody>{this.state.crops.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
