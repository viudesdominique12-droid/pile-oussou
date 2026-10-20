/* =========================================================
   Pile Oussou — réglages de la page
   Tout le site se met à jour à partir de ces lignes.
   ========================================================= */
const CONFIG = {
  // Numéro WhatsApp de Miya (commandes), format international sans "+" ni espaces.
  whatsapp: "22391026406",
  // Prix d'un pack, en FCFA.
  prix: 20000,
  // Nombre de piles dans le pack (4 d'après le client, Miya doit le reconfirmer).
  nbPiles: 4,
  // Nom du produit tel qu'il apparaît dans le message WhatsApp.
  produit: "Pack boîtier de charge USB-C + piles AA rechargeables",
};

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // 25000 -> "25 000" (espace insécable)
  const fcfa = (n) => Math.round(n).toLocaleString("fr-FR").replace(/[  \s]/g, " ");

  const waLink = (message) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;

  const telAffiche = (num) => {
    const local = num.replace(/^223/, "");
    return "+223 " + local.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  };

  /* ---------- Remplissage des valeurs ---------- */
  $$("[data-prix]").forEach((el) => (el.textContent = fcfa(CONFIG.prix)));
  $$("[data-piles]").forEach((el) => (el.textContent = CONFIG.nbPiles));
  $$("[data-wa]").forEach((el) => {
    el.href = waLink(`Bonjour Pile Oussou ! J'ai une question sur le ${CONFIG.produit}.`);
    el.target = "_blank";
    el.rel = "noopener";
  });
  $$("[data-tel]").forEach((el) => {
    el.href = "tel:+" + CONFIG.whatsapp;
    el.textContent = telAffiche(CONFIG.whatsapp);
  });
  /* ---------- Comparaison sur 3 ans (visuel « Vous économisez ») ---------- */
  // Même hypothèse que la valeur par défaut du calculateur : 8 piles par mois à 250 F.
  const jetables3ans = 8 * 250 * 36;
  $$("[data-eco-jetables]").forEach((el) => (el.textContent = fcfa(jetables3ans)));
  $$("[data-eco-gain]").forEach((el) => (el.textContent = fcfa(Math.max(0, jetables3ans - CONFIG.prix))));
  $$("[data-eco-bar]").forEach((el) => el.style.setProperty("--w", Math.min(100, (CONFIG.prix / jetables3ans) * 100) + "%"));

  const annee = $("#annee");
  if (annee) annee.textContent = new Date().getFullYear();

  /* ---------- Calculateur d'économies ---------- */
  const qte = $("#calc-qte");
  const qteOut = $("#calc-qte-out");
  const annuel = $("#calc-annuel");
  const retour = $("#calc-retour");

  function dureeRemboursement(mois) {
    if (mois < 1) {
      const semaines = Math.max(1, Math.ceil(mois * 4.3));
      return semaines <= 1 ? "moins d'une semaine" : `${semaines} semaines`;
    }
    const m = Math.ceil(mois);
    return m === 1 ? "1 mois" : `${m} mois`;
  }

  function majCalcul() {
    const n = Number(qte.value);
    const prixPile = Number($('input[name="prix-pile"]:checked').value);
    const parMois = n * prixPile;
    qteOut.textContent = n;
    qte.style.setProperty("--p", ((n - qte.min) / (qte.max - qte.min)) * 100 + "%");
    annuel.textContent = fcfa(parMois * 12);
    retour.textContent = dureeRemboursement(CONFIG.prix / parMois);
  }

  if (qte) {
    qte.addEventListener("input", majCalcul);
    $$('input[name="prix-pile"]').forEach((r) => r.addEventListener("change", majCalcul));
    majCalcul();
  }

  /* ---------- Formulaire de commande ---------- */
  const form = $("#form-commande");
  const champQte = $("#f-qte");
  const total = $("#total");

  const lireQte = () => {
    const n = parseInt(champQte.value, 10);
    return Number.isFinite(n) ? Math.min(20, Math.max(1, n)) : 1;
  };
  const majTotal = () => (total.textContent = fcfa(lireQte() * CONFIG.prix));

  $$(".stepper__btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      champQte.value = Math.min(20, Math.max(1, lireQte() + Number(btn.dataset.step)));
      majTotal();
    })
  );
  champQte.addEventListener("input", majTotal);
  champQte.addEventListener("blur", () => {
    champQte.value = lireQte();
    majTotal();
  });
  majTotal();

  const champsRequis = [
    { input: $("#f-nom"), err: $("#f-nom-err") },
    { input: $("#f-quartier"), err: $("#f-quartier-err") },
  ];

  function valider(champ) {
    const ok = champ.input.value.trim().length > 0;
    champ.input.setAttribute("aria-invalid", ok ? "false" : "true");
    champ.err.hidden = ok;
    return ok;
  }

  champsRequis.forEach((champ) => {
    champ.input.addEventListener("blur", () => {
      if (champ.input.value.trim() || champ.input.getAttribute("aria-invalid") === "true") valider(champ);
    });
    champ.input.addEventListener("input", () => {
      if (champ.input.getAttribute("aria-invalid") === "true") valider(champ);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalides = champsRequis.filter((c) => !valider(c));
    if (invalides.length) {
      invalides[0].input.focus();
      return;
    }

    const n = lireQte();
    const data = new FormData(form);
    const note = String(data.get("note") || "").trim();
    const lignes = [
      "Bonjour Pile Oussou ! Je veux commander :",
      `• ${n} × ${CONFIG.produit} (${CONFIG.nbPiles} piles)`,
      `• Total : ${fcfa(n * CONFIG.prix)} FCFA`,
      "",
      `Nom : ${String(data.get("nom")).trim()}`,
      `Quartier : ${String(data.get("quartier")).trim()}`,
      `Paiement : ${data.get("paiement")}`,
    ];
    if (note) lignes.push(`Remarque : ${note}`);

    const url = waLink(lignes.join("\n"));
    $("#order-ok-link").href = url;
    $("#order-ok").hidden = false;
    window.open(url, "_blank", "noopener");
  });

  /* ---------- Barre de commande fixe (mobile) ---------- */
  const barre = $("#sticky-cta");
  const heroCta = $("#hero-cta");
  const zoneCommande = $("#commander");

  if (barre && "IntersectionObserver" in window) {
    let heroVisible = true;
    let commandeVisible = false;
    const maj = () => {
      const afficher = !heroVisible && !commandeVisible;
      barre.classList.toggle("is-visible", afficher);
      barre.setAttribute("aria-hidden", String(!afficher));
      barre.querySelector("a").tabIndex = afficher ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; maj(); }).observe(heroCta);
    new IntersectionObserver(([e]) => { commandeVisible = e.isIntersecting; maj(); }, { threshold: 0.05 }).observe(zoneCommande);
  }

  /* =========================================================
     Effets au défilement
     ========================================================= */
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const aIO = "IntersectionObserver" in window;

  /* ---------- Apparition des blocs ---------- */
  const blocs = $$("[data-reveal]");
  if (!aIO || reduit) {
    blocs.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    blocs.forEach((el) => io.observe(el));
  }
  window.__pileReady = true;

  /* ---------- En-tête plus marqué après le haut de page ---------- */
  const entete = $("#site-header");
  const heroImg = $("#hero-img");
  let tick = false;
  function auScroll() {
    tick = false;
    const y = window.scrollY;
    entete.classList.toggle("is-scrolled", y > 8);
    // léger effet de profondeur sur la photo du haut de page
    if (heroImg && !reduit && y < 900) heroImg.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
  }
  window.addEventListener("scroll", () => {
    if (!tick) { tick = true; requestAnimationFrame(auScroll); }
  }, { passive: true });
  auScroll();

  /* ---------- Chiffres qui défilent ---------- */
  const compteurs = $$("[data-count]");
  function compter(el) {
    const fin = Number(el.dataset.count);
    const debut = performance.now();
    const duree = 1100;
    const pas = (t) => {
      const k = Math.min(1, (t - debut) / duree);
      el.textContent = fcfa(fin * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }
  if (aIO && !reduit) {
    const ioC = new IntersectionObserver((entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        compter(e.target);
        ioC.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    compteurs.forEach((el) => ioC.observe(el));
  }

  /* ---------- Avantages : le visuel fixe suit le texte (ordinateur) ---------- */
  const avantages = $$(".feature");
  const cadre = $(".features__frame");
  if (cadre) {
    // On recopie le visuel de chaque avantage dans le cadre fixe (une seule source dans le HTML).
    const repere = cadre.querySelector(".features__dots");
    $$(".feature .panel").forEach((panneau, k) => {
      const copie = panneau.cloneNode(true);
      copie.classList.toggle("is-active", k === 0);
      copie.querySelectorAll("[role], [aria-label]").forEach((el) => { el.removeAttribute("role"); el.removeAttribute("aria-label"); });
      copie.querySelectorAll("img").forEach((img) => (img.alt = ""));
      cadre.insertBefore(copie, repere);
    });
  }
  const photos = $$(".features__frame .panel");
  const points = $$(".features__dots li, .swipe-hint__dots li");
  const nbPoints = Math.max(1, avantages.length);
  function activer(i) {
    avantages.forEach((el, k) => el.classList.toggle("is-active", k === i));
    photos.forEach((el, k) => el.classList.toggle("is-active", k === i));
    points.forEach((el, k) => el.classList.toggle("is-active", k % nbPoints === i));
  }
  const ordinateur = window.matchMedia("(min-width: 960px)");
  // Ordinateur : l'avantage actif est celui qui passe au milieu de l'écran (calcul au scroll,
  // plus fiable qu'un IntersectionObserver quand la page est affichée dans un cadre).
  let actif = 0;
  function suivreAvantages() {
    if (!avantages.length || !ordinateur.matches) return;
    const milieu = window.innerHeight / 2;
    let meilleur = actif, distMin = Infinity;
    avantages.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      const d = r.top <= milieu && r.bottom >= milieu ? 0 : Math.min(Math.abs(r.top - milieu), Math.abs(r.bottom - milieu));
      if (d < distMin) { distMin = d; meilleur = k; }
    });
    if (meilleur !== actif) { actif = meilleur; activer(actif); }
  }
  window.addEventListener("scroll", () => requestAnimationFrame(suivreAvantages), { passive: true });
  window.addEventListener("resize", suivreAvantages);
  suivreAvantages();

  // Téléphone : carrousel à faire glisser, l'avantage actif suit la carte affichée.
  const carrousel = $("#features-list");
  if (carrousel) {
    let tickC = false;
    carrousel.addEventListener("scroll", () => {
      if (tickC || ordinateur.matches) return;
      tickC = true;
      requestAnimationFrame(() => {
        tickC = false;
        const carte = avantages[0].getBoundingClientRect().width + 12;
        const i = Math.min(avantages.length - 1, Math.max(0, Math.round(carrousel.scrollLeft / carte)));
        if (i !== actif) { actif = i; activer(i); }
      });
    }, { passive: true });
  }

  /* ---------- Menu plein écran (téléphone) ---------- */
  const boutonMenu = $("#menu-btn");
  const menu = $("#menu");
  if (boutonMenu && menu) {
    const fermer = () => {
      menu.hidden = true;
      boutonMenu.setAttribute("aria-expanded", "false");
      boutonMenu.textContent = "Menu";
      document.body.style.overflow = "";
    };
    boutonMenu.addEventListener("click", () => {
      const ouvrir = menu.hidden;
      menu.hidden = !ouvrir;
      boutonMenu.setAttribute("aria-expanded", String(ouvrir));
      boutonMenu.textContent = ouvrir ? "Fermer" : "Menu";
      document.body.style.overflow = ouvrir ? "hidden" : "";
      if (ouvrir) menu.querySelector("a").focus();
    });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) fermer(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { fermer(); boutonMenu.focus(); } });
    ordinateur.addEventListener("change", (e) => { if (e.matches) fermer(); });
  }
})();
