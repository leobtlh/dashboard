# Analyse Réglementaire Approfondie et Perspectives d'Innovation :

# Projet DeFi Cat Bond et l'Écosystème Financier Suisse

## 1. Introduction et Cadrage Stratégique

L'écosystème financier mondial traverse une phase de transformation structurelle sans précédent, caractérisée par la convergence de la finance traditionnelle (TradFi) et de la finance décentralisée (DeFi). Au cœur de cette mutation se trouve la Suisse, juridiction historiquement reconnue pour son excellence dans la gestion de fortune et la réassurance, qui s'est réinventée en tant que "Crypto Valley" mondiale. Le projet de création d'une obligation catastrophe (Catastrophe Bond ou Cat Bond) gérée via des protocoles DeFi s'inscrit précisément à l'intersection de ces deux mondes. Il nécessite une navigation minutieuse à travers un cadre législatif récemment modernisé, notamment la révision de la Loi sur la surveillance des assurances (LSA), l'entrée en vigueur de la Loi sur les technologies de registres distribués (Loi TRD/DLT), et les exigences strictes de la Loi sur les placements collectifs (LPCC).

Ce rapport a pour objectif de fournir une analyse exhaustive, rigoureuse et nuancée des implications réglementaires pour un tel projet, tout en explorant les horizons inexploités de la DeFi pour identifier de nouvelles opportunités de développement. L'analyse se fonde sur les textes législatifs fédéraux, les ordonnances du Conseil fédéral, les circulaires de l'Autorité fédérale de surveillance des marchés financiers (FINMA), et la pratique émergente du marché.



### 1.1 La Philosophie Réglementaire Suisse :

Neutralité Technologique et Approche Fondée sur les Principes

