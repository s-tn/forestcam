(function() {
  
  const neb = nebula({
    path: './pages',
    mode: 'dev',
  });
  
  const { router } = neb;

  navigator.serviceWorker.register('/pwa.js', {scope: '/'});
  
  neb.addEventListener('load', {initial: true, promise: true}, function(e) {
    var iconContainer = document.querySelector('.icon');
    var icon = document.getElementById("icon");
    var icon1 = document.getElementById("a");
    var icon2 = document.getElementById("b");
    var icon3 = document.getElementById("c");
    var mobileMenu = document.getElementById("mobile-navmenu");

    function toggleMobileMenu() {
      icon1.classList.toggle('a');
      icon2.classList.toggle('c');
      icon3.classList.toggle('b');
      mobileMenu.classList.toggle('active');

      // Update ARIA attribute
      const isExpanded = mobileMenu.classList.contains('active');
      iconContainer.setAttribute('aria-expanded', isExpanded);
    }

    if (icon && mobileMenu) {
      icon.addEventListener('click', toggleMobileMenu);

      // Add close button to mobile menu
      if (!mobileMenu.querySelector('.mobile-menu-close')) {
        const closeButton = document.createElement('button');
        closeButton.className = 'mobile-menu-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close navigation menu');
        closeButton.addEventListener('click', toggleMobileMenu);
        mobileMenu.insertBefore(closeButton, mobileMenu.firstChild);
      }
    }
  });
  
  const socket = io();

  window.nebula = nebula,
    window.socket = socket,
    window.router = router;
})();