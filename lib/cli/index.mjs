import { program } from 'commander';
import path from 'path';
import Nebula from '../index.mjs';

import socketio from './plugin/socket.io.mjs';

var opts = {}

program
  .command('dev')
  .action((e)=>opts.mode='dev');

program
  .command('start')
  .action((e)=>opts.mode='start');

program
  .option('--server <type> <path>', 'HTTP Server');

program
  .option('--plugin <plugins>', 'Plugins <socket.io> <webpack>');

program
  .option('-p, --port <port>', 'set process port');

program
  .option('-pwa, --pwa', 'create progressive web app serviceworker');

program
  .option('-s, --static <path>', 'set static file directory');

program
  .option('-d, --dir <path>', 'set directory for route pages');

program.parse();

const options = program.opts();

if (options.static) opts.static = options.static;
if (options.port) opts.port = options.port;

const nebula = new Nebula(opts);

if (options.pwa) nebula.createPWA;

nebula.ready.then(async () => {
  await new Promise(e=>setTimeout(e, 1000));
  if (options.plugin) {
    var plugins = options.plugin.split(' ');

    for (var plugin of plugins) {
      if (plugin=='socket.io') {

        nebula.plugins[plugin] = socketio(nebula.server.http);
      }
    }
  }
  
  if (options.server) {
    var serverType = options.server.split(' ')[0];
    var serverFiles = options.server.split(' ').splice(1);
  
    var server = nebula.server;
    
    for (var file of serverFiles) {
      if (serverType=='express') {
        (await import(path.join(nebula.baseDir, file))).default(server, nebula);
      }
    
      if (serverType=='http') {
        (await import(path.join(nebula.baseDir, file))).default(server.http, nebula);
      }
    }
  };

  nebula.server.use((req, res, next) => {
    
  })
});