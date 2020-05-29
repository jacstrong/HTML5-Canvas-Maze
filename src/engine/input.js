export default class Input {
  constructor() {
    this.keys = []
    this.keyPress = []
    
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = e.timeStamp;
      this.keyPress[e.key] = e.timeStamp;
    });
    window.addEventListener('keyup', (e) => {
      delete this.keys[e.key];
    });
  }

  clear() {
    this.keyPress = []
  }
}

