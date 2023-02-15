import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { APIService, JReponse } from "src/app/services/api.service";
import { HelperService } from "src/app/services/helper.service";
import { HomeService } from "../../home.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "app-create-workspace",
  templateUrl: "./create-workspace.component.html",
  styleUrls: ["./create-workspace.component.scss"],
})
export class CreateWorkspaceComponent implements OnInit {
  orgId;
  isEdit;
  addWorkSpaceForm: FormGroup;
  submitted = false;
  modalRef: BsModalRef | null;
  selectedOrgId;
  wsName = "";
  wsDescription = "";
  wsId;
  workspacename: any;
  workspacedesc:any;

  constructor(
    private fb: FormBuilder,
    public helperService: HelperService,
    private apiService: APIService,
    public homeService: HomeService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.orgId = this.selectedOrgId;
    this.addWorkSpaceForm = this.fb.group({
      name: ["", [Validators.required]],
      description: [""],
    });
    if (this.isEdit) {
      this.setEditForm(this.wsName, this.wsDescription);
    }
  }

  setEditForm(name, desc) {
    this.addWorkSpaceForm.get("name").setValue(name);
    this.addWorkSpaceForm.get("description").setValue(desc);
  }
  get form() {
    return this.addWorkSpaceForm.controls;
  }
  add() {
    this.submitted = true;
      this.workspacename= this.addWorkSpaceForm.get("name").value;
      this.workspacename=this.helperService.removeTags(this.workspacename);
      this.workspacedesc=this.addWorkSpaceForm.get("description").value;
      this.workspacedesc=this.helperService.removeTags(this.workspacedesc);
    if (this.addWorkSpaceForm.valid) {
      const data = {
        name:this.workspacename,
        description: this.workspacedesc,
        organization_id: this.orgId,
        workspace_id: this.wsId,
      };
      if (!this.isEdit) {
        delete data.workspace_id;
        this.apiService
          .postWithHeader("workspace/addWorkspace", data)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
              this.modalService.hide(1);
             // this.helperService.setLocalStore("workspaces", "");
              this.getWorkspaces(
                this.orgId,
                this.helperService.getLocalStore("orgRole"),
                this.helperService.getLocalStore("backgroundColor")
              );
              this.addWorkSpaceForm.reset();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            this.modalService.hide(1);
            throw err;
          });
      } else {
        this.apiService
          .postWithHeader("workspace/editWorkspace", data)
          .then((jresponse: JReponse) => {
            if (jresponse) {
              this.helperService.showSuccessToast(jresponse.message);
              this.modalService.hide(1);
            //  this.helperService.setLocalStore("workspaces", "");
              this.getWorkspaces(
                this.orgId,
                this.helperService.getLocalStore("backgroundColor")
              );
              this.addWorkSpaceForm.reset();
            }
          })
          .catch((err: any) => {
            this.helperService.showErrorToast(err.message);
            this.modalService.hide(1);
            throw err;
          });
      }
      this.submitted = false;
    }
  }

  setTextAreaLength(id) {
    const element = document.getElementById(id);
    element.style.height = "1px";
    element.style.height = 2 + element.scrollHeight + "px";
  }

  getWorkspaces(orgId, orgRole, orgColor?) {
    if (orgId) {
      this.homeService.activityOrgId=orgId;
      this.homeService.sendOrgIdForPost({organization_id:orgId});
      this.homeService.orgId = orgId;
      this.homeService.backgroundColor = orgColor;
      if (
        this.homeService.backgroundColor &&
        this.homeService.backgroundColor !== undefined &&
        this.homeService.backgroundColor !== "undefined"
      ) {
        this.helperService.setLocalStore(
          "backgroundColor",
          this.homeService.backgroundColor
        );
      } else {
        this.helperService.setLocalStore("backgroundColor", "transparent");
      }
      const data = {
        organization_id: orgId,
      };
      this.apiService
        .postWithHeader("workspace/getWorkspaces", data)
        .then((jresponse: JReponse) => {
          if (jresponse) {
            this.helperService.setLocalStore("workspaces", "");
            this.homeService.workSpaceList = jresponse.body;
            this.helperService.setLocalStore(
              "workspaces",
              this.homeService.workSpaceList
            );
          }
        })
        .catch((err: any) => {
          throw err;
        });
    }
  }
}
