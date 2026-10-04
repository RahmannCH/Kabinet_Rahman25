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

// 4. Clay Button Spring Bounce Physics on Pointer (applies to real interactive controls)
const magneticBtns = document.querySelectorAll('.button, .nav-action, .theme-toggle, .filter-btn');
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

// 5. Fungsionaris Filter Logic (Organizational Tree + Legacy Fallback)
const filterButtons = document.querySelectorAll('.fungsionaris-filter .filter-btn');
const orgTree = document.getElementById('fungsionarisGrid');
const treeTiers = document.querySelectorAll('.org-tree > .tree-tier[data-group]');
const treeConnectors = document.querySelectorAll('.org-tree > .tree-connector');
const legacyCards = document.querySelectorAll('.fungsionaris-grid .member-card');

// Department roster data (1 Kadep + 4 Staff each) for the dynamic expansion panel
const DEPT_ROSTER = {
  hr: {
    name: 'Departemen Hubungan Relasi',
    lead: { role: 'Kepala Departemen', name: 'Dedi Mulyadi Pratama', tag: 'HR' },
    staff: [
      { name: 'Naufal Zaki Ramadhan' },
      { name: 'Putri Ayu Wandira' },
      { name: 'Adit Nugraha Pratama' },
      { name: 'Wawan Hermawan Saputra' }
    ]
  },
  padi: {
    name: 'Pengembangan Akademik dan Teknologi',
    lead: { role: 'Kepala Departemen', name: 'Asep Sunandar Wijaya', tag: 'PADI' },
    staff: [
      { name: 'Rian Hidayatullah' },
      { name: 'Dewi Anggraini Sari' },
      { name: 'Fajar Sidiq Ramadhan' },
      { name: 'Galih Permana Putra' }
    ]
  },
  orse: {
    name: 'Departemen Olahraga dan Seni',
    lead: { role: 'Kepala Departemen', name: 'Joko Susilo Raharjo', tag: 'ORSE' },
    staff: [
      { name: 'Bayu Setiawan Nugroho' },
      { name: 'Dodi Prasetyo Aji' },
      { name: 'Rina Marlina Sari' },
      { name: 'Hendra Gunawan Saputra' }
    ]
  },
  kominfo: {
    name: 'Komunikasi dan Informasi',
    lead: { role: 'Kepala Departemen', name: 'Bagas Dwi Cahyono', tag: 'KOMINFO' },
    staff: [
      { name: 'Rifki Maulana Yusuf' },
      { name: 'Indah Permatasari' },
      { name: 'Yogi Pratama Saputra' },
      { name: 'Taufik Hidayat Ramadhan' }
    ]
  },
  psdm: {
    name: 'Pengembangan Sumber Daya Mahasiswa',
    lead: { role: 'Kepala Departemen', name: 'Slamet Riyadi Nugroho', tag: 'PSDM' },
    staff: [
      { name: 'Arif Budiman Saputra' },
      { name: 'Lestari Widya Ningsih' },
      { name: 'Rendi Kurniawan Putra' },
      { name: 'Sigit Purnomo Aji' }
    ]
  },
  sosma: {
    name: 'Sosial dan Masyarakat',
    lead: { role: 'Kepala Departemen', name: 'Iwan Setiawan Saputra', tag: 'SOSMA' },
    staff: [
      { name: 'Zaki Mubarak Ramadhan' },
      { name: 'Nurul Aini Safitri' },
      { name: 'Bima Arya Pratama' },
      { name: 'Gilang Ramadhan Putra' }
    ]
  },
  harmoni: {
    name: 'Hari Momen Inspiratif',
    lead: { role: 'Kepala Departemen', name: 'Wulan Sari Andini', tag: 'HARMONI' },
    staff: [
      { name: 'Kevin Aditya Pratama' },
      { name: 'Maya Sari Dewi' },
      { name: 'Yusuf Ramadhan Hakim' },
      { name: 'Rizky Ananda Putra' }
    ]
  }
};

const treePanel = document.getElementById('treeDeptPanel');
const treePanelBadge = document.getElementById('treePanelBadge');
const treePanelName = document.getElementById('treePanelName');
const treePanelLeadRow = document.getElementById('treePanelLeadRow');
const treePanelStaffRow = document.getElementById('treePanelStaffRow');

