# Pile Oussou — page de vente

Page de vente d'un pack « boîtier de charge USB-C + piles AA rechargeables lithium », vendu à Bamako (Mali).
Commande via WhatsApp, paiement à la livraison ou par Mobile Money.

Site statique (HTML, CSS, JavaScript), sans outil de compilation.

## Modifier le prix, le numéro WhatsApp ou le nombre de piles

Tout se règle en haut de `main.js`, dans `CONFIG` :

```js
const CONFIG = {
  whatsapp: "22300000000", // numéro au format international, sans + ni espaces
  prix: 25000,             // prix d'un pack en FCFA
  nbPiles: 4,              // nombre de piles dans le pack
  ...
};
```

⚠️ Les valeurs actuelles sont **provisoires**.

## Voir le site en local

```bash
python -m http.server 8080
```

Puis ouvrir http://localhost:8080.
