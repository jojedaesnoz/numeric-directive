import {
  Directive,
  Input,
  HostListener,
  Optional,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumOnly]',
})
export class NumOnlyDirective {
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
    '-',
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

  addCssClasses() {
    for (let cssClass of this.cssClasses) {
      this.renderer.addClass(this.element, cssClass);
    }
  }

  ngOnInit() {
    this.addCssClasses();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.isAllowedInput(event)) {
      event.preventDefault();
    }
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
}
