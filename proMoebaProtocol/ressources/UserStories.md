# User Stories

## US 1
En tant que Sponsor (Assureur), Je veux déployer un Smart Contract de Vault et y déposer ma "Junior Tranche" (ex: 4M$), Afin de d'initialiser la capacité de couverture et activer la période de collecte de fonds.

→ Un onglet pour la création de nouveaux vaults qui ne sont pas trouvable sur le site tant quils n'ont pas été whitelisté.

## US 2
En tant qu' Investisseur potentiel (Liquidity Provider), Je veux visualiser clairement la répartition du capital (Tranche Junior vs Tranche Senior) sur le tableau de bord, Afin de vérifier que l'assureur a bien engagé son propre capital en "première perte" avant de déposer mes fonds.

→ Concept de la sur-collateralisation pour éviter aux investisseurs de perdre l'intégraliter de leur investissement.

## US 3
En tant qu' Investisseur, Je veux retirer ma part résiduelle de capital (Senior Tranche) après la confirmation d'un sinistre, Afin de récupérer environ 55% de ma mise (Soft Default) au lieu de tout perdre.

→ Sur-collateralisation des assureurs qui permet aux investisseurs de ne pas perdre l'intégralité de leur capital investit.

## US 4
En tant qu' Investisseur Qualifié, Je veux connecter mon portefeuille et prouver mon identité (Whitelisting d'adresse), Afin d'être autorisé par le Smart Contract à déposer des fonds, conformément à la réglementation LBA suisse.

## US 5
En tant qu' Investisseur, Je veux que 80% de mes fonds non utilisés soient automatiquement alloués à des actifs RWA (Bons du trésor), Afin de générer un rendement de base (5% APR) même pendant la période de couverture.

## US 6
En tant que Protocole, Je veux bloquer automatiquement tout retrait 5 jours avant la date de maturité, Afin de garantir que la liquidité est disponible si la catastrophe survient au dernier moment.

## US 7
En tant que Smart Contract du Protocole (HPIV), Je veux recevoir et agréger les données certifiées provenant de sondes externes spécialisées (météorologiques, sismographes, niveaux hydrauliques de barrages), Afin de calculer en temps réel la probabilité d'un événement critique et déclencher automatiquement les mécanismes de sécurité (hausse des frais ou blocage des retraits).

1. **Connexion Multi-Sources (IoT & API) :** Le contrat doit pouvoir ingérer des données provenant de différentes typologies d'oracles selon le Vault créé :

- Météo : Vitesse du vent (anémomètres) pour les ouragans.

- Géologie : Magnitude sur l'échelle de Richter (sismographes) pour les séismes.

- Hydrologie : Niveau d'eau (capteurs de pression/ultrasons) pour les risques de rupture de barrage.

2. **Calcul de Probabilité & Frais Dynamiques :** Les données reçues doivent mettre à jour le "Score de Risque" du Vault.

- Exemple : Si une sonde météo détecte une dépression s'approchant (probabilité accrue), les frais de retrait (Dynamic Fees) doivent augmenter automatiquement pour désinciter la fuite des capitaux.

3. **Seuils de Déclenchement (Triggers) :** Des seuils précis sont codés en dur (Hardcoded) lors de la création du Vault.

- Exemple : Si vent > 250km/h ALORS Trigger = TRUE.

- Une fois le seuil franchi, l'événement est considéré comme "validé", déclenchant la procédure de calcul du "Soft Default".

4. **Redondance et Consensus (Sécurité) :** Pour éviter une manipulation (ex: piratage d'une seule sonde), l'oracle doit agréger au moins 3 sources différentes pour confirmer une donnée (ex: 3 stations météo différentes) avant de valider l'événement.

## US 8 : Création et Amorçage
En tant que **Sponsor (Assureur)**, Je veux déployer un Smart Contract de Vault en définissant :

1. Les paramètres physiques (ex: Vent > 250km/h).

2. Le montant de ma "Junior Tranche" (First Loss).

3. Le montant de la "Prime" (Yield) que je verse immédiatement. _Afin d'initialiser la capacité de couverture et d'attirer des liquidités._

## US 9 : Transparence des Risques
En tant qu'**Investisseur potentiel**, Je veux voir clairement la distinction entre :

- Le "Capital à Risque" (Junior + Senior) utilisé pour payer les sinistres.

- La "Réserve de Prime" (Yield) qui est sanctuarisée et ne sert jamais à payer les sinistres. _Afin de comprendre que mon rendement est garanti même en cas de catastrophe totale._

## US 10 : Protection du Capital (Soft Default)
En tant qu'**Investisseur**, Je veux que le paiement du sinistre consomme en priorité la Tranche Junior de l'assureur avant de toucher à ma Tranche Senior. _Afin de minimiser mes pertes ("Haircut") lors de sinistres mineurs ou moyens._

## US 11 : Principe Indemnitaire (Dual Trigger)
En tant qu'**Investisseur**, Je veux que le paiement final soit basé sur le montant réel des dommages (`actualClaimAmount`) et non forcé au maximum de la capacité. _Afin d'éviter que l'assureur ne siphonne la liquidité (20M$) pour un événement qui n'a causé que peu de dégâts (1M$)._

## US 12 : Conformité (KYC)
En tant qu'**Investisseur Qualifié**, Je veux connecter mon portefeuille et prouver mon identité (Whitelisting), _Afin d'être autorisé par le Smart Contract à déposer des fonds et à échanger mes parts sur le marché secondaire, conformément à la réglementation LBA suisse._

## US 13 : Réclamation (Claim)
En tant qu'**Investisseur post-catastrophe**, Je veux réclamer mon solde restant via une transaction unique qui me verse :

1. Le reliquat de mon capital (si `SeniorLoss` < 100%).

2. Ma part intégrale de la prime d'assurance (Yield).

3. Les rendements générés par le placement en Bons du Trésor (RWA).
