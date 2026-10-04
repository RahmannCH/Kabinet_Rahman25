// ==========================================================================
// KABINET RAHMAN 25 - CORE SCRIPT (CLAYMORPHISM INTERACTION ENGINE)
// ==========================================================================

// 0. Scroll-Lock Manager (counter-based, supports multiple overlapping overlays)
//
// Hardened against "stuck lock": every overlay close path resets cleanly, and a
// safety net re-syncs the counter if the DOM ever disagrees with our depth
// (e.g. an exception mid-close, or a bfcache restore).
const ScrollLock = (() => {
  let depth = 0;
  const apply = () => {
    document.body.style.overflow = depth > 0 ? 'hidden' : '';
  };
  const lock = () => {
    depth++;
    apply();
  };
  const unlock = () => {
    depth = Math.max(0, depth - 1);
    apply();
  };
  const forceReset = () => {
    depth = 0;
    apply();
  };
  // Safety net: if nothing is actually open but we still hold a lock, release it.
  const reconcile = () => {
    const anyOpen = document.querySelector(
      '.cabinet-modal:not([hidden]), .article-modal:not([hidden]), .lightbox:not([hidden])'
    );
    if (!anyOpen && depth !== 0) forceReset();
  };
  // Never leave the page frozen across a bfcache restore / tab return.
  window.addEventListener('pagehide', forceReset);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reconcile();
  });
  return { lock, unlock, forceReset, reconcile, get depth() { return depth; } };
})();

// 0c. Focus helpers — only real, visible, focusable elements (skips hidden dept sections)
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getVisibleFocusables = (root) =>
  Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    el => el.offsetParent !== null && !el.closest('[hidden]')
  );


//
// Each overlay registers { id, close }. `close()` MUST be idempotent and return
// true only when it actually closed something, so Escape walks the stack safely.
const OverlayManager = {
  stack: [],
  register(id, close) {
    this.stack = this.stack.filter(o => o.id !== id);
    this.stack.push({ id, close });
  },
  closeTop() {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].close()) return true;
    }
    return false;
  },
};

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
    // Return focus to the toggle so keyboard/AT users keep their place
    menuButton.focus();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || menuButton.getAttribute('aria-expanded') !== 'true') return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka navigasi');
    navigation.classList.remove('is-open');
    menuButton.focus();
  });

  const mqDesktop = window.matchMedia('(min-width: 961px)');
  const closeMobileNav = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Buka navigasi');
    navigation.classList.remove('is-open');
  };
  mqDesktop.addEventListener('change', e => {
    if (e.matches) closeMobileNav();
  });
  // Also check immediately on load
  if (mqDesktop.matches) closeMobileNav();

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
if (
  magneticBtns.length &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
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
    name: 'Departemen Harmoni dan Kebersamaan',
    lead: { role: 'Kepala Departemen', name: 'Wulan Sari Andini', tag: 'HARMONI' },
    staff: [
      { name: 'Kevin Aditya Pratama' },
      { name: 'Maya Sari Dewi' },
      { name: 'Yusuf Ramadhan Hakim' },
      { name: 'Rizky Ananda Putra' }
    ]
  }
};

