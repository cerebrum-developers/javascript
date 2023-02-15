import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef
} from '@angular/core';
import {
  HelperService
} from 'src/app/services/helper.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { APIService } from "../../../../../../services/api.service";
import {
  JReponse
} from 'src/app/services/api.service';
import {
  HomeService
} from "src/app/modules/application/home/home.service";
import {
  environment
} from "../../../../../../../environments/environment";
import {
  MatSlideToggleChange
} from '@angular/material/slide-toggle';

import {
  BsModalService,
  BsModalRef
} from "ngx-bootstrap/modal";
import {
  STEPPER_GLOBAL_OPTIONS
} from '@angular/cdk/stepper';

import {
  ErrorStateMatcher
} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS,
    useValue: {
      showError: true
    },
  }, ],
})
export class BillingComponent implements OnInit {

  modalRef: BsModalRef;
  loader: boolean = false;
  subscriptions: Array<String> = [];
 
  constructor(
    private modalService: BsModalService,
    private helper: HelperService,
    private fb: FormBuilder,
    private apiService: APIService,
    private homeService: HomeService,
  ) {}

  ngOnInit() {
   this.getPlatformSubscriptions();
  }
  // MODAL CONFIG
  openModal(template: TemplateRef < any > , type = "") {
    this.modalRef = this.modalService.show(template, {
      class: "paid-groups-modal relative",
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false
    });
  }
    
  // GET PLATFORM SUBSCRIPTONS
  getPlatformSubscriptions() {
    this.homeService.getPlatformSubscriptions()
      .then((jresponse: any) => {
        if (jresponse) {
          console.log('jresponse dd', jresponse.body)
          this.subscriptions = jresponse.body.filter((data) => data.status);
          if(this.subscriptions.length){
            localStorage.setItem('isPaidPlan','true');
          }
          else{
            localStorage.setItem('isPaidPlan','false');
          }
          this.loader = false;
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        throw err;
      });
  }

  getDateFormat(data:any){
    let newDate = new Date(data * 1000);
    return newDate.toDateString();
  }

  cancelSubscription(subscriptionId:any){
    this.homeService.cancelSubscription(subscriptionId)
      .then((jresponse: any) => {
        if (jresponse) {
          console.log('jresponse dd', jresponse.body)
          this.subscriptions = jresponse.body;
          this.loader = false;
          this.getPlatformSubscriptions();
          this.modalService.hide(1);
          this.modalService.hide(1);
        }
      })
      .catch((err: Error) => {
        this.helper.showErrorToast(err.message);
        this.loader = false;
        this.getPlatformSubscriptions();
        this.modalService.hide(1);
        this.modalService.hide(1);
        throw err;
      });
  }


}
