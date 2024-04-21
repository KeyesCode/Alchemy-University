const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp256k1.utils.randomPrivateKey();

console.log("Private Key:", toHex(privateKey));

const publicKey = secp256k1.getPublicKey(privateKey);

console.log("Public Key:", toHex(publicKey));

// 62d7fc0fdd1dd1d6f58c4b5ac37dd226c58e228451abf0e8c5ee6c590384bc50

// 0282a086f02f6b93c3c544a4113641931525263226b840b64fe46cd66a2fcf6e89
