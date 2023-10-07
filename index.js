const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server,{transports:["websockets"]});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log("Server is running on port 3001");
});

app.get("/",(req,res)=>{
  res.send("Wohoo.. Our server is live now");
});


const players = {};
const speed = 0.5;
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  players[socket.id] = {
    name: "Unknown",
    position: [10 * Math.random(), 1.5, 10 * Math.random()],
    rotation: [0, Math.random(), 0],
    color: "#ffffff",
  };

  console.log(players);

  socket.on("connect", (data) => {
    io.emit("connect_user", data);
  });

  socket.on("keyDown", (key) => {
    const car = players[socket.id];
    switch (key) {
      case "KeyW":
        car.position[2] += Math.cos(car.rotation[1]) * speed;
        car.position[0] += Math.sin(car.rotation[1]) * speed;
        break;
      case "KeyS":
        car.position[2] -= Math.cos(car.rotation[1]) * speed;
        car.position[0] -= Math.sin(car.rotation[1]) * speed;
        break;
      case "KeyA":
        car.rotation[1] += speed * 0.05;
        break;
      case "KeyD":
        car.rotation[1] -= speed * 0.05;
    }
    
  });

  socket.on("colorUpdated", (color) => {
    players[socket.id].color = color;
  });

  socket.on("disconnect", (reason) => {
    console.log(reason);
    delete players[socket.id];
  });
});

setInterval(() => {
  io.emit("players", players);
}, 15);


