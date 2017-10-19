var io = require('socket.io')(6789);

var conn;
var r = require("rethinkdb");
r.connect({host: "localhost", port: 28015, db: "webcarve"}, function(err, c) {
  if (err) console.log(err);
  conn = c;
});

var projects = [];

io.on('connection', function(socket) {
  console.log("Socket connected");
  var project = null;
  var leaveProject = () => {
    if (project) {
      project.sockets.splice(project.sockets.indexOf(socket), 1);
      console.log("Project leaved with id "+project.id);
      if (project.sockets.length == 0) {
        projects.splice(projects.indexOf(project), 1);
        console.log("Project removed with id "+project.id);
      }
      project = null;
    }
  }
  socket.on('save-project', (id) => {

  });
  socket.on('join-project', (id, data) => {
    leaveProject();
    project = projects.find(el => el.id == id);
    if (!project) {
      project = {
        id: id,
        data: data,
        sockets: [socket]
      };
      projects.push(project);
      console.log("Project created with id "+id);
    } else {
      project.sockets.push(socket);
      socket.emit('update-project', project.data, true);
      console.log("Project joined with id "+id)
    }
  });
  socket.on('update-project', (data) => {
    if (project) {
      for (var s of project.sockets) {
        if (s != socket) s.emit('update-project', data);
      }
      for (var d in data) {
        project.data[d] = data[d];
      }
      console.log("Project updated");
    }
  });
  socket.on('disconnect', () => {
    leaveProject();
  });
});