// Program kerja per departemen (3 per departemen = 21 total)
const DEPT_PROGRAMS = [
  // HR
  { key: 'hr', dept: 'HR', title: 'ORMAWA Gathering', desc: 'Forum kolaborasi seluruh organisasi mahasiswa tingkat fakultas dalam satu agenda bersama.', featured: true },
  { key: 'hr', dept: 'HR', title: 'Open Recruitment Pengurus', desc: 'Seleksi terbuka bagi mahasiswa Ilmu Komputer yang ingin berkontribusi dalam kepengurusan.', featured: false },
  { key: 'hr', dept: 'HR', title: 'Silaturahmi Alumni', desc: 'Pertemuan rutin dengan alumni untuk memperkuat jejaring dan sharing pengalaman industri.', featured: false },
  // PADI
  { key: 'padi', dept: 'PADI', title: 'Gemastik Preparation Camp', desc: 'Program intensif persiapan kompetisi teknologi informasi nasional untuk delegasi ULM.', featured: false },
  { key: 'padi', dept: 'PADI', title: 'Tech Talk Series', desc: 'Seri seminar teknologi dengan pembicara praktisi dan akademisi dari berbagai bidang IT.', featured: false },
  { key: 'padi', dept: 'PADI', title: 'Riset Bersama Dosen', desc: 'Wadah kolaborasi mahasiswa dan dosen dalam penelitian dan publikasi ilmiah.', featured: false },
  // ORSE
  { key: 'orse', dept: 'ORSE', title: 'Pekan Minat Bakat', desc: 'Olimpiade olahraga dan pentas seni antar angkatan Ilmu Komputer.', featured: true },
  { key: 'orse', dept: 'ORSE', title: 'Fun Run Kampus', desc: 'Lari pagi bersama seluruh civitas akademika dengan rute kampus dan hadiah menarik.', featured: false },
  { key: 'orse', dept: 'ORSE', title: 'Kompetisi E-Sport', desc: 'Turnamen game antar angkatan dan lintas jurusan untuk mempererat kebersamaan.', featured: false },
  // KOMINFO
  { key: 'kominfo', dept: 'KOMINFO', title: 'Media Sosial Campaign', desc: 'Strategi konten dan branding HIMAKOM ULM di berbagai platform media sosial.', featured: false },
  { key: 'kominfo', dept: 'KOMINFO', title: 'Podcast Ilkom Ngobrol', desc: 'Podcast rutin membahas isu teknologi, kampus, dan kehidupan mahasiswa.', featured: false },
  { key: 'kominfo', dept: 'KOMINFO', title: 'Desain Grafis Workshop', desc: 'Pelatihan desain visual dan branding untuk pengurus dan anggota aktif.', featured: false },
  // PSDM
  { key: 'psdm', dept: 'PSDM', title: 'Pelatihan Kepemimpinan', desc: 'Program kaderisasi internal untuk membekali pengurus baru dengan dasar manajemen organisasi.', featured: false },
  { key: 'psdm', dept: 'PSDM', title: 'Mentoring Akademik', desc: 'Program bimbingan belajar antar angkatan untuk mata kuliah dasar dan lanjut.', featured: false },
  { key: 'psdm', dept: 'PSDM', title: 'Soft Skill Bootcamp', desc: 'Pelatihan komunikasi, negosiasi, dan presentasi untuk mahasiswa Ilmu Komputer.', featured: false },
  // SOSMA
  { key: 'sosma', dept: 'SOSMA', title: 'Ilkom Goes To School', desc: 'Kunjungan edukasi teknologi ke sekolah menengah mitra di wilayah Kalimantan Selatan.', featured: true },
  { key: 'sosma', dept: 'SOSMA', title: 'Bakti Sosial Kampus', desc: 'Aksi sosial berkala untuk masyarakat sekitar kampus dan lingkungan.', featured: false },
  { key: 'sosma', dept: 'SOSMA', title: 'Donor Darah Rutin', desc: 'Kerja sama dengan PMI untuk penggalangan donor darah dari civitas akademika.', featured: false },
  // HARMONI
  { key: 'harmoni', dept: 'HARMONI', title: 'Malam Keakraban Kabinet', desc: 'Perayaan akhir periode sekaligus penguatan kekeluargaan antar pengurus dan angkatan.', featured: false },
  { key: 'harmoni', dept: 'HARMONI', title: 'Buka Bersama Ramadhan', desc: 'Kegiatan buka puasa bersama seluruh pengurus dan anggota HIMAKOM ULM.', featured: false },
  { key: 'harmoni', dept: 'HARMONI', title: 'Family Day Ilkom', desc: 'Hari rekreasi bersama keluarga besar Ilmu Komputer di destinasi lokal.', featured: false }
];

