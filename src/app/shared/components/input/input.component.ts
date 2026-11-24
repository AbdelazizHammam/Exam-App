import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-input',
  styleUrl: './input.component.css',
  templateUrl: './input.component.html',
})
export class InputComponent {
  flag: boolean = true;
  @Input() control: any;
  @Input() typeInput!: string;
  @Input() idInput!: string;
  @Input() labelInput!: string;
}
