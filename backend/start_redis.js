const RedisServer = require('redis-server');

const server = new RedisServer(6379);

server.open((err) => {
  if (err) {
    console.log('Redis server status:', err.message || err);
  } else {
    console.log('Redis server started on port 6379!');
  }
});