// Agenda timeline data: April – Desember 2027 (18 items, 2 per month, all 7 depts)
const AGENDA_ITEMS = [
  { month: 'apr', date: '2027-04-12', title: 'Open Recruitment Pengurus', dept: 'HR', desc: 'Pembukaan pendaftaran calon pengurus baru Kabinet Rahman 25 bagi seluruh mahasiswa Ilmu Komputer.' },
  { month: 'apr', date: '2027-04-25', title: 'Tech Talk Series #1', dept: 'PADI', desc: 'Seri seminar teknologi dengan pembicara praktisi dan akademisi dari berbagai bidang IT.' },
  { month: 'mei', date: '2027-05-10', title: 'Pelatihan Kepemimpinan Mahasiswa', dept: 'PSDM', desc: 'Program kaderisasi internal untuk membekali pengurus baru dengan dasar manajemen organisasi.' },
  { month: 'mei', date: '2027-05-24', title: 'Ilkom Goes To School', dept: 'SOSMA', desc: 'Kunjungan edukasi teknologi ke sekolah menengah mitra di wilayah Kalimantan Selatan.' },
  { month: 'jun', date: '2027-06-07', title: 'Fun Run Kampus', dept: 'ORSE', desc: 'Lari pagi bersama seluruh civitas akademika dengan rute kampus dan hadiah menarik.' },
  { month: 'jun', date: '2027-06-21', title: 'Donor Darah Rutin', dept: 'SOSMA', desc: 'Kerja sama dengan PMI untuk penggalangan donor darah dari civitas akademika.' },
  { month: 'jul', date: '2027-07-12', title: 'Pekan Minat Bakat', dept: 'ORSE', desc: 'Olimpiade olahraga dan pentas seni antar angkatan Ilmu Komputer.' },
  { month: 'jul', date: '2027-07-26', title: 'Bakti Sosial Kampus', dept: 'SOSMA', desc: 'Aksi sosial berkala untuk masyarakat sekitar kampus dan lingkungan.' },
  { month: 'agu', date: '2027-08-09', title: 'Gemastik Preparation Camp', dept: 'PADI', desc: 'Program intensif persiapan kompetisi teknologi informasi nasional untuk delegasi ULM.' },
  { month: 'agu', date: '2027-08-23', title: 'Silaturahmi Alumni', dept: 'HR', desc: 'Pertemuan rutin dengan alumni untuk memperkuat jejaring dan sharing pengalaman industri.' },
  { month: 'sep', date: '2027-09-13', title: 'Media Sosial Campaign Launch', dept: 'KOMINFO', desc: 'Peluncuran strategi konten dan branding HIMAKOM ULM di berbagai platform media sosial.' },
  { month: 'sep', date: '2027-09-27', title: 'Mentoring Akademik', dept: 'PSDM', desc: 'Program bimbingan belajar antar angkatan untuk mata kuliah dasar dan lanjut.' },
  { month: 'okt', date: '2027-10-11', title: 'Kompetisi E-Sport', dept: 'ORSE', desc: 'Turnamen game antar angkatan dan lintas jurusan untuk mempererat kebersamaan.' },
  { month: 'okt', date: '2027-10-25', title: 'Desain Grafis Workshop', dept: 'KOMINFO', desc: 'Pelatihan desain visual dan branding untuk pengurus dan anggota aktif.' },
  { month: 'nov', date: '2027-11-08', title: 'ORMAWA Gathering', dept: 'HR', desc: 'Forum kolaborasi seluruh organisasi mahasiswa tingkat fakultas dalam satu agenda bersama.' },
  { month: 'nov', date: '2027-11-22', title: 'Podcast Ilkom Ngobrol Live', dept: 'KOMINFO', desc: 'Live recording podcast rutin yang membahas isu teknologi, kampus, dan kehidupan mahasiswa.' },
  { month: 'des', date: '2027-12-13', title: 'Malam Keakraban Kabinet', dept: 'HARMONI', desc: 'Perayaan akhir periode sekaligus penguatan kekeluargaan antar pengurus dan angkatan.' },
  { month: 'des', date: '2027-12-20', title: 'Family Day Ilkom', dept: 'HARMONI', desc: 'Hari rekreasi bersama keluarga besar Ilmu Komputer di destinasi lokal.' }
];

