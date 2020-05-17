import { Component, OnInit } from '@angular/core';
import { Post } from './posts/post.model';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
 /*  storedPosts: Post[] = [];

  onPostedAdded(post: Post) {
    this.storedPosts.push(post);
  } */

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser();
  }
}
