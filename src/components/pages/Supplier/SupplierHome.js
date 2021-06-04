import React, { Component } from "react";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import "./Supplier.css";
import SupplierNavbar from "./SupplierNavbar";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()
export default class SupplierHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: "",
      publickey: "",
    };
  }

  async componentWillMount() {
    let account_contract;
    (async function () {
      await loadWeb3();
    })();
    (async function () {
      account_contract = await loadBlockchainData("UserData");
    })().then(() => {
      console.log(account_contract);
      this.setState({ account: account_contract[0] });
      this.setState({ contract: account_contract[1] });
      this.fetchUsername();
    });
  }

  fetchUsername() {
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
          });
        });
      });
  }

  render() {
    return (
        <div id="bg1">
          <SupplierNavbar
            username={this.state.userName}
            publicKey={this.state.publickey}
          ></SupplierNavbar>
        </div>
      );
  }
}
