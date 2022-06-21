import {
  Directive,
  Input,
  HostListener,
  Optional,
  ElementRef,
  Renderer2,
  AfterViewInit,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { formatNumber } from '@angular/common';
import { NgControl } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Directive({
  selector: '[appNumeric]',
})
export class NumericDirective {
  @Output() onCambio: EventEmitter<any> = new EventEmitter();
  destroy$: Subject<void> = new Subject<void>();
  valueChange$: BehaviorSubject<number> = new BehaviorSubject(null);
  private readonly separator = ',';
  private readonly numOnlyRegex = new RegExp(
    '[0-9.' + this.separator + ']',
    'g'
  );
  private readonly actionKeys = ['a', 'c', 'v', 'x', 'z'];
  private readonly navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste',
    '-'
  ];
  private readonly functionKeys = [
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F1F0',
    'F1F1',
    'F12',
  ];

  @Input('decimals') decimals = 2;
  @Input('locale') locale = 'es-ES';
  @Input('value')
  set value(value: number) {
    this.element.value = this.format(value);
  }

  get separatorPos() {
    return this.element.value.indexOf(this.separator);
  }

  get selectionStart() {
    return this.element.selectionStart;
  }
  cssClasses = ['number-input'];

  readonly element: HTMLInputElement;
  model: NgControl;

  constructor(
    public elementRef: ElementRef,
    @Optional() model: NgControl,
    public renderer: Renderer2
  ) {
    this.model = model;
    this.element = elementRef.nativeElement;
  }

  ngOnInit() {
    this.addCssClasses();
    if (this.model) {
      this.update(this.element.value);
      this.model.valueChanges.subscribe((value) => {
        this.updateAndEmit();
      });
    }
  }

  ngAfterViewInit() {
    if (this.element.tagName === 'MAT-CELL') {
      this.update(this.element.innerText);
    } else {
      this.update(this.element.value);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('blur')
  onChange() {
    this.updateAndEmit();
  }

  addCssClasses() {
    for (let cssClass of this.cssClasses) {
      this.renderer.addClass(this.element, cssClass);
    }
  }

  defaultNegativeValue = '-' + this.separator + '0'.repeat(this.decimals);
  defaultExpandedNegativeValue = '-0' + this.separator + '0'.repeat(this.decimals);

  update(value?: any): number {
    console.log('update',value);
    if (value === this.defaultNegativeValue || value === this.defaultExpandedNegativeValue) {
      console.log("DAMN");
      return 0;
    }
    let parsedValue = this.parse(value);
    let formattedValue = this.format(parsedValue);
    if (this.element.tagName === 'MAT-CELL') {
      this.element.innerText = formattedValue;
    } else if (this.model) {
      this.model.control.setValue(parsedValue, { emitEvent: false });
      this.model.valueAccessor.writeValue(formattedValue);
    } else {
      this.element.value = formattedValue;
    }
    return parsedValue;
  }

  updateAndEmit(): void {
    if (this.element !== document.activeElement) {
      let value = this.update(this.element.value);
      this.onCambio.emit(value);
    }
  }

  // CHILD
 

  @HostListener('input', ['$event'])
  onInput(event: KeyboardEvent) {
    if (!this.element.value) {
      this.element.value = this.format(0);
      this.setPosition(0);
      return;
    }
    let caretPosition = this.selectionStart;
    const insideDecimalPart =
      this.separatorPos != -1 && this.separatorPos < caretPosition;
    const beginsWithSeparatorBefore = this.beginsWithSeparator();
    if (insideDecimalPart) {
      let before = this.element.value.substring(0, this.separatorPos + 1);
      let after = this.element.value
        .substring(this.separatorPos + 1)
        .substring(0, this.decimals);
      this.element.value = before + after;
    }
    const prevLength = this.element.value.length;
    this.update(this.element.value);
    if (insideDecimalPart) {
      const beginsWithSeparatorNow = this.beginsWithSeparator();
      if (beginsWithSeparatorBefore && !beginsWithSeparatorNow) {
        caretPosition++;
      } else if (!beginsWithSeparatorBefore && beginsWithSeparatorNow) {
        caretPosition--;
      }
    } else if (prevLength > 1) {
      caretPosition += this.element.value.length - prevLength;
    }
    this.setPosition(caretPosition);
  }

  private beginsWithSeparator() {
    return this.isSeparatorKey(this.charAt(0));
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    console.log(event.key);
    if (!this.isAllowedInput(event)) {
      event.preventDefault();
    }
    if (this.isSeparatorKey(event.key) && this.decimals > 0) {
      this.insertSeparator();
      this.updateAndEmit();
      event.preventDefault();
      return;
    }
    if (this.selectionStart == this.element.selectionEnd) {
      if (this.isBackspace(event)) {
        if (this.isShiftNeeded(-1)) {
          this.shiftPosition(-1);
        }
        this.setPosition(this.selectionStart);
      } else if (this.isDelete(event)) {
        if (this.isShiftNeeded(0)) {
          this.shiftPosition(1);
        }
        this.setPosition(this.selectionStart);
      }
    }
  }

  private isDelete(event: KeyboardEvent) {
    return event.key == 'Delete';
  }

  private isBackspace(event: KeyboardEvent) {
    return event.key == 'Backspace' && this.selectionStart > 1;
  }

  format(value: number) {
    console.log("format",value + 5);
    if (value != null) {
      let formatted = formatNumber(
        value,
        this.locale,
        '1.' + this.decimals + '-' + this.decimals
      );
      if (formatted[0] == '-') {
      }
      if (value == 0) {
        formatted = formatted.substring(1); // quitar el cero, ejemplo: '0,00' -> ',00'
      }
      return formatted;
    } else {
      return null;
    }
  }

  parse(value: string) {
    console.log("parse",value);
    if (value === null || value === undefined) {
      return null;
    }
    value = this.removeBlanks(value);
    if (value.slice(0, 1) == this.separator) {
      value = '0' + value;
    } else if (value.slice(0, 1) == '-') {
      value = '-0' + value.slice(1);
    }
    if (!value.match(this.numOnlyRegex)) {
      return null;
    }
    let numberValue = Number(value);
    if (isNaN(numberValue)) {
      numberValue = Number(this.cleanInput(value));
      if (isNaN(numberValue)) {
        return null;
      }
    }
    return this.roundToDecimals(numberValue, this.decimals);
  }

  insertSeparator() {
    const currentText = this.element.value;
    const endPos = currentText.length;

    let beforeInput: string = currentText.substring(0, this.selectionStart);
    let afterInput: string;
    if (this.separatorPos == -1) {
      afterInput = currentText.substring(this.selectionStart, endPos);
      this.element.value = beforeInput + this.separator + afterInput;
    } else if (this.separatorPos < this.selectionStart) {
      afterInput = currentText.substring(this.separatorPos, endPos);
    } else {
      afterInput = currentText.substring(this.separatorPos + 1, endPos);
      this.element.value = beforeInput + this.separator + afterInput;
    }
    this.update(this.element.value);
    this.setPosition(this.separatorPos + 1);
  }

  insertAtCaretPosition(text: string) {
    const endPos = this.element.value.length;
    let beforeInput = this.element.value.substring(0, this.selectionStart);
    let afterInput = this.element.value.substring(this.selectionStart, endPos);
    let finalText = beforeInput + text + afterInput;
    const separatorPos = finalText.indexOf(this.separator);
    if (separatorPos != -1) {
      finalText =
        finalText.substring(0, separatorPos) +
        finalText.substring(separatorPos, separatorPos + this.decimals + 1);
    }
    this.element.value = finalText;
    this.setPosition(this.selectionStart + 1);
  }

  truncateToDecimals(num, dec = 2): number {
    const calcDec = Math.pow(10, dec);
    return Math.trunc(num * calcDec) / calcDec;
  }

  roundToDecimals(
    num: number,
    dec: number = 2,
    truncate: boolean = false
  ): number {
    const calcDec = Math.pow(10, dec);
    if (truncate) {
      return Math.trunc(num * calcDec) / calcDec;
    } else {
      return Math.round(num * calcDec) / calcDec;
    }
  }

  private setPosition(start: number, end?: number): void {
    start = Math.max(0, start);
    end = end ?? start; // si no se le pasa un valor a end, end = start
    end = Math.min(end, this.element.value.length);
    this.element.setSelectionRange(start, end);
  }

  private shiftPosition(shift: number): void {
    this.setPosition(this.selectionStart + shift);
  }

  private isShiftNeeded(shift: number): boolean {
    return this.isSeparatorKey(this.charAt(this.selectionStart + shift));
  }

  private isAllowedInput(event) {
    return (
      this.isNumberKey(event) ||
      this.isNavigationKey(event) ||
      this.isActionKey(event) ||
      this.isFunctionKey(event) ||
      event.key == '-'
    );
  }

  private isFunctionKey(event: any): boolean {
    return this.functionKeys.indexOf(event.key) > -1;
  }

  private isSeparatorKey(value: string) {
    return value == this.separator || value == '.';
  }

  private isActionKey(event: any): boolean {
    return (
      this.actionKeys.indexOf(event.key) > -1 &&
      (event.ctrlKey || event.metaKey)
    );
  }

  private isNavigationKey(event: any): boolean {
    return this.navigationKeys.indexOf(event.key) > -1;
  }

  private isNumberKey(event: any) {
    return !isNaN(Number(event.key));
  }

  private cleanInput(value: string): any {
    return value.replace(/\./g, '').replace(',', '.');
  }

  private removeBlanks(value: string): string {
    return value.toString().replace(/\s+/g, '');
  }

  private charAt(index: number): string {
    return this.element.value.charAt(index);
  }
}
