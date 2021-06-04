import React from "react";
import "../pages/inst.css";
import Navbar from "../../components/Navbar";

export default function Instructions() {
  return (
    <>
      <Navbar />
      <div className="textHeading">Instructions and clarifications</div>
      <ol>
        <li>
          Signup
          <ol className="step">
            <li>This is the first step in registration</li>
            <li>For this a user has to provide the expected details </li>
            <li>
              while uplaoding the documents pdf, all users has to upload aadhar
              card, pan card and Agro Consultant has to upload his degree
              certificate.
            </li>
            <li>
              While entring the public key, the user has to enter it in the
              particular format
            </li>
            <li>Format : public key of the ethereun account-username</li>
          </ol>
        </li>
        <li>
          Login
          <ol className="step">
            <li>
              Governing Authority is going to validate the details uploaded by
              the users and documents.
            </li>
            <li>
              A user can login to the network only after he/she is accepted by
              Governing Authority.
            </li>
            <li>
              If a user is accepted, then he/she should provide the correct
              credentials and select the correct role.
            </li>
            <li>
              The public key entered in the username text box should be same as
              the ethereum account selected in the metamask.
            </li>
          </ol>
        </li>
        <li>
          Farmer
          <ol className="step">
            <li>
              Book a Agro Consultant :
              <ol className="step2">
                <li>
                  A Farmer can book a Agro Consultant by clicking the Book
                  Consultant button and follwed by fees transfer.
                </li>
                <li>
                  Farmers need to notedown the Key phrase which is going to come
                  in the toast for the future reference.
                </li>
              </ol>
            </li>
            <li>
              Add or Withdraw the Security deposit :
              <ol className="step2">
                <li>
                  A farmer has to add some security deposit in order to get the
                  Fundings from the Investor.
                </li>
                <li>
                  he can add or withdraw it by clicking on Add deposit button.
                </li>
              </ol>
            </li>
            <li>
              Propose a new crop :
              <ol className="step2">
                <li>
                  Farmer can propose a new crop by providing all the crop
                  details, keyPhrase by booking the Agro Consultant and clicking
                  the checkbox if Funding required for that crop.
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          Agro Consultant
          <ol className="step">
            <li>
              Agro Consultant can rate the Farmer and his crops by giving
              rating(1-5) to all the questions asked.
            </li>
          </ol>
        </li>
      </ol>
    </>
  );
}
