// === Paramètres ===
base_protocol_fee      // frais de base fixé avant le début du battle
protocol_fee           // frais évoluant dans le temps (protocol_fee à temps 0 = base_protocol_fee)
fee_change_factor      // facteur d’évolution des frais en fonction du temps
time                   // temps écoulé depuis le début du battle
time_limit             // limite de temps pour plafonner les frais
stake                  // somme misée par l’utilisateur
outcomes_liquidity     // tableau des liquidités {rapper#1, rapper#2, ...}
MCs_fee                // frais pour rémunération des MCs

// === Calcul des frais du protocole ===
function protocol_fee(fee_change_factor, time, base_protocol_fee, time_limit) {
    if (time < time_limit)
        return base_protocol_fee + fee_change_factor * time;
    else
        return base_protocol_fee + fee_change_factor * time_limit;
}

// === Frais prélevés par le protocole ===
function protocol_amount(protocol_fee, stake) {
    return stake * protocol_fee;
}

// === Frais pour les MCs ===
function MCs_amount(MCs_fee, stake) {
    return stake * MCs_fee;
}

// === Mise après prélèvement des frais ===
function stake_after_fee(MCs_fee, protocol_fee, stake) {
    return stake * (1 - MCs_fee - protocol_fee);
}

// === Liquidité totale pour un battle ===
function total_liquidity(outcomes_liquidity) {
    let total = 0;
    for (let i = 0; i < outcomes_liquidity.length; i++) {
        total += outcomes_liquidity[i];
    }
    return total;
}
