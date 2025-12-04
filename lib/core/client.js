(function() {
  const listeners = {
    load: [],
  }

  const currentScript = document.currentScript;

  function loadScript(src, location = 'body') {
    return new Promise(e => {
      src = document.querySelector('script[src="' + src + '"]').getAttribute('src');
      var script = document.querySelector('script[src="' + src + '"]');
      var newS = document.createElement('script');
      newS.setAttribute('src', src);
      if (script.getAttribute('type')) newS.setAttribute('type', script.getAttribute('type'));
      if (script.getAttribute('onerror')) newS.setAttribute('onerror', script.getAttribute('onerror'));
      if (script.getAttribute('onload')) newS.setAttribute('onload', script.getAttribute('onload'));
      newS.onload = function() {
        e();
      };
      newS.onerror = function() {
        e();
      }

      script.remove();
      document[location].appendChild(newS);
    })
  };

  function loadLink(href, location = 'head') {
    return new Promise(e => {
      href = document.querySelector('link[href="' + href + '"]').getAttribute('href');
      var rel = document.querySelector('link[href="' + href + '"]').getAttribute('rel');
      var link = document.querySelector('link[href="' + href + '"]');

      if (rel=='icon'||rel=='shortcut icon') return;
      
      var newS = document.createElement('link');
      newS.setAttribute('href', href);
      newS.setAttribute('rel', rel);
      newS.onload = function() {
        e();
      };
      newS.onerror = function() {
        e();
      }

      document[location].appendChild(newS);
    })
  }

  class DevWatch {
    open = false;
    
    constructor(config) {
      if (config.mode!=='dev') return;

      this.config = config;

      this.createWS();
    };

    createWS() {
      this.ws = new WebSocket(location.protocol.replace('http', 'ws')+'//'+location.host+'/__neb/ws/dev');

      this.ws.onopen = this.open;
      this.ws.onmessage = this.message;
    };

    open(e) {
      this.open = true;
    };

    message(e) {
      console.log(e.data)
    }
  }
  
  class Router {
    parent = {};
    
    constructor(config) {
      this.config = config;

      this.loadPage();

      this.createListeners();
    };

    createListeners() {
      var that = this;

      window.addEventListener('popstate', function(event) {
        event.preventDefault();

        return that.route(location.pathname);
      })
    }

    route(url = '') {
      url = url.replace(/(^\/|\/$)/g, '')
      
      var that = this;

      var og = location.href+''

      var a = document.createElement('a');

      a.href = url;

      if (location.pathname==new URL(a.href).pathname&&this.config.forceReload==false) return;

      const newHTML = (this.parent.files[this.parent.routes[new URL(a.href).pathname.replace(/^\//g, '')]]);

      this.loadNewPage(newHTML, url);
    };

    async loadNewPage(html, url) {
      var that = this;

      const parsed = new DOMParser().parseFromString(html, 'text/html');

      const staticElements = [...document.querySelectorAll('*[nebula-static], *[nebula-core]'), ...document.querySelectorAll('html, head, body')],
        headElements = [...document.head.querySelectorAll('*')],
        bodyElements = [...document.body.querySelectorAll('*')],
        allElements = [...document.querySelectorAll('*')];

      [...document.body.childNodes].filter(e=>e instanceof Text).forEach(e=>e.remove());

      const parseIgnore = [...parsed.querySelectorAll('html, head, body')],
        parseHead = [...parsed.head.childNodes],
        parseBody = [...parsed.body.childNodes],
        parseAll = [...parsed.querySelectorAll('*')];

      async function goBody() {
        for (var el of parseBody) {
          var go = true;
          if (el.getAttribute && el.getAttribute('nebula-static')) {
            const a = el.getAttribute('nebula-static');
  
            if (staticElements.find(e=>e.getAttribute('nebula-static')==a)) go = false;
          }
          
          if (go) document.body.appendChild(el);
  
          if (go&&el instanceof HTMLScriptElement) {
            console.log(el.getAttribute('src'))
            //await (await loadScript(el.getAttribute('src'), 'body'));

            loadScript(el.getAttribute('src'), 'body');
  
            el.remove();
          };
  
          if (el.style) el.setAttribute('og-display', el.style.display);
  
          if (el.style) el.style.display = 'none';
        };
  
        bodyElements.forEach(el => (staticElements.indexOf(el)==-1)?el.remove():null);
  
        parseBody.forEach(e=>{
          if (!e.style) return;
          
          e.style.display = e.getAttribute('og-display');
          
          e.removeAttribute('og-display');
        });
      }

      var deleteLinks = [];

      async function goHead() {
        for (var el of parseHead) {
          var go = true;
          if (el.getAttribute && el.getAttribute('nebula-static')) {
            const a = el.getAttribute('nebula-static');
  
            if (staticElements.find(e=>e.getAttribute('nebula-static')==a)) go = false;
          }
          
          if (go) document.head.appendChild(el);
  
          if (go&&el instanceof HTMLLinkElement&&el.rel=='stylesheet') {
            deleteLinks.push(el);
            await (await loadLink(el.getAttribute('href'), 'head'));
            //loadLink(el.getAttribute('href'), 'head')
          }
  
          if (go&&el instanceof HTMLScriptElement&&el.getAttribute('src')) {
            await (await loadScript(el.getAttribute('src'), 'head'));
          }
        };
      }

      await goHead();
      goBody();

      deleteLinks.forEach(e=>e.remove());
      
      allElements.forEach(el => (staticElements.indexOf(el)==-1)?el.remove():null);

      that.historyReplace(url);
      
      this.loadPage();

      return true;
    }

    historyReplace(url) {
      if (url.includes(location.origin)) url = url;
        else url = new URL(url, new URL(location.origin));
      return history.pushState(null, null, url);
    };

    loadPage() {
      var that = this;
      
      document.querySelectorAll('*[nebula-link]').forEach(node => {
        node.addEventListener('click', function(e) {
          e.preventDefault();

          that.route(node.href);
        });
      });

      document.removeEventListener('click', this.clickListener);
      document.addEventListener('click', this.clickListener);

      for (var listener of listeners['load']) {
        this.loadListener(listener);
      }
    }

    loadListener([callback, initial]) {
      var that = this;
      
      const event = (new NebulaLoadEvent({name:location.pathname, html: (this.parent.files[this.parent.routes[new URL(location.href).pathname.replace(/^\//g, '')]])}));

      callback(event);

      if (typeof event.returnValue !== 'undefined') {
        console.log(event)
        if (event.returnValue instanceof Promise) {
          event.returnValue.then(e=>{
            if (typeof e == 'string') {
              
              that.loadNewPage(e, location.pathname);
            }
          })
        }

        if (typeof event.returnValue == 'string') {
          that.loadNewPage(event.returnValue, location.pathname);
        }
      };

    }

    clickListener(e) {
      // listener redundancy to prevent leaks of <anchor> requests.
      
      if (e.path) {
        if (e.path.find(e=>e.getAttribute&&e.getAttribute('nebula-link')!==null)) {
          setTimeout(function() {
            
          })
        };
      }
    }
  }

  class NebulaLoadEvent extends Event {
    constructor(obj) {
      super('load', {});

      this.obj = obj;
    };

    respondWith(value) {
      this.returnValue = value;
    }
    
    get path() {
      return this.obj.name;
    };

    get html() {
      return this.obj.html||'';
    }
  }

  const defaultConfig = {
    mode: 'dev',
    path: './pages',
    forceReload: false,
  }
  
  window.nebula = function(config = {}) {   
    config = Object.assign(defaultConfig, config);
    
    const object = {
      router: new Router(config),
      path: location,
      files: JSON.parse(currentScript.getAttribute('nebula-files')),
      routes: JSON.parse(currentScript.getAttribute('nebula-routes')),
      dev: {},
      addEventListener(event, config = {}, callback) {
        listeners[event].push([callback, config.initial||false, config.promise||false]);

        if (config.initial) object.router.loadListener([callback, config.initial, config.promise]);

        return callback;
      }
    };

    if (config.mode=='dev') object.dev = new DevWatch(config);

    object.router.parent = object;

    return object;
  };
})();