(function() {
  const currentScript = document.currentScript;

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
    };

    route(url) {
      this.#historyReplace(url);

      const newHTML = this.parent.files[this.parent.routes[location.pathname.replace(/^\//g, '')]];

      this.loadNewPage(newHTML);
    };

    #historyReplace(url) {
      if (url.includes(location.origin)) url = url;
        else url = new URL(url, new URL(location.origin));
      return history.replaceState(null, null, url);
    };

    loadPage() {
      document.querySelectorAll('*[nebula-link]').forEach(node => {
        node.addEventListener('click', function(e) {
          e.preventDefault();
        })
      })
    }
  }
  
  window.nebula = function(config = {}) {   
    const object = {
      router: new Router(config),
      path: location,
      files: JSON.parse(currentScript.getAttribute('nebula-files')),
      routes: JSON.parse(currentScript.getAttribute('nebula-routes')),
      dev: {},
    };

    if (config.mode=='dev') object.dev = new DevWatch(config);

    object.router.parent = object;

    return object;
  };
})();