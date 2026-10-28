# Batteries Bamako — page de vente

Page de vente d'un pack « boîtier de charge USB-C + 4 piles AA rechargeables lithium » (PUJIMAX, 3 400 mWh), vendu à Bamako (Mali).
Commande via WhatsApp, livraison incluse à Bamako, paiement à la livraison ou par Orange Money.

Site statique (HTML, CSS, JavaScript), sans outil de compilation. En ligne sur GitHub Pages : https://sugumall.com/ (domaine acheté chez Cloudflare, le fichier `CNAME` le déclare à GitHub)

## Modifier le prix, le numéro WhatsApp ou le nombre de piles

Tout se règle en haut de `main.js`, dans `CONFIG` :

```js
const CONFIG = {
  whatsapp: "22391026406", // numéro au format international, sans + ni espaces
  prix: 20000,             // prix d'un pack en FCFA
  nbPiles: 4,              // nombre de piles dans le pack
  ...
};
```

## Encore provisoire

- L'image d'aperçu `img/og-image.jpg` affiche le nom et le prix : à refaire s'ils changent.

Les photos du produit (dossier `img/`) ont été détourées et retouchées à partir des photos envoyées par Miya
(fond studio uni, balance des blancs, contraste). Les versions grand format sont dans `../photos-retouchees/` (hors dépôt).

## Propositions de logos

`logos.html` (non liée depuis la page de vente) présente les 3 idées de logo proposées. Le client a choisi **Batteries Bamako** (badge vert avec une pile AA).

## Voir le site en local

```bash
python -m http.server 8090
```

Puis ouvrir http://localhost:8090.
