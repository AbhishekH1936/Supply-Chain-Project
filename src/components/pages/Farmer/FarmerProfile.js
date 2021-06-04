import React, { Component } from "react";
import { Link } from "react-router-dom";
//import "./style.css";
import { storage } from "../../Firebase";
import {
  ipfs,
  loadWeb3,
  loadBlockchainData,
  formValid,
} from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

class FarmerProfile extends Component {
    async componentWillMount() {
      let account_contract;
      (async function () {
        await loadWeb3();
        
      })().then(() =>{
      
      });
      (async function () {
        account_contract = await loadBlockchainData("UserData");
      })().then(() => {
        
        console.log("account :",account_contract[0]);
        console.log("contract :",account_contract[1]);
        this.setState({ account: account_contract[0] });
        this.setState({ contract: account_contract[1] });
        this.fetchUserDetails();
      });
    }
  
    constructor(props) {
      super(props);
  
      this.state = {
        userName: "",
        publickey: "",
        address : "",
        contactno :"",
        email : "",
        document : "",
      };
      
    }
    fetchUserDetails() {
      console.log(this.props.match.params.publicKey);
      this.state.contract.methods
        .get_signup(this.props.match.params.publickey)
        .call({ from: this.state.account })
        .then((ipfs_hash) => {
          console.log("hash from solidity", ipfs_hash);
          ipfs.cat(ipfs_hash, (error, result) => {
            if (result === undefined) {
              toast("There is an issue with your credentials");
              return;
            }
            let userData = JSON.parse(result.toString());
            console.log("ipfs result", userData);
            this.setState({
              userName: userData.First_Name + " " + userData.Last_Name,
              publickey: userData.PublicKey,
              address : userData.Address,
              contactno : userData.ContactNo,
              email : userData.Email,
              document : userData.Document,

            });
          });
        });
    }
  
   
  
    render() {
      
  
      return (
        <div class="wrapper_pro">
          <div className="form-wrapper_pro_head">
          <h1> Farmer Profile Page </h1>
          </div>
        <div className="form-wrapper_pro">
          
          <div>
            <h1>Farmer Name : {this.state.userName}</h1>
          </div>
          <div>
            <h1>Pulic Key: {this.state.publickey}</h1>
          </div>
          <div>
            <h1>Address : {this.state.address}</h1>
          </div>
          <div>
            <h1>Contact Number : {this.state.contactno}</h1>
          </div>
          <div>
           <h1>Uploaded Documents : <a href = {this.state.document} target = "_blank">Click here</a></h1>
          </div>
          <div>
            <h1>Email Id : {this.state.email}</h1>
          </div>
          <div>
         <Link to={"/FarmerEditProfile/"+this.state.publickey}> <button class="edit_button_pro">Edit Profile</button></Link>
          </div>
          
         </div>
        </div>
      );
    }
  }
  
  export default FarmerProfile;
  