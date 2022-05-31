import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import * as Mnemonic from "bitcore-mnemonic";
import * as CryptoJS from "crypto-js";
import { hdkey } from "ethereumjs-wallet";
import * as bip39 from "bip39";
import * as util from "ethereumjs-util";
import Web3 from 'web3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

    loginForm: any;
    sendForm: any;
    encrypted: any;

  wallet:any = {
    address: '',
    privateKey: '',
  }

  web3: any;

  window: any;

  mining = false;

  lastTransaction: any;

  constructor(@Inject(DOCUMENT) private document: Document, private formBuilder: FormBuilder) {
    this.window = document.defaultView;

    this.loginForm = this.formBuilder.group({
      seeds: '',
      password: ''
    });

    this.sendForm = this.formBuilder.group({
      to: '',
      amount: ''
    });

    this.encrypted = window.localStorage.getItem('seeds');

    this.initWallet('february current defy one inform wet hurry cupboard type enable spare famous'); // trampa

    this.web3 = new Web3;
    this.web3.setProvider(
      new this.web3.providers.HttpProvider('https://ropsten.infura.io/v3/d09825f256ae4705a74fdee006040903')
    );
  }

  // february current defy one inform wet hurry cupboard type enable spare famous
  async initWallet(seeds: string) {
    var mnemonic = new Mnemonic(seeds);
    var seed = await bip39.mnemonicToSeed(mnemonic.toString());
    var path = "m/44'/60'/0'/0/0";

    var wallet = hdkey
      .fromMasterSeed(seed)
      .derivePath(path)
      .getWallet();

    var privateKey = wallet.getPrivateKey();
    var publicKey = util.privateToPublic(privateKey);
    var address = "0x" + util.pubToAddress(publicKey).toString("hex");

    this.wallet.privateKey = privateKey;

    this.getBalance(address);
  }

  async getBalance(address:string) {
    this.wallet.address = address;
    this.wallet.balance = await this.web3.eth.getBalance(address).then((result:any) => {
      return this.web3.utils.fromWei(result, 'ether');
    });
  }

  sendLogin(loginData:any) {
    if (loginData.password == '') {
      return alert('Introduce tu contraseña');
    }

    if (this.encrypted) {
      var decrypt = CryptoJS.AES.decrypt(this.encrypted, loginData.password);
      loginData.seeds = decrypt.toString(CryptoJS.enc.Utf8);
    }

    if (!Mnemonic.isValid(loginData.seeds)) {
      return alert('Semilla inválida');
    }

    var encrypted = CryptoJS.AES.encrypt(loginData.seeds, loginData.password).toString();

    window.localStorage.setItem('seeds', encrypted);

    this.loginForm.reset();

    this.initWallet(loginData.seed);
  }

  loginWithMetamask() {
    if (!this.window.ethereum) {
      return alert('Metamask no está instalado');
    }

    this.window.ethereum.enable().then((accounts:any) => {
      let address = accounts[0];
      this.getBalance(address);
    });
  }

  removeSeeds() {
    window.localStorage.removeItem('seeds');
    this.encrypted = '';
    this.wallet = {
      address: '',
      balance: ''
    };
  }

  async sendEther(sendData:any) {
    if (sendData.to == '' || sendData.amount == null) {
      return alert('Campos son obligatorios');
    }

    if ( ! util.isValidAddress(sendData.to)) {
      return alert('Dirección inválida');
    }

    this.mining = true;

    var rawData = {
      from: this.wallet.address,
      to: sendData.to,
      value: sendData.amount,
      gasPrice: this.web3.utils.toHex(10000000000),
      gasLimit: this.web3.utils.toHex(1000000),
      nonce: await this.web3.eth.getTransactionCount(this.wallet.address)
    };

    var signed = await this.web3.eth.accounts.signTransaction(rawData, this.wallet.privateKey.toString('hex'));

    this.web3.eth.sendSignedTransaction(signed.rawTransaction).then((receipt:any) => {
      this.mining = false;
      this.lastTransaction = receipt;

      this.sendForm.reset();
    });
  }

}
