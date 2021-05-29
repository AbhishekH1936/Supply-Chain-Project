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

class AgroConsultantProfile extends Component {
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
        address : "",
        contactno :"",
        email : "",
        collegename:"",
        qualification :"",
        publickey : "",
      };
      
    }
    fetchUserDetails() {
      this.state.contract.methods
        .get_signup(this.props.match.params.publickey)
        .call({ from: this.state.account })
        .then((ipfs_hash) => {
          console.log("hash from solidity", ipfs_hash);
          ipfs.cat(ipfs_hash, (error, result) => {
            if (result === undefined) {
              alert("There is an issue with your credentials");
              return;
            }
            let userData = JSON.parse(result.toString());
            console.log("ipfs result", userData);
            this.setState({
              userName: userData.First_Name + " " + userData.Last_Name,
              address : userData.Address,
              contactno : userData.ContactNo,
              email : userData.Email,
              collegename : userData.CollegeName,
              qualification : userData.Qualification,
              publickey : userData.PublicKey,

            });
          });
        });
    }
  
   
  
    render() {
      
  
      return (
        <div class="wrapper_pro">
          <div className="form-wrapper_pro_head">
          <h1> Agro Consultant Profile Page </h1>
          </div>
        <div className="form-wrapper_pro">
            <h1>Agro Consultant Name : {this.state.userName}</h1>
          </div>
          <div>
            <h1>Address : {this.state.address}</h1>
          </div>
          <div>
            <h1>Contact Number : {this.state.contactno}</h1>
          </div>
          <div>
            <h1> College Name : {this.state.collegename}</h1>
          </div>
          <div>
            <h1>Qualification {this.state.qualification}</h1>
          </div>
          <div>
            <h1>Email Id : {this.state.email}</h1>
          </div>
          <div>
         <Link to={"/AgroConsultantEditProfile/"+this.state.publickey}> <button class="edit_button_pro">Edit Profile</button></Link>
          </div>
          
         
        </div>
      );
    }
  }
  
  export default AgroConsultantProfile;
  