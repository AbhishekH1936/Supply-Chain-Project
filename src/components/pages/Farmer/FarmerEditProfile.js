import React, { Component, useRef } from "react";
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

const emailRegex = RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);
const contactRegex = RegExp(/^\d{10}$/);
const publickeyRegex = RegExp(/^[0-9A-Za-z]{42}-[a-zA-Z0-9]+$/);
const passRegex = RegExp(
  // eslint-disable-next-line no-useless-escape
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
);

class FarmerEditProfile extends Component {
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
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      contactno: null,
      publickey: "",
      address: null,
      role: "Farmer",
      verified: "not verified",
      image: null,
      progress: 0,
      url: "",
      formErrors: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        contactno: "",
        publickey: "",
        address: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setProgress = this.setProgress.bind(this);
    this.setUrl = this.setUrl.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(`--SUBMITTING-- : `);
      
            let signup_info = {
              First_Name: this.state.firstName,
              Last_Name: this.state.lastName,
              Address: this.state.address,
              Email: this.state.email,
              ContactNo: this.state.contactno,

              Document: this.state.url,

              Password: this.state.password,
              PublicKey: this.state.publickey,
              Role: this.state.role,
              Verified: this.state.verified,
              
            };
            console.log("Signup info:  ", signup_info);
            let signup_string = JSON.stringify(signup_info);

            let ipfs_sign_up = Buffer(signup_string);
            console.log("Submitting file to ipfs...");

           ipfs.add(ipfs_sign_up, (error, result) => {
              console.log("Ipfs result", result);
              if (error) {
                console.error(error);
                return;
              } else {
                console.log("sending hash to contract");
                this.state.contract.methods
                  .set_signup(this.state.publickey, result[0].hash)
                  .send({ from: this.state.account }, (res) => {
                    console.log("res :",res);
                    if (res === false) {
                      toast("Your Profile is Updated");
                    }
                  });
              }
            });
         
      
  };

  handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case "firstName":
        formErrors.firstName =
          value.length < 3 ? "minimum 3 characaters required" : "";
        break;

      case "lastName":
        formErrors.lastName =
          value.length < 1 ? "minimum 1 characaters required" : "";
        break;

      case "address":
        formErrors.address =
          value.length < 1 ? "Please enter your address" : "";
        break;


      case "email":
        formErrors.email = emailRegex.test(value)
          ? ""
          : "invalid email address";
        break;

      case "contactno":
        formErrors.contactno = contactRegex.test(value)
          ? ""
          : "Exactly 10 numbers are required";
        break;

      default:
        break;
    }

    this.setState({ formErrors, [name]: value }, () => console.log(this.state));
  };

  setProgress = (prog) => {
    this.setState({
      progress: prog,
    });
  };

  setUrl = (link) => {
    this.setState({
      url: link,
    });
  };

  captureFile = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    console.log("image", file);
    this.setState(
      function (prevState, props) {
        return {
          image: file,
        };
      },
      () => {
        console.log("image", this.state.image);
        const uploadTask = storage
          .ref(`${this.state.role}/${this.state.image.name}`)
          .put(this.state.image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            this.setProgress(progress);
          },
          (error) => {
            console.log(error);
          },
          () => {
            storage
              .ref(`${this.state.role}`)
              .child(this.state.image.name)
              .getDownloadURL()
              .then((url) => {
                this.setUrl(url);
              });
            toast("Upload Complete");
          }
        );
      }
    );
  };

  fetchUserDetails() {
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
          console.log("fetched user details :", userData);
          this.setState({
            firstName : userData.First_Name,
            lastName : userData.Last_Name,
            publickey: userData.PublicKey,
            address : userData.Address,
            contactno : userData.ContactNo,
            email : userData.Email,
            url : userData.Document,
            role : userData.Role,
            password : userData.Password,
            verified : userData.Verified,

          });
        });
      });
  }


  render() {
    const { formErrors } = this.state;

    return (
      <div className="wrapper">
        <div className="form-wrapper">
          <h1>Edit Profile - Farmer </h1>
          <form onSubmit={this.handleSubmit} noValidate>
            <div className="firstName">
              <label htmlFor="firstName">First Name</label>
              <input
                className={formErrors.firstName.length > 0 ? "error" : null}
                type="text"
                value={this.state.firstName}
                name="firstName"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.firstName.length > 0 && (
                <span className="errorMessage">{formErrors.firstName}</span>
              )}
            </div>
            <div className="lastName">
              <label htmlFor="lastName">Last Name</label>
              <input
                className={formErrors.lastName.length > 0 ? "error" : null}
                type="text"
                value={this.state.lastName}
                name="lastName"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.lastName.length > 0 && (
                <span className="errorMessage">{formErrors.lastName}</span>
              )}
            </div>
            <div className="email">
              <label htmlFor="email">Email</label>
              <input
                className={formErrors.email.length > 0 ? "error" : null}
                type="email"
                value={this.state.email}
                name="email"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.email.length > 0 && (
                <span className="errorMessage">{formErrors.email}</span>
              )}
            </div>
            <div className="contact_no">
              <label htmlFor="email">Contact Number</label>
              <input
                className={formErrors.contactno.length > 0 ? "error" : null}
                type="contactno"
                value={this.state.contactno}
                name="contactno"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.contactno.length > 0 && (
                <span className="errorMessage">{formErrors.contactno}</span>
              )}
            </div>

            <div className="address">
              <label htmlFor="email">Address</label>
              <input
                className={formErrors.address.length > 0 ? "error" : null}
                value={this.state.address}
                type="text"
                name="address"
                noValidate
                onChange={this.handleChange}
              />
              {formErrors.address.length > 0 && (
                <span className="errorMessage">{formErrors.address}</span>
              )}
            </div>

            <div className="upload_doc">
              <label htmlFor="email">Uploaded Documents</label>
              
            <a href = {this.state.url} target = "_blank">Click here to view Uploaded Documents</a>
        
            </div>

            <div className="upload_doc">
              <label htmlFor="email">Upload Documents  ** If you want to update the documents **</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={this.captureFile}
              />
              {<progress value={this.state.progress} max="100" />}
            </div>

            <div className="createAccount">
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default FarmerEditProfile;
