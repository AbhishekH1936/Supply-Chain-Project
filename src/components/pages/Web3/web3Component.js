import Web3 from "web3";
import Scm from "../../../abis/Scm.json";

const ipfsClient = require("ipfs-api");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  apiPath: "/api/v0",
  protocol: "https",
});

export async function loadWeb3() {
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

export async function loadBlockchainData() {
  const web3 = window.web3;
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  const networkData = Scm.networks[networkId];
  if (networkData) {
    const contract = web3.eth.Contract(Scm.abi, networkData.address);
    return [accounts[0], contract];
  } else {
    window.alert("Smart contract not deployed to detected network.");
  }
}

export const formValid = ({ formErrors, ...rest }) => {
  let valid = true;

  // validate form errors being empty
  Object.values(formErrors).forEach((val) => {
    val.length > 0 && (valid = false);
  });

  // validate the form was filled out
  Object.values(rest).forEach((val) => {
    val === null && (valid = false);
  });

  return valid;
};

export { ipfs };
