import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ privateKey, setBalance, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = `Transfer ${sendAmount} to ${recipient}`;
    const messageHash = keccak256(Buffer.from(message));

    console.log("messageHash:", messageHash);

    console.log("private key", privateKey);

    const signature = secp256k1.sign(
      messageHash,
      Buffer.from(privateKey, "hex")
    );

    // Serialize r, s, and recovery into a hex string
    const rHex = signature.r.toString(16).padStart(64, "0"); // Ensure 32 bytes
    console.log("r", rHex);
    const sHex = signature.s.toString(16).padStart(64, "0"); // Ensure 32 bytes
    console.log("s", sHex);
    const recoveryHex = signature.recovery.toString(16).padStart(2, "0"); // Ensure 1 byte
    console.log("recovery", recoveryHex);

    const signatureHex = `${rHex}${sHex}${recoveryHex}`;

    console.log("signatureHex:", signatureHex);
    console.log("signature", signature);

    try {
      const response = await server.post(`send`, {
        signature: signatureHex,
        amount: parseInt(sendAmount),
        recipient,
        address,
      });
      if (response.data) {
        setBalance(response.data.balance);
      } else {
        alert("No data received from the server");
      }
    } catch (ex) {
      console.error("Error during the transfer:", ex);
      alert(
        ex.response
          ? ex.response.data.message
          : ex.message || "An error occurred during the transfer."
      );
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
