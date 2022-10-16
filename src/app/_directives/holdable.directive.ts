import {Directive, EventEmitter, HostListener, Output} from '@angular/core';
import {interval, Observable, Subject} from 'rxjs';
import {filter, takeUntil, tap} from 'rxjs/operators';

@Directive({
  selector: '[appHoldable]'
})
export class HoldableDirective {

  @Output() holdTime: EventEmitter<any> = new EventEmitter();

  state: Subject<string> = new Subject();
  cancel: Observable<string>;


  constructor() {
    this.cancel = this.state.pipe(
      filter(v => v === 'cancel'),
      tap(x => {
        this.holdTime.emit(0)
      })
    )
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('touchcancel', ['$event'])
  @HostListener('touchend', ['$event'])
  onExit() {
    this.state.next('cancel')
  }

  @HostListener('touchmove', ['$event'])
  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onHold() {
    this.state.next('start')
    const n = 100;
    interval(n)
      .pipe(
        takeUntil(this.cancel),
        tap(v => {
          this.holdTime.emit(v * n)
        })
      ).subscribe();

  }


}
