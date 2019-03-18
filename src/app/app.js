import React, { Component } from 'react';
import './app.scss';

import GymHTTPClient from "../gym/client";
import Agent from "../gym/agent";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      client: null,
      agent: null,
      serverIp: "http://127.0.0.1:5000",
      envId: "CartPole-v0",
      instanceId: "",
      outDir: "tmp",
      episode: 0,
      step: 0,
      ended: true,
      monitoring: false
    };
  }

  handleCreateClient = () => {
    this.setState({client: new GymHTTPClient(this.state.serverIp)});
  };

  handleCreateEnv = async () => {
    let {client, envId} = this.state;
    let response = await client.envCreate(envId);
    this.setState({instanceId: response.instance_id});
  };

  handleCloseEnv = async () => {
    let {client, instanceId} = this.state;
    await client.envClose(instanceId);
    this.setState({instanceId: ""});
  };

  handleCreateAgent = async () => {
    let {client, instanceId} = this.state;
    let response = await client.envActionSpaceInfo(instanceId);
    this.setState({agent: new Agent(response.info.n)});
  };

  handleCloseAgent = () => {
    this.setState({agent: null});
  };

  handleStartMonitoring = async () => {
    let {client, instanceId, outDir} = this.state;
    await client.envMonitorStart(instanceId, outDir, true);
    this.setState({monitoring: true}, this.handleReset);
  };

  handleCloseMonitoring = async () => {
    let {client, instanceId} = this.state;
    await client.envMonitorClose(instanceId);
    this.setState({monitoring: false});
  };

  handleCloseClient = async () => {
    this.setState({client: null});
  };

  handleActStep = async () => {
    let {agent, client, instanceId, step} = this.state;
    let action = agent.act();
    let response = await client.envStep(instanceId, action, true);
    this.setState({ended: response.done, step: step+1});
  };

  handleActEpisode = async () => {
    let {agent, client, instanceId, step, episode} = this.state;
    let action = agent.act();
    let response = { done: false };
    while(!response.done) {
      response = await client.envStep(instanceId, action, true);
      this.setState({ended: response.done, step: step+1});
    }
    this.setState({episode: episode+1, step:0});
  };

  handleReset = async () => {
    let {instanceId, client} = this.state;
    let response = await client.envReset(instanceId);
    if(response) this.setState({ended: false, step: 0});
  };

  handleEnvChange = (e) => { this.setState({envId: e.target.value}) };
  handleServerChange = (e) => { this.setState({serverIp: e.target.value}) };


  render() {
    let {client, agent, serverIp, envId, instanceId, outDir, episode, step, ended, monitoring} = this.state;
    let instanceIdPresent = instanceId.length>0;
    return (
      <div className="app">
        <header className="app-header">

          <div className='ui'>
            <div className="row">
              <span>Server IP</span>
              <input type="text" value={serverIp} onChange={this.handleServerChange} />
              { !client && <button onClick={this.handleCreateClient}>Connect Client</button> }
              { client && !instanceIdPresent && <button onClick={this.handleCloseClient}>Close Client</button> }
            </div>
            <div className="row">
              <span>Env ID</span>
              <input type="text" value={envId} onChange={this.handleEnvChange} />
              { client && !instanceIdPresent && <button onClick={this.handleCreateEnv}>Create Game</button>}
              { client && instanceIdPresent && !agent && <button onClick={this.handleCloseEnv}>Close Game</button>}
            </div>
            <div className="row">
              <span>Instance ID</span>
              <input type="text" disabled value={instanceId} />
              { client && instanceIdPresent && !agent && <button onClick={this.handleCreateAgent}>Create Agent</button> }
              { client && instanceIdPresent && agent && !monitoring && <button onClick={this.handleCloseAgent}>Delete Agent</button> }
            </div>
            <div className="row">
              <span>Out Dir</span>
              <input type="text" disabled value={outDir} />
              { client && agent && instanceIdPresent && !monitoring &&
                  <button onClick={this.handleStartMonitoring}>Start Monitoring</button> }
              { client && agent && instanceIdPresent && monitoring &&
                  <button onClick={this.handleCloseMonitoring}>Close Monitoring</button> }
            </div>

            <div className="row">
              <span>Step</span>
              <input type="text" disabled value={step} />
              { client && agent && instanceIdPresent && monitoring && !ended &&
                  <button onClick={this.handleActStep}>Play Step</button> }
            </div>

            <div className="row">
              <span>Episode</span>
              <input type="text" disabled value={episode} />
              { client && agent && instanceIdPresent && monitoring && !ended &&
                  <button onClick={this.handleActEpisode}>Play Game</button> }
            </div>

            <div className="row">
              <span>Game Over?</span>
              <input type="text" disabled value={ended} />
              { client && agent && instanceIdPresent && monitoring && ended &&
                  <button onClick={this.handleReset} style={{background: '#EE0000'}}>Reset</button> }
            </div>
          </div>

        </header>
      </div>
    );
  }
}

export default App;
