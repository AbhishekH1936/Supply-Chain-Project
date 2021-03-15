import './App.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


import Home from './components/pages/Home';
import ContactUs from './components/pages/ContactUs';
import Instructions from './components/pages/Instructions';
import Farmer from './components/pages/signup/Farmer';
import Distributor from './components/pages/signup/Distributor';
import Investor from './components/pages/signup/Investor';
import Retailer from './components/pages/signup/Retailer';
import Seller from './components/pages/signup/Seller';
import Storage from './components/pages/signup/Storage';
import Transporter from './components/pages/signup/Transporter';
import AgroConsultant from './components/pages/signup/AgroConsultant';
import login from './components/pages/login/login'
import main from './components/pages/main/main';

function App() {
  return (
    <Router>
        
        <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/contact-us' component={ContactUs} />
        <Route path='/instructions' component={Instructions} />
        <Route path='/farmer' component={Farmer} />
        <Route path='/distributor' component={Distributor} />
        <Route path='/investor' component={Investor} />
        <Route path='/retailer' component={Retailer} />
        <Route path='/seller' component={Seller} />
        <Route path='/storage' component={Storage} />
        <Route path='/transporter' component={Transporter} />
        <Route path='/agro-consultant' component={AgroConsultant} />
        <Route path='/login' component={login}/>
        <Route path='/main/:name' component = {main}/>
      </Switch>
    </Router>
  );
}

export default App;