# Détails des calculs

Les calculs sont détaillés en bas de page, suivre les numéros **(1)**, **(2)**, etc.

---

## Vue d’ensemble

Les parieurs arrivent sur un **dashboard** regroupant tous les paris actuellement en cours et sur lesquels ils peuvent miser.  
Sur chaque fiche, on indique :

- les statistiques fournies par l'oracle avec le pourcentage de chance de gagner ;
- les **cotes actuelles (1)**, calculées en fonction des mises déjà collectées ;
- la **liquidité totale pariée** → sert à savoir si sa mise fera beaucoup évoluer les cotes.

---

## Détails d’un pari

Une fois un pari **sélectionné**, le parieur aura **davantage d’éléments** à sa disposition.

### Partie statistique

Le parieur aura accès aux **statistiques détaillées** de chaque rappeur, indiquant notamment :
- son **style**,  
- ses **victoires** dans cette compétition,  
- s’il y a déjà eu un **battle** les opposant, etc.

### Partie technique

Se présenteront à lui les **taxes (rappeurs + protocole)** (2), en affichant sa mise sans taxe puis sa mise une fois les taxes prélevées.  
De plus, il verra une **jauge** lui permettant de répartir sa mise sur les deux rappeurs.  

Les cotes pourront être affichées en :
- mode **« cote actuelle »**, ou  
- mode **« simulation »**, qui montre l’impact de sa mise sur l’évolution des cotes.  

Le mode simulation affiche également les **gains potentiels** si les cotes n’évoluent pas.

> 💡 Miser sur `rapper#1` revient simplement à déposer sa liquidité sur `rapper#1`, qui est un **ERC-1155** :  
> sa valeur augmente et donc sa cote augmente avec.

---

## Résultat et gains

Une fois le pari terminé et le **résultat validé par l’oracle**, les **gains** sont crédités automatiquement sur le compte du parieur (3).

---

## Formules

### Calculer la cote

(1) Pour calculer la cote du rapper#1, il faut diviser la liquidité déposée sur rapper#1 par la liquidité totale, ce qui nous donne la valeur du token rapper#1, puis multiplier le tout par cent :

**Rapper_liquidity  / Total_liquidity * 100 = Cote du rappeur en %.**

---
### Calculer la mise après taxation

(2) 15 % de la liquidité revient aux rappeurs et 2 % à 10 % (évolutif dans le temps (4)) revient au protocole.
Pour calculer la mise effective du parieur, il faut faire :

**mise * (1 − rapper_fee − protocol_fee) = mise_réelle.**

---
### Calculer les gains

(3) Pour calculer les gains, il faut faire :

**Total_liquidity / Winner_Liquidity * mise_réelle = gains** (mise incluse)

**gains − mise_réelle = gains_nets** (mise exclue).

---
### Évolution des frais

(4) Pour calculer l'évolution des frais il faut faire :

Si time < time_limit :
**base_protocol_fee + fee_change_factor * time**

Sinon :
**base_protocol_fee + fee_change_factor * time_limit**

Notice : time_limit existe pour éviter que les frais continuent de monter de manière déraisonnable.

---
<img width="3661" height="2227" alt="Image" src="https://github.com/user-attachments/assets/09ed9e72-8b8b-4d33-be4c-86a5bbc64ed0" />

<img width="3157" height="2590" alt="Image" src="https://github.com/user-attachments/assets/ab3f895b-4510-4bd0-b643-5eeb2ce1b0e1" />

<img width="4738" height="1857" alt="Image" src="https://github.com/user-attachments/assets/9df7038d-5839-4bc2-9b7e-3c6ad55c978e" />

[bet_function.js](https://github.com/user-attachments/files/23501856/bet_function.js)
