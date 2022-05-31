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
    encrypted: any;

    constructor(private formBuilder: FormBuilder) {
        this.loginForm = this.formBuilder.group({
            seeds: '',
            password: ''
        });

        this.encrypted = localStorage.getItem('seeds');
    }

    sendLogin (loginData: any) {
        let { seeds, password } = loginData;

        if(this.encrypted){
            if(!password)
                return alert('Please, enter your credentials');
            const decrypted = CryptoJS.AES.decrypt(this.encrypted, password).toString(CryptoJS.enc.Utf8);
            seeds = decrypted;
            this.loginForm.reset();
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
}
