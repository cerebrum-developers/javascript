import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";

import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  orgRole = "";
  selectedItemId = "";
  selectedOrgId = "";
  selectedOrgUserRole = "";
  orgList = [];
  orgName: string;
  orgImage: any;
  orgImagePreview: any;
  onboardingImg: any;
  updateImg: any;
  applyClass = false;
  wsName: string;
  categories: any;
  wsdescription: string;
  searchKeyword;
  showCalendarClass = false;
  showContacts = false;
  userActiveStatuses: any = {};
  editOrgId: any;
  // enJSON = require("../language/translation.en.json");
  constructor(
    // private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router
    // private apiService: APIService,
    // public homeService: HomeService,
  ) { }
  private subjectForPublicProfile = new Subject<any>();
  selectedRecipient = "";
  followers = [];
  messages = {};
  openedChat = [];
  showChat = [];
  notificationCount = 0;
  notificationApiCalled = false;
  openedMobileChat: any = {};
  showMobileChat = true;
  orgEvent:any = {};
  groupEvent:any = {};


  getOrgEvent(data){
    this.orgEvent = data;
  }

  getGroupEvent(data){
    this.groupEvent = data;
  }

  sendUserIdForPublicProfile(data) {
    this.subjectForPublicProfile.next(data);
  }

  getUserIdForPublicProfile() {
    return this.subjectForPublicProfile.asObservable();
  }

   removeTags(str:any) {
    if ((str !== null) || (str !== '' )){
      str = str.toString();
      return str.replace( /(<([^>]+)>)/ig, '');
    }
  }

  changeClass() {
    this.router.events.subscribe((el) => {
      if (el["url"]) {
        if (el["url"].includes("/auth") || el["url"].includes("/onboarding")) {
          this.applyClass = false;
        } else {
          this.applyClass = true;
        }
      }
      return this.applyClass;
    });
  }
  /**
   * loggedUser() => logged user info return
   */
  get loggedUser() {
    return this.getLocalStore("userData");
  }

  printLog(message: any, values?: any) {
    if (!environment.production) {
    }
  }

  setLocalStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getLocalStore(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  clearStorageFor(key) {
    return localStorage.removeItem(key);
  }

  clearStorage() {
    localStorage.clear();
  }

  // check whether password and confirm password is same
  confirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors.confirmedValidator
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  showSuccessToast(msg) {
    this.toastr.success(msg);
  }

  showErrorToast(msg) {
    this.toastr.error(msg);
  }

  showInfoToast(msg) {
    this.toastr.info(msg);
  }

  showNotifyToast(message, title, config) {
    return this.toastr.success(message, title, config);
  }

  clearNotifyToast(toastId) {
    setTimeout(() => {
      this.toastr.clear(toastId);
    }, 500);
  }

  showAlert(error) {
    this.showInfoToast(error);
  }
}
