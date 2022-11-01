(function() {
  
  const neb = nebula({
    path: './pages',
    mode: 'dev',
  });
  
  const { router } = neb;

  navigator.serviceWorker.register('/pwa.js', {scope: '/'});
  
  neb.addEventListener('load', {initial: true, promise: true}, function(e) {
    var icon = document.getElementById("icon");
    var icon1 = document.getElementById("a");
    var icon2 = document.getElementById("b");
    var icon3 = document.getElementById("c");
  
    if (icon) {
      icon.addEventListener('click', function() {
        icon1.classList.toggle('a');
        icon2.classList.toggle('c');
        icon3.classList.toggle('b');
        if ($('#mobile-navmenu')[0].style.height === "0px") {
          $('#mobile-navmenu').show()
          $('#mobile-navmenu')[0].style.height = "calc(100vh - 20px)"
          $('#mobile-navmenu')[0].style.padding = "10px 5px 10px 5px"
          $('#mobile-navmenu a').fadeIn(500)
        } else {
          $('#mobile-navmenu')[0].style.height = "0"
          $('#mobile-navmenu a').fadeOut(500, () => $('#mobile-navmenu')[0].style.padding = "0")
        }
      });
    };
  });
  
  const socket = io();

  window.nebula = nebula,
    window.socket = socket,
    window.router = router;
})();