const fs = require('fs');
const watch = require('node-watch');
const { JSDOM } = require('jsdom');
const path = require('path');
const http = require('http');
const static = require('node-static');
const colors = require('colors');

const Static = new static.Server('./lib/cache');

const defaultConfig = {
  path: './pages',
  mode: 'start',
  server: http.createServer(),
}

class Nebula {
  constructor(config) {
    this.paths = {};
    this.files = [];
    this.start = [];
  
    var that = this;
    that.config = Object.assign(defaultConfig, config);

    if (config.server) config.server.on('request', (req, res) => that.request(req, res));
  
    (async function() {
      that.pkgdir = await import('pkg-dir');
      
      that.baseDir = await that.pkgdir.packageDirectory();
      that.files = fs.readdirSync(that.config.path);
      that.paths = that.getPathsObject(that.files);
    
      that.build();
    
      if (that.config.mode=='start') that.start();
      if (that.config.mode=='dev') that.dev();
  
      //that.start.forEach(e=>e());
    })();
  };

  on(event, func) {
    this.start.push(func)
  };

  request(req, res, next = ()=>{}) {
    var that = this;
  
    function go() {

      if (req.url.startsWith('/__neb/')) return that.routeNebRequest(req, res);
      
      var updatedURL = req.url.split('?')[0].split('#')[0].replace(/^\//g, '');
    
      if (that.paths[updatedURL]) {
        var file = that.paths[updatedURL];
    
        res.writeHead(200, {'content-type': 'text/html'}).end(fs.readFileSync(path.join(__dirname, 'cache/'+file)));
      }
    
      return next();
    }
    
    if (!that.paths) return setTimeout(go, 100);
  
    return go();
  };

  routeNebRequest(req, res) {
    try {
      return res.writeHead(200, {'content-type': 'text/plain'}).end(fs.readFileSync(path.join(__dirname, req.url.split('?')[0].split('#')[0].replace('/__neb', ''))));
    } catch {
      return;
    }
  }

  getPathsObject(files) {
    var object = {};
    
    for (var file of files) {
      var name = file.replace('.nebula.html', '');
  
      if ('index'==name) name = '';
  
      object[name] = file;
    }
  
    return object;
  };

  getFilesObject(files) {
    var object = {};
    
    for (var file of files) {
      try {
        var code = fs.readFileSync(path.join(__dirname, '/cache/bare', path.parse(file).base)).toString();
  
        object[file] = btoa(code);
      } catch {
        
      }
    }
  
    return object;
  };

  update(file) {
    var startDate = new Date().getTime();
    
    const code = fs.readFileSync(path.join(this.baseDir, file)).toString();
  
    const dom = new JSDOM(code);
    var document = dom.window.document;

    fs.writeFileSync(path.join(__dirname, '/cache/bare', path.parse(file).base), dom.serialize());
  
    var ScriptInject = document.createElement('script');
  
    var ScriptFilesObject = this.getFilesObject(this.files);
    var ScriptRoutesObject = this.getPathsObject(this.files);

    ScriptInject.setAttribute('nebula-files', JSON.stringify(ScriptFilesObject));
    ScriptInject.setAttribute('nebula-routes', JSON.stringify(ScriptRoutesObject));
    ScriptInject.setAttribute('nebula-core', '1');
    ScriptInject.setAttribute('src', '/__neb/core/client.js');
    ScriptInject.setAttribute('type', 'application/javascript');
  
    document.head.insertAdjacentElement('afterbegin', ScriptInject);
  
    fs.writeFileSync(path.join(__dirname, '/cache', path.parse(file).base), dom.serialize());

    var endDate = new Date().getTime();
    var totalTime = ((endDate - startDate) / 1000).toFixed(2)

    console.log(colors.cyan(`Compile (${file}): ${totalTime}s`));
  };

  build() {
    var startDate = new Date().getTime();
    
    var dir = fs.readdirSync(this.config.path).filter(e=>e.includes('.nebula.'));
  
    dir.map(e=>this.update(path.join(this.config.path, e)));

    var endDate = new Date().getTime();
    var totalTime = ((endDate - startDate) / 1000).toFixed(2)

    console.log(colors.green(`Build Complete (${dir.length} files): ${totalTime}s`));
  };

  dev() {
    var that = this;
    
    watch(this.config.path, function(event, name) {
      var startDate = new Date().getTime();
      
      that.files = fs.readdirSync(that.config.path);
      that.paths = that.getPathsObject(that.files);
  
      if (!name.includes('.nebula.')) return;
      
      if (event=='update') {
        that.update(name);

        var endDate = new Date().getTime();
        var totalTime = ((endDate - startDate) / 1000).toFixed(2)
    
        console.log(colors.green(`Build Complete (1 files): ${totalTime}s`));
      }
    })
  };

  start() {
    
  };

  stop() {
    
  }
}

/*function Nebula(config) {
  this.paths = {};
  this.files = [];
  this.start = [];

  var that = this;

  (async function() {
    that.pkgdir = await import('pkg-dir');
    
    that.config = Object.assign(defaultConfig, config);
    that.baseDir = await that.pkgdir.packageDirectory();
    that.files = fs.readdirSync(that.config.path);
    that.paths = that.getPathsObject(that.files);
  
    that.build();
  
    if (that.config.mode=='start') that.start();
    if (that.config.mode=='dev') that.dev();

    //that.start.forEach(e=>e());
  })();
};

Nebula.prototype.on = function(event, func) {
  this.start.push(func)
}

Nebula.prototype.request = function(req, res, next = ()=>{}) {
  var that = this;

  function go() {
    console.log(that)
    
    var updatedURL = req.url.split('?')[0].split('#')[0];
  
    if (that.paths[updatedURL]) {
      var file = that.paths[updatedURL];
  
      req.writeHead(200, {'content-type': 'text/html'}).end(fs.readFileSync('cache/'+file));
    }
  
    return next();
  }
  
  if (!that.paths) return setTimeout(go, 100);

  return go();
}

Nebula.prototype.getPathsObject = function(files) {
  var object = {};
  
  for (var file of files) {
    var name = file.replace('.nebula.html', '');

    if ('index'==name) name = '/';

    object[name] = file;
  }

  return object;
}

Nebula.prototype.getFilesObject = function(files) {
  var object = {};
  
  for (var file of files) {
    try {
      var code = fs.readFileSync(path.join(this.baseDir, path.join(this.config.path, file))).toString();

      object[file] = btoa(code);
    } catch {
      
    }
  }

  return object;
}

Nebula.prototype.update = function(file) {
  const code = fs.readFileSync(path.join(this.baseDir, file)).toString();

  const dom = new JSDOM(code);
  var document = dom.window.document;

  var ScriptInject = document.createElement('script');

  var ScriptObject = this.getFilesObject(this.files);

  ScriptInject.textContent = JSON.stringify(ScriptObject);

  document.head.insertAdjacentElement('afterbegin', ScriptInject);

  fs.writeFileSync(path.join(__dirname, '/cache', path.parse(file).base), dom.serialize());
}

Nebula.prototype.build = function() {
  var dir = fs.readdirSync(this.config.path).filter(e=>e.includes('.nebula.'));

  dir.forEach(e=>this.update(path.join(this.config.path, e)));
}

Nebula.prototype.dev = function() {
  var that = this;
  
  watch(this.config.path, function(event, name) {
    that.files = fs.readdirSync(that.config.path);
    that.paths = that.getPathsObject(that.files);

    if (!name.includes('.nebula.')) return;
    
    if (event=='update') {
      that.update(name);
    }
  })
}

Nebula.prototype.start = async function() {
  
}

Nebula.prototype.stop = function() {
 
}*/

module.exports = Nebula;