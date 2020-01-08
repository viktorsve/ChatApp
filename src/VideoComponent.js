import React, { Component } from 'react';
import Video from 'twilio-video';
import PropTypes from 'prop-types';
import ParticipantComponent from './ParticipantComponent';

/* Component is used for connecting to the twilio video chat room using a JWT token.
Also stores a list of all users that are connected to the chat room. */
class VideoComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      room: null,
      participants: []
    };
  }

  componentDidMount() {
    const { token } = this.props;

    Video.connect(token, {
      name: 'video'
    }).then(room => {
      this.setState({ room });
      room.on('participantConnected', participant => {
        this.participantConnected(participant);
      });
      room.on('participantDisconnected', participant => {
        this.participantDisconnect(participant);
      });
      room.participants.forEach(participant => {
        this.participantConnected(participant);
      });
    });
  }

  componentWillUnmount() {
    const { room } = this.state;

    if (room) {
      room.disconnect();
    }
  }

  participantConnected(participant) {
    this.setState(prevState => ({
      participants: [...prevState.participants, participant]
    }));
  }

  participantDisconnect(disconnectedParticipant) {
    this.setState(prevState => ({
      participants: prevState.participants.filter(
        participant => participant !== disconnectedParticipant
      )
    }));
  }

  render() {
    const { participants, room } = this.state;

    return (
      <div className="video-room">
        <div className="local">
          {room ? (
            <ParticipantComponent
              key={room.localParticipant.sid}
              participant={room.localParticipant}
            />
          ) : (
            ''
          )}
        </div>
        <div className="remote">
          {participants.map(participant => (
            <ParticipantComponent key={participant.sid} participant={participant} />
          ))}
        </div>
      </div>
    );
  }
}

VideoComponent.propTypes = {
  token: PropTypes.string.isRequired
};

export default VideoComponent;
