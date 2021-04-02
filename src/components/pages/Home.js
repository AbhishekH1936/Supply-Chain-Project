import React from "react";
import Navbar from "../../components/Navbar";
import "./style.css";
import Farmer from "./videos/Farmer.mp4";

export default function Home() {
  return (
    <>
      <div>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            left: "50%",
            top: "50%",
            height: "100%",
            objectFit: "cover",
            transform: "translate(-50%, -50%)",
            zIndex: "-1",
          }}
        >
          <source src={Farmer} type="video/mp4" />
        </video>
        <Navbar />
      </div>
    </>
  );
}

// killing process at <PORT>
// sudo netstat -lpn |grep :<PORT>
// sudo kill -9 <PID>
