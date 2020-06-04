import React, { Component } from 'react';
// import axios
import axios from 'axios';
// uuid import
import uuid from 'uuid/dist/v4';
// Component
import Joke from '../Joke/Joke';
//styles
import './JokeList.css';

export default class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };
  constructor(props) {
    super(props);
    //this.state = { jokes: [] };
    // get jokes from localStorage otherwise parse which is empty []
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((joke) => joke.text));
    console.log('[JokeList][constructor] => BEGIN seenJokes:');
    console.log(this.seenJokes);
    console.log('[JokeList][constructor] => END seenJokes:');

    // binding
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    console.log(
      '[JokeList][componentDidMount] => this.state.jokes.length: ',
      this.state.jokes.length,
    );
    if (this.state.jokes.length === 0) {
      this.getJokes();
    }
  }

  // Load jokes
  async getJokes() {
    try {
      console.log(
        '[JokeList][getJokes][BEGIN] => this.state.jokes.length: ',
        this.state.jokes.length,
      );
      let newJokes = [];
      while (newJokes.length < this.props.numJokesToGet) {
        let response = await axios.get('https://icanhazdadjoke.com', {
          headers: { Accept: 'application/json' },
        });
        // represents a single joke
        let newJoke = response.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          newJokes.push({
            id: uuid(),
            text: response.data.joke,
            votes: 0,
          });
        } else {
          console.log('[JokeList][getJokes] => BEGIN - FOUND DUPLICATE:');
          console.log(newJoke);
          console.log('[JokeList][getJokes] => END: - FOUND DUPLICATE');
        }
      }
      console.log('[JokeList][getJokes] => # of retrieved jokes: ', newJokes.length);
      // this.setState( {jokes: newJokes} );
      // this.setState(st => ({jokes: [...st.jokes, ...newJokes]}));
      this.setState(
        (state) => ({
          loading: false,
          jokes: [...state.jokes, ...newJokes],
        }),
        () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)),
      );
      console.log(
        '[JokeList][getJokes][END] => this.state.jokes.length: ',
        this.state.jokes.length,
      );
    } catch (exc) {
      alert(exc);
      this.setState({ loading: false });
    }
  }
  // handleVote method
  handleVote(id, delta) {
    this.setState(
      (state) => ({
        jokes: state.jokes.map((joke) =>
          joke.id === id ? { ...joke, votes: joke.votes + delta } : joke,
        ),
      }),
      // 2nd arg- call after setState finishes, which needs to be updated
      () => window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes)),
    );
  }
  // handleClick method
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }
    let sortedJokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
            alt="Smiley Face"
          />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {sortedJokes.map((joke) => (
            <Joke
              key={joke.id}
              votes={joke.votes}
              text={joke.text}
              upVote={() => this.handleVote(joke.id, 1)}
              downVote={() => this.handleVote(joke.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}
