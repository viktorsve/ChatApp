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
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    // fix this eslint error later, idk how though :)

    socket.on('message', message => {
      this.setState({ messages: [...this.state.messages, message] });
    });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    const { value } = this.state;

    e.preventDefault();
    socket.emit('message', { value });
    this.setState({ value: '' });
  }

  render() {
    const { value, messages } = this.state;

    return (
      <div className="App">
        <div className="App-intro">
          <p>socket.io test</p>
          <form onSubmit={this.handleSubmit}>
            <input type="text" value={value} onChange={this.handleChange} />
            <input type="submit" />
          </form>
          <ul>
            {messages.map((message) => (<li key={message.id}>{`${message.user_id}: ${message.value}`}</li>))}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
