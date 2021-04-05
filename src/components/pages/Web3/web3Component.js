import Web3 from "web3";
import Scm from "../../../abis/Scm.json";
import ConsultationContract from "../../../abis/ConsultationContract.json";
import Crops from "../../../abis/Crops.json";
import Ratings from "../../../abis/Ratings.json";
import SecurityDeposit from "../../../abis/SecurityDeposit.json";
import UserData from "../../../abis/UserData.json";

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

export async function loadBlockchainData(contract) {
  const web3 = window.web3;
  const accounts = await web3.eth.getAccounts();
  const networkId = await web3.eth.net.getId();
  console.log("contract name",contract)

  switch (contract) {
    case "Scm":
      const scmNetworkData = Scm.networks[networkId];
      if (scmNetworkData) {
        const contract = web3.eth.Contract(Scm.abi, scmNetworkData.address);
        return [accounts[0], contract];
      } else {
        window.alert("SCM Smart contract not deployed to detected network.");
      }
      break;

    case "UserData":
      const userNetworkdata = UserData.networks[networkId];
      if (userNetworkdata) {
        const contract = web3.eth.Contract(
          UserData.abi,
          userNetworkdata.address
        );
        return [accounts[0], contract];
      } else {
        window.alert(
          "UserData Smart contract not deployed to detected network."
        );
      }
      break;

    case "ConsultationContract":
      const ConsultationContractNetworkdata =
        ConsultationContract.networks[networkId];
      if (ConsultationContractNetworkdata) {
        const contract = web3.eth.Contract(
          ConsultationContract.abi,
          ConsultationContractNetworkdata.address
        );
        return [accounts[0], contract];
      } else {
        window.alert(
          "ConsultationContract Smart contract not deployed to detected network."
        );
      }
      break;

    case "Crops":
      const CropsNetworkdata = Crops.networks[networkId];
      if (CropsNetworkdata) {
        const contract = web3.eth.Contract(Crops.abi, CropsNetworkdata.address);
        return [accounts[0], contract];
      } else {
        window.alert("Crops Smart contract not deployed to detected network.");
      }
      break;

    case "Ratings":
      const RatingsNetworkdata = Ratings.networks[networkId];
      if (RatingsNetworkdata) {
        const contract = web3.eth.Contract(
          Ratings.abi,
          RatingsNetworkdata.address
        );
        return [accounts[0], contract];
      } else {
        window.alert(
          "Ratings Smart contract not deployed to detected network."
        );
      }
      break;

    case "SecurityDeposit":
      const SecurityDepositNetworkdata = SecurityDeposit.networks[networkId];
      if (SecurityDepositNetworkdata) {
        const contract = web3.eth.Contract(
          SecurityDeposit.abi,
          SecurityDepositNetworkdata.address
        );
        return [accounts[0], contract];
      } else {
        window.alert(
          "SecurityDeposit Smart contract not deployed to detected network."
        );
      }
      break;

    default:
      break;
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
