// ==========================================================================
// KABINET RAHMAN 25 - CORE SCRIPT (CLAYMORPHISM INTERACTION ENGINE)
// ==========================================================================

// 1. Theme Management (Light & Dark Clay State Controller)
const themeButton = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');

if (themeButton) {
  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.setAttribute('aria-label', theme === 'dark' ? 'Aktifkan tema terang' : 'Aktifkan tema gelap');
    const symbol = themeButton.querySelector('.theme-symbol');
    if (symbol) {
      symbol.textContent = theme === 'dark' ? '☀' : '◐';
    }
    themeMeta?.setAttribute('content', theme === 'dark' ? '#090e17' : '#eef4fc');
  };

  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

  themeButton.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      localStorage.setItem('kabinet-theme', nextTheme);
    } catch {}
  });
}

// 2. Navbar Dynamic Elevation on Scroll
const siteHeader = document.getElementById('siteHeader');
if (siteHeader) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 24) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }, { passive: true });
}

// 3. Mobile Navigation Controller (Clay Island Menu)
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    menuButton.setAttribute('aria-expanded', String(nextState));
    menuButton.setAttribute('aria-label', nextState ? 'Tutup navigasi' : 'Buka navigasi');
    navigation.classList.toggle('is-open', nextState);
  });

  navigation.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka navigasi');
    navigation.classList.remove('is-open');
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka navigasi');
    navigation.classList.remove('is-open');
    menuButton.focus();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Buka navigasi');
      navigation.classList.remove('is-open');
    }
  });

  // Scrollspy: Highlight Active Nav Link
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = navigation.querySelectorAll('a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              if (link.getAttribute('href') === `#${id}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach(section => observer.observe(section));
  }
}

// 4. Clay Button Spring Bounce Physics on Pointer
const magneticBtns = document.querySelectorAll('.magnetic-btn');
if (magneticBtns.length && window.matchMedia('(pointer: fine)').matches) {
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// 5. Fungsionaris Department Filter Logic (Hierarchical Department Groups)
const filterButtons = document.querySelectorAll('.fungsionaris-filter .filter-btn');
const deptGroups = document.querySelectorAll('.fungsionaris-groups .dept-group');
const legacyCards = document.querySelectorAll('.fungsionaris-grid .member-card');

if (filterButtons.length) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      // Filter groups
      if (deptGroups.length) {
        deptGroups.forEach(group => {
          const groupName = group.getAttribute('data-group');
          if (filter === 'all' || groupName === filter) {
            group.classList.remove('is-hidden');
          } else {
            group.classList.add('is-hidden');
          }
        });
      }

      // Legacy fallback if flat cards exist
      if (legacyCards.length) {
        legacyCards.forEach(card => {
          const dept = card.getAttribute('data-department');
          if (filter === 'all' || dept === filter) {
            card.classList.remove('is-hidden');
          } else {
            card.classList.add('is-hidden');
          }
        });
      }
    });
  });
}

// 6. Aspirasi Form Feedback Simulation
const form = document.getElementById('publicAspirasiForm');
const alertBox = document.getElementById('formSuccessAlert');

if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const previousText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirimkan...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = previousText;
      if (alertBox) {
        alertBox.style.display = 'block';
        setTimeout(() => {
          alertBox.style.display = 'none';
        }, 5000);
      }
    }, 600);
  });
}

// 7. Fluid Scroll Reveal Engine
if ('IntersectionObserver' in window) {
  const revealElements = document.querySelectorAll('.sc-fade-up, .sc-fade-in');
  
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sc-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.sc-fade-up, .sc-fade-in').forEach(el => el.classList.add('sc-in'));
}

// ==========================================================================
// 8. FULL-SCREEN CABINET EXPLORER MODAL CONTROLLER
// ==========================================================================
const openModalBtn = document.getElementById('openFullCabinetBtn');
const closeModalBtn = document.getElementById('closeFullCabinetBtn');
const cabinetModal = document.getElementById('fullCabinetModal');
let lastFocusedElement = null;

if (openModalBtn && closeModalBtn && cabinetModal) {
  const openCabinetModal = () => {
    lastFocusedElement = document.activeElement;
    cabinetModal.hidden = false;
    document.body.style.overflow = 'hidden';
    openModalBtn.setAttribute('aria-expanded', 'true');
    
    if (window.location.hash !== '#struktur-lengkap') {
      history.pushState(null, '', '#struktur-lengkap');
    }
    
    setTimeout(() => {
      const firstTabBtn = cabinetModal.querySelector('.modal-pill-btn');
      if (firstTabBtn) firstTabBtn.focus();
      else closeModalBtn.focus();
    }, 50);
  };

  const closeCabinetModal = () => {
    cabinetModal.hidden = true;
    document.body.style.overflow = '';
    openModalBtn.setAttribute('aria-expanded', 'false');
    
    if (window.location.hash === '#struktur-lengkap') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  openModalBtn.addEventListener('click', openCabinetModal);
  closeModalBtn.addEventListener('click', closeCabinetModal);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !cabinetModal.hidden) {
      closeCabinetModal();
    }
  });

  // Accessible Focus Trap inside modal
  cabinetModal.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const focusableElements = cabinetModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });

  // Browser Back button integration
  window.addEventListener('popstate', () => {
    if (window.location.hash !== '#struktur-lengkap' && !cabinetModal.hidden) {
      closeCabinetModal();
    } else if (window.location.hash === '#struktur-lengkap' && cabinetModal.hidden) {
      openCabinetModal();
    }
  });

  if (window.location.hash === '#struktur-lengkap') {
    openCabinetModal();
  }

  // Modal Internal Quick Filter Logic
  const modalFilterBtns = cabinetModal.querySelectorAll('.modal-pill-btn');
  const modalDeptSections = cabinetModal.querySelectorAll('.modal-dept-section');

  if (modalFilterBtns.length && modalDeptSections.length) {
    modalFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modalFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filterVal = btn.getAttribute('data-modal-filter');

        modalDeptSections.forEach(section => {
          const secId = section.getAttribute('id');
          if (filterVal === 'all' || secId === filterVal) {
            section.classList.remove('is-modal-hidden');
          } else {
            section.classList.add('is-modal-hidden');
          }
        });
        
        const modalBody = cabinetModal.querySelector('.cabinet-modal-body');
        if (modalBody) {
          modalBody.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }
}
