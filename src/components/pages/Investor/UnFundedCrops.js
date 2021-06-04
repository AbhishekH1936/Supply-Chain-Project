import React, { Component } from 'react';
import InvestorNavbar from './InvestorNavbar';
import Web3 from "web3";
import Scm from "../../../abis/Crops.json";
import Scm1 from "../../../abis/UserData.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

class UnFundedCrops extends Component {
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
        const networkData1 = Scm1.networks[networkId];
        if (networkData) {
          const contract = web3.eth.Contract(Scm.abi, networkData.address);
          this.setState({ contract });
          const contract1 = web3.eth.Contract(Scm1.abi, networkData1.address);
          this.setState({ contract1 });
          console.log("block chain data loaded");
        } else {
          window.alert("Smart contract not deployed to detected network.");
        }
      }
    
      async rendertable() {
        console.log("in render table");

    
        this.state.contract.methods.getAllCropId
          .call({ from: this.state.account })
          .then((usernames) => {
            // eslint-disable-next-line array-callback-return
            let new_usernames = [...new Set(usernames)];
            new_usernames.map((username) => {
              this.state.contract.methods 
                .getCropByCropId(username)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if (result !== undefined) {
                      let userData = JSON.parse(result.toString());
                      console.log("ipfs result data", userData);
                      //if (userData["Role"] === "AgroConsultant") {
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
            });
            console.log("Un Funded Crops are :", this.state.UnFundedCrops);
          });
      }
      handleChange =(event) => {
        this.setState({value: event.target.value});
      }
      handleSubmit= (event)=> {
        this.props.history.push('/SearchCrop/'+this.state.value);
        event.preventDefault();
      }
   
    renderTableData(record, index) {
        console.log("in render table data"+record);
        console.log(this.state.UnFundedCrops);
        return (
          <tr id="customers" key={record.PublicKey}>
            <td>
              {record.cropId}
            </td>
            <td>{record.cropType}</td>
            <td>{record.cropVariant}</td>
            <td>{record.cropDuration}</td>
            <td>{record.cropStatus}</td>
            <td>
              <button
                className="btn btn-danger"
                onClick={() =>
                   
                  this.raiseFund(record)}
              >
                Activate Funding
              </button>
            </td>
          </tr>
        );
      }

      raiseFund=(record) =>{
        var r = window.confirm(
          "Are you sure you want to Raise Fund " + record.cropId + " to Crop"
        );
        /**/
        
        
        if (r === true) {
          console.log("you pressed ok");
          record.fund = false;
          record.cropStatus = "Funding Activated";
          /*var new1 = ;
          if(new1<=record.maxRequired){
            record.fundAlloted = new1;
          }*/
          let CropData = JSON.stringify(record);
          console.log("CropData:  ", CropData);
    
          let ipfs_cropData = Buffer(CropData);
          console.log("Submitting file to ipfs...");
    
          ipfs.add(ipfs_cropData, (error, result) => {
            console.log("Ipfs result", result);
            if (error) {
              console.error(error);
              return;
            } else {
              console.log("Latest Status"+record.cropStatus);
              this.state.contract.methods
                .setFarmerCrops(
                  this.props.match.params.publickey,
                  result[0].hash,
                  record.cropId,
                  record.agroConsultantId,
                  record.keyPhrase
                  
                )
                .send({ from: this.state.account }, () => {
                  alert("Funding is activated for "+ record.cropId  );
                });
            }
          });
        } else {
          alert("Start funding for this crop ....!");
        }
      }
          
          
    
    render() {
        return (
            
            <div >
                <h1>UnFunded Crops</h1>
                <div className="aabb">
                <div className="publickey_login">
                <div className="searchForm">
                
                <form onSubmit={this.handleSubmit}>
                <input
                className="input_login"
                placeholder="Search Crop by Id"
                type="publickey_login"
                name="publickey"
                noValidate
                onChange={this.handleChange}/>
                </form>
                </div>
                  
              
            </div>
            
                <table id="customers">
          <thead>
            <tr>
            <th>CropId</th>
                            <th>Type</th>
                            <th>Varient</th>
                            <th>Duration</th>
                            <th>AgroConsultant</th>
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

export default UnFundedCrops;