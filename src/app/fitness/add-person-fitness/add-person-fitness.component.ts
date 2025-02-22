import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FitnessService } from '../../fitness.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-add-person-fitness',
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, MatToolbarModule,ReactiveFormsModule,
    MatInputModule,CommonModule,MatTooltipModule],
  templateUrl: './add-person-fitness.component.html',
  styleUrl: './add-person-fitness.component.css'
})
export class AddPersonFitnessComponent {
  url: any;
  formGroup: FormGroup;
  readonly dialogPerson = inject(MatDialogRef<AddPersonFitnessComponent>);

  constructor(private formBuilder: FormBuilder, private fitnessService: FitnessService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'personName': [null, Validators.required]
    });
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event) => {
        this.url = event.target.result;
      };
    }
  }

  close(): void {
    this.dialogPerson.close();
  }

  onSubmit(personDetail) {
    if(this.formGroup.valid) {
      personDetail.personPic = this.url;
     this.fitnessService.savePersonDetails(personDetail).subscribe(()=> this.formGroup.reset());
  }

}

}
