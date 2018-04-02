import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { AUTH_CONFIG } from './auth.config'
import * as auth0 from 'auth0-js'
import { createWiresService } from 'selenium-webdriver/firefox'
import { Subscription } from 'rxjs/Subscription'
import { Observable } from 'rxjs/Observable'
import { mergeMap } from 'rxjs/operators'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/timer'

@Injectable()
export class AuthService {
  private _auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.CLIENT_ID,
    domain: AUTH_CONFIG.CLIENT_DOMAIN,
    responseType: 'token',
    redirectUri: AUTH_CONFIG.REDIRECT,
    audience: AUTH_CONFIG.AUDIENCE,
    scope: AUTH_CONFIG.SCOPE
  })
  userProfile: any
  loggedIn: boolean
  loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn)
  isAdmin: boolean
  refreshSub: Subscription

  constructor(private router: Router) {
    const lsProfile = localStorage.getItem('profile')

    if (this.tokenValid) {
      this.userProfile = JSON.parse(lsProfile)
      this.isAdmin = localStorage.getItem('isAdmin') === 'true'

      this.setLoggedIn(true)
      this.scheduleRenewal()
    } else if (!this.tokenValid && lsProfile) {
      this.logout()
    }
  }

  setLoggedIn(value: boolean) {
    this.loggedIn$.next(value)
    this.loggedIn = value
  }

  login(redirect?: string) {
    const _redirect = redirect ? redirect : this.router.url
    localStorage.setItem('authRedirect', _redirect)
    this._auth0.authorize()
  }

  logout(noRedirect?: boolean) {
    // Ensure all auth items removed from localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('profile')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('authRedirect')
    this._clearRedirect()

    this.userProfile = undefined
    this.isAdmin = undefined

    this.setLoggedIn(false)
    this.unscheduleRenewal()

    if (noRedirect !== true) {
      this.router.navigate(['/'])
    }
  }

  get tokenValid(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))

    return Date.now() < expiresAt
  }

  handleAuth() {
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        window.location.hash = ''
        this._getProfile(authResult)
      } else if (err) {
        this._clearRedirect()
        this.router.navigate(['/'])
        console.error(`Error authenticating: ${err.error}`)
      }
      this.router.navigate(['/'])
    })
  }

  private _getProfile(authResult) {
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile)
        this.router.navigate([localStorage.getItem('authRedirect') || '/'])
        this._redirect()
        this._clearRedirect()
      } else if (err) {
        console.error(`Error authenticating: ${err.error}`)
      }
    })
  }

  private _redirect() {
    const fullRedirect = decodeURI(localStorage.getItem('authRedirect'))
    const redirectAttr = fullRedirect.split('?tab=')
    const navArr = [redirectAttr[0] || '/']
    const tabObj = redirectAttr[1]
      ? { queryParams: { tab: redirectAttr[1] } }
      : null

    if (!tabObj) {
      this.router.navigate(navArr)
    } else {
      this.router.navigate(navArr, tabObj)
    }
  }

  private _clearRedirect() {
    localStorage.removeItem('authRedirect')
  }

  private _checkAdmin(profile) {
    let authConfigNamespace = AUTH_CONFIG.NAMESPACE
    let roles = profile[authConfigNamespace] || []
    if (roles.length < 1) {
      authConfigNamespace = authConfigNamespace.replace(/\./g, ':')
      roles = profile[authConfigNamespace] || []
    }
    return roles.indexOf('admin') > -1
  }

  private _setSession(authResult, profile) {
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + Date.now())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('expires_at', expiresAt)
    localStorage.setItem('profile', JSON.stringify(profile))
    this.userProfile = profile

    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile))
      this.userProfile = profile
      this.isAdmin = this._checkAdmin(profile)
      localStorage.setItem('isAdmin', this.isAdmin.toString())
    }

    this.setLoggedIn(true)

    this.scheduleRenewal()
  }

  scheduleRenewal() {
    if (!this.tokenValid) {
      return
    }
    this.unscheduleRenewal()
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    const expiresIn$ = Observable.of(expiresAt).pipe(
      mergeMap(expires => {
        const now = Date.now()
        return Observable.timer(Math.max(1, expires - now))
      })
    )
    this.refreshSub = expiresIn$.subscribe(() => {
      this.renewToken()
      this.scheduleRenewal()
    })
  }

  unscheduleRenewal() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe()
    }
  }

  renewToken() {
    this._auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken) {
        this._setSession(authResult, null)
      } else if (err) {
        console.warn(`Could not renew token: ${err.errorDescription}`)
        this.logout(true)
        this.login()
      }
    })
  }
}
