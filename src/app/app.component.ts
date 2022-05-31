import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as Mnemonic from "bitcore-mnemonic";
import * as CryptoJS from "crypto-js";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

// seeds ex
// february current defy one inform wet hurry cupboard type enable spare famous

export class AppComponent {
    loginForm: any;

    constructor(private formBuilder: FormBuilder) {
        this.loginForm = this.formBuilder.group({
            seeds: '',
            password: ''
        });
    }

    sendLogin (loginData: any) {
        const { seeds, password } = loginData;
        if(!seeds || !password)
            return alert('Please, enter your credentials');

        const validSeeds = Mnemonic.isValid(seeds);
        if(!validSeeds)
            return alert('Invalid seeds');

        const encryptedSeeds = CryptoJS.AES.encrypt(seeds, password).toString();
        localStorage.setItem('seeds', encryptedSeeds);
    }
}
