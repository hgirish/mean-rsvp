import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/debounceTime'
import { Router } from '@angular/router'

import { AuthService } from './auth/auth.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app'
  navOpen: boolean
  minHeight: string
  private _initWinHeight = 0

  constructor(private auth: AuthService, private router: Router) {
    auth.handleAuth()

    if (auth.isAdmin) {
      // router.navigate(['/admin'])
    }
  }

  ngOnInit() {
    Observable.fromEvent(window, 'resize')
      .debounceTime(200)
      .subscribe(event => this._resizeFn(event))

    this._initWinHeight = window.innerHeight
    this._resizeFn(null)
  }

  navToggleHandler(e: boolean) {
    this.navOpen = e
  }

  private _resizeFn(e) {
    const winHeight: number = e ? e.target.innerHeight : this._initWinHeight
    this.minHeight = `${winHeight}px`
  }
}
