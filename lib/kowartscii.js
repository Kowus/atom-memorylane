const {
  CompositeDisposable
} = require('atom');
const moment = require('moment'),
  path = require('path');

module.exports = {

  subscriptions: null,
  disposable: null,
  prev_file: null,
  uzer:process.env.USER,

  activate(state) {
    this.disposable = atom.project.onDidChangeFiles(events => {
      for (const event of events) {
        if (event.action === 'created' && path.extname(event.path) === '.js') {
          // This check is necessary because the event sometimes gets called twice for the same file
          if (this.prev_file !== path.normalize(event.path)) {
            this.stamp(event.path);
            this.prev_file = path.normalize(event.path);
          }
        }
        // if file is deleted right after it was created
        else if(event.action === 'deleted' && this.prev_file === path.normalize(event.path)) {
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
  stamp(file_path, user) {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const stamp = `/*${'\n'} * ${path.basename(file_path)}\n * created by ${this.uzer}\n * on ${moment().format('ddd, MMM Do YYYY [at] hh:mm a')}${'\n'} */${'\n\n'}`;

      editor.buffer.insert([0, 0], stamp)
    }
  }
};