import { Component, signal } from '@angular/core';
import { SideBarComponent } from '../../shared/components/side-bar/side-bar.component';
import { ContentComponent } from '../../shared/components/content/content.component';

@Component({
  imports: [SideBarComponent, ContentComponent],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  otpArray = signal(Array(6));
}
