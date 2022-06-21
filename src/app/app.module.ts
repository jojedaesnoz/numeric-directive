import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { NumericDirective } from './directives/numeric.directive';
import { NumOnlyDirective } from './directives/num-only.directive';
import { NumberFormatDirective } from './directives/number-format.directive';

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  declarations: [
    AppComponent,
    HelloComponent,
    NumericDirective,
    NumOnlyDirective,
    NumberFormatDirective,
  ],
  bootstrap: [AppComponent],
  exports: [NumericDirective, NumOnlyDirective, NumberFormatDirective],
})
export class AppModule {}
