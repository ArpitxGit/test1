import { ZusK } from './ZusK.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

await isReady;

console.log('SnarkyJS loaded');

const useProof = true;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

const salt = Field.random();

// ----------------------------------------------------

// create a destination we will deploy the smart contract to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const zkAppInstance = new ZusK(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.initState(salt);
});
await deployTxn.prove();
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// ----------------------------------------------------

const age = Field(20); // User's age

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.verifyAge(salt, age);
});
await txn1.prove();
await txn1.sign([senderKey]).send();

const result = zkAppInstance.result.get();
console.log('Verification result:', result);

// ----------------------------------------------------

console.log('Shutting down');

await shutdown();
