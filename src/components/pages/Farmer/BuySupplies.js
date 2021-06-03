import Web3 from "web3";
import React, { Component } from "react";
import * as Utils from "web3-utils";
import { ipfs, loadWeb3, loadBlockchainData } from "../Web3/web3Component";

export default class BuySupplies extends Component {
  constructor(props) {
    super(props);

    this.state = {
      Suppliers: [],
    };

    this.rendertable = this.rendertable.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  async componentWillMount() {
    let account_contract_userdata;

    (async function () {
      await loadWeb3();
    })();

    (async function () {
      account_contract_userdata = await loadBlockchainData("UserData");
    })().then(() => {
      console.log(account_contract_userdata);
      this.setState({ account: account_contract_userdata[0] });
      this.setState({ userData_contract: account_contract_userdata[1] });
      this.rendertable();
    });
    await this.loadWeb32();
    await this.loadBlockchainData();
  }

  async loadWeb32() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      alert("provider");
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
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
                  if (userData["Role"] === "Supplier") {
                    this.setState(
                      {
                        Suppliers: this.state.Suppliers.concat([userData]),
                      },
                      () => {
                        console.log("res ", this.state.Suppliers);
                      }
                    );
                  }
                }
              });
            });
        });
        console.log("Suppliers are :", this.state.Suppliers);
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
        <td>{record.Address}</td>
        <td>{record.Email}</td>
        <td>{record.ContactNo}</td>
        <td>{record.Specialisation}</td>

        <td>
          <button
            className="btn btn-danger"
            onClick={() => this.sendRequest(record, record.Specialisation)}
          >
            Buy
          </button>
        </td>
      </tr>
    );
  }

  sendRequest(record, specialization) {
    console.log("record in buy supplies :", record);

    var allseeds = specialization.split(",");

    var seed_name_entered = prompt("enter seed name");
    allseeds.forEach((val) => {
      var brace_index = val.indexOf("(");
      var close_brace = val.indexOf(")");
      if (seed_name_entered === val.slice(0, brace_index)) {
        var x = specialization.indexOf(seed_name_entered);
        x = x + seed_name_entered.length;
        var brace_index1 = specialization.indexOf("(", x);
        var close_brace2 = specialization.indexOf(")", x);

        var price = parseInt(
          specialization.slice(close_brace + 2, close_brace + 3)
        );

        var available_quantity = parseInt(
          specialization.slice(brace_index1 + 1, close_brace2)
        );
        var quantity_entered = parseInt(
          prompt(
            "enter the quantity (Available quantity = " +
              available_quantity +
              ")"
          )
        );

        if (quantity_entered <= available_quantity) {
          var updated_specialization = specialization.replace(
            "" + available_quantity,
            "" + available_quantity - quantity_entered
          );
          alert(updated_specialization);
          console.log("updated record : ", record);
          record["Specialisation"] = updated_specialization;
          console.log("upadted record : ", record);

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
              this.state.userData_contract.methods
                .set_signup(record.PublicKey, result[0].hash)
                .send({ from: this.state.account }, (res) => {
                  console.log("resultttt :", res);

                  var x = this.props.match.params.publickey.indexOf("-");
                  var fkey = this.props.match.params.publickey.slice(0, x);

                  var y = record.PublicKey.indexOf("-");
                  var skey = record.PublicKey.slice(0, y);

                  console.log("farmer key  : ", fkey, "   supp key   :", skey);
                  console.log(
                    price,
                    quantity_entered,
                    "price*quantity_enterd",
                    price * quantity_entered
                  );

                  console.log("accounts  :", this.state.accounts);
                  const web3 = window.web3;

                  web3.eth.sendTransaction({
                    from: this.state.accounts[0],
                    to: skey,
                    value: Utils.toWei("" + price * quantity_entered, "ether"),
                  });
                });
            }
          });
        } else {
          alert("Please enter the value less than or equal to avilable value");
        }
      }
    });
  }

  render() {
    return (
      <div>
        <h1>Suppliers</h1>
        <table className="styled-table-crop">
          <thead>
            <tr>
              <th>Name</th>
              <th>Public key</th>
              <th>Address</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>
                Specialisation(Seed name(available quantity)(price per kg in
                ETH)
              </th>
              <th>Buy</th>
            </tr>
          </thead>
          <tbody>{this.state.Suppliers.map(this.renderTableData)}</tbody>
        </table>
      </div>
    );
  }
}
