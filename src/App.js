import React, { Component } from 'react';
// Component
import JokeList from './Components/JokeList/JokeList';

// style
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <JokeList />
      </div>
    );
  }
}
