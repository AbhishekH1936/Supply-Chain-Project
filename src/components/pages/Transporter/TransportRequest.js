import React, { Component } from 'react';
import TransporterNavbar from './TransporterNavbar';
import Web3 from "web3";
import "./Transporter.css";
import Scm from "../../../abis/UserData.json";
import * as Utils from 'web3-utils';

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

class TransportRequest extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          UnverifiedData: [],
          // rr:[
          //   {
          //       "cropId": 	"0x4322EcbD8d43421a77Ec6F0AF0E6CA866e2A3CEd-bha779",
          //       "retailerId": 	"0x4322EcbD8d43421a77Ec6F0AF0E6CA866e2A3CEd-bha776",
          //       "pkm": 5,
          //       "pkg": 5,
          //       "km": 2,
          //       "kg": 2,
          //       "status": "waiting"
          //     },
          //     {
          //       "cropId": 555,
          //       "retailerId": 999,
          //       "pkm": 7,
          //       "pkg": 7,
          //       "km": 6,
          //       "kg": 12,
          //       "status": "waiting"
          //     }
          // ],
        };
    
        this.rendertable = this.rendertable.bind(this);
        this.renderTableData = this.renderTableData.bind(this);
        this.transport = this.transport.bind(this);
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
        const accounts = await web3.eth.getAccounts();
        console.log("accounts loaded"+accounts);
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
        this.state.UnverifiedData = [];
    
        this.state.contract.methods.get_usernames
          .call({ from: this.state.account })
          .then((usernames) => {
            usernames.map((username) => {
              this.state.contract.methods
                .get_signup(username)
                .call({ from: this.state.account })
                .then((ipfs_hash) => {
                  ipfs.cat(ipfs_hash, (error, result) => {
                    if (result !== undefined) {
                      let userData = JSON.parse(result.toString());
                      if (userData["Role"] === "Transporter" && userData["PublicKey"]===this.props.match.params.publickey) {
                        this.setState(
                          {
                            UnverifiedData: this.state.UnverifiedData.concat([
                              userData,
                            ]),
                          },
                          () => {
                            console.log(this.state.UnverifiedData);
                          }
                        );
                      }
                    }
                  });
                });
            });
            console.log("unverified data:", this.state.UnverifiedData);
          });
      }
    
    //   renderTableData(record, index) {
    //     console.log("in render table data");
    //     console.log(this.state.UnverifiedData);
    //     return (
    //       <tr className="active-row" key={record.PublicKey}>
    //         <td>{record.PublicKey}</td>
    //         <td>{record.PublicKey}</td>
    //         <td>{record.Role}</td>
    //         <td>{record.Status}</td>
    //         <td>{record.c1pkm*parseInt(record.km)+record.c1pkg*parseInt(record.kg)}</td>
    //         <td>
    //           <button
    //             className="btn btn-danger"
    //             onClick={() => this.transport(record)}
    //           >
    //             Transport
    //           </button>
    //         </td>
    //       </tr>
    //     );
    //   }

      renderTableData(record, index) {
        console.log("in render table data");
        console.log("--------",record);
        return (
          <tr className="active-row" key={record.PublicKey}>
            <td>{record.PublicKey}</td>
            {/* <td>{record.retailerId}</td>
            <td>{record.km}</td>
            <td>{record.kg}</td> 
            <td>{record.pkm*parseInt(record.km)+record.pkg*parseInt(record.kg)}</td>*/}
            <td>{record.status}</td>
            
            <td>
              <button
                className="btn btn-danger"
                onClick={() => this.transport(record,(record.pkm*parseInt(record.km)+record.pkg*parseInt(record.kg)))}
              >
                Transport
              </button>
            </td>
          </tr>
        );
      }
    
      transport(record,ethers) {

        console.log("record in Transport Request :", record);
        console.log("record in Transport Request :", this.state.account);

    // var allseeds = specialization.split(",");

    // var seed_name_entered = prompt("enter seed name");
    // allseeds.forEach((val) => {
    //   var brace_index = val.indexOf("(");
    //   var close_brace = val.indexOf(")");
    //   if (seed_name_entered === val.slice(0, brace_index)) {
    //     var x = specialization.indexOf(seed_name_entered);
    //     x = x + seed_name_entered.length;
    //     var brace_index1 = specialization.indexOf("(", x);
    //     var close_brace2 = specialization.indexOf(")", x);

    //     var price = parseInt(
    //       specialization.slice(close_brace + 2, close_brace + 3)
    //     );

    //     var available_quantity = parseInt(
    //       specialization.slice(brace_index1 + 1, close_brace2)
    //     );
    //     var quantity_entered = parseInt(
    //       prompt(
    //         "enter the quantity (Available quantity = " +
    //           available_quantity +
    //           ")"
    //       )
    //     );

    //     if (quantity_entered <= available_quantity) {
    //       var updated_specialization = specialization.replace(
    //         "" + available_quantity,
    //         "" + available_quantity - quantity_entered
    //       );
    //       alert(updated_specialization);
    //       console.log("upadted record : ", record);
    //       record["Specialisation"] = updated_specialization;
    //       console.log("upadted record : ", record);
          record.status="Transported";
          let string = JSON.stringify(record);

          let ipfs_modified = Buffer(string);
          console.log("Submitting file to ipfs...");

          ipfs.add(ipfs_modified, (error, result) => {
            console.log("Ipfs result", result);
            if (error) {
              console.error(error);
              return;
            } else {
              console.log("sending hash to contract");
              this.state.contract.methods
                .set_signup(this.props.match.params.publickey, result[0].hash)
                .send({ from: this.state.account }, (res) => {
                  console.log("resultttt :", res);

                  var x = record.cropId.indexOf("-");
                  var dkey = record.cropId.slice(0, x);

                  var y = record.retailerId.indexOf("-");
                  var tkey = record.retailerId.slice(0, y);

                  console.log("Distributer key  : ", dkey, "   Transporter key   :", tkey);
                  console.log(
                    "ethers",
                    ethers
                  );

                  console.log("accounts  :", this.state.account);
                  const web3 = window.web3;

                  // web3.eth.sendTransaction({
                  //   from: dkey,
                  //   to: this.state.account,
                  //   value: Utils.toWei("" + ethers, "ether"),
                  // });
                });
            }
          });
    //     } else {
    //       alert("Please enter the value less than or equal to avilable value");
    //     }
    //   }
    // });
        // console.log(`--SUBMITTING-- : `);
        // console.log(this.state.account, this.state.security_deposit);
        // this.state.contract.methods.setSecurityDeposit()
        // .send({
        //   from: this.state.account,
        //   value: Utils.toWei(ethers, "ether"),
        // },()=>{
          
        //   window.location.reload();
        //   console.log("reolad")
        // })
        //=======================================================

        // var r = window.confirm(
        //   "Are you sure you want to add " + userData.PublicKey + " in the network"
        // );
        // if (r === true) {
        //   console.log("you pressed ok");
        //   userData.Verified = "Verified";
        //   console.log("Signup info:  ", userData);
        //   let signup_string = JSON.stringify(userData);
    
        //   let ipfs_sign_up = Buffer(signup_string);
        //   console.log("Submitting file to ipfs...");
    
        //   ipfs.add(ipfs_sign_up, (error, result) => {
        //     console.log("Ipfs result", result);
        //     if (error) {
        //       console.error(error);
        //       return;
        //     } else {
        //       console.log("sending hash to contract");
        //       this.state.contract.methods
        //         .set_signup(userData.PublicKey, result[0].hash)
        //         .send({ from: this.state.account }, () => {
        //           alert(userData.First_Name + " " +userData.Last_Name +" is now a legit user" );
        //         });
        //     }
        //   });
        // } else {
        //   alert("User not verified ....! Try again") 
        // }
      }
    
      render() {
        return (
          <>
            <h1> Available Transports </h1>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Transporter Id</th>
                  {/* <th>Retailer key</th>
                  <th>Km</th>
                  <th>Kg</th>
                  
                  <th>Totpayment</th> */}
                  <th>status</th>
                  <th>Transport</th>
                </tr>
              </thead>
              {/* <tbody>{this.state.UnverifiedData.map(this.renderTableData)}</tbody> */}
              <tbody>{this.state.UnverifiedData.map(this.renderTableData)}</tbody>
            </table>
          </>
        );
      }
}

export default TransportRequest;