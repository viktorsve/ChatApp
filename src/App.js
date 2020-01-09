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
      token: null,
      scrolledToBottom: true,
      newMessages: false,
      connectedUsers: []
    };

    this.focusInput = this.focusInput.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.focusInput();

    window.addEventListener('scroll', this.handleScroll);

    socket.on('message history', previousMessages => {
      const { messages } = this.state;

      this.setState({ messages: [...messages, ...previousMessages] });
    });

    socket.on('message', message => {
      const { scrolledToBottom, messages } = this.state;

      if (scrolledToBottom === false) {
        this.setState({ newMessages: true });
      }

      this.setState({ messages: [...messages, message] });
    });
    socket.on('update userlist', connectedUsers => {
      this.setState({ connectedUsers });
    });
  }

  componentDidUpdate() {
    const { scrolledToBottom } = this.state;

    if (scrolledToBottom === true) {
      this.scrollToBottom();
    }
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

  handleScroll() {
    const rootElement = document.documentElement;

    if (window.scrollY === rootElement.scrollHeight - rootElement.clientHeight) {
      this.setState({ scrolledToBottom: true, newMessages: false });
    } else {
      this.setState({ scrolledToBottom: false });
    }
  }

  scrollToBottom() {
    this.input.scrollIntoView();
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    const { username, value } = this.state;

    e.preventDefault();

    if (username === '') {
      this.setState({ username: value });
      socket.emit('add user', value);
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
      username, value, messages, token, connectedUsers, newMessages
    } = this.state;

    const form = (
      <form onSubmit={this.handleSubmit}>
        {username === '' ? 'Username: ' : <span />}
        <input
          ref={input => {
            this.input = input;
          }}
          type="text"
          value={value}
          onChange={this.handleChange}
        />
        <input type="submit" />
      </form>
    );

    return (
      <div className="App" aria-hidden onClick={this.focusInput}>
        <div className="flex-container">
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
            {form}
          </div>
          {connectedUsers[0] ? (
            <div className="user-list">
              <ul>
                <li>Connected users:</li>
                {connectedUsers.map(connectedUser => (
                  <li style={{ color: `hsl(${connectedUser.userColor}, 50%, 50%)` }} key={connectedUser.id}>{connectedUser.username}</li>
                ))}
              </ul>
            </div>
          ) : ''}
          {token ? (
            <VideoComponent token={token} />
          ) : (
            ''
          )}
        </div>
        {newMessages && (
          <div className="newMessages">
            <p>NEW MESSAGES BELOW&nbsp;</p>
            <p>Go to bottom</p>
          </div>
        )}
      </div>
    );
  }
}

export default App;
