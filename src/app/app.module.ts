import { BrowserModule, Title } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http'
import { DatePipe } from '@angular/common'
import { AppRoutingModule } from './app-routing.module'
import { FormsModule } from '@angular/forms'

import { AppComponent } from './app.component'
import { HomeComponent } from './pages/home/home.component'
import { HeaderComponent } from './header/header.component'
import { FooterComponent } from './footer/footer.component'
import { CallbackComponent } from './pages/callback/callback.component'
import { LoadingComponent } from './core/loading.component'

import { AuthService } from './auth/auth.service'
import { ApiService } from './core/api.service'
import { UtilsService } from './core/utils.service'
import { FilterSortService } from './core/filter-sort.service';
import { AdminComponent } from './pages/admin/admin.component'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    CallbackComponent,
    LoadingComponent,
    AdminComponent
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule],
  providers: [
    Title,
    AuthService,
    DatePipe,
    ApiService,
    UtilsService,
    FilterSortService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
