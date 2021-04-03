import React, { Component } from "react";
import FarmerNavbar from "./FarmerNavbar";
import Web3 from "web3";
import "./Farmer.css";
import Scm from "../../../abis/Scm.json";
import { ipfs } from "../Web3/web3Component";
import propose from "../media/propose.png";
import status from "../media/status.jpg";
import stopfunding from "../media/stopfunding.jpg";
import { Link } from "react-router-dom";

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
      <>
        <div id="bg1">
          <FarmerNavbar
            username={this.state.userName}
            publicKey={this.state.publickey}
          />
        </div>

        <div className="container">
          <div className="cards card_outer">
            <div className="card">
              <Link to={"/ProposeCrops/" + this.state.publickey}>
                <div className="top image">
                  <a href={propose}>
                    <img src={propose} alt="card" />
                  </a>
                </div>
                <div className="bottom content">
                  <small>Propose a new crop</small>
                  <p className="paraText">
                    Proposing crops is a starting point for your crop life
                    cycle. You are required to have a prior contract with a
                    agricultural consaltant as prerequist. In this section you
                    be prompted to added all the basic information needed about
                    the new crop that you have planned.
                  </p>
                </div>
              </Link>
            </div>

            <div className="card">
              <Link to={"/ApproveCrops/" + this.state.publickey}>
                <div className="top image">
                  <a href={stopfunding}>
                    <img src={stopfunding} alt="card" />
                  </a>
                </div>
                <div className="bottom content">
                  <small>Finalize a crop</small>
                  <p className="paraText">
                    In case you have opted for public funding, this tab will
                    give you the list of such crops and also the section gives
                    you an option to stop receiving funds, even if the limit set
                    is not reached yet for whatever you choose to end funds.
                    Once you choose to opt of public funding, you can not resume
                    the funding in any way. So be careful with this feature.
                    Before terminating funds you can view the funds received
                    till now.
                  </p>
                </div>
              </Link>
            </div>

            <div className="card">
              <Link to={"/CropsStatus/" + this.state.publickey}>
                <div className="top image">
                  <a href={status}>
                    <img src={status} alt="card" />
                  </a>
                </div>
                <div className="bottom content">
                  <small>Check crop status</small>
                  <p className="paraText">
                    In this section you can have quick look at all the crops
                    that are under your account, with their details,
                    credentials, and most importantly status. This will help you
                    in keeping track of your indiviual crop lifecycles online.
                    You can have look at your keyPhrase as well for creating
                    contracts.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

/*
0x4322EcbD8d43421a77Ec6F0AF0E6CA866e2A3CEd-bharath
Bhar123@*/
