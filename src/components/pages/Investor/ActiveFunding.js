import React, { Component } from 'react';
import Web3 from "web3";
import * as Utils from 'web3-utils';
import Scm from "../../../abis/Crops.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});


const formValid = (state) => {
  //console.log("form err:", state.publickey.length, state);
  if (state.security_deposit.length === 0) {
    return false;
  }
  return true;
};

class ActiveFunding extends Component {
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

    
        this.state.contract.methods.getAllCropId
          .call({ from: this.state.account })
          .then((usernames) => {
            // eslint-disable-next-line array-callback-return
            let new_usernames=[...new Set(usernames)];
            new_usernames.map((username) => {
              this.state.contract.methods 
                .getCropByCropId(username)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if (result !== undefined) {
                      let userData = JSON.parse(result.toString());
                      console.log("ipfs result data", userData);
                      if (userData["cropStatus"] === "Funding Activated") {
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
                      }
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
      console.log("in pubk"+this.props.publickey);
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
            <td>{record.fundAmount}</td>
            <td>{record.funded}</td>
            <td>{record.investors}</td>
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

      // raiseFund=(record) =>{
      //   var r = window.confirm(
      //     "Are you sure you want to Raise Fund " + record.cropId + " to Crop"
          
      //   );
      //   if (r === true) {
      //     console.log("you pressed ok");
      //     var amt = parseInt(prompt("What's the amount you want to invest",0));

      //     console.log("Crop info:  ", record);
      //     let signup_string = JSON.stringify(record);
      //     //let string1 = JSON.stringify(record.cropId);
      //     var x = record.cropId.indexOf("-");
      //     //var dkey = record.cropId.slice(0, x);
      //     let farmer_id = record.cropId.slice(0, x);

      //     let xamt = parseInt(amt);
      //     if(xamt<record.fundAmount){
            
      //           //this.raiseInvestment(farmer_id,amt);
      //     }else{
      //         var r = window.alert("Total amount exceeded max required!!");
      //     }
          
      //     console.log("999999999");
      //     record.cropDuration=55;
      //     record.funded= 100;
      //     record.investors="kkk";
      //       console.log(this.state.account, xamt);
      //       console.log("00000", record.investors,record.funded);
          
      //     console.log(signup_string);
    
      //     let ipfs_sign_up = Buffer(signup_string);
      //     console.log("Crop info to ipfs...");
    
      //     ipfs.add(ipfs_sign_up, (error, result) => {
      //       console.log("Ipfs result", result);
      //       if (error) {
      //         console.error(error);
      //         return;
      //       } else {
      //         console.log("sending hash to contract");
      //         alert("Updating investor info to "+ record.cropId  );
      //         this.state.contract.methods
      //         .setFarmerCrops(
      //           this.props.match.params.publickey,
      //           result[0].hash,
      //           record.cropId,
      //             record.agroConsultantId,
      //             record.keyPhrase
      //         )
      //         .send({ from: this.state.account }, () => {
      //           alert("Funding is activated for "+ record.cropId  );
      //         });
      //       }
      //     });
      //   } else {
      //     alert("User not verified ....! Try again") 
      //   }
      // }

      raiseFund=(record) =>{
        var r = window.confirm(
          "Are you sure you want to Raise Fund " + record.cropId + " to Crop"
        );
        /**/
        
        
        if (r === true) {
          console.log("you pressed ok");
          console.log("you pressed ok");
              var amt = parseInt(prompt("What's the amount you want to invest",0));
    
              console.log("Crop info:  ", record);
              let signup_string = JSON.stringify(record);
              //let string1 = JSON.stringify(record.cropId);
              var x = record.cropId.indexOf("-");
              //var dkey = record.cropId.slice(0, x);
              let farmer_id = record.cropId.slice(0, x);
    
              let xamt = parseInt(amt);
              if(xamt<record.fundAmount){
                console.log("999999999");
              record.funded+= amt;
              record.investors="\n"+this.props.match.params.publickey+"="+amt;
                console.log(this.state.account, xamt);
                console.log("00000", record.investors,record.funded);
                  this.raiseInvestment(farmer_id,amt);
                  console.log(signup_string);
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
              }else{
                  var r = window.alert("Total amount exceeded max required!!");
              }
              
              
              
          
        } else {
          alert("Start funding for this crop ....!");
        }
      }

      getInvestment() {
        this.state.contract.methods
              .getSecurityDeposit()
              .call({ from: this.state.account })
              .then((balance) => {
                console.log("balance0",balance)
                this.setState({
                  security_deposit_bal : parseInt(balance._hex)/1000000000000000000
                })
              })
      }

      raiseInvestment=(fid,ethers) =>{
        console.log(`--SUBMITTING-- : `);
        const web3 = window.web3;
        web3.eth.sendTransaction({
          from: this.state.account,
          to: fid,
          value: Utils.toWei("" + ethers, "ether"),
        });
  
          // console.log(this.state.account, this.state.security_deposit);
          // this.state.contract.methods.setInvestorInvestment()
          // .send({
          //   from: this.state.account,
          //   value: Utils.toWei(ethers, "ether"),
          // },()=>{
            
          //   window.location.reload();
          //   console.log("reolad")
          // })
        
      }
    
    render() {
        return (
            
            <div >
                <h1>Active Fundings</h1>
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
                            <th>MaxFund</th>
                            <th>FundAmount</th>
                            <th>Ivestors+Investment</th>
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

export default ActiveFunding;