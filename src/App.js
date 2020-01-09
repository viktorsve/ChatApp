import React, { Component } from 'react';
import './App.css';
import openSocket from 'socket.io-client';
import axios from 'axios';
import VideoComponent from './VideoComponent';

const socket = openSocket('http://localhost:8000');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      value: '',
      messages: [],
      token: null
    };

    this.focusInput = this.focusInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.focusInput();

    socket.on('message history', previousMessages => {
      this.setState({ messages: [...this.state.messages, ...previousMessages] });
    });

    socket.on('message', message => {
      this.setState({ messages: [...this.state.messages, message] });
    });
  }

  async getToken() {
    const { username } = this.state;

    const postData = JSON.stringify({
      identity: username,
      room: 'video',
    });

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/video/token', postData, axiosConfig);
      this.setState({ token: res.data.token });
    } catch (error) {
      console.error(error);
    }
  }

  clearToken() {
    this.setState({ token: null });
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

    if (value === '/join video chat' && username !== '') {
      this.getToken();
    } else if (value === '/leave video chat') {
      this.clearToken();
    }

    this.setState({ value: '' });
  }

  render() {
    const {
      username, value, messages, token
    } = this.state;
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
        <div className="message-container">
          {username !== '' && (
            <>
              <p>{`Logged in as ${username}`}</p>
              <p>{`Available commands for ${username}:`}</p>
              <ul>
                <li>/join video chat</li>
                <li>/leave video chat</li>
              </ul>
            </>
          )}
          <ul>
            {messages.map((message) => (
              <li key={message.id}>
                <span className="timestamp">{`[${message.sentAt}] `}</span>
                <span style={{ color: `hsl(${message.userColor}, 50%, 50%)` }}>{`${message.user}`}</span>
                {`: ${message.value}`}
              </li>
            ))}
          </ul>
        </div>
        {form}
        {token ? (
          <VideoComponent token={token} />
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default App;
