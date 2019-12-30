import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      value: '',
      messages: []
    };

    this.focusInput = this.focusInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.focusInput();

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
    const { username, value } = this.state;

    e.preventDefault();

    if (username === '') {
      this.setState({ username: value });
    } else {
      socket.emit('message', { username, value });
    }

    this.setState({ value: '' });
  }

  render() {
    const { username, value, messages } = this.state;
    let form;

    if (username === '') {
      form = (
        <form onSubmit={this.handleSubmit}>
          Username:&nbsp;
          <input ref={input => { this.input = input; }} type="text" value={value} onChange={this.handleChange} />
          <input type="submit" />
        </form>
      );
    } else {
      form = (
        <form onSubmit={this.handleSubmit}>
          <span />
          <input ref={(input) => { this.input = input; }} type="text" value={value} onChange={this.handleChange} />
          <input type="submit" />
        </form>
      );
    }

    return (
      <div className="App" onClick={this.focusInput}>
        {username !== '' && (
          <p>{`Logged in as ${username}`}</p>
        )}
        <ul>
          {messages.map((message) => (<li key={message.id}>{`${message.user}: ${message.value}`}</li>))}
        </ul>
        {form}
      </div>
    );
  }
}

export default App;
