import { registerLocaleData } from '@angular/common';
import { Component, OnInit, VERSION } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import localeEsExtra from '@angular/common/locales/extra/es';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

registerLocaleData(localeEs, 'es-ES', localeEsExtra);

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular ' + VERSION.major;
  form: FormGroup;
  clasico = new FormControl(1.00009);
  negativo = new FormControl(0);
  entero = new FormControl(0);

  constructor(public fb: FormBuilder) {}

  ngOnInit() {}
}
