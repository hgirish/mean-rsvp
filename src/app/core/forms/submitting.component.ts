import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-submitting',
  template: `
   <img src="/assets/images/loading.svg" title="submitting" />
  `,
  styles: [
    `
  :host {
    display: inline-block;
  }
  img {
    display: inline-block;
    margin: 4px 3px;
    width: 30px;
  }
  `
  ]
})
export class SubmittingComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
