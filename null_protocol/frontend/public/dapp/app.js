// Petit script d'exemple pour se connecter au wallet et appeler un contrat
const connectBtn = document.getElementById('connectBtn');
const accountP = document.getElementById('account');
const networkP = document.getElementById('network');
const output = document.getElementById('output');


let provider, signer;


async function connectWallet(){
if(!window.ethereum){
output.innerText = 'No injected wallet found (MetaMask).';
return;
}


provider = new ethers.BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
signer = await provider.getSigner();
const addr = await signer.getAddress();
accountP.innerText = 'Compte : ' + addr;


const network = await provider.getNetwork();
networkP.innerText = 'Réseau : ' + network.name + ' ('+network.chainId+')';


output.innerText = 'Wallet connecté.';
}


connectBtn.addEventListener('click', connectWallet);


// Fonction d'exemple pour lire / écrire sur le contrat
async function readContract(){
try{
// TODO: remplacer par ton adresse et ABI
const CONTRACT_ADDRESS = '0x...';
const ABI = [ /* ... */ ];
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
// exemple: if contract has `getValue()`
const val = await contract.getValue();
output.innerText = 'Valeur: ' + val;
}catch(e){ output.innerText = 'Erreur: ' + e.message }
}


async function writeContract(){
try{
const CONTRACT_ADDRESS = '0x...';
const ABI = [ /* ... */ ];
const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
// exemple: if contract has `increment()`
const tx = await contractWithSigner.increment();
output.innerText = 'Tx envoyée: ' + tx.hash;
await tx.wait();
output.innerText += '\nTx minée';
}catch(e){ output.innerText = 'Erreur: ' + e.message }
}


document.getElementById('readBtn').addEventListener('click', readContract);
document.getElementById('writeBtn').addEventListener('click', writeContract);
