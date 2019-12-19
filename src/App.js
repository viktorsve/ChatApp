import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');

class App extends Component {
  constructor(props) {
    super(props); 
    this.state = {
      value: '',
      messages: []
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount(){
    socket.on("message", message => {
      this.setState({ messages: [...this.state.messages, message] })
    })
  }

  handleChange(e){
    this.setState({ value: e.target.value });
  }

  handleSubmit(e){
    e.preventDefault();
    socket.emit("message", this.state.value)
    this.setState({ value: '' })
  }

  render() {
    return (
      <div className="App">
        <div className="App-intro">
          <p>socket.io test</p>
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={this.state.value} onChange={this.handleChange}></input>
            <input type="submit"></input>
          </form>
          <ul>
            {this.state.messages.map((message, i) => (<li key={i}>{message}</li>))}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
