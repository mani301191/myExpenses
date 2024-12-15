import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-profile-setting',
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule,MatToolbarModule,MatInputModule,CommonModule,ReactiveFormsModule ],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css'
})
export class ProfileSettingComponent {
  url: any;
  formGroup: FormGroup;
  readonly dialogProfile = inject(MatDialogRef<ProfileSettingComponent>);

  constructor(private formBuilder: FormBuilder,private commonService: CommonService ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'profileName': [null, Validators.required]
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
    this.dialogProfile.close();
  }

  onSubmit(profileSetting) {
    if(this.formGroup.valid) {
     profileSetting.profilePic = this.url;
     this.commonService.saveProfileData(profileSetting);
  }
  this.formGroup.setValue(  {
    'profileName': ''
  });
}

}
