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
})();
