import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  /*  posts = [
     {title: 'First Post', content: 'This is the first post'},
     {title: 'Second Post', content: 'This is the second post'},
     {title: 'Third Post', content: 'This is the third post'}
   ] */

  posts: Post[] = [];
  isLoading: boolean;
  totalPosts: number = 0;
  postsPerPage: number = 2;
  currentPage: number = 1;
  pageSizeOptions: number[] = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postsSubscription: Subscription;
  private authStatusSubscription: Subscription;

  constructor(private postService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    /*   this.postsSubscription = this.postService.postsUpdated.subscribe((posts: Post[]) => {
        this.posts = posts
      }); */
    this.postsSubscription = this.postService
      .getPostUpdateListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
    // we had to call getIsAuthenticated() here because,although it is listening, the postList component is loaded after login occurs and consequently after the change occurs
    this.userIsAuthenticated = this.authService.getIsAuthenticated();

    // here we only listen is something change; as postList is only loaded after login, postList does not receive changes update
    // so when pagelist is firstly loaded it should actually fetch the required info
    this.authStatusSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    // we add 1 because we are getting the index and in BE we start from 1
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.postsSubscription.unsubscribe();
    this.authStatusSubscription.unsubscribe();
  }
}
