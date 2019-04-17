import {Component, Input, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject, AngularFireList} from "angularfire2/database";
import {Student} from '../../Share/Models/student.model';

import {firebaseConfig, firebaseDevConfig} from "../../../environments/firebase.config"
import {environment} from '../../../environments/environment.prod';
import {HttpClient} from '@angular/common/http';
import { UserComment} from '../../Share/Models/comment.model';
import {Attributes} from '../../Share/Models/attributes.model';
import {NavigationService} from '../../Share/Services/navigation.service';
import {Router} from '@angular/router';
import Database = firebase.database.Database;
import {UserService} from '../../Share/Services/user.service';
import {User} from '../../Share/Models/user.model';
import {Teacher} from '../../Share/Models/teacher.model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  userRef: AngularFireObject<any>;
  usersRef: AngularFireList<any>;
  user: User;
  attributeData = []; // in order;
  comments: UserComment[];
  attributeDataOrder = ['realistic', 'independent', 'listener', 'dedicated', 'calm',
                        'optimistic', 'teamplayer', 'speaker', 'flexible', 'energetic' ];
  noOfFeedback: number;

  constructor(private userServ: UserService,
              private router: Router) {
  }

  ngOnInit() {
    if (!this.userServ.getUser()) {
      this.userServ.onUserInited.subscribe(
        (user: User) => {
          console.log(user);
          this.user = user;
          // Get attributes
          this.getAttributes(this.user.id);
          // Get comments
          this.getComments(this.user.id);
        }
    );
    } else {
      this.user = this.userServ.getUser();
      // Get attributes
      this.getAttributes(this.user.id);
      // Get comments
      this.getComments(this.user.id);
    }
  }
  getAttributes(id: number) {
    this.userServ.getAttributesObservable(id).subscribe(
      (attributes) => {
        this.noOfFeedback = attributes.length;
        if (this.attributeData.length > 0) {
          this.attributeData = [];
        }
        const dataAttributes = attributes.reduce((newArr, attribute) => {
          return newArr.concat(attribute.data);
        }, []);
        // Create an object whose keys are the average.

        const averageObj = {...dataAttributes[0]};

        for (let i = 1; i < dataAttributes.length; i++) {
          for (const key of Object.keys(averageObj)) {
            averageObj[key] += dataAttributes[i][key];
            // Calculate the average when this is the last item of dataAttribute
            if (i === dataAttributes.length - 1 ) {
              averageObj[key] = averageObj[key] / attributes.length;
            }
          }
        }

        console.log('obj', averageObj);
        // Map the value into an array in a correct order
        for (let i = 0; i < this.attributeDataOrder.length; i ++) {
          this.attributeData.push(averageObj[this.attributeDataOrder[i]]);
        }
        console.log('fasd', this.attributeData);

      }
    );
  }
  getComments(id: number) {
    this.userServ.getCommentsObservable(id).subscribe(
      (comments) => {
        if (comments.length > 0) {
          this.comments = comments.reverse().slice(0, 5);
        }
      }
    );
  }
}
