import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, RouterEvent, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import axios from 'axios';
import { Project } from '../project.model';
import { Comment } from '../comment.model';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  id: any;
  paramsSub: any;
  project: Project;

  constructor(private activatedRoute: ActivatedRoute, public auth: AuthService, public router: Router) {

  }
  projects: Project[] = [];
  comments: Comment[] = [];
  commentsUpdated = new Subject<Comment[]>();
  projectsUpdated = new Subject<Project[]>();
  //#1 This code by Simon McClive on Medium for reload the same url
  ngOnInit(): void {
    //This is a fucntion to refresh the page
    //#1 start
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.getDetailProject();
      this.getComment();
    });
    //#1 finish
    this.paramsSub = this.activatedRoute.params.subscribe(params => this.id = params['id']);
   this.getDetailProject();
    this.getComment();
  }
  //a request function to get detail of a project
  getDetailProject(){
    let that = this;
    axios.post('http://localhost:8000/selectedProject', { id_project: this.id })
    .then(function (response) {
      console.log(response.data['message']);
      that.project = response.data.project;
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  //a request function to get comment on a project
  getComment(){
    axios.post<{ message: string, comments: Comment[] }>('http://localhost:8000/retrieveComments', { id_project: this.id })
      .then((commentData) => {
        console.log(commentData.data['message']);
        this.comments = commentData.data.comments;
        this.commentsUpdated.next([...this.comments]);
        console.log(this.comments);
      });
  }
  //initiate field fo comment image
  imageUpload: String = '';
  fileData: File = null;
  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
  }
  selectedFile: File = null;
  onFileSelected(event) {
    console.log(event);
    this.selectedFile = <File>event.target.files[0];
  }
  //delete comment function
  DeleteComment(id_comment: String){
    axios.post('http://localhost:8000/deleteComment', { id_comment: id_comment })
          .then(function (response) {
            console.log(response.data['message']);
            location.reload();
          })
          .catch(function (error) {
            console.log(error);
          });
  }
  //Send Quick React function
  SendReact(id_user: String, user_name: String, profile_picture: String, react: Number) {
    let url = 'https://firebasestorage.googleapis.com/v0/b/royalspectreproject.appspot.com/o/react' + react + '.svg?alt=media&token=57f0fd2a-30f4-469c-8371-d30e66a47975';
    axios.post('http://localhost:8000/sendComment', { id_user: id_user, typeReact: react, id_project: this.project[0]._id, user_name: user_name, image_url: url, profile_picture: profile_picture })
          .then(function (response) {
            console.log(response.data['message']);
            location.reload();
          })
          .catch(function (error) {
            console.log(error);
          });
  }
  //Send comment function
  SendComment(id_user: String, user_name: String, profile_picture: String) {
    console.log(this.project[0]._id);
    //Prepare needed variable
    let fileName = 'file';
    //get the image extention only
    let ext = this.selectedFile.name.split('.')[1];
    const fd = new FormData();
    //This is quite unique, "that" variable belongs to this, and uses for double this
    let that = this;
    axios.post('http://localhost:8000/imageName')
      .then(function (response) {
        //setup new unique image name 
        fileName = response.data + '.' + ext;
         //Set up image in Firebase link to store in MongoDB
        let url = 'https://firebasestorage.googleapis.com/v0/b/royalspectreproject.appspot.com/o/' + fileName + '?alt=media&token=57f0fd2a-30f4-469c-8371-d30e66a47975';
        fd.append('Testing', that.selectedFile, fileName);
        //Post image to Firebase
        axios.post('https://us-central1-royalspectreproject.cloudfunctions.net/uploadFile', fd).then(res => {
          console.log(res);
          location.reload();
        })
        //Post to the Backend
        axios.post('http://localhost:8000/sendComment', { id_user: id_user, typeReact: 0, id_project: that.project[0]._id, user_name: user_name, image_url: url, profile_picture: profile_picture })
          .then(function (response) {
            console.log(response.data['message']);
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}