Pour comprendre l'environnement dans lequel un Cat Bond DeFi doit opérer, il est impératif de saisir la doctrine fondamentale de la FINMA. Contrairement à d'autres juridictions qui ont opté pour des cadres législatifs entièrement nouveaux et spécifiques aux crypto-actifs (comme le règlement MiCA dans l'Union européenne), la Suisse privilégie une approche fondée sur des principes (principle-based) et la neutralité technologique.¹

Le principe directeur est "same business, same risks, same rules" (même activité, mêmes risques, mêmes règles). Cela signifie que l'utilisation de la technologie blockchain ou de contrats intelligents (smart contracts) ne soustrait pas un projet aux obligations réglementaires existantes. La FINMA examine la substance économique ("substance over form") plutôt que la forme technique. Si un token a la fonction économique d'une obligation, il sera traité comme une valeur mobilière, indépendamment de son support cryptographique.⁴

Dans le contexte d'un Cat Bond, cela implique une double contrainte : le projet doit satisfaire aux exigences prudentielles de l'assurance (car il y a transfert de risque) et aux exigences de transparence des marchés de capitaux (car il y a émission de titres), tout en gérant les risques spécifiques liés à la technologie DLT (blanchiment d'argent, cyber-risques, volatilité).

### 1.2 Définition du Projet et Architecture Cible

Le projet analysé consiste en l'émission d'instruments liés à l'assurance (ILS - Insurance-Linked Securities) sous forme de tokens sur une infrastructure blockchain. Le cycle de vie du produit comprend :

1. **La cession de risque :** Un assureur ou réassureur (le cédant) transfère un risque de catastrophe (ex: tremblement de terre, ouragan) à une structure dédiée.

2. **La titrisation :** La structure émet des tokens représentatifs de ce risque à des investisseurs.

3. **Le collatéral :** Les fonds levés (en crypto-actifs ou fiat tokenisé) sont verrouillés dans un contrat intelligent ou un compte ségrégué pour garantir le paiement en cas de sinistre.

4. **Le déclenchement (Trigger) :** Un oracle (source de données externe) confirme la survenance de l'événement, déclenchant automatiquement le transfert des fonds au cédant ou le remboursement aux investisseurs.

Cette architecture soulève des questions juridiques complexes touchant la LSA (pour le véhicule), le Code des Obligations (pour le token), la LPCC (pour la gestion des actifs), et la LBA (pour les flux financiers).

---

## 2. Le Cadre de la Surveillance des Assurances (LSA et AVO)

La pierre angulaire de la régulation d'un Cat Bond est la Loi sur la surveillance des assurances (LSA). Jusqu'à récemment, la Suisse souffrait d'un désavantage concurrentiel par rapport aux Bermudes ou à Guernesey, faute d'un régime adapté aux véhicules de titrisation. La révision de la LSA, entrée en vigueur le 1er janvier 2024, a radicalement changé la donne en introduisant un cadre spécifique pour les véhicules à usage spécifique d'assurance (VUSA).⁶

### 2.1 Le Véhicule à Usage Spécifique d'Assurance (VUSA / ISPV)

L'article 30e de la LSA révisée définit le VUSA comme une société qui n'est pas une entreprise d'assurance traditionnelle, mais qui reprend des risques d'entreprises d'assurance (réassurance) et finance intégralement ces risques par l'émission d'instruments financiers.⁸

Cette définition est cruciale pour le projet DeFi. Elle permet de créer une entité ad hoc (SPV - Special Purpose Vehicle) qui agit comme un transformateur de risques. Contrairement à un assureur classique qui mutualise les risques et s'appuie sur la loi des grands nombres, le VUSA isole un risque spécifique et le finance à 100% par le marché des capitaux.

#### 2.1.1 L'Exigence du "Fully Funded" (Financement Intégral)

L'élément central du régime VUSA est l'exigence de financement intégral ("fully funded"). L'article 111d de l'Ordonnance sur la surveillance (AVO) précise que le VUSA doit disposer à tout moment d'actifs dont la valeur couvre l'exposition maximale au risque.⁹

Dans un contexte DeFi, cette exigence de "fully funded" impose des contraintes techniques strictes sur le collatéral :

- **Volatilité des Actifs :** Si le collatéral est détenu en crypto-actifs volatils (ex: ETH, BTC), la volatilité du sous-jacent pourrait entraîner une sous-capitalisation du véhicule par rapport au risque couvert. La FINMA appliquera vraisemblablement le "Prudent Person Principle" (Principe de la personne prudente), exigeant que les actifs soient investis de manière à garantir la sécurité, la liquidité et la rentabilité.¹⁰

- **Stablecoins et CBDC :** Pour satisfaire à l'exigence de financement intégral sans sur-collatéralisation massive, le projet devra probablement utiliser des stablecoins de haute qualité (adossés à des réserves fiat auditées) ou, idéalement, une monnaie numérique de banque centrale de gros (wCBDC), telle qu'explorée dans le projet Helvetia de la BNS.³

- **Subordination :** Les conditions d'émission des tokens doivent explicitement stipuler que les créances des investisseurs sont subordonnées aux obligations de réassurance. En cas de sinistre, le cédant est payé en priorité. Cette subordination doit être encodée dans le smart contract régissant la distribution des fonds.⁹

#### 2.1.2 Capital Minimum et Fonds d'Organisation

Bien que le risque soit couvert par les investisseurs, le VUSA doit être constitué sous forme de société anonyme (SA) ou de coopérative.¹²

- **Capital-actions :** Le capital minimum légal pour une SA est de 100 000 CHF. Cependant, la FINMA dispose d'un pouvoir d'appréciation pour fixer le capital minimum réglementaire en fonction du plan d'affaires. Pour les réassureurs captifs ou les véhicules entièrement collatéralisés, ce montant peut être maintenu proche du minimum légal, contrairement aux assureurs traditionnels (qui nécessitent entre 3 et 20 millions CHF).⁹

- **Fonds d'organisation :** Le VUSA doit disposer d'un fonds d'organisation (généralement 20% du capital minimum) pour couvrir les frais de constitution et d'exploitation initiale. Des exemptions sont possibles si l'activité est limitée à des preneurs d'assurance professionnels.⁹

### 2.2 Exemptions pour Preneurs d'Assurance Professionnels (Art. 30a LSA)

Une innovation majeure de la LSA révisée est la distinction entre les assurés nécessitant une protection (grand public) et les "preneurs d'assurance professionnels". Les projets ILS/Cat Bond traitent quasi exclusivement avec des contreparties professionnelles (réassureurs, grandes entreprises).

En vertu de l'article 30a LSA, les entreprises qui ne concluent des contrats d'assurance qu'avec des preneurs d'assurance professionnels peuvent être dispensées de certaines exigences prudentielles, notamment 15 :

- L'obligation d'alimenter une fortune liée (actifs réservés pour garantir les créances des assurés).

- L'obligation de disposer d'un fonds d'organisation.

- Certaines exigences en matière de solvabilité, pour autant que le transfert de risque soit transparent et compris par les contreparties.

Pour un projet DeFi, cette exemption est stratégique. Elle réduit la lourdeur administrative et les coûts de capital immobilisé, permettant au véhicule de se concentrer sur la mécanique technique de la titrisation. Le VUSA doit toutefois soumettre une demande formelle à la FINMA et documenter le statut professionnel de ses clients.¹⁵

### 2.3 Régime des Petits Assureurs (Art. 1c AVO)

Il existe également un régime allégé pour les "petits assureurs" (catégories de surveillance 4 et 5), caractérisé par des exigences de reporting réduites (exemption du rapport ORSA, réduction de l'audit).¹⁶

Cependant, il est crucial de noter que ce régime exclut les assureurs directs qui bénéficient déjà des exemptions pour preneurs d'assurance professionnels (Art. 30a LSA). Ainsi, un projet Cat Bond devra choisir sa voie réglementaire : soit se structurer comme un petit assureur généraliste (peu probable pour un VUSA), soit, ce qui est recommandé, opter pour le statut de VUSA avec exemption pour clients professionnels.¹⁵

---

## 3. Le Cadre des Titres et Infrastructures de Marché (Loi DLT et LIMF)



La "tokenisation" du Cat Bond transforme un contrat de réassurance en un actif numérique négociable. Cela active le cadre de la Loi sur l'infrastructure des marchés financiers (LIMF/FinMIA) et les modifications du Code des Obligations apportées par la Loi DLT.

### 3.1 Qualification des Tokens : Asset Tokens

Selon le guide pratique de la FINMA sur les ICOs, les tokens émis dans le cadre d'un Cat Bond sont classifiés comme des **Asset Tokens** (jetons d'actifs).¹

- **Nature Juridique :** Ils représentent une créance de dette envers l'émetteur (le VUSA) et un droit conditionnel au remboursement du principal et au paiement d'intérêts (coupons).

- **Conséquence :** Ces tokens sont qualifiés de valeurs mobilières (Effekten). Leur émission primaire tombe sous le coup de la Loi sur les services financiers (LSFin) et leur négoce secondaire sous la LIMF.

### 3.2 Les Droits-Valeurs Inscrits (Registerwertrechte)

La Loi DLT a introduit l'article 973d dans le Code des Obligations, créant une nouvelle catégorie de titres : les droits-valeurs inscrits.³

- **Mécanisme :** Contrairement aux titres intermédiés classiques qui nécessitent un dépositaire central, les droits-valeurs inscrits existent uniquement sur la blockchain. Le transfert du token équivaut juridiquement au transfert de la créance, sans exigence de cession écrite.

- **Convention d'inscription :** Pour émettre un Cat Bond sous cette forme, le VUSA doit établir une "convention d'inscription" (Registration Agreement) qui lie juridiquement le droit au token.

- **Intégrité du Registre :** La blockchain utilisée doit garantir l'intégrité, la publicité et la protection contre les modifications non autorisées. Les blockchains publiques comme Ethereum sont généralement acceptées, à condition que le smart contract soit audité et sécurisé.

### 3.3 Systèmes de Négociation DLT (DLT Trading Facility)

Si le projet prévoit non seulement l'émission mais aussi une plateforme de négoce secondaire pour permettre aux investisseurs de revendre leurs positions Cat Bond, il pourrait nécessiter une licence de **Système de négociation DLT** (Art. 73a LIMF).¹⁹

- **Innovation :** Cette licence permet à une entité d'offrir simultanément des services de négoce, de compensation et de règlement, et ce, directement aux investisseurs finaux (y compris les particuliers), sans passer par des intermédiaires bancaires.

- **Seuils et Exigences :** Si le volume de négoce ou le nombre de participants reste faible, le projet pourrait opérer sous une licence Fintech ou en tant que maison de titres. Cependant, la création d'un "DEX" (Decentralized Exchange) propriétaire géré par le VUSA tomberait presque certainement sous cette exigence de licence infrastructurelle, ce qui représente un coût de conformité élevé.

- **Stratégie Alternative :** Pour éviter cette lourdeur, le VUSA devrait se limiter au marché primaire et laisser le marché secondaire se développer sur des plateformes DLT tierces déjà régulées (comme SDX ou BX Digital) ou via des transferts OTC (Over-The-Counter) entre investisseurs qualifiés.

---

## 4. Analyse sous l'Angle de la Loi sur les Placements Collectifs (LPCC)



Une distinction fondamentale doit être opérée entre un produit structuré et un placement collectif de capitaux, car les régimes réglementaires diffèrent radicalement.

### 4.1 Produit Structuré vs Fonds de Placement

- **Produit Structuré :** Un Cat Bond standard, qui lie le remboursement à un événement unique ou à un index paramétrique, est généralement considéré comme un produit structuré (instrument de dette). Les produits structurés ne nécessitent pas d'autorisation de la FINMA au titre de la LPCC, bien qu'ils doivent respecter les règles de transparence de la LSFin.²¹

- **Placement Collectif (Fonds) :** Si le véhicule lève des fonds auprès de multiples investisseurs pour les investir selon une stratégie de diversification (par exemple, un "panier" de risques catastrophiques géré activement), il risque d'être requalifié en fonds de placement. Cela exigerait une direction de fonds, une banque dépositaire et une autorisation produit de la FINMA.²³

### 4.2 Le Piège des "Liquidity Pools" DeFi

Dans la DeFi, les "Liquidity Pools" (piscines de liquidité) où les utilisateurs déposent des actifs qui sont ensuite alloués automatiquement à différentes stratégies sont souvent assimilables à des placements collectifs du point de vue suisse.²⁵

- **Risque :** Si le projet Cat Bond permet aux utilisateurs de déposer de l'USDC dans un pool qui souscrit automatiquement à plusieurs risques de réassurance, la FINMA pourrait considérer cela comme une activité de fonds non autorisée.

- **Solution AMC (Actively Managed Certificate) :** Pour offrir une exposition diversifiée sans la lourdeur d'un fonds, la structure AMC est privilégiée en Suisse.26 Un AMC est un produit structuré (dette) dont la valeur dépend d'un portefeuille sous-jacent géré de manière discrétionnaire ou selon des règles fixes. Des plateformes comme GenTwo permettent de titriser des stratégies actives sous forme d'AMC dotés d'un ISIN suisse, contournant ainsi la complexité de la LPCC tant que la distribution est limitée aux investisseurs qualifiés.

### 4.3 Le Fonds L-QIF (Limited Qualified Investor Fund)

Depuis mars 2024, la Suisse offre le **L-QIF**, un fonds réservé aux investisseurs qualifiés qui est **exempté d'approbation et d'autorisation de la FINMA.**²⁸

- **Avantage :** Lancement beaucoup plus rapide (Time-to-market).

- **Condition :** Il doit être administré par une direction de fonds supervisée par la FINMA. Pour un projet DeFi d'envergure institutionnelle, le L-QIF représente une alternative crédible au VUSA si l'objectif est de gérer un portefeuille de risques plutôt qu'une émission unique.

---

## 5. Protection des Investisseurs et Documentation (LSFin)



La Loi sur les services financiers (LSFin) régit le point de vente et la documentation.

### 5.1 Obligation de Prospectus

L'offre publique de tokens Cat Bond déclenche en principe l'obligation de publier un prospectus approuvé par un organe de contrôle.¹⁷

- **Exemptions (Art. 36 LSFin) :** C'est ici que la structuration du projet est critique. L'obligation de prospectus tombe si :

    1. L'offre s'adresse uniquement à des **investisseurs professionnels** (banques, assurances, caisses de pension).

    2. L'offre s'adresse à moins de **500 investisseurs.**

    3. L'investissement minimum est de **100 000 CHF** par investisseur.

- **Recommandation :** Il est impératif de structurer le Cat Bond avec un ticket d'entrée minimum de 100 000 CHF (ou équivalent en crypto). Cela aligne le produit avec la cible institutionnelle typique des ILS et élimine la charge administrative et le risque de responsabilité liés au prospectus public.

### 5.2 Feuille d'Information de Base (FIB / KID)

Si le produit est accessible à des clients privés (retail), une FIB est obligatoire. Cependant, compte tenu de la complexité des Cat Bonds (risque de perte totale du capital), la distribution au grand public est fortement déconseillée et attirerait un examen minutieux de la FINMA sous l'angle de la protection des consommateurs.31

---

## 6. Conformité LBA (AML/KYC) et Défis Techniques



C'est dans le domaine de la lutte contre le blanchiment d'argent (LBA) que la friction entre la DeFi et la réglementation suisse est la plus forte.

### 6.1 Statut d'Intermédiaire Financier

Le VUSA, en acceptant des fonds d'investisseurs pour les détenir comme collatéral, agit à titre professionnel et qualifie d'**intermédiaire financier** au sens de l'art. 2 al. 3 LBA.³

- **Conséquence :** Le VUSA doit s'affilier à un Organisme d'Autorégulation (OAR) reconnu par la FINMA (comme VQF ou PolyReg) ou être directement surveillé par la FINMA.³³

### 6.2 Le Problème de l'Anonymat et les "Hosted Wallets"

La FINMA interdit les transferts anonymes de valeurs pour les intermédiaires supervisés. L'application de la "Travel Rule" (obligation de transmettre les informations sur l'ordonneur et le bénéficiaire lors des transferts) est stricte.³⁵

- **Impact DeFi :** Un protocole DeFi totalement ouvert (permissionless), où n'importe quelle adresse Ethereum peut acheter le token sur Uniswap, est incompatible avec la réglementation suisse pour des titres émis par une entité régulée.

- **Solution Technique (Whitelisting) :** Le smart contract du Cat Bond doit intégrer une fonction de "Whitelist" (liste blanche). Le transfert de tokens ne doit être techniquement possible que vers des adresses préalablement identifiées et vérifiées (KYC) par l'émetteur ou un tiers délégué. Des standards comme **ERC-3643** (T-REX) ou **ERC-1400** sont conçus spécifiquement pour intégrer ces contrôles de conformité directement dans le code du token.9

### 6.3 Responsabilité des Opérateurs d'Interface (Front-End)

La FINMA adopte une position de plus en plus ferme concernant les interfaces utilisateur (sites web, dApps) qui facilitent l'accès aux protocoles DeFi.

- **Guidance :** Si l'opérateur de l'interface exerce un contrôle effectif ou facilite le transfert de valeurs, il peut être considéré comme un négociant en valeurs mobilières ou une plateforme de trading non autorisée.4

- **Atténuation :** Le projet doit s'assurer que l'interface ne fait que "lire" la blockchain ou que l'entité opérant l'interface dispose des licences appropriées (ex: licence Fintech ou maison de titres) si elle gère des ordres.

---

## 7. Analyse Stratégique des "Gaps" DeFi et Opportunités d'Innovation



En réponse à la seconde partie de votre demande, voici une analyse prospective de l'écosystème DeFi actuel, identifiant des lacunes structurelles qui représentent des opportunités majeures pour un nouvel entrant, en particulier depuis une juridiction stable comme la Suisse.

### 7.1 Lacune n°1 : La "Zero-Knowledge Compliance" (Conformité à Divulgation Nulle)

- **Le Problème :** La tension actuelle entre la transparence totale de la blockchain (toutes les transactions sont visibles) et la nécessité de confidentialité des institutions financières (secret des affaires, protection des données). Les grandes banques ne peuvent pas utiliser la DeFi publique si leurs positions de trading sont exposées à leurs concurrents.

- **L'Opportunité :** Développer une couche d'infrastructure utilisant les preuves à divulgation nulle (zk-Proofs) pour permettre la conformité réglementaire (prouver qu'on est un investisseur qualifié, qu'on n'est pas sur une liste de sanctions) sans révéler l'identité ou le montant de la transaction sur la chaîne publique.

- **Application Suisse :** Créer un "Swiss Compliance Passport" on-chain, émis par des intermédiaires suisses régulés, permettant l'accès à des pools de liquidité DeFi institutionnels sans révéler les données sous-jacentes.

### 7.2 Lacune n°2 : Le Crédit Sous-Collatéralisé via Identité On-Chain

- **Le Problème :** La DeFi actuelle est inefficace en capital car elle repose presque exclusivement sur la sur-collatéralisation (déposer 150$ d'ETH pour emprunter 100$ d'USDC). Cela limite le marché aux traders et exclut l'économie réelle qui a besoin de crédit basé sur la confiance ou les flux de trésorerie futurs.

- **L'Opportunité :** Construire des protocoles de "Crédit Délégataire" où la réputation et l'identité juridique (ancrée en Suisse via la Loi DLT) remplacent le collatéral liquide.

- **Innovation :** Un Cat Bond où le collatéral n'est pas "bloqué" de manière improductive, mais investi dans des instruments de crédit on-chain à faible risque (ex: financement de factures tokenisées), augmentant le rendement pour les investisseurs sans augmenter le risque de contrepartie de manière excessive.

### 7.3 Lacune n°3 : Assurance Paramétrique de "Seconde Génération" (Beyond Weather)

- **Le Problème :** Les oracles actuels sont fiables pour des données simples (météo, prix des actifs). Ils sont incapables de gérer des sinistres complexes (ex: interruption d'activité, cyber-attaque, risque pandémique) qui nécessitent une évaluation subjective ou des données privées.

- **L'Opportunité :** Créer des "Oracles Optimistes" ou des tribunaux décentralisés spécialisés, validés par des experts juridiques/assurances suisses.

- **Innovation :** Un Cat Bond couvrant le **risque Cyber** pour les protocoles DeFi eux-mêmes (Smart Contract Risk), où le déclencheur n'est pas une donnée météo, mais un audit forensique on-chain validé par un comité d'experts (DAO d'experts) dont la décision est juridiquement contraignante via la convention d'inscription suisse.

### 7.4 Lacune n°4 : Synchronisation Haute-Fidélité des RWA (Real World Assets)

- **Le Problème :** La plupart des projets RWA (immobilier, or, actions) ont un problème de "double dépense" juridique ou de désynchronisation entre l'état de la blockchain et l'état juridique réel de l'actif hors chaîne.

- **L'Opportunité :** Utiliser le cadre des droits-valeurs inscrits (Art. 973d CO) pour créer des actifs où la blockchain est le seul et unique registre de vérité juridique, supprimant la nécessité de réconciliation.

- **Sujet de travail :** Développer des standards pour la gestion automatisée des "Corporate Actions" (dividendes, votes, restructurations) directement via smart contracts pour des actions de PME suisses, rendant le capital-investissement liquide et composable dans la DeFi.

### 7.5 Lacune n°5 : Marchés de Méta-Gouvernance et Dérivés de Vote

- **Le Problème :** La gouvernance des DAOs est primitive (1 token = 1 vote), conduisant à l'apathie des électeurs et à la capture par des baleines. De plus, la valeur du "droit de vote" est souvent mal valorisée par rapport à la valeur financière du token.

- **L'Opportunité :** Créer des marchés liquides pour l'emprunt de "pouvoir de vote" (bribe markets institutionalisés et transparents) ou des produits dérivés séparant le rendement financier du droit de vote.

- **Innovation :** Un protocole de "Staking de Gouvernance" où les investisseurs passifs délèguent leur vote à des "Délégués Professionnels" (qui pourraient être des cabinets d'avocats ou des ONG suisses) en échange d'un rendement, professionnalisant ainsi la gestion des protocoles décentralisés.

---

## 8. Synthèse et Feuille de Route pour le Projet



Le lancement d'un DeFi Cat Bond en Suisse est un projet ambitieux mais réalisable, bénéficiant d'un alignement rare entre la volonté politique, le cadre légal et l'innovation technologique.

### Tableau Récapitulatif des Exigences Réglementaires

| **Domaine**      | **Exigence Principale**               | **Solution Stratégique pour le Projet**                                          |
|------------------|---------------------------------------|----------------------------------------------------------------------------------|
| **Structure**    | VUSA (ISPV) selon Art. 30e LSA        | Création d'une SA dédiée, demande de licence VUSA.                               |
| **Capital**      | "Fully Funded" (Financement intégral) | Collatéralisation 1:1 via smart contract + audit de solvabilité (SST simplifié). |
| **Token**        | Droit-valeur inscrit (Art. 973d CO)   | Convention d'inscription liant le token à la créance juridique.                  |
| **Distribution** | Prospectus LSFin                      | **Exemption :** Ticket min. 100k CHF ou Investisseurs Pro uniquement.            |
| **AML/LBA**      | Identification des ayants droit       | Affiliation OAR (VQF/PolyReg) + Tokens avec Whitelist (Permissioned DeFi).       |
| **Négoce**       | Licence Trading Facility (LIMF)       | Éviter le marché secondaire propre. Lister sur SDX/BX ou transfert OTC.          |


### Recommandations Finales

- **Prioriser le VUSA :** Ne tentez pas de structurer cela comme un fonds (CISA) ou une assurance classique. Le régime VUSA est fait sur mesure pour ce cas d'usage.

- **Cibler les Pros :** L'exemption de prospectus et les allègements LSA pour "preneurs d'assurance professionnels" sont les clés de la rentabilité opérationnelle. Évitez le retail.

- **Hybridation "CeDeFi" :** Acceptez que la conformité suisse impose une centralisation partielle (KYC, Whitelist). C'est le prix à payer pour la sécurité juridique et la confiance institutionnelle.

- **Explorer les Niches :** Parallèlement au Cat Bond, explorez les lacunes identifiées (Zero-Knowledge Compliance, Cyber-Insurance paramétrique) pour différencier votre offre technologique.

La Suisse offre le cadre le plus sûr au monde pour ce type d'innovation, à condition de respecter scrupuleusement la règle d'or : l'innovation technologique ne justifie jamais un déficit de conformité.

---

## Sources des citations

1. FINMA publishes ICO guidelines, consulté le décembre 19, 2025,
https://www.finma.ch/en/news/2018/02/20180216-mm-ico-wegleitung/

2. FINMA publishes 'stable coin' guidelines, consulté le décembre 19, 2025, 
https://www.finma.ch/en/news/2019/09/20190911-mm-stable-coins/

3. Switzerland: Blockchain & Crypto Assets - Legal 500 Country Comparative Guides 2025, consulté le décembre 19, 2025, 
https://www.legal500.com/guides/chapter/switzerland-blockchain-crypto-assets/?export-pdf

4. Decentralized Finance (DeFi) 2022 - FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/documentation/dossier/dossier-fintech/decentralized-finance-defi-2022/

5. Developments in FinTech - FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/documentation/dossier/dossier-fintech/entwicklungen-im-bereich-fintech/

6. Insurance & Reinsurance 2025 - Switzerland - Chambers Global Practice Guides, consulté le décembre 19, 2025, 
https://practiceguides.chambers.com/practice-guides/insurance-reinsurance-2025/switzerland/trends-and-developments

7. The Revised Swiss Insurance Supervision Act - Pontinova Law, consulté le décembre 19, 2025, 
https://www.pontinova.law/blog-posts/revised-swiss-insurance-supervision-act

8. Swiss Insurance Supervision Act establishes new Regime for Special Purpose Vehicle, consulté le décembre 19, 2025, 
https://caplaw.ch/2024/swiss-insurance-supervision-act-establishes-new-regime-for-special-purpose-vehicle/

9. PANORAMIC INSURANCE & REINSURANCE - Lenz & Staehelin, consulté le décembre 19, 2025, 
https://www.lenzstaehelin.com/fileadmin/user_upload/Switzerland__-_Insurance___Reinsurance_2025.pdf

10. Investment activities of insurance companies – general framework | FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/supervision/insurers/cross-sectoral-tools/investment-activities-from-1-january-2024-onwards/

11. DLT / blockchain / tokenisation, consulté le décembre 19, 2025, 
https://www.sif.admin.ch/en/dlt-blockchain-en

12. How to Open an SPV in Switzerland in 2025 - Swiss Law Firm, consulté le décembre 19, 2025, 
https://goldblum.ch/knowledgebase/open-a-spv-company-in-switzerland

13. Insurance Supervision Law - Walder Wyss, consulté le décembre 19, 2025, 
https://www.walderwyss.com/assets/content/publications/361.pdf

14. Switzerland: Insurance & Reinsurance - Legal 500 Country Comparative Guides 2025, consulté le décembre 19, 2025, 
https://www.legal500.com/guides/chapter/switzerland-insurance-reinsurance/?export-pdf

15. Business with professional policyholders – regulations from 1 January 2024 | FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/supervision/insurers/professionelle-versicherungsnehmer/

16. Small insurers regime | FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/supervision/insurers/small-insurers-regime-and-relief-for-insurers/

17. Security token offering a snapshot in Switzerland - EY, consulté le décembre 19, 2025, 
https://www.ey.com/en_ch/insights/financial-services/security-token-offering-a-snapshot-in-switzerland

18. Guidelines - IOSCO, consulté le décembre 19, 2025, 
https://www.iosco.org/library/ico-statements/Switzerland%20-%20FINMA%20-%20ICO%20Guidelines.pdf

19. BX DIGITAL: THE FIRST DLT TRADING FACILITY IN SWITZERLAND | CapLaw, consulté le décembre 19, 2025, 
https://caplaw.ch/2025/bx-digital-the-first-dlt-trading-facility-in-switzerland/

20. Development of digitalisation in the financial sector (2024) - FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/documentation/dossier/dossier-fintech/entwicklung-der-digitalisierung-im-finanzbereich---2024/

21. AMCs (actively managed certificates): Tips & Info - Everon AG, consulté le décembre 19, 2025, 
https://everon.swiss/en/amcs-actively-managed-certificates/

22. Regulatory challenges in the use of Actively Managed Certificates (AMCs) - VSV-ASG, consulté le décembre 19, 2025, 
https://www.vsv-asg.ch/en/0324-grantthornton

23. Reporting on collective investment schemes - FINMA, consulté le décembre 19, 2025, 
https://www.finma.ch/en/supervision/asset-management/data-collection/reporting-on-collective-investment-schemes/

24. SR 951.31 - Federal Act of 23 June 2006 on Collective Investment ..., consulté le décembre 19, 2025, 
https://www.fedlex.admin.ch/eli/cc/2006/822/en

25. Private Law Aspects of Liquidity Pools in Decentralized Finance (DeFi) | sui generis, consulté le décembre 19, 2025, 
https://sui-generis.ch/article/download/8902/7353/20192

26. What Is an Actively Managed Certificate (AMC)? - GenTwo, consulté le décembre 19, 2025, 
https://www.gentwo.com/articles/what-is-an-actively-managed-certificate-amc/

27. GenTwo Pro | Swiss Platform for AMCs, CLNs & Trackers, consulté le décembre 19, 2025, 
https://www.gentwo.com/GenTwo-PRO/

28. Limited Qualified Investor Funds: new fund category exempt from FINMA authorisation and supervision, consulté le décembre 19, 2025, 
https://www.finma.ch/en/news/2024/02/23240223-meldung-l-qif/

29. L-QIF: New Innovative Swiss Fund Structure – Final Rules Published - Lenz & Staehelin, consulté le décembre 19, 2025, 
https://www.lenzstaehelin.com/news-and-insights/browse-thought-leadership-insights/insights-detail/l-qif-new-innovative-swiss-fund-structure-final-rules-published/

30. ICO/token sale - Multilaw, consulté le décembre 19, 2025, 
https://multilaw.com/Multilaw/ZENTSO/BusinessGuides/Presentation/Section_Home.aspx?GuideId=2&GuideCountry=Switzerland&GuideSection=710

31. Implementing Reform of Swiss Insurance Supervision Laws - Schellenberg Wittmer, consulté le décembre 19, 2025, 
https://www.swlegal.com/media/filer_public/92/ec/92ec39b8-dbe9-490a-b8f3-96633fe588ad/sw_nl_september_01_2023_english.pdf

32. Frequently asked questions - PolyReg, consulté le décembre 19, 2025, 
https://www.polyreg.ch/en/membership/frequently-asked-questions

33. Obtain A Cryptocurrency Licence In Switzerland: FINMA & SRO Pathways, consulté le décembre 19, 2025, 
https://globallawexperts.com/obtain-a-cryptocurrency-licence-in-switzerland-finma-sro-pathways/

34. VQF SRO in Switzerland: membership & fees | Goldblum & Partners - Swiss Law Firm, consulté le décembre 19, 2025,
https://goldblum.ch/knowledgebase/vqf-sro-switzerland

35. What You Need to Know About Switzerland's Crypto AML Rules by FINMA - Shufti Pro, consulté le décembre 19, 2025, 
https://shuftipro.com/blog/what-you-need-to-know-about-switzerlands-crypto-aml-rules-by-finma/

36. Is Crypto Legal in Switzerland? Regulations & Compliance in 2025 - Lightspark, consulté le décembre 19, 2025, 
https://www.lightspark.com/knowledge/is-crypto-legal-in-switzerland

37. Legal Liability of Front-End Operators in Decentralized Projects: A Definitive Guide, consulté le décembre 19, 2025, 
https://legalnodes.com/article/front-end-operator-legal-liability
