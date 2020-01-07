import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ParticipantComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      videoTracks: [],
      audioTracks: []
    };

    this.videoRef = React.createRef();
    this.audioRef = React.createRef();
  }

  componentDidMount() {
    const { participant } = this.props;

    this.setState({
      videoTracks: [Array.from(participant.videoTracks.values())[0]],
      audioTracks: [Array.from(participant.audioTracks.values())[0]]
    });

    participant.on('trackSubscribed', track => {
      this.trackSubscribed(track);
    });
    participant.on('trackUnsubscribed', track => {
      this.trackUnsubscribed(track);
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { videoTracks, audioTracks } = this.state;
    if (videoTracks !== prevState.videoTracks) {
      this.attachVideo();
    } else if (audioTracks !== prevState.audioTracks) {
      this.attachAudio();
    }
  }

  componentWillUnmount() {
    const { participant } = this.props;

    this.setState({
      videoTracks: [],
      audioTracks: []
    });

    participant.removeAllListeners();
  }

  trackSubscribed(track) {
    if (track.kind === 'video') {
      this.setState({
        videoTracks: [track]
      });
    } else {
      this.setState({
        audioTracks: [track]
      });
    }
  }

  trackUnsubscribed(track) {
    if (track.kind === 'video') {
      this.setState(prevState => ({
        videoTracks: prevState.videoTracks.filter(video => video !== track)
      }));
    } else {
      this.setState(prevState => ({
        audioTracks: prevState.audioTracks.filter(audio => audio !== track)
      }));
    }
  }

  attachVideo() {
    const { videoTracks } = this.state;
    const videoTrack = videoTracks[0];

    if (videoTrack) {
      videoTrack.attach(this.videoRef.current);
    }
  }

  attachAudio() {
    const { audioTracks } = this.state;
    const audioTrack = audioTracks[0];

    if (audioTrack) {
      audioTrack.attach(this.audioRef.current);
    }
  }

  render() {
    return (
      <>
        <video ref={this.videoRef} autoPlay><track kind="captions" /></video>
        <audio ref={this.audioRef} autoPlay muted />
      </>
    );
  }
}

ParticipantComponent.propTypes = {
  participant: PropTypes.instanceOf(Object).isRequired
};

export default ParticipantComponent;
