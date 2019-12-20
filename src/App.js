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

    this.focusInput = this.focusInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.focusInput();

    // fix this eslint error later, idk how though :)

    socket.on('message', message => {
      this.setState({ messages: [...this.state.messages, message] });
    });
  }

  focusInput() {
    this.input.focus();
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
      <div className="App" onClick={this.focusInput}>
        <ul>
          {messages.map((message) => (<li key={message.id}>{`${message.user_id}: ${message.value}`}</li>))}
        </ul>
        <form onSubmit={this.handleSubmit}>
          <span />
          <input ref={(input) => { this.input = input; }} type="text" value={value} onChange={this.handleChange} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
