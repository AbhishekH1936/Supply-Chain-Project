import React, { Component } from "react";
import MainNavbar from "./MainNavbar";

export default class main extends Component {
  render() {
    return (
      <div id="bg2">
        <MainNavbar username={this.props.match.params.name} />
      </div>
    );
  }
}
