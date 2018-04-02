import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { ApiService } from './../../../core/api.service'
import { EventModel, FormEventModel } from './../../../core/models/event.model'
import { DatePipe } from '@angular/common'
import { dateValidator } from './../../../core/forms/date.validator'
import {
  DATE_REGEX,
  TIME_REGEX,
  stringsToDate
} from './../../../core/forms/formUtils.factory'
import { EventFormService } from './event-form.service'
import { dateRangeValidator } from './../../../core/forms/date-range.validator'

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  providers: [EventFormService]
})
export class EventFormComponent implements OnInit, OnDestroy {
  @Input() event: EventModel
  isEdit: boolean
  eventForm: FormGroup
  datesGroup: AbstractControl
  formEvent: FormEventModel
  formErrors: any
  formChangeSub: Subscription
  submitEventObj: EventModel
  submitEventSub: Subscription

  error: boolean
  submitting: boolean
  submitBtnText: string

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private datePipe: DatePipe,
    public ef: EventFormService,
    private router: Router
  ) {}

  ngOnInit() {
    this.formErrors = this.ef.formErrors
    this.isEdit = !!this.event
    this.submitBtnText = this.isEdit ? 'Update Event' : 'Create Event'
    this.formEvent = this._setFormEvent()
    this._buildForm()
  }

  private _setFormEvent(): FormEventModel {
    if (!this.isEdit) {
      return new FormEventModel(null, null, null, null, null, null, null, null)
    } else {
      const _shortDate = 'M/d/yyyy'
      return new FormEventModel(
        this.event.title,
        this.event.location,
        this.datePipe.transform(this.event.startDatetime, _shortDate),
        this.datePipe.transform(this.event.startDatetime, 'shortTime'),
        this.datePipe.transform(this.event.endDatetime, _shortDate),
        this.datePipe.transform(this.event.endDatetime, 'shortTime'),
        this.event.viewPublic,
        this.event.description
      )
    }
  }
  private _buildForm() {
    this.eventForm = this.fb.group({
      title: [
        this.formEvent.title,
        [
          Validators.required,
          Validators.minLength(this.ef.textMin),
          Validators.maxLength(this.ef.titleMax)
        ]
      ],
      location: [
        this.formEvent.location,
        [
          Validators.required,
          Validators.minLength(this.ef.textMin),
          Validators.maxLength(this.ef.locMax)
        ]
      ],
      viewPublic: [this.formEvent.viewPublic, Validators.required],
      description: [
        this.formEvent.description,
        Validators.maxLength(this.ef.descMax)
      ],
      datesGroup: this.fb.group(
        {
          startDate: [
            this.formEvent.startDate,
            [
              Validators.required,
              Validators.maxLength(this.ef.dateMax),
              Validators.pattern(DATE_REGEX),
              dateValidator()
            ]
          ],
          startTime: [
            this.formEvent.startTime,
            [
              Validators.required,
              Validators.maxLength(this.ef.timeMax),
              Validators.pattern(TIME_REGEX)
            ]
          ],
          endDate: [
            this.formEvent.endDate,
            [
              Validators.required,
              Validators.maxLength(this.ef.dateMax),
              Validators.pattern(DATE_REGEX),
              dateValidator()
            ]
          ],
          endTime: [
            this.formEvent.endTime,
            [
              Validators.required,
              Validators.maxLength(this.ef.timeMax),
              Validators.pattern(TIME_REGEX)
            ]
          ]
        },
        { validator: dateRangeValidator }
      )
    })
    this.datesGroup = this.eventForm.get('datesGroup')

    this.formChangeSub = this.eventForm.valueChanges.subscribe(data =>
      this._onValueChanged()
    )

    if (this.isEdit) {
      const _markDirty = group => {
        for (const i in group.controls) {
          if (group.controls.hasOwnProperty(i)) {
            group.controls[i].markAsDirty()
          }
        }
      }
      _markDirty(this.eventForm)
      _markDirty(this.datesGroup)
    }
    this._onValueChanged()
  }

  private _onValueChanged() {
    if (!this.eventForm) {
      return
    }
    const _setErrMsgs = (
      control: AbstractControl,
      errorsObj: any,
      field: string
    ) => {
      if (control && control.dirty && control.invalid) {
        const messages = this.ef.validationMessages[field]
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            errorsObj[field] += messages[key] + '<br />'
          }
        }
      }
    }

    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        if (field !== 'datesGroup') {
          this.formErrors[field] = ''
          _setErrMsgs(this.eventForm.get(field), this.formErrors, field)
        } else {
          const datesGroupErrors = this.formErrors['datesGroup']
          for (const dateField in datesGroupErrors) {
            if (datesGroupErrors.hasOwnProperty(dateField)) {
              datesGroupErrors[dateField] = ''
              _setErrMsgs(
                this.datesGroup.get(dateField),
                datesGroupErrors,
                dateField
              )
            }
          }
        }
      }
    }
  }

  private _getSubmitObj() {
    const startDate = this.datesGroup.get('startDate').value
    const startTime = this.datesGroup.get('startTime').value
    const endDate = this.datesGroup.get('endDate').value
    const endTime = this.datesGroup.get('endTime').value

    return new EventModel(
      this.eventForm.get('title').value,
      this.eventForm.get('location').value,
      stringsToDate(startDate, startTime),
      stringsToDate(endDate, endTime),
      this.eventForm.get('viewPublic').value,
      this.eventForm.get('description').value,
      this.event ? this.event._id : null
    )
  }

  onSubmit() {
    this.submitting = true
    this.submitEventObj = this._getSubmitObj()

    if (!this.isEdit) {
      this.submitEventSub = this.api
        .postEvent$(this.submitEventObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleError(err)
        )
    } else {
      this.submitEventSub = this.api
        .editEvent$(this.event._id, this.submitEventObj)
        .subscribe(
          data => this._handleSubmitSuccess(data),
          err => this._handleError(err)
        )
    }
  }

  private _handleSubmitSuccess(res) {
    this.error = false
    this.submitting = false
    this.router.navigate(['/event', res._id])
  }

  private _handleError(err) {
    console.error(err)
    this.submitting = false
    this.error = true
  }

  resetForm() {
    this.eventForm.reset()
  }
  ngOnDestroy() {
    if (this.submitEventSub) {
      this.submitEventSub.unsubscribe()
    }
    this.formChangeSub.unsubscribe()
  }
}
