const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
  "0282a086f02f6b93c3c544a4113641931525263226b840b64fe46cd66a2fcf6e89": 10, //Private 62d7fc0fdd1dd1d6f58c4b5ac37dd226c58e228451abf0e8c5ee6c590384bc50
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { signature, amount, recipient, address } = req.body;

  try {
    console.log("signature", signature);
    console.log("recipient", recipient);
    console.log("amount", amount);
    console.log("address", address);

    const message = `Transfer ${amount} to ${recipient}`;
    const messageHash = keccak256(Buffer.from(message));
    console.log("messageHash", messageHash);

    // Extract r, s, and v components from the signature
    const r = signature.slice(0, 64);
    const s = signature.slice(64, 128);
    const v = signature.slice(128, 130); // assuming `v` is the remaining part

    // Convert hex to number for recovery
    const recovery = parseInt(v, 16);

    // Recreate the signature object
    const signatureObject = {
      r: BigInt("0x" + r),
      s: BigInt("0x" + s),
      recovery: recovery,
    };

    console.log("signatureObject", signatureObject);

    /* Not needed was going way to overboard when the ethereum-cryptography had the verify and sign functions
    // console.log("r:", r);
    // console.log("s:", s);
    // console.log("v:", v);

    // // Convert hex values to buffers
    // const rBuffer = Buffer.from(r, "hex");
    // const sBuffer = Buffer.from(s, "hex");
    // const vBuffer = parseInt(v, 16); // Convert v to an integer

    // console.log("rBuffer:", rBuffer);
    // console.log("sBuffer:", sBuffer);
    // console.log("vBuffer:", vBuffer);

    // Convert public key from hex to buffer if necessary
    // const publicKey = keccak256(Buffer.from(address, "hex"));
    // console.log("publicKey", publicKey);

    // const signatureUint8Array = keccak256(
    //   Buffer.concat([rBuffer, sBuffer, Buffer.from([vBuffer])])
    // );
    // console.log("signature array", signatureUint8Array);
    */

    // Verify the signature
    const isValidSignature = secp256k1.verify(
      signatureObject,
      messageHash,
      address
    );

    console.log("isValidSignature", isValidSignature);

    if (!isValidSignature) {
      return res.status(401).send({ message: "Invalid signature" });
    }

    setInitialBalance(address);
    setInitialBalance(recipient);

    if (balances[address] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    }

    balances[address] -= amount;
    balances[recipient] += amount;

    res.send({ balance: balances[address] });
  } catch (err) {
    res.status(500).send({ message: "Error processing transaction" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
