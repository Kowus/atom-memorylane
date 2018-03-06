const {
  CompositeDisposable
} = require('atom'),
  moment = require('moment'),
  path = require('path'),
  request = require('request');
var navigator = {};
navigator.geolocation = {};
navigator.geolocation.getCurrentPosition = function(callback) {
  request('http://freegeoip.net/json/', function(err, response, body) {
    if (err) return callback(err);
    let data = JSON.parse(body);
    // console.log(response);
    var position = {
      ip: data.ip,
      country_code: data.country_code,
      country_name: data.country_name,
      city: data.city,
      zip_code: data.zip_code,
      coords: {
        latitude: data.latitude,
        longitude: data.longitude
      }
    };
    callback(null, data);
  });
};



module.exports = {

  subscriptions: null,
  disposable: null,
  prev_file: null,
  uzer: process.env.USER || process.env.USERNAME,
  location: null,

  activate(state) {
    this.disposable = atom.project.onDidChangeFiles(events => {
      for (const event of events) {
        if (event.action === 'created' && path.extname(event.path) === '.js') {
          // This check is necessary because the event sometimes gets called twice for the same file and prevent node_modules

          if (this.prev_file !== path.normalize(event.path)) {
            this.stamp(event.path);
            this.prev_file = path.normalize(event.path);
          }
        }
        // if file is deleted right after it was created
        else if (event.action === 'deleted' && this.prev_file === path.normalize(event.path)) {
          this.prev_file = null;
        }
      }
    })
  },

  deactivate() {
    this.subscriptions.dispose();
    this.disposable.dispose();
    this.prev_file.dispose();
  },
  stamp(file_path) {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor && path.normalize(editor.getPath()) == path.normalize(file_path)) {
      let stamp;
      navigator.geolocation.getCurrentPosition((err, position) => {
        if (err) stamp = `/*${'\n'} * ${path.basename(file_path)}\n * created by ${this.uzer}\n * on ${moment().format('ddd, MMM Do YYYY [at] hh:mm a')}${'\n'} */${'\n\n'}`;
        else {
          let postring;
          if (position.city) postring = `${position.city}, ${position.country_code}`
          else postring = position.country_name
          stamp = `/*${'\n'} * ${path.basename(file_path)}\n * created by ${this.uzer}\n * on ${moment().format('ddd, MMM Do YYYY [at] hh:mm a')}\n * location: ${postring} ${'\n'} */${'\n\n'}`;
        }
        editor.buffer.insert([0,0], stamp)
      })


      // editor.buffer.insert([0, 0], stamp)
    }
  }
};