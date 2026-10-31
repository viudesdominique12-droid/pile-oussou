# Sugu Mall — page de vente

Sugu Mall, le marché en ligne de Bamako. Premier produit : page de vente d'un pack « boîtier de charge USB-C + 4 piles AA rechargeables lithium » (PUJIMAX, 3 400 mWh), vendu à Bamako (Mali).
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

- L'image d'aperçu `img/og-sugu-mall.jpg` affiche le prix : à refaire s'il change (voir plus bas).

## Images et logo

Les images du produit (`img/boitier-studio.webp`, `img/pack-studio.webp`) sont des images studio faites par IA
à partir des photos du vrai produit, comme sur les pubs Facebook. Les photos envoyées par Miya servent de preuve
et ne vont pas sur le site.

Le logo `img/logo-sugu-mall.svg` (4 carrés en couleur, nom vert) s'affiche toujours sur fond blanc.

Images, favicon et aperçu de partage se refont avec `python site_sugu_mall.py`
dans `../visuels-pubs/sources/` (hors dépôt).

## Voir le site en local

```bash
python -m http.server 8090
```

Puis ouvrir http://localhost:8090.
