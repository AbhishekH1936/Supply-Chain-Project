import React, { Component } from 'react';
import InvestorNavbar from './InvestorNavbar';
import Web3 from "web3";
import Scm from "../../../abis/UserData.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

class SearchCrop extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          UnFundedCrops: [],
          value:'',
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
              this.state.contract.methods 
                .getCropByCropId(this.props.match.params.publickey)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if (result !== undefined) {
                      let userData = JSON.parse(result.toString());
                      console.log("ipfs result data", userData);
                        this.setState(
                          {
                            UnFundedCrops: this.state.UnFundedCrops.concat([
                              userData,
                            ]),
                          },
                          () => {
                            console.log("res ", this.state.UnFundedCrops);
                          }
                        );
                      //}
                    }
                  });
                });
      }
    
   
    renderTableData(record, index) {
        console.log("in render table data");
        console.log(this.state.UnFundedCrops);
        return (
            
          <tr id="customers" key={record.PublicKey}>
              
            <td>
              {record.cropId}
            </td>
            <td>{record.cropType}</td>
            <td>{record.cropVariant}</td>
            <td>{record.cropDuration}</td>
            <td>{record.agroConsultantId}</td>
            <td>
              <button
                className="btn btn-danger"
                onClick={() => this.raiseFund(record)}
              >
                Raise Fund
              </button>
            </td>
          </tr>
        );
      }
      raiseFund=(record) =>{
        var r = window.confirm(
          "Are you sure you want to Raise Fund " + record.cropId + " to Crop"
        );
        if (r === true) {
          console.log("you pressed ok");
          record.fund = false;
          console.log("Crop info:  ", record);
          let signup_string = JSON.stringify(record);
    
          let ipfs_sign_up = Buffer(signup_string);
          console.log("Crop info to ipfs...");
    
          ipfs.add(ipfs_sign_up, (error, result) => {
            console.log("Ipfs result", result);
            if (error) {
              console.error(error);
              return;
            } else {
              console.log("sending hash to contract");
              this.state.contract.methods
                .updateFarmerCrops(record.cropId)
                .send({ from: this.state.account }, () => {
                  alert(record.cropId + " is now a Funded " );
                });
            }
          });
        } else {
          alert("User not verified ....! Try again") 
        }
      }
    
    render() {
        return (
            
            <div >
                <h1>ID Searched UnFunded Crops</h1>
                <div className="aabb">
               
            
                <table id="customers">
          <thead>
            <tr>
            <th>CropId</th>
                            <th>Type</th>
                            <th>Varient</th>
                            <th>Duration</th>
                            <th>Consultant</th>
                            <th>Action</th>
            </tr>
          </thead>
          <tbody>{this.state.UnFundedCrops.map(this.renderTableData)}</tbody>
        </table>
                </div>
            </div>
        );
    }
}


export default SearchCrop;