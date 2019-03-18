import axios from 'axios';

class Client {

  constructor(remote) {
    this.remote = remote;
    this.shouldLog = (process.env.SHOULD_LOG === "true");

    if (this.shouldLog) console.log("Logging enabled");
    else console.log("To enable logging, set SHOULD_LOG=true");
  }

  _parseServerErrors = async (promise) => {
    let response = await promise;
    let status = response.status, message = response.data["message"];
    if (status !== 200 && message !== undefined) {
      throw new Error("ERROR: Got status code " + status + "\nMessage: " + message);
    }
    else {
      return response.data;
    }
  };

  _buildURL = (route) => {
    return "" + this.remote + route;
  };

  _post = (route, data) => {
    if (this.shouldLog) console.log("POST " + route + "\n" + JSON.stringify(data));
    return this._parseServerErrors(axios.post(this._buildURL(route), data));
  };

  _get = (route) => {
    if (this.shouldLog) console.log("GET " + route);
    return this._parseServerErrors(axios.get(this._buildURL(route)));
  };

  envCreate = (envID) => {
    return this._post("/v1/envs/", { env_id: envID })
      .then(function (value) { return value; });
  };

  envListAll = () => {
    return this._get("/v1/envs/")
      .then(function (value) { return value; });
  };

  envReset = (instanceID) => {
    const route = "/v1/envs/" + instanceID + "/reset/";
    return this._post(route, null)
      .then(function (value) { return value.observation; });
  };

  envStep = (instanceID, action, render) => {
    if (render === void 0) { render = false; }
    const route = "/v1/envs/" + instanceID + "/step/";
    const data = {action: action, render: render};
    return this._post(route, data)
      .then(function (value) { return value; });
  };

  envActionSpaceInfo = (instanceID) => {
    const route = "/v1/envs/" + instanceID + "/action_space/";
    return this._get(route)
      .then(function (reply) { return reply; });
  };

  envObservationSpaceInfo = (instanceID) => {
    const route = "/v1/envs/" + instanceID + "/observation_space/";
    return this._get(route)
      .then(function (reply) { return reply; });
  };

  envMonitorStart = (instanceID, directory, force, resume) => {
    if (force === void 0) { force = false; }
    if (resume === void 0) { resume = false; }
    const route = "/v1/envs/" + instanceID + "/monitor/start/";
    return this._post(route, { directory: directory, force: force, resume: resume })
      .then(function (reply) { return; });
  };

  envMonitorClose = (instanceID) => {
    const route = "/v1/envs/" + instanceID + "/monitor/close/";
    return this._post(route, null)
      .then(function (reply) { return; });
  };

  envClose = (instanceID) => {
    const route = "/v1/envs/" + instanceID + "/close/";
    return this._post(route, null)
      .then(function (reply) { return; });
  };

  upload = (trainingDir, algorithmID, apiKey) => {
    if (algorithmID === void 0) { algorithmID = undefined; }
    if (apiKey === void 0) { apiKey = undefined; }
    if (apiKey === undefined) { apiKey = process.env["OPENAI_GYM_API_KEY"]; }

    this._post("/v1/upload/", {
      training_dir: trainingDir,
      algorithm_id: algorithmID,
      api_key: apiKey
    });
  };

  shutdownServer = (self) => {
    this._post("/v1/shutdown/", null);
  };

}


export default Client;