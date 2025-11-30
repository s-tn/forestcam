import fs from 'fs';
import watch from 'node-watch';
import { JSDOM } from 'jsdom';
import path from 'path';
import express from 'express';
import http from 'http';
import nodestatic from 'node-static';
import colors from 'colors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.dirSync = (dirPath) => {try {return (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory())} catch(e) {return false}};

const Static = new nodestatic.Server('./lib/cache');

const defaultConfig = {
  path: './pages',
  mode: 'start',
  server: (express()),
  port: 8080,
  static: './public',
}

class Nebula {
  constructor(config) {
    this.paths = {};
    this.files = [];
    this.plugins = {};
    this.start = [];
    this.importPaths = {};
  
    var that = this;
    that.config = Object.assign(defaultConfig, config);

    if (that.config.server) {
      this.server = this.config.server;
      this.server.http = http.createServer(this.server);
      this.config.server.use(function(req, res, next = ()=>{}) {
        return that.request(req, res, next);
      });

      this.config.server.use(function(req, res, next = ()=>{}) {
        return next();
      })

      this.config.server.use(express.static(that.config.static, {
        setHeaders: function (res, path) {
          res.set('Service-Worker-Allowed', '/');
        }
      }));
    }

    this.ready = new Promise(function(e) {
      (async function() {
        that.pkgdir = await import('pkg-dir');
        
        that.baseDir = await that.pkgdir.packageDirectory();
        that.files = fs.readdirSync(that.config.path);
        that.filesObj = that.getFilesObject(that.files);
        that.paths = that.getPathsObject(Object.entries(that.filesObj).map(e=>e[0]));
      
        that.build();
      
        if (that.config.mode=='start') that.start();
        if (that.config.mode=='dev') that.dev();
  
        that.server.http.listen(that.config.port);

        return e()
      })();
    })
  };

  on(event, func) {
    this.start.push(func)
  };

