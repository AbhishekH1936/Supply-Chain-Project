import React, { Component } from "react";
import FarmerNavbar from "./FarmerNavbar";
import Web3 from "web3";
import "./Farmer.css";
import Scm from "../../../abis/Scm.json";
import { ipfs } from "../Web3/web3Component";

export default class FarmerHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userData: [],
      userName: "",
      publickey: "",
    };
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    await this.fetchUsername();
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

  fetchUsername() {
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
            publickey: userData.PublicKey,
          });
        });
      });
  }

  render() {
    return (
      <div id="bg1">
        <FarmerNavbar
          username={this.state.userName}
          publicKey={this.state.publickey}
        />
      </div>
    );
  }
}

/*
0x4322EcbD8d43421a77Ec6F0AF0E6CA866e2A3CEd-bharath
Bhar123@*/
