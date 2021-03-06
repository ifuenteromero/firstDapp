import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as Mnemonic from "bitcore-mnemonic";
import * as CryptoJS from "crypto-js";
import * as bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import * as util from "ethereumjs-util";
import Web3 from 'web3';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

// seeds ex

export class AppComponent {
    loginForm: any;
    encrypted: any;
    wallet: any = {
        address: ''
    }

    web3: any;
    
    defaultSeeds : string = 'february current defy one inform wet hurry cupboard type enable spare famous'
    constructor(private formBuilder: FormBuilder) {
        this.loginForm = this.formBuilder.group({
            seeds: '',
            password: ''
        });

        this.encrypted = localStorage.getItem('seeds');
        this.initializeWallet(this.defaultSeeds);
        this.web3 = new Web3;
        this.web3.setProvider(
          new this.web3.providers.HttpProvider('https://ropsten.infura.io/v3/d09825f256ae4705a74fdee006040903')
        );
    }

    sendLogin (loginData: any) {
        let { seeds, password } = loginData;

        if(this.encrypted){
            if(!password)
                return alert('Please, enter your credentials');
            const decrypted = CryptoJS.AES.decrypt(this.encrypted, password).toString(CryptoJS.enc.Utf8);
            seeds = decrypted;
            this.loginForm.reset();
            this.initializeWallet(seeds);
        } else {
            if(!password || !seeds)
                return alert('Please, enter your credentials');

            const validSeeds = Mnemonic.isValid(seeds);
            if(!validSeeds)
                    return alert('Invalid seeds');
            const encryptedSeeds = CryptoJS.AES.encrypt(seeds, password).toString();
            localStorage.setItem('seeds', encryptedSeeds);
        }
    }

    async initializeWallet(seeds: string){
        const mnemonic = new Mnemonic(seeds);
        const seed = await bip39.mnemonicToSeed(mnemonic.toString());
        const path = "m/44'/60'/0'/0/0";

        const wallet = hdkey
            .fromMasterSeed(seed)
            .derivePath(path)
            .getWallet();

        const privateKey = wallet.getPrivateKey();
        const publicKey = util.privateToPublic(privateKey);
        const address = "0x" + util.pubToAddress(publicKey).toString("hex");
        this.wallet.address = address;
    }
}