const buildMemberCard = ({ role, name, tag, isLead }) => `
  <article class="member-card glow-card tree-node" data-department="${(tag || '').toLowerCase()}">
    <div class="member-image-wrap"><img src="assets/ProfileRahman.jpeg" alt="Foto ${role} ${tag}" loading="lazy"></div>
    <div class="member-info">
      <span class="member-role${isLead ? ' role-lead' : ''}">${role}</span>
      <h3 class="member-name">${name}</h3>
      <span class="member-dept-tag">${tag}</span>
    </div>
  </article>`;

const renderDeptPanel = key => {
  const dept = DEPT_ROSTER[key];
  if (!dept || !treePanel) return;
  treePanelBadge.textContent = key.toUpperCase();
  treePanelName.textContent = dept.name;
  treePanelLeadRow.innerHTML = buildMemberCard({
    role: dept.lead.role,
    name: dept.lead.name,
    tag: dept.lead.tag,
    isLead: true
  });
  treePanelStaffRow.innerHTML = dept.staff
    .map(s => buildMemberCard({ role: 'Staff', name: s.name, tag: dept.lead.tag, isLead: false }))
    .join('');
  treePanel.hidden = false;
};

const hideDeptPanel = () => {
  if (treePanel) {
    treePanel.hidden = true;
    treePanelLeadRow.innerHTML = '';
    treePanelStaffRow.innerHTML = '';
  }
};

// Map filter key -> which tiers stay visible
const isDeptKey = key => Object.prototype.hasOwnProperty.call(DEPT_ROSTER, key);

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

      // ---- Tree mode ----
      if (orgTree && treeTiers.length) {
        treeTiers.forEach(tier => {
          const group = tier.getAttribute('data-group');
          let visible = false;

          if (filter === 'all') {
            visible = ['dpo', 'bph', 'departments'].includes(group);
          } else if (filter === 'dpo') {
            visible = group === 'dpo';
          } else if (filter === 'bph') {
            visible = group === 'bph';
          } else if (isDeptKey(filter)) {
            // Show only the Kadep rail as a visual anchor
            visible = group === 'departments';
          }

          tier.hidden = !visible;
        });

        // Connectors: show only when relevant
        treeConnectors.forEach(conn => {
          conn.hidden = filter !== 'all';
        });

        // Hide the Kadep rail when a single department is expanded
        if (isDeptKey(filter)) {
          const deptTier = Array.from(treeTiers).find(t => t.getAttribute('data-group') === 'departments');
          if (deptTier) deptTier.hidden = true;
          renderDeptPanel(filter);
        } else {
          hideDeptPanel();
        }
      }

      // ---- Legacy flat-card fallback ----
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

// ==========================================================================
// 6. Aspirasi Form — Real Client-Side Validation (no fake server claim)
// ==========================================================================
const form = document.getElementById('publicAspirasiForm');
const alertBox = document.getElementById('formSuccessAlert');

const setFieldError = (field, message) => {
  if (!field) return;
  let errorEl = field.parentElement.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.setAttribute('role', 'alert');
    field.parentElement.appendChild(errorEl);
  }
  if (message) {
    errorEl.textContent = message;
    field.setAttribute('aria-invalid', 'true');
  } else {
    errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }
};

