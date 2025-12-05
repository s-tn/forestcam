(function() {

  const neb = nebula({
    path: './pages',
    mode: 'dev',
  });

  const { router } = neb;

  navigator.serviceWorker.register('/pwa.js', {scope: '/'});

  // Mobile menu functions that query elements fresh each time
  function toggleMobileMenu() {
    const icon1 = document.getElementById("a");
    const icon2 = document.getElementById("b");
    const icon3 = document.getElementById("c");
    const mobileMenu = document.getElementById("mobile-navmenu");
    const iconContainer = document.querySelector('.icon');

    if (icon1 && icon2 && icon3 && mobileMenu && iconContainer) {
      icon1.classList.toggle('a');
      icon2.classList.toggle('c');
      icon3.classList.toggle('b');
      mobileMenu.classList.toggle('active');

      // Update ARIA attribute
      const isExpanded = mobileMenu.classList.contains('active');
      iconContainer.setAttribute('aria-expanded', isExpanded);
    }
  }

  function closeMobileMenu() {
    const icon1 = document.getElementById("a");
    const icon2 = document.getElementById("b");
    const icon3 = document.getElementById("c");
    const mobileMenu = document.getElementById("mobile-navmenu");
    const iconContainer = document.querySelector('.icon');

    if (mobileMenu && mobileMenu.classList.contains('active')) {
      icon1.classList.remove('a');
      icon2.classList.remove('c');
      icon3.classList.remove('b');
      mobileMenu.classList.remove('active');
      iconContainer.setAttribute('aria-expanded', 'false');
    }
  }

  // Mobile menu initialization - runs on every page load
  neb.addEventListener('load', {initial: true, promise: true}, function(e) {
    const icon = document.getElementById("icon");
    const mobileMenu = document.getElementById("mobile-navmenu");

    if (icon && mobileMenu) {
      // Remove old listeners first to prevent duplicates
      icon.removeEventListener('click', toggleMobileMenu);
      icon.removeEventListener('touchend', toggleMobileMenu);

      // Re-attach listeners on every page load (DOM gets replaced)
      icon.addEventListener('click', toggleMobileMenu);
      // Add touchend for better mobile support
      icon.addEventListener('touchend', function(e) {
        e.preventDefault(); // Prevent double-firing with click
        toggleMobileMenu();
      });

      // Add close button if it doesn't exist
      if (!mobileMenu.querySelector('.mobile-menu-close')) {
        const closeButton = document.createElement('button');
        closeButton.className = 'mobile-menu-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close navigation menu');
        closeButton.addEventListener('click', toggleMobileMenu);
        closeButton.addEventListener('touchend', function(e) {
          e.preventDefault();
          toggleMobileMenu();
        });
        mobileMenu.insertBefore(closeButton, mobileMenu.firstChild);
      }
    }
  });

  const socket = io();

  window.nebula = nebula,
    window.socket = socket,
    window.router = router;
})();