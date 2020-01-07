import React, { Component } from 'react';
import Video from 'twilio-video';
import PropTypes from 'prop-types';
import ParticipantComponent from './ParticipantComponent';

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
    room.disconnect();
  }

  participantConnected(participant) {
    this.setState(prevState => ({
      participants: [...prevState.participants, participant]
    }));
  }

  participantDisconnect(participant) {
    this.setState(prevState => ({
      participants: prevState.participants.filter(p => p !== participant)
    }));
  }

  render() {
    const { participants, room } = this.state;

    const remoteParticipants = participants.map(participant => (
      <ParticipantComponent key={participant.sid} participant={participant} />
    ));

    return (
      <div className="room">
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
        <div className="remote">{remoteParticipants}</div>
      </div>
    );
  }
}

VideoComponent.propTypes = {
  token: PropTypes.string.isRequired
};

export default VideoComponent;
