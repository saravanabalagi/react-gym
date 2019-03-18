class Agent {

  constructor(noOfActions) {
    this.noOfActions = noOfActions;
  }

  act = (observation, reward, done) => {
    let {noOfActions} = this;
    return Math.floor(Math.random() * noOfActions);
  }

}

export default Agent;