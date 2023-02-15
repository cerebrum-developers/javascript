import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

// const CLIENT_ID = environment.googleClientId;
const CLIENT_ID = environment.GoogleKey;
const API_KEY = environment.googleApiKey;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];
const SCOPES = "email profile";
// https://www.googleapis.com/auth/calendar

// function handleAuthResult(token) {
//         const view = new google.picker.View(google.picker.ViewId.DOCS);
//         view.setMimeTypes('image/png,image/jpeg,image/jpg,video/mp4');
//         const pickerBuilder = new google.picker.PickerBuilder();
//         const picker = pickerBuilder.
//         enableFeature(google.picker.Feature.NAV_HIDDEN).
//         setOAuthToken(token).
//         addView(view).
//         addView(new google.picker.DocsUploadView()).
//         setCallback((e) => {
//             if (e[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
//             const doc = e[google.picker.Response.DOCUMENTS][0];
//             const src = doc[google.picker.Document.URL];
//             }
//         }).
//         build();
//         picker.setVisible(true);

// }

@Injectable()
export class GoogleAPIService {
  googleAuth: gapi.auth2.GoogleAuth;
  pickerApiLoaded = false;
  token: any = {
    token_type: "Bearer",
    // tslint:disable-next-line: max-line-length
    access_token:
      "ya29.a0AfH6SMDJEQtFBpADsk3Mes91LwRNwuR7p5Xj1PbxZJeY3BqVOULmFAWm7N-GyZwBJxKcO1vOKI_OXNbYAEsXlO_P5SFga-rRoFnB9in0Xm1zepvaygFbCx4SkSA2lo-1DbPlPMQlF5LnaYZgPZT3eDbO5pNn1UDqxMk",
    // tslint:disable-next-line: max-line-length
    // scope:
    //   "email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    login_hint:
      "AJDLj6JUa8yxXrhHdWRHIV0S13cAhTIlP1ruGT5ihYK5Y7cJISCOU3airT8JzJDiGdL0lDj1o7VzU9LzKl_eV7Cowd900MxKvw",
    expires_in: "634",
    // tslint:disable-next-line: max-line-length
    id_token:
      "eyJhbGciOiJSUzI1NiIsImtpZCI6ImIxNmRlMWIyYWIwYzE2YWMwYWNmNjYyZWYwMWY3NTY3ZTU0NDI1MmEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNzA1MjM2MDQ4MDgxLW91ZmlxcmliMDFwdWV0bjNnZmEydDI4YnVnMGl1ODBrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNzA1MjM2MDQ4MDgxLW91ZmlxcmliMDFwdWV0bjNnZmEydDI4YnVnMGl1ODBrLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAzODU4NzMzOTkzODg5OTIwMjgwIiwiZW1haWwiOiJhcmNoaXQubmF1dGl5YWwuc2FAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJTMWhSM1FkVEdUMEg0S1dZWEJOUGJBIiwibmFtZSI6IkFyY2hpdCBOYXV0aXlhbCIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLWcxdHY1WGlzZTlFL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y25oR0FhMTBadnVJRzJtUEJiUG9Jdkc3VURmQXcvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IkFyY2hpdCIsImZhbWlseV9uYW1lIjoiTmF1dGl5YWwiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTU5MjU3MjcxNiwiZXhwIjoxNTkyNTc2MzE2LCJqdGkiOiIyYjM0YmU0MjNmZDRmM2UwNWM5ZDliMjczNmZlNGQ2OWU2OGI2ZjMxIn0.sXRfFKukE_CJAj9KGgaVPKMFkiJEhOcbGuNjUyRGNNkxAHoI_Mb4kZhAbUf1VJ4KrKhv1KAfVMzUvwAyQck9Hb6fMc5HBVXuoWMaqUg70O-hPffmZR4OmNhWPyHcm4n6KHy7s-U7Dkzo8PbTTWQqbO8tR3C2M5vBjtwBfmBAmWk5HS_qpb5V889uNgLPpAg08urSMl9TUB7N52UAP71iV9hb_Vi69KzMpKoCuZhTbhyjHTyCGpdBo8PJD15SXn7VSW06bzGN86Hku7OJToWIMhWPgpn5OCEZrcvTRWWQhgYkJtapsylbd5YqfPwry-qNpSChGSx_0O9NtzLmnHfLdQ",
    session_state: {
      extraQueryParams: {
        authuser: "0",
      },
    },
    first_issued_at: 1592572716959,
    expires_at: 1592576315959,
    idpId: "google",
  };

