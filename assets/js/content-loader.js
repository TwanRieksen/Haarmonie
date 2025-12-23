(async function () {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return res.json();
  }

  function setText(el, value) {
    if (!el) return;
    el.textContent = (value ?? "").toString();
  }

  function setHTML(el, value) {
    if (!el) return;
    el.innerHTML = (value ?? "").toString();
  }

  function setAttr(el, attr, value) {
    if (!el) return;
    if (value === undefined || value === null || value === "") {
      el.removeAttribute(attr);
      return;
    }
    el.setAttribute(attr, value.toString());
  }

  function safeJoinUrl(href) {
    return href || "#";
  }

  function buildNav(site) {
    const nav = qs('[data-nav="desktop"]');
    const mobile = qs('[data-nav="mobile"]');
    if (!nav || !mobile) return;

    const current = (document.body.getAttribute("data-page") || "").trim();

    const links = site.ui?.nav || [];
    nav.innerHTML = "";
    mobile.innerHTML = "";

    for (const l of links) {
      const a = document.createElement("a");
      a.href = safeJoinUrl(l.href);
      a.textContent = l.label || "";
      if (l.href && l.href.includes(current)) a.setAttribute("aria-current", "page");
      nav.appendChild(a);

      const b = a.cloneNode(true);
      mobile.appendChild(b);
    }
  }

  function buildHeader(site) {
    setText(qs('[data-bind="brand.name"]'), site.brand?.name);
    setText(qs('[data-bind="brand.city"]'), site.brand?.city);

    const cta = qs('[data-bind="cta.primary"]');
    if (cta) {
      cta.textContent = site.ui?.cta_primary_label || "Afspraak maken";
      cta.href = site.ui?.cta_primary_href || "afspraak-maken.html";
    }

    buildNav(site);
  }

  function buildFooter(site) {
    setText(qs('[data-bind="footer.note"]'), site.footer?.note);
    setText(qs('[data-bind="footer.copy"]'), site.footer?.copyright);

    const ig = qs('[data-bind="footer.instagram"]');
    if (ig) {
      ig.href = site.contact?.instagram_url || "#";
      ig.textContent = site.contact?.instagram_handle || "Instagram";
    }
  }

  function setMeta(site, page) {
    const title = page?.seo?.title || page?.title || site.brand?.name || "Website";
    const desc = page?.seo?.description || site.seo?.site_description || "";
    document.title = `${title} | ${site.brand?.name || "HaarMonie Hairdesign"}`.trim();

    const metaDesc = qs('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    const theme = qs('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", site.seo?.theme_color || "#ffffff");
  }

  function mountHome(site, page) {
    setText(qs('[data-bind="home.hero.eyebrow"]'), page.hero?.eyebrow);
    setText(qs('[data-bind="home.hero.title"]'), page.hero?.title);
    setText(qs('[data-bind="home.hero.subtitle"]'), page.hero?.subtitle);

    const img = qs('[data-bind="home.hero.image"]');
    if (img) {
      img.src = page.hero?.hero_image || "assets/img/uploads/hero.jpg";
      img.alt = page.hero?.title || "Hero";
    }

    const primary = qs('[data-bind="home.hero.primary"]');
    if (primary) {
      primary.textContent = page.hero?.primary_button_label || "Online afspraak";
      primary.href = page.hero?.primary_button_url || site.contact?.booking_url || "#";
    }
    const secondary = qs('[data-bind="home.hero.secondary"]');
    if (secondary) {
      secondary.textContent = page.hero?.secondary_button_label || "Bel ons";
      secondary.href = page.hero?.secondary_button_url || site.contact?.phone_link || "#";
    }

    // Sections
    const mount = qs('[data-mount="home.sections"]');
    if (!mount) return;
    mount.innerHTML = "";

    const sections = page.sections || [];
    for (const s of sections) {
      if (s.type === "feature_grid") {
        const section = document.createElement("section");
        section.className = "section reveal";
        section.innerHTML = `
          <div class="container">
            <div class="section-head">
              <h2 class="h2"></h2>
              <p class="sub"></p>
            </div>
            <div class="grid-3" data-slot="items"></div>
          </div>`;
        setText(qs(".h2", section), s.title || "");
        const slot = qs('[data-slot="items"]', section);
        for (const it of (s.items || [])) {
          const d = document.createElement("div");
          d.className = "feature";
          d.innerHTML = `<h3></h3><p></p>`;
          setText(qs("h3", d), it.title || "");
          setText(qs("p", d), it.text || "");
          slot.appendChild(d);
        }
        mount.appendChild(section);
      }

      if (s.type === "highlight") {
        const section = document.createElement("section");
        section.className = "section reveal";
        section.innerHTML = `
          <div class="container">
            <div class="split">
              <div class="card copy">
                <span class="badge">Uitgelicht</span>
                <h2 class="h2" style="margin-top:12px"></h2>
                <p></p>
                <div style="margin-top:14px">
                  <a class="btn primary" data-slot="btn" href="#"></a>
                </div>
              </div>
              <div class="media">
                <img data-slot="img" src="" alt="">
              </div>
            </div>
          </div>`;
        setText(qs(".h2", section), s.title || "");
        setText(qs("p", section), s.text || "");
        const btn = qs('[data-slot="btn"]', section);
        btn.textContent = s.button_label || "Meer info";
        btn.href = s.button_url || "#";
        const im = qs('[data-slot="img"]', section);
        im.src = s.image || "assets/img/uploads/highlight.jpg";
        im.alt = s.title || "Highlight";
        mount.appendChild(section);
      }

      if (s.type === "gallery") {
        const section = document.createElement("section");
        section.className = "section reveal";
        section.innerHTML = `
          <div class="container">
            <div class="section-head">
              <h2 class="h2"></h2>
              <p class="sub"></p>
            </div>
            <div class="gallery" data-slot="gallery"></div>
            <p class="sub" style="margin-top:12px" data-slot="note"></p>
          </div>`;
        setText(qs(".h2", section), s.title || "");
        const gal = qs('[data-slot="gallery"]', section);
        for (const im of (s.images || [])) {
          const a = document.createElement("a");
          a.href = im.src || "#";
          a.setAttribute("aria-label", im.alt || "Foto");
          const img = document.createElement("img");
          img.src = im.src || "";
          img.alt = im.alt || "";
          a.appendChild(img);
          gal.appendChild(a);
        }
        setText(qs('[data-slot="note"]', section), s.note || "");
        mount.appendChild(section);
      }
    }
  }

  function mountBehandelingen(site, page) {
    setText(qs('[data-bind="page.title"]'), page.intro?.title || "Behandelingen");
    setText(qs('[data-bind="page.subtitle"]'), page.intro?.subtitle || "");

    const wrap = qs('[data-mount="treatments"]');
    if (!wrap) return;
    wrap.innerHTML = "";

    for (const g of (page.groups || [])) {
      const section = document.createElement("section");
      section.className = "section reveal";
      section.innerHTML = `
        <div class="container">
          <div class="section-head">
            <h2 class="h2"></h2>
            <p class="sub"></p>
          </div>
          <table class="table" aria-label="Prijzen">
            <thead><tr><th>Behandeling</th><th>Prijs</th></tr></thead>
            <tbody data-slot="rows"></tbody>
          </table>
        </div>`;
      setText(qs(".h2", section), g.title || "");
      const rows = qs('[data-slot="rows"]', section);
      for (const it of (g.items || [])) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td></td><td></td>`;
        setText(tr.children[0], it.name || "");
        setText(tr.children[1], it.price || "");
        rows.appendChild(tr);
      }
      wrap.appendChild(section);
    }

    setText(qs('[data-bind="page.note"]'), page.note || "");
  }

  function mountAfspraak(site, page) {
    setText(qs('[data-bind="page.title"]'), page.title || "Afspraak maken");
    setText(qs('[data-bind="page.subtitle"]'), page.subtitle || "");

    const p = qs('[data-bind="booking.primary"]');
    if (p) { p.textContent = page.primary?.label || "Online afspraak"; p.href = page.primary?.url || site.contact?.booking_url || "#"; }
    const s = qs('[data-bind="booking.secondary"]');
    if (s) { s.textContent = page.secondary?.label || "Bel ons"; s.href = page.secondary?.url || site.contact?.phone_link || "#"; }

    const extras = qs('[data-mount="booking.extras"]');
    if (extras) {
      extras.innerHTML = "";
      for (const e of (page.extra || [])) {
        const d = document.createElement("div");
        d.className = "feature";
        d.innerHTML = `<h3></h3><p></p>`;
        setText(qs("h3", d), e.title || "");
        setText(qs("p", d), e.text || "");
        extras.appendChild(d);
      }
    }
  }

  function mountProducten(site, page) {
    setText(qs('[data-bind="page.title"]'), page.title || "Producten");
    setText(qs('[data-bind="page.subtitle"]'), page.subtitle || "");

    setText(qs('[data-bind="products.brand.name"]'), page.brand?.name || "");
    setText(qs('[data-bind="products.brand.desc"]'), page.brand?.description || "");
    setText(qs('[data-bind="products.brand.origin"]'), page.brand?.origin_note || "");

    const link = qs('[data-bind="products.brand.link"]');
    if (link) {
      link.textContent = page.brand?.link_label || "Meer info";
      link.href = page.brand?.link_url || "#";
    }

    const gal = qs('[data-mount="products.images"]');
    if (gal) {
      gal.innerHTML = "";
      for (const im of (page.images || [])) {
        const a = document.createElement("a");
        a.href = im.src || "#";
        a.setAttribute("aria-label", im.alt || "Product");
        const img = document.createElement("img");
        img.src = im.src || "";
        img.alt = im.alt || "";
        a.appendChild(img);
        gal.appendChild(a);
      }
    }
  }

  function mountTeam(site, page) {
    setText(qs('[data-bind="page.title"]'), page.title || "Team");
    setText(qs('[data-bind="page.subtitle"]'), page.subtitle || "");

    const wrap = qs('[data-mount="team.members"]');
    if (!wrap) return;
    wrap.innerHTML = "";

    for (const m of (page.members || [])) {
      const card = document.createElement("article");
      card.className = "card person reveal";
      card.innerHTML = `
        <div class="photo"><img src="" alt=""></div>
        <div class="meta">
          <h3></h3>
          <div class="role"></div>
          <div class="bio"></div>
        </div>`;
      const img = qs("img", card);
      img.src = m.photo || "assets/img/uploads/team.jpg";
      img.alt = m.name || "Team";
      setText(qs("h3", card), m.name || "");
      setText(qs(".role", card), m.role || "");
      setText(qs(".bio", card), m.bio || "");
      wrap.appendChild(card);
    }
  }

  function mountContact(site, page) {
    setText(qs('[data-bind="page.title"]'), page.title || "Contact");
    setText(qs('[data-bind="page.subtitle"]'), page.subtitle || "");

    const cards = qs('[data-mount="contact.cards"]');
    if (cards) {
      cards.innerHTML = "";
      for (const c of (page.cards || [])) {
        const el = document.createElement("div");
        el.className = "card info-card reveal";
        el.innerHTML = `<h3></h3><p></p><a class="small-link" href="#"></a>`;
        setText(qs("h3", el), c.title || "");
        setText(qs("p", el), c.text || "");
        const a = qs("a", el);
        a.textContent = c.link_label || "Open";
        a.href = c.link_url || "#";
        cards.appendChild(el);
      }
    }

    // Opening hours
    const oh = qs('[data-mount="opening-hours"]');
    if (oh) {
      oh.innerHTML = "";
      for (const r of (site.opening_hours || [])) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td></td><td></td>`;
        setText(tr.children[0], r.day || "");
        setText(tr.children[1], r.hours || "");
        oh.appendChild(tr);
      }
    }

    // Form labels
    setText(qs('[data-bind="form.title"]'), page.form?.title || "Stuur een bericht");
    setText(qs('[data-bind="form.name_label"]'), page.form?.fields?.name_label || "Naam");
    setText(qs('[data-bind="form.email_label"]'), page.form?.fields?.email_label || "E-mail");
    setText(qs('[data-bind="form.message_label"]'), page.form?.fields?.message_label || "Bericht");
    const submit = qs('[data-bind="form.submit_label"]');
    if (submit) submit.textContent = page.form?.fields?.submit_label || "Versturen";
  }

  function initMobileMenu() {
    const btn = qs('[data-action="toggle-menu"]');
    const mobile = qs('.mobile-nav');
    if (!btn || !mobile) return;
    btn.addEventListener("click", () => {
      const open = mobile.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initCurrentNav() {
    const current = (document.body.getAttribute("data-page") || "").trim();
    qsa(`[data-nav="desktop"] a`).forEach(a => {
      if ((a.getAttribute("href") || "").includes(current)) a.setAttribute("aria-current", "page");
    });
  }

  // Page selection
  const pageKey = document.body.getAttribute("data-content") || "home";

  const [siteData, pageData] = await Promise.all([
    loadJSON("content/site.json"),
    loadJSON(`content/${pageKey}.json`)
  ]);

  buildHeader(siteData);
  buildFooter(siteData);
  setMeta(siteData, pageData);

  initMobileMenu();
  initCurrentNav();

  const page = document.body.getAttribute("data-page");
  if (page === "home") mountHome(siteData, pageData);
  if (page === "behandelingen") mountBehandelingen(siteData, pageData);
  if (page === "afspraak") mountAfspraak(siteData, pageData);
  if (page === "producten") mountProducten(siteData, pageData);
  if (page === "team") mountTeam(siteData, pageData);
  if (page === "contact") mountContact(siteData, pageData);

  // reveal animations
  const obs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    }
  }, { threshold: 0.12 });

  qsa(".reveal").forEach(el => obs.observe(el));
})();
