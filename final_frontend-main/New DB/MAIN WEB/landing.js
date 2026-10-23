(function initLandingPage() {
  'use strict';

  // 1. Intersection Observer for lightweight, performant scroll animations
  const setupScrollReveals = () => {
    // Respect user preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.lp-reveal');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Disconnect observer after animation to save performance
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  };

  // 2. Sticky Navigation Logic
  const setupStickyNav = () => {
    const header = document.getElementById('lp-header');
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('lp-scrolled');
      } else {
        header.classList.remove('lp-scrolled');
      }
    };

    // Passive event listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger on load
  };

  // 3. Mobile Navigation Toggle
  const setupMobileNav = () => {
    const toggleBtn = document.getElementById('lp-mobile-toggle');
    const navMenu = document.getElementById('lp-nav-menu');
    
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-open');
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target.closest('a[href^="#"]')) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      }
    });
  };

  const setupLandingViews = () => {
    const wrapper = document.querySelector('.lp-wrapper');
    if (!wrapper) return;

    const views = {
      home: { title: 'SIERRA HAVEN | Property & Lease Portal', nav: '#home' },
      properties: { title: 'Properties | SIERRA HAVEN', nav: '#properties' },
      about: { title: 'About SIERRA HAVEN', nav: '#about' },
      'how-it-works': { title: 'How It Works | SIERRA HAVEN', nav: '#how-it-works' }
    };
    const viewForHash = (hash) => {
      const requestedView = hash.slice(1);
      if (requestedView === 'faq') return 'how-it-works';
      return Object.prototype.hasOwnProperty.call(views, requestedView) ? requestedView : 'home';
    };

    const renderView = () => {
      const view = viewForHash(window.location.hash);
      wrapper.dataset.activeView = view;
      document.title = views[view].title;
      document.querySelectorAll('.lp-nav-link[href^="#"]').forEach((link) => {
        if (link.getAttribute('href') === views[view].nav) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href');
      if (!hash || !views[viewForHash(hash)]) return;
      event.preventDefault();
      if (window.location.hash === hash) renderView();
      else window.location.hash = hash;
    });
    window.addEventListener('hashchange', renderView);
    renderView();
  };

  const propertyStorageKey = 'haven-property-listings';
  const propertyImageFallbacks = {
    Apartment: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    Condominium: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    Townhouse: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=85',
    'Single-family': 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85',
    Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85'
  };

  const safePropertyImage = (image, type) => {
    if (/^data:image\/jpeg;base64,/i.test(image || '')) return image;
    if (image) {
      try {
        const url = new URL(image, window.location.href);
        if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
      } catch (error) {
        console.error('Unable to use the saved property image URL.', error);
      }
    }
    return propertyImageFallbacks[type] || propertyImageFallbacks.Apartment;
  };

  const createAdminPropertyCard = (property) => {
    const card = document.createElement('article');
    card.className = 'lp-property-card lp-reveal lp-reveal-up is-visible';
    card.dataset.adminPropertyCard = '';
    card.dataset.location = `${property.location || ''} ${property.name || ''}`.toLowerCase();
    card.dataset.type = String(property.type || '').toLowerCase();

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'lp-card-image-wrapper';
    const image = document.createElement('img');
    image.className = 'lp-card-image';
    image.src = safePropertyImage(property.image, property.type);
    image.alt = `${property.name || 'Property'} exterior`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 600;
    image.height = 400;
    imageWrapper.append(image);
    const badge = document.createElement('span');
    badge.className = 'lp-badge';
    badge.textContent = 'For Rent';
    imageWrapper.append(badge);

    const content = document.createElement('div');
    content.className = 'lp-card-content';
    const title = document.createElement('h3');
    title.className = 'lp-card-title';
    title.textContent = property.name || 'Property';
    const location = document.createElement('p');
    location.className = 'lp-card-location';
    location.textContent = property.location || '';
    const details = document.createElement('div');
    details.className = 'lp-card-details';
    const type = document.createElement('span');
    type.textContent = property.type || 'Property';
    const units = Number(property.units) || 0;
    const occupied = Number(property.occupied) || 0;
    const availability = document.createElement('span');
    availability.textContent = `${Math.max(0, units - occupied)} of ${units} units available`;
    details.append(type, availability);

    const footer = document.createElement('div');
    footer.className = 'lp-card-footer';
    const price = document.createElement('span');
    price.className = 'lp-card-price';
    price.textContent = `$${(Number(property.rent) || 0).toLocaleString()} / mo`;
    const link = document.createElement('a');
    link.className = 'lp-btn lp-btn-outline';
    link.href = `../LOGIN%20PANEL/Index.html?property=${encodeURIComponent(property.id || '')}`;
    link.textContent = 'View Details';
    footer.append(price, link);
    content.append(title, location, details, footer);
    card.append(imageWrapper, content);
    return card;
  };

  const setupPropertyListings = () => {
    const grid = document.getElementById('lp-property-grid');
    if (!grid) return;

    const renderSavedProperties = () => {
      grid.querySelectorAll('[data-admin-property-card]').forEach(card => card.remove());
      try {
        const storedProperties = localStorage.getItem(propertyStorageKey);
        if (storedProperties === null) return;
        const properties = JSON.parse(storedProperties);
        if (!Array.isArray(properties)) throw new Error('Saved property data is not a list.');
        properties
          .filter(property => property && property.status === 'Active')
          .forEach(property => grid.append(createAdminPropertyCard(property)));
      } catch (error) {
        console.error('Unable to load saved property listings.', error);
        const status = document.getElementById('lp-search-status');
        if (status) {
          status.hidden = false;
          status.textContent = 'Admin property listings could not be loaded in this browser.';
        }
      }
    };

    renderSavedProperties();
    window.addEventListener('storage', event => {
      if (event.key === propertyStorageKey || event.key === null) renderSavedProperties();
    });
  };

  // Filter sample and admin-managed listings together.
  const setupSearchForm = () => {
    const form = document.getElementById('lp-search-form');
    const status = document.getElementById('lp-search-status');
    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('lp-location').value.trim().toLowerCase();
      const type = document.getElementById('lp-type').value;
      const propertyCards = document.querySelectorAll('.lp-property-card');
      let matches = 0;

      propertyCards.forEach((card) => {
        const matchesLocation = !location || card.dataset.location.includes(location);
        const matchesType = type === 'all' || card.dataset.type === type;
        const isMatch = matchesLocation && matchesType;
        card.hidden = !isMatch;
        if (isMatch) matches += 1;
      });

      status.hidden = false;
      status.textContent = matches
        ? `${matches} ${matches === 1 ? 'listing matches' : 'listings match'} your search.`
        : 'No listings match those filters. Try another location or property type.';
      if (window.location.hash === '#properties') {
        document.querySelector('.lp-wrapper').dataset.activeView = 'properties';
      } else {
        window.location.hash = 'properties';
      }
    });
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveals();
    setupStickyNav();
    setupMobileNav();
    setupLandingViews();
    setupPropertyListings();
    setupSearchForm();
  });


  // Update existing login/signup links when a Supabase session is active.
  const updateSupabaseNav = async () => {
    if (!window.sierraSupabase) return;
    try {
      const { data } = await window.sierraSupabase.auth.getSession();
      if (!data.session) return;
      document.querySelectorAll('a[href*="LOGIN%20PANEL/Index.html?mode=login"], a[href*="LOGIN%20PANEL/Index.html?mode=signup"]').forEach(link => {
        link.href = 'tenant-dashboard.html#overview';
        if (/signup/i.test(link.textContent)) link.textContent = 'My Dashboard';
        else if (/log in/i.test(link.textContent)) link.textContent = 'My Dashboard';
      });
    } catch (error) { console.warn('Could not update account navigation.', error); }
  };
  updateSupabaseNav();
})();