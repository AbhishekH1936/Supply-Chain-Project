import React, { Component } from "react";
import * as Utils from "web3-utils";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";
import {toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
toast.configure()

export default class hireTransporter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      Transporter: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  async componentWillMount() {
    let account_contract_userdata;
    let account_contract_transporter;
    (async function () {
      await loadWeb3();
    })();

    (async function () {
      account_contract_userdata = await loadBlockchainData("UserData");
    })().then(() => {
      console.log(account_contract_userdata);
      this.setState({ account: account_contract_userdata[0] });
      this.setState({ userData_contract: account_contract_userdata[1] });
    });

    (async function () {
      account_contract_transporter = await loadBlockchainData("Transportation");
    })().then(() => {
      console.log(account_contract_transporter);
      this.setState({
        consulatation_contract: account_contract_transporter[1],
      });
      this.rendertable();
    });
    await this.loadBlockchainData();
  }

  async loadBlockchainData(contract) {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts });
    console.log("contract name", contract);
  }

  async rendertable() {
    console.log("in render table");

    this.state.userData_contract.methods.get_usernames
      .call({ from: this.state.account })
      .then((users) => {
        let usernames = [...new Set(users)];
        // eslint-disable-next-line array-callback-return
        usernames.map((username) => {
          this.state.userData_contract.methods
            .get_signup(username)
            .call({ from: this.state.account })
            .then((ipfs_hash) => {
              ipfs.cat(ipfs_hash, (error, result) => {
                if (result !== undefined) {
                  let userData = JSON.parse(result.toString());
                  console.log("ipfs result data", userData);
                  if (userData["Role"] === "Transporter") {
                    this.setState(
                      {
                        Transporter: this.state.Transporter.concat([userData]),
                      },
                      () => {
                        console.log("res ", this.state.Transporter);
                      }
                    );
                  }
                }
              });
            });
        });
        console.log("Agro consultants are :", this.state.Transporter);
      });
  }

  renderTableData(record, index) {
    console.log("in render table data");
    return (
      <tr className="active-row" key={record.PublicKey}>
        <td>
          {record.First_Name}&nbsp;{record.Last_Name}
        </td>
        <td>{record.PublicKey}</td>
        <td>{record.MeansOfTransport}</td>
        <td>{record.Email}</td>
        <td>{record.ContactNo}</td>
        <td>{/*record.kg*/}1</td>
        <td>{/*record.km*/}2</td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() =>
              this.sendRequest(record.PublicKey /*,record.kg, record.km*/)
            }
          >
            Hire Transporter
          </button>
        </td>
      </tr>
    );
  }

  sendRequest(transPublicKey) {
    let enteredKg = parseInt(prompt("Enetr the number of kgs to transfer"));
    let enteredKm = parseInt(prompt("Enetr the munber of kms to transfer"));
    let km = 1;
    let kg= 2;
    let distPublicKey = this.props.match.params.publickey;
    console.log("dist pub key : ", distPublicKey, this.state.account);
    let sendPublicKey = distPublicKey.slice(0, 42);
    console.log("swndPublic key  : ", sendPublicKey);

    let recPublicKey = transPublicKey.slice(0, 42);
    console.log("swndPublic key  : ", sendPublicKey);

    var r = window.confirm("Are you sure you want to hire" + transPublicKey);
    if (r === true) {
      this.state.consulatation_contract.methods
        .setTransHiringArray("" + transPublicKey + distPublicKey)
        .send(
          {
            from: this.state.account,
          },
          () => {
            this.state.consulatation_contract.methods
              .setTransAndDist(distPublicKey, transPublicKey)
              .send(
                {
                  from: this.state.account,
                },
                () => {
                  const web3 = window.web3;

                  web3.eth.sendTransaction({
                    from: this.state.accounts[0],
                    to: recPublicKey,
                    value: Utils.toWei("" + enteredKm*km + enteredKg*kg, "ether"),
                  });
                  toast(
                    "Your have hired" +
                      transPublicKey +
                      "for transportation for" +
                      km * kg,{position: toast.POSITION.TOP_CENTER, className:"toast"}
                  );
                }
              );
          }
        );
    } else {
      toast("try again later, intenal error");
    }
  }

  render() {
    return (
      <div>
        <h1>Available transporters</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Name</th>
              <th>Public key</th>
              <th>Means Of Transporter</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Per Kg cost</th>
              <th>Per Km cost</th>
              <th>Hire Transporter</th>
            </tr>
          </thead>
          <tbody>{this.state.Transporter.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
