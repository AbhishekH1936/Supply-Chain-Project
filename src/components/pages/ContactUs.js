/* eslint-disable react/jsx-pascal-case */
import React from "react";
import Navbar_GM from "./Navbar_GM";
import { Card } from "react-bootstrap";
import nikhil from "./media/nikhil.jpeg";
import bharath from "./media/bharath.jpg";
import abhishek from "./media/abhishek.jpeg";
import hetav from "./media/hetav.jpeg";
import lohith from "./media/lohit.jpeg";


export default function ContactUs() {


  const cardInfo = [
    { image: nikhil, title: "Nikhil C", phoneno: "+918088631797" , email : "nikhil.c@bmsce.ac.in"},
    { image: bharath, title: "Bharath kumar", phoneno: "+918317450757",  email : "bharathkumar@bmsce.ac.in"},
    { image: abhishek, title: "Abhishek H", phoneno: "+919740133236", email : "abhishekh@bmsce.ac.in" },
    { image: hetav, title: "Hetav", phoneno: "+919409492522", email : "hetavpabari@bmsce.ac.in" },
    
  ];

  const mentor = [{ image: lohith, title: "Prof. Lohith ", phoneno: "+919886745882", email : "lohith.cse@bmsce.ac.in" }]

  const renderCard = (card, index) => {
    return (
      <Card style={{ width: '25rem'}} key={index} className="box">
        <Card.Img variant="top" src="holder.js/100px180" src={card.image} />
        <Card.Body>
          <br />
          <center><Card.Title>{card.title}</Card.Title></center>
          <center><Card.Subtitle className="mb-2 text-muted">Phone Number  : {card.phoneno}</Card.Subtitle></center>
          <center><Card.Subtitle className="mb-2 text-muted">Email address  : {card.email}</Card.Subtitle></center>
        </Card.Body>
      </Card>
    )
  }

  return (
    <>
      <Navbar_GM />
      <div className="textHeading">Team Members</div>
      <div className="grid">
        {cardInfo.map(renderCard)}
      </div>
      <div className="textHeading">Mentor</div>
      <div className="grid">
        {mentor.map(renderCard)}
      </div>

    </>
  );
}
