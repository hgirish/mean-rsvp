import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { AuthService } from './../../../auth/auth.service'
import { ApiService } from './../../../core/api.service'
import { UtilsService } from './../../../core/utils.service'
import { FilterSortService } from './../../../core/filter-sort.service'
import { RsvpModel } from './../../../core/models/rsvp.model'
import { Subscription } from 'rxjs/Subscription'

@Component({
  selector: 'app-rsvp',
  templateUrl: './rsvp.component.html',
  styleUrls: ['./rsvp.component.scss']
})
export class RsvpComponent implements OnInit, OnDestroy {
  @Input() eventId: string
  @Input() eventPast: boolean
  rsvpSub: Subscription
  rsvps: RsvpModel[]
  loading: boolean
  error: boolean
  userRsvp: RsvpModel
  totalAttending: number
  footerTense: string
  showAllRsvps = false
  showRsvpsText = 'View All RSVPs'

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    public fs: FilterSortService
  ) {}

  ngOnInit() {
    this.footerTense = !this.eventPast
      ? 'plan to attend this event.'
      : 'attended this event.'
    this._getRSVPs()
  }

  private _getRSVPs() {
    this.loading = true
    this.rsvpSub = this.api.getRsvpsByEventId$(this.eventId).subscribe(
      res => {
        this.rsvps = res
        this._updateRsvpState()
        this.loading = false
      },
      err => {
        console.error(err)
        this.loading = false
        this.error = true
      }
    )
  }

  toggleShowRsvps() {
    this.showAllRsvps = !this.showAllRsvps
    this.showRsvpsText = this.showAllRsvps ? 'Hide RSVPs' : 'Show All RSVPs'
  }

  private _updateRsvpState() {
    this._setUserRsvpGetAttending()
  }
  private _setUserRsvpGetAttending() {
    let guests = 0
    const rsvpArr = this.rsvps.map(rsvp => {
      if (rsvp.userId === this.auth.userProfile.sub) {
        this.userRsvp = rsvp
      }
      if (rsvp.attending) {
        guests++
        if (rsvp.guests) {
          guests += rsvp.guests
        }
      }
      return rsvp
    })
    this.rsvps = rsvpArr
    this.totalAttending = guests
  }

  ngOnDestroy() {
    this.rsvpSub.unsubscribe()
  }
}