if (form) {
  const nameInput = form.querySelector('#namaInput');
  const targetSelect = form.querySelector('#divisiTarget');
  const messageInput = form.querySelector('#pesanInput');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Live-clear errors as the user types
  [nameInput, targetSelect, messageInput].forEach(field => {
    if (!field) return;
    field.addEventListener('input', () => setFieldError(field, ''));
    field.addEventListener('change', () => setFieldError(field, ''));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!submitBtn) return;

    let valid = true;

    if (!targetSelect || !targetSelect.value) {
      setFieldError(targetSelect, 'Pilih departemen tujuan terlebih dahulu.');
      valid = false;
    }

    const message = (messageInput?.value || '').trim();
    if (message.length < 10) {
      setFieldError(messageInput, 'Pesan minimal 10 karakter agar jelas.');
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const previousText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    // Local preview mode: no backend is connected yet.
    window.setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = previousText;
      if (alertBox) {
        alertBox.textContent = 'Aspirasi tersimpan di pratinjau ini. Pengiriman nyata ke pengurus belum aktif.';
        alertBox.style.display = 'block';
        window.setTimeout(() => {
          alertBox.style.display = 'none';
        }, 6000);
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
    if (!cabinetModal.hidden) return; // already open — prevent double-open & duplicate history
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
    if (cabinetModal.hidden) return; // already closed
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

// ==========================================================================
// 9. ARTICLE READER MODAL (Kabar & Proker Detail — replaces dead links)
// ==========================================================================
const ARTICLES = {
  'proker-igts': {
    kicker: 'PROKER · SOSMA',
    title: 'Ilkom Goes To School (IGTS)',
    date: 'Program Unggulan 2026',
    author: 'Departemen Sosial dan Masyarakat',
    body: [
      'Ilkom Goes To School adalah program pengabdian yang membawa mahasiswa Ilmu Komputer turun langsung ke sekolah-sekolah menengah untuk memperkenalkan dunia teknologi sejak dini.',
      'Kegiatan ini mencakup pelatihan dasar pemrograman, pengenalan literasi digital, serta sesi motivasi karier di bidang teknologi informasi bagi para siswa.',
      'Melalui IGTS, HIMAKOM ULM berkomitmen menjadi jembatan antara dunia kampus dan masyarakat, sekaligus menumbuhkan minat generasi muda terhadap ilmu komputer.'
    ]
  },
  'proker-pmb': {
    kicker: 'PROKER · ORSE',
    title: 'Pekan Minat Bakat',
    date: 'Program Unggulan 2026',
    author: 'Departemen Olahraga dan Seni',
    body: [
      'Pekan Minat Bakat adalah olimpiade tahunan yang menjadi ajang kompetisi sportif sekaligus panggung ekspresi seni bagi seluruh mahasiswa Ilmu Komputer.',
      'Berbagai cabang dipertandingkan, mulai dari futsal, badminton, hingga lomba band dan tari kontemporer antar angkatan.',
      'Acara ini dirancang untuk mempererat kebersamaan, menyalurkan bakat terpendam, dan membangun jiwa sportivitas di lingkungan himpunan.'
    ]
  },
  'proker-ormawa': {
    kicker: 'PROKER · HR',
    title: 'ORMAWA Gathering',
    date: 'Program Unggulan 2026',
    author: 'Departemen Hubungan Relasi',
    body: [
      'ORMAWA Gathering adalah inisiatif strategis yang mempertemukan seluruh organisasi mahasiswa di tingkat fakultas dalam satu forum kolaborasi.',
      'Melalui kegiatan ini, setiap organisasi saling berbagi program kerja, mencari potensi sinergi, dan menyusun agenda bersama untuk kepentingan mahasiswa.',
      'Tujuannya jelas: memperkuat persatuan antar lembaga dan menghadirkan gerakan mahasiswa yang lebih solid, terarah, dan berdampak.'
    ]
  },
  'kabar-pelatihan': {
    kicker: 'KABAR · PSDM',
    title: 'Pelatihan Kepemimpinan Mahasiswa Sukses Digelar',
    date: '12 Oktober 2026',
    author: 'Departemen PSDM',
    body: [
      'Lebih dari 80 mahasiswa baru Ilmu Komputer mengikuti pelatihan kepemimpinan yang diselenggarakan untuk mempersiapkan kaderisasi masa depan himpunan.',
      'Materi pelatihan mencakup dasar-dasar manajemen organisasi, komunikasi efektif, penyelesaian konflik, dan penyusunan program kerja berbasis kebutuhan anggota.',
      'Peserta diharapkan mampu mengambil peran aktif ketika masa kepengurusan berikutnya berjalan.'
    ]
  },
  'kabar-oprec': {
    kicker: 'KABAR · HR',
    title: 'HIMAKOM Buka Pendaftaran Open Recruitment Pengurus',
    date: '8 Oktober 2026',
    author: 'Departemen Hubungan Relasi',
    body: [
      'HIMAKOM ULM resmi membuka pendaftaran pengurus baru melalui jalur seleksi terbuka bagi seluruh mahasiswa Ilmu Komputer yang ingin mengambil peran.',
      'Tahapan seleksi meliputi pengumpulan berkas, wawancara, dan evaluasi minat pada departemen yang dituju.',
      'Ini kesempatan bagi mahasiswa untuk berkontribusi nyata dalam kabinet sekaligus mengembangkan keterampilan organisasi dan kepemimpinan.'
    ]
  },
  'kabar-gemastik': {
    kicker: 'KABAR · PADI',
    title: 'Tim Riset ULM Sabet Juara Gemastik Nasional',
    date: '28 September 2026',
    author: 'Departemen Pengembangan Akademik dan Teknologi',
    body: [
      'Tim riset delegasi mahasiswa Ilmu Komputer berhasil meraih juara pada ajang kompetisi teknologi informasi nasional Gemastik tahun ini.',
      'Prestasi ini merupakan buah dari pembinaan riset berkelanjutan yang difasilitasi departemen pengembangan akademik.',
      'Capaian tersebut menjadi motivasi bagi mahasiswa lain untuk terus berprestasi di tingkat nasional.'
    ]
  }
};

const articleModal = document.getElementById('articleModal');
const articleKicker = document.getElementById('articleKicker');
const articleTitle = document.getElementById('articleTitle');
const articleDate = document.getElementById('articleDate');
const articleAuthor = document.getElementById('articleAuthor');
const articleBody = document.getElementById('articleBody');
const articleTriggers = document.querySelectorAll('[data-article]');
let articleLastFocus = null;

if (articleModal && articleTriggers.length) {
  const openArticle = key => {
    const data = ARTICLES[key];
    if (!data) return;
    articleLastFocus = document.activeElement;
    articleKicker.textContent = data.kicker;
    articleTitle.textContent = data.title;
    articleDate.textContent = data.date;
    articleAuthor.textContent = data.author;
    articleBody.innerHTML = data.body.map(p => `<p>${p}</p>`).join('');
    articleModal.hidden = false;
    document.body.style.overflow = 'hidden';
    articleModal.querySelector('.article-sheet-close')?.focus();
  };

  const closeArticle = () => {
    articleModal.hidden = true;
    document.body.style.overflow = '';
    if (articleLastFocus) articleLastFocus.focus();
  };

  articleTriggers.forEach(btn => {
    btn.addEventListener('click', () => openArticle(btn.getAttribute('data-article')));
  });

  articleModal.querySelectorAll('[data-article-close]').forEach(el => {
    el.addEventListener('click', closeArticle);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !articleModal.hidden) closeArticle();
  });

  articleModal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = articleModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });
}

// ==========================================================================
// 10. STATISTIK COUNT-UP (IntersectionObserver)
// ==========================================================================
(() => {
  const statCards = document.querySelectorAll('.stat-number[data-count]');
  if (!statCards.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statCards.forEach(card => io.observe(card));
})();

// ==========================================================================
// 11. AGENDA FILTER (by month)
// ==========================================================================
(() => {
  const filterBtns = document.querySelectorAll('.agenda-filter-btn');
  const items = document.querySelectorAll('.agenda-item[data-month]');
  const empty = document.getElementById('agendaEmpty');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const month = btn.dataset.agendaFilter;
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      let visible = 0;
      items.forEach(item => {
        const show = month === 'all' || item.dataset.month === month;
        item.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    });
  });
})();

// ==========================================================================
// 12. GALLERY LIGHTBOX
// ==========================================================================
(() => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxCap = document.getElementById('lightboxCaption');
  const triggers = document.querySelectorAll('.gallery-item[data-caption]');
  if (!lightbox || !triggers.length) return;

  let lastFocused = null;

  const open = (trigger) => {
    const img = trigger.querySelector('img');
    if (!img) return;
    lastFocused = document.activeElement;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCap.textContent = trigger.dataset.caption || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightboxImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    lightboxImg.alt = '';
    lightboxCap.textContent = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  triggers.forEach(btn => btn.addEventListener('click', () => open(btn)));
  lightbox.querySelectorAll('[data-lightbox-close]').forEach(el =>
    el.addEventListener('click', close)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.hidden) close();
  });
})();

// ==========================================================================
// 13. FAQ ACCORDION (single-open)
// ==========================================================================
(() => {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        items.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });
})();