  // tslint:disable-next-line: max-line-length
  oneDriveAuthToken =
    "access_token=EwBwA8l6BAAUO9chh8cJscQLmU+LSWpbnr0vmwwAARNr7UtDHLxbG2mw660NM0QFDwBEq9pwEG/91hlq2stTZRtoYPH6+vyRweK7cPuvizT2BzDoqc2WC4AqdFWcAXDiTtbGMbtkgIrvh8HlXftNs4t4tVRgUkluhHmBn9lkeLMsgv0VGpFYQ6rSrKOeusVbKggSaHa4nwOWJUnZqqJNT6WpsSjzuaCyrLyj+JsdGM0G4R4TXNrP7ZwQkKeVNW9H6sSvK/YDsPCneHwi0/HAVhciN/fKYeVks73pRzGe3a/8WF3bYEdPVGc8mQPNv0mY5h86ltkfGB1gvoHTnSleK2BOQGTpx0kqwHIor+kAnIuK29TH9cjsri7EYLemFmEDZgAACK+Df2av74U1QAJyMxN53ndciJSGdxMyGaXRBk3CnZupfGEQzRD42O8hyy1azXsuD1aP7hpggw+lP42YktZwHA7DYpyiZTuRtwW53PF/HBgB62Gi1cR0iYxRe1GUEG7mfnZ/SuIlKnzRo6t+LaxSA8uZ0wf1Zv3Ej0SOEaIMQqM/MXTKv2ooMfoPthRuXxGQ+xQlqkIw9PFeRgSP4Jh8VGPeEopUYIOMT21uRdyHKLQVL8Pqzw/qSTiD5Z7ZwGPGA3BRxf2PcL0gG2OljTXsE713RagjaPucRCmBK+/K+Q7hghNN4fuIMETp6mMH+ziCPx8owSP66ugxPqKpFsR0s/+POhHO5aHLtw5sk8SKe0BObyqc8gdTPDjQctvva1MkloloxOxHLx9G+YaEga7HGDpoihSPpkkexbmdN1lp0qw0VpMYBU39clLUe1iNufUYgg/zEZ34XkDotYjN68GQHmzXXhb/rcM6aG4aHEVabJf4649dbCcUrHQfhI5bsLUIS8h52KAUdqtM0L/WN19Y9XtQm41/nhI5UoBzQM5tv+ecIkxMT7XOAWy/ZNJt5KPMdG9KRWg4lxTBrNr521rmZzvMQLBUXLE06WpgKnOzyNSpKSLNge2nClKIWtp87EbhNCAiMSQ3UE4ibepjceaLYV22GaZA7oPOyTrBuQsba/8m/x0Tew7IjVv8IdaCzSS//8J0DawU5jKdW0rh/Vq136YvLO885yQTkN6/LbSkpBRcHDLmgCm8jYetAso+zx6qGQoTJRQdeswBqYecAg==&token_type=bearer&expires_in=3600&scope=Files.ReadWrite.All Files.ReadWrite User.Read";
  constructor() { }

  initClient() {
    return new Promise((resolve, reject) => {
      gapi.load("client:auth2", () => {
        return gapi.client
          .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES
          })
          .then(() => {
            this.googleAuth = gapi.auth2.getAuthInstance();
            resolve();
          });
      });
    });
  }

  // get isSignedIn(): boolean {
  //     return this.googleAuth.isSignedIn.get();
  // }

  get userDetails(): object {
    return this.googleAuth.currentUser.get();
  }

  signIn(scope) {
    return this.googleAuth.grantOfflineAccess({
      prompt: "consent",
      scope: scope
    });
  }

  signOut() {
    this.googleAuth.signOut();
  }

  gSignIn() {
    return this.googleAuth.signIn({
      prompt: 'select_account',
      scope: 'email profile'
    });
  }

  getFiles(folderId: string) {
    return new Promise((resolve, reject) => {
      gapi.client.drive.files
        .list({
          pageSize: 100,
          fields:
            "nextPageToken, files(id, name, mimeType, modifiedTime, size,webContentLink, webViewLink)",
          q: `'${folderId}' in parents and trashed = false`,
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getParticularFile(fileId) {
    return new Promise((resolve, reject) => {
      gapi.client.drive.files
        .get({
          fileId,
          alt: "media",
        })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  loadDrive() {
    // handleAuthResult(this.token);
    this.token = gapi.auth.getToken();
    // gapi.load('auth', { 'callback': this.onAuthApiLoad.bind(this) });
    // gapi.load('picker', { 'callback': this.onPickerApiLoad.bind(this) });
    // this.onPickerApiLoad();
  }

  authorize(token: any = {}) {
    gapi.auth.setToken(token);
  }

  // onPickerApiLoad() {
  //     this.pickerApiLoaded = true;
  //     this.createPicker();
  //     handleAuthResult(this.token);
  // }

  // createPicker() {
  //     if (this.pickerApiLoaded && this.token) {
  //       const picker = new google.picker.PickerBuilder().
  //           addView(google.picker.ViewId.DOCS).
  //           setOAuthToken(this.token).
  //           setDeveloperKey(API_KEY).
  //           build();
  //       picker.setVisible(true);
  //     }
  //   }

  insertFile(fileData, callback: any = "") {
    this.authorize();
    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const reader: any = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = (e) => {
      const contentType = fileData.type || "application/octet-stream";
      const metadata = {
        title: fileData.name,
        mimeType: contentType,
      };
      const base64Data = btoa(reader.result);
      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " +
        contentType +
        "\r\n" +
        "Content-Transfer-Encoding: base64\r\n" +
        "\r\n" +
        base64Data +
        closeDelim;

      const request = gapi.client.request({
        path: "/upload/drive/v2/files",
        method: "POST",
        params: { uploadType: "multipart" },
        headers: {
          "Content-Type": 'multipart/mixed; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
      });
      if (!callback) {
        callback = (file) => { };
      }
      request.execute(callback);
    };
  }
}
