import React from 'react';
import Navbar from '../../components/Navbar';


export default function Home() {
  return (
    <>
        <Navbar />
      <h1 className='home'>Home</h1>
    </>
  );
}


// killing process at <PORT>
// sudo netstat -lpn |grep :<PORT>
// sudo kill -9 <PID>