const MONTH_LABELS = {
  apr: 'April', mei: 'Mei', jun: 'Juni', jul: 'Juli',
  agu: 'Agustus', sep: 'September', okt: 'Oktober', nov: 'November', des: 'Desember'
};

const treePanel = document.getElementById('treeDeptPanel');
const treePanelBadge = document.getElementById('treePanelBadge');
const treePanelName = document.getElementById('treePanelName');
const treePanelLeadRow = document.getElementById('treePanelLeadRow');
const treePanelStaffRow = document.getElementById('treePanelStaffRow');

const DEFAULT_MEMBER_PHOTO = 'assets/ProfileRahman.jpeg';

const buildMemberCard = ({ role, name, tag, isLead, image }) => `
  <article class="member-card tree-node" data-department="${(tag || '').toLowerCase()}">
    <div class="member-image-wrap"><img src="${image || DEFAULT_MEMBER_PHOTO}" alt="Foto ${role} ${tag}" loading="lazy"></div>
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
    isLead: true,
    image: dept.lead.image
  });
  treePanelStaffRow.innerHTML = dept.staff
    .map(s => buildMemberCard({ role: 'Staff', name: s.name, tag: dept.lead.tag, isLead: false, image: s.image }))
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
  const errorEl = field.parentElement.querySelector('.field-error');
  if (message) {
    if (!errorEl) {
      const el = document.createElement('span');
      el.className = 'field-error';
      el.setAttribute('role', 'alert');
      field.parentElement.appendChild(el);
    }
    field.parentElement.querySelector('.field-error').textContent = message;
    field.setAttribute('aria-invalid', 'true');
  } else {
    if (errorEl) errorEl.remove();
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

// 7. Fluid Scroll Reveal Engine (exposed so dynamically-injected nodes also reveal)
const RevealEngine = (() => {
  if (!('IntersectionObserver' in window)) {
    return {
      observe: els => els.forEach(el => el.classList.add('sc-in'))
    };
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sc-in');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  const observe = els => els.forEach(el => observer.observe(el));
  observe(document.querySelectorAll('.sc-fade-up, .sc-fade-in'));
  return { observe };
})();

// ==========================================================================
// 8. FULL-SCREEN CABINET EXPLORER MODAL CONTROLLER
// ==========================================================================
const openModalBtn = document.getElementById('openFullCabinetBtn');
const closeModalBtn = document.getElementById('closeFullCabinetBtn');
const cabinetModal = document.getElementById('fullCabinetModal');
let lastFocusedElement = null;

if (openModalBtn && closeModalBtn && cabinetModal) {
  const openCabinetModal = () => {
    if (!cabinetModal.hidden) return;
    lastFocusedElement = document.activeElement;
    cabinetModal.hidden = false;
    ScrollLock.lock();
    openModalBtn.setAttribute('aria-expanded', 'true');

    if (window.location.hash !== '#struktur') {
      history.pushState(null, '', '#struktur');
    }

    setTimeout(() => {
      const firstTabBtn = cabinetModal.querySelector('.modal-pill-btn');
      if (firstTabBtn) firstTabBtn.focus();
      else closeModalBtn.focus();
    }, 50);
  };

  const closeCabinetModal = () => {
    if (cabinetModal.hidden) return false;
    cabinetModal.hidden = true;
    ScrollLock.unlock();
    openModalBtn.setAttribute('aria-expanded', 'false');

    if (window.location.hash === '#struktur') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
    return true;
  };

  openModalBtn.addEventListener('click', openCabinetModal);
  closeModalBtn.addEventListener('click', closeCabinetModal);

  // Register with the shared overlay manager (Escape priority handled centrally)
  OverlayManager.register('cabinet', closeCabinetModal);

  // Accessible Focus Trap inside modal (skips hidden department sections)
  cabinetModal.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const focusableElements = getVisibleFocusables(cabinetModal);
      if (!focusableElements.length) return;
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
    if (window.location.hash !== '#struktur' && !cabinetModal.hidden) {
      closeCabinetModal();
    } else if (window.location.hash === '#struktur' && cabinetModal.hidden) {
      openCabinetModal();
    }
  });

  if (window.location.hash === '#struktur') {
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
    date: 'Program Unggulan 2027',
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
    date: 'Program Unggulan 2027',
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
    date: 'Program Unggulan 2027',
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
    date: '12 Oktober 2027',
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
    date: '8 Oktober 2027',
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
    date: '28 September 2027',
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
    if (!articleModal.hidden) return; // already open — single-instance guard
    articleLastFocus = document.activeElement;
    articleKicker.textContent = data.kicker;
    articleTitle.textContent = data.title;
    articleDate.textContent = data.date;
    articleAuthor.textContent = data.author;
    articleBody.innerHTML = data.body.map(p => `<p>${p}</p>`).join('');
    articleModal.hidden = false;
    articleModal.dataset.currentKey = key;
    ScrollLock.lock();
    articleModal.querySelector('.article-sheet-close')?.focus();
  };

  const closeArticle = () => {
    if (articleModal.hidden) return false;
    articleModal.hidden = true;
    ScrollLock.unlock();
    if (articleLastFocus) articleLastFocus.focus();
    return true;
  };

  articleTriggers.forEach(btn => {
    btn.addEventListener('click', () => openArticle(btn.getAttribute('data-article')));
  });

  articleModal.querySelectorAll('[data-article-close]').forEach(el => {
    el.addEventListener('click', closeArticle);
  });

  OverlayManager.register('article', closeArticle);

  articleModal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusables = getVisibleFocusables(articleModal);
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
    // Respect reduced-motion: set final value instantly, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target + suffix;
      return;
    }
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
  }, { threshold: 0.25 });

  statCards.forEach(card => io.observe(card));
})();

// ==========================================================================
// 11. AGENDA TIMELINE (Data-driven render + auto filter pills + dynamic status)
// ==========================================================================
(() => {
  const timeline = document.getElementById('agendaTimeline');
  const filterContainer = document.getElementById('agendaFilter');
  const empty = document.getElementById('agendaEmpty');
  if (!timeline || !AGENDA_ITEMS.length) return;

  // --- Dynamic status based on date (timezone-safe: compare YYYY-MM-DD strings) ---
  const computeStatus = (dateStr) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (dateStr < todayStr) return { cls: 'is-selesai', label: '✓ Selesai' };
    if (dateStr === todayStr) return { cls: 'is-running', label: '▶ Berjalan' };
    return { cls: 'is-upcoming', label: '○ Akan Datang' };
  };

  // --- Format date: "12 Apr 2027" ---
  const MONTH_SHORT = { apr: 'Apr', mei: 'Mei', jun: 'Jun', jul: 'Jul', agu: 'Agu', sep: 'Sep', okt: 'Okt', nov: 'Nov', des: 'Des' };
  const formatDate = (dateStr, monthKey) => {
    const day = new Date(dateStr + 'T00:00:00').getDate();
    return `${day} ${MONTH_SHORT[monthKey]} 2027`;
  };

  // --- Render timeline items ---
  const renderItem = (item, index) => {
    const status = computeStatus(item.date);
    const li = document.createElement('li');
    li.className = 'agenda-item sc-fade-up';
    li.dataset.month = item.month;
    li.style.setProperty('--stagger', index + 1);
    li.innerHTML = `
      <div class="agenda-node" aria-hidden="true"></div>
      <div class="agenda-card">
        <div class="agenda-meta">
          <span class="agenda-date">${formatDate(item.date, item.month)}</span>
          <span class="agenda-status ${status.cls}">${status.label}</span>
        </div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <span class="agenda-dept">${item.dept}</span>
      </div>`;
    return li;
  };

  timeline.innerHTML = '';
  AGENDA_ITEMS.forEach((item, i) => timeline.appendChild(renderItem(item, i)));

  // Register freshly-injected nodes with the reveal engine
  RevealEngine.observe(timeline.querySelectorAll('.sc-fade-up'));

  // --- Generate filter pills automatically from data ---
  if (filterContainer) {
    const months = [...new Set(AGENDA_ITEMS.map(a => a.month))];
    // Preserve insertion order (Apr → Des, already sorted in data)
    const pills = [{ key: 'all', label: 'Semua' }, ...months.map(m => ({ key: m, label: MONTH_LABELS[m] }))];
    filterContainer.innerHTML = pills
      .map((p, i) => `<button type="button" class="agenda-filter-btn${i === 0 ? ' active' : ''}" data-agenda-filter="${p.key}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}">${p.label}</button>`)
      .join('');
  }

  // --- Filter logic ---
  const filterBtns = filterContainer ? filterContainer.querySelectorAll('.agenda-filter-btn') : [];
  const items = timeline.querySelectorAll('.agenda-item');

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
    if (!lightbox.hidden) return; // already open — double-click guard
    lastFocused = document.activeElement;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCap.textContent = trigger.dataset.caption || '';
    lightbox.hidden = false;
    ScrollLock.lock();
    lightbox.querySelector('.lightbox-close')?.focus();
  };

  const close = () => {
    if (lightbox.hidden) return false;
    lightbox.hidden = true;
    lightboxImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    lightboxImg.alt = '';
    lightboxCap.textContent = '';
    ScrollLock.unlock();
    if (lastFocused) lastFocused.focus();
    return true;
  };

  triggers.forEach(btn => btn.addEventListener('click', () => open(btn)));
  lightbox.querySelectorAll('[data-lightbox-close]').forEach(el =>
    el.addEventListener('click', close)
  );

  // Escape priority: registered LAST so it is the topmost overlay
  OverlayManager.register('lightbox', close);
})();

// 14. Global Escape Handler (closes only the topmost overlay)
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  // Ignore when mobile nav is open — its own handler manages that
  const menuBtn = document.querySelector('.menu-toggle');
  if (menuBtn && menuBtn.getAttribute('aria-expanded') === 'true') return;
  if (OverlayManager.closeTop()) e.preventDefault();
});

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

// ==========================================================================
// 15. PROGRAM KERJA DEPARTEMEN (Render + Filter)
// ==========================================================================
(() => {
  const grid = document.getElementById('prokerDeptGrid');
  const filterBtns = document.querySelectorAll('.proker-filter-btn');
  const empty = document.getElementById('prokerEmpty');
  if (!grid || !DEPT_PROGRAMS.length) return;

  const buildCard = prog => `
    <article class="proker-dept-card" data-proker-dept="${prog.key}">
      <span class="proker-dept-badge">${prog.dept}</span>
      <h3>${prog.title}</h3>
      <p>${prog.desc}</p>
    </article>`;

  grid.innerHTML = DEPT_PROGRAMS.map(buildCard).join('');

  if (!filterBtns.length) return;
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.prokerFilter;
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      let visible = 0;
      grid.querySelectorAll('.proker-dept-card').forEach(card => {
        const show = filter === 'all' || card.dataset.prokerDept === filter;
        card.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible > 0;
    });
  });
})();