  request(req, res, next = ()=>{}) {
    var that = this;

    function go() {
      if (res.headersSent) return;
      if (res.writableEnded) return;

      if (req.url.startsWith('/socket.io/')) return next();

      if (req.url.startsWith('/__neb/')) return that.routeNebRequest(req, res);

      // SEO: Serve robots.txt
      if (req.url === '/robots.txt') {
        try {
          return res.writeHead(200, {'content-type': 'text/plain'}).end(fs.readFileSync(path.join(that.baseDir, 'public/robots.txt')));
        } catch(e) {
          return next();
        }
      }

      // SEO: Serve sitemap.xml
      if (req.url === '/sitemap.xml') {
        try {
          return res.writeHead(200, {'content-type': 'application/xml'}).end(fs.readFileSync(path.join(that.baseDir, 'public/sitemap.xml')));
        } catch(e) {
          return next();
        }
      }

      var updatedURL = req.url.split('?')[0].split('#')[0].replace(/^\//g, '').replace(/\/$/g, '');

      if (that.paths[updatedURL]) {
        var file = that.paths[updatedURL];

        // SEO: Enhanced HTTP headers for HTML pages
        return res.writeHead(200, {
          'content-type': 'text/html; charset=utf-8',
          'Service-Worker-Allowed': '/',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }).end(fs.readFileSync(path.join(__dirname, 'cache/'+file)));
      }

      /*if (that.paths['404']) {
        var file = that.paths['404'];

        return res.writeHead(200, {'content-type': 'text/html; charset=utf-8'}).end(fs.readFileSync(path.join(__dirname, 'cache/'+file)));
      }*/

      return next();
    }

    return go();
  };

  routeNebRequest(req, res) {
    try {
      return res.writeHead(200, {'content-type': req.url.endsWith('.js')?'application/javascript':'text/plain'}).end(fs.readFileSync(path.join(__dirname, req.url.split('?')[0].split('#')[0].replace('/__neb', ''))));
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
    var that = this;
    var object = {};
    
    for (var file of files) {
      if (file!=='styles') {
        try {
            var code = fs.readFileSync(path.join(__dirname, '/cache/__neb_bare', file)).toString();
    
          object[file] = (code);
        } catch(g) {
          function checkSystem(file) {
            if (g.toString().startsWith(`Error: ENOENT: no such file or directory`)) object[file] = '';
            if (fs.dirSync(path.join(that.config.path, file))) {
              if (!fs.dirSync(path.join(__dirname, '/cache/', file))) {
                try {
                  fs.mkdirSync(path.join(__dirname, '/cache/__neb_bare', file));
                } catch {}

                try {
                fs.mkdirSync(path.join(__dirname, '/cache/', file));
                } catch(e) {console.log(e)}
              };
              var readDir = fs.readdirSync(path.join(that.config.path, file));
  
              for (var efile of readDir) {
                if (fs.dirSync(path.join(that.config.path, file, efile))) {
                  return checkSystem(path.join(file, efile));
                }

                object[path.join(file, efile)] = fs.readFileSync(path.join(that.config.path, file, efile)).toString();
              }
            }
          }

          checkSystem(file);
        };
      }
    }
  
    return object;
  };

  update(file) {
    try {
      var that = this;
      
      var startDate = new Date().getTime();
      
      const code = fs.readFileSync(path.join(this.baseDir, file)).toString();
    
      const dom = new JSDOM(code, {
        contentType: "text/html",
      });
      var document = dom.window.document;
    
      var ScriptInject = document.createElement('script');
      
      this.files = Object.entries(this.getFilesObject(this.files)).map(e=>e[0]);
    
      var ScriptFilesObject = this.getFilesObject(this.files);
      var ScriptRoutesObject = this.getPathsObject(this.files);
  
      ScriptInject.setAttribute('nebula-files', JSON.stringify(ScriptFilesObject));
      ScriptInject.setAttribute('nebula-routes', JSON.stringify(ScriptRoutesObject));
      ScriptInject.setAttribute('nebula-core', '-10');
      ScriptInject.setAttribute('src', '/__neb/core/client.js');
      ScriptInject.setAttribute('type', 'application/javascript');
    
      document.head.insertAdjacentElement('afterbegin', ScriptInject);

      var ProxyScript = document.createElement('script');
      ProxyScript.setAttribute('nebula-core', '-9');
      ProxyScript.src = '/__neb/core/proxy.js';
      document.head.insertAdjacentElement('afterbegin', ProxyScript);

      var UtilsScript = document.createElement('script');
      UtilsScript.setAttribute('nebula-core', '-8');
      UtilsScript.src = '/__neb/core/util.js';
      document.head.insertAdjacentElement('afterbegin', UtilsScript);
      
      var links = document.querySelectorAll('link');
  
      for (var link of links) {
        if (link.rel=='stylesheet') {
          try {
            var linkText = (fs.readFileSync(path.join(that.config.path, link.getAttribute('href'))).toString());
            if (!that.importPaths[file]) that.importPaths[file] = [];
            that.importPaths[file].push(path.parse(link.getAttribute('href')).base);
  
            var newElem = document.createElement('style');
  
            newElem.textContent = linkText;
  
            link.replaceWith(newElem)
          } catch(e) {
            
          }
        }
      }

      console.log(file)
    
      fs.writeFileSync(path.join(__dirname, '/cache', file.replace('pages/', '')), dom.serialize());
  
      ScriptInject.remove();
      ProxyScript.remove();
      UtilsScript.remove();
  
      fs.writeFileSync(path.join(__dirname, '/cache/__neb_bare', file.replace('pages/', '')), dom.serialize());
  
      var endDate = new Date().getTime();
      var totalTime = ((endDate - startDate) / 1000).toFixed(2)
  
      console.log(colors.cyan(`Compile (${file}): ${totalTime}s`));
    } catch(e) {
      console.log(e)
    }
  };

  build() {
    var startDate = new Date().getTime();
    
    var dir = Object.entries(this.filesObj).map(e=>e[0]).filter(e=>e.includes('.nebula.'));
  
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
      that.filesObj = that.getFilesObject(that.files);
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

export default Nebula;