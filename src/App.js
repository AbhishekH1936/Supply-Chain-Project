import "./App.css";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./components/pages/Home";
import ContactUs from "./components/pages/ContactUs";
import Instructions from "./components/pages/Instructions";
import Farmer from "./components/pages/signup/Farmer";
import Distributor from "./components/pages/signup/Distributor";
import Investor from "./components/pages/signup/Investor";
import Retailer from "./components/pages/signup/Retailer";
import Supplier from "./components/pages/signup/Supplier";
import Storage from "./components/pages/signup/Storage";
import Transporter from "./components/pages/signup/Transporter";
import AgroConsultant from "./components/pages/signup/AgroConsultant";
import login from "./components/pages/login/login";
import main from "./components/pages/main/main";
import UnverifiedUsers from "./components/pages/main/UnverifiedUsers";
import FarmerHome from "./components/pages/Farmer/FarmerHome";
import FarmerProfile from "./components/pages/Farmer/FarmerProfile";
import ProposeCrops from "./components/pages/Farmer/ProposeCrops";
import CropsStatus from "./components/pages/Farmer/CropsStatus";
import ApproveCrops from "./components/pages/Farmer/ApproveCrops";
import BookConsultant from "./components/pages/Farmer/BookConsultant";
import AgroConsultantHome from "./components/pages/AgroConsultant/AgroConsultantHome";
import AcceptOffer from "./components/pages/AgroConsultant/AcceptOffer";
import RateCrops from "./components/pages/AgroConsultant/RateCrops";
import RateFarmer from "./components/pages/AgroConsultant/RateFarmer";
import SecurityDeposit from "./components/pages/Farmer/SecurityDeposit";
import SupplierHome from "./components/pages/Supplier/SupplierHome";
import EditCommodities from "./components/pages/Supplier/EditCommodities";
import ManageCommodities from "./components/pages/Supplier/ManageCommodities";
import BuySupplies from "./components/pages/Farmer/BuySupplies";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/contact-us" component={ContactUs} />
        <Route path="/instructions" component={Instructions} />
        <Route path="/farmer" component={Farmer} />
        <Route path="/distributor" component={Distributor} />
        <Route path="/investor" component={Investor} />
        <Route path="/retailer" component={Retailer} />
        <Route path="/supplier" component={Supplier} />
        <Route path="/storage" component={Storage} />
        <Route path="/transporter" component={Transporter} />
        <Route path="/agro-consultant" component={AgroConsultant} />
        <Route path="/login" component={login} />
        <Route path="/main/:name" component={main} />
        <Route path="/UnverifiedUsers" component={UnverifiedUsers} />
        <Route path="/FarmerHome/:publickey" component={FarmerHome} />
        <Route path="/FarmerProfile" component={FarmerProfile} />
        <Route path="/ProposeCrops/:publickey" component={ProposeCrops} />
        <Route path="/CropsStatus/:publickey" component={CropsStatus} />
        <Route path="/ApproveCrops/:publickey" component={ApproveCrops} />
        <Route path="/BookConsultant/:publickey" component={BookConsultant} />
        <Route
          path="/AgroConsultantHome/:publickey"
          component={AgroConsultantHome}
        />
        <Route path="/AcceptOffer/:publickey" component={AcceptOffer} />
        <Route path="/RateCrops/:publickey" component={RateCrops} />
        <Route path="/RateFarmer/:publickey" component={RateFarmer} />
        <Route path="/SecurityDeposit/:publickey" component={SecurityDeposit} />
        <Route path="/SupplierHome/:publickey" component={SupplierHome} />
        <Route path="/EditCommodities/:publickey" component={EditCommodities} />
        <Route path="/ManageCommodities/:publickey" component={ManageCommodities} />
        <Route path="/BuySupplies/:publickey" component={BuySupplies} />
      </Switch>
    </Router>
  );
}

export default App;
