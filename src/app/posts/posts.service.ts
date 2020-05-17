import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

const BACKEND_URL = `${environment.apiUrl}/posts/`;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(postsPerPage: number, currentPage: number) {
   // const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`;
    let params: HttpParams = new HttpParams();
      params = params.append('pageSize', postsPerPage.toString());
      params = params.append('page', currentPage.toString());
    //get() converts json to js
    //return this.http.get<{ message: string, posts: any, maxPosts: number }>('http://localhost:3200/api/posts' + queryParams)
    return this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL , { params })
      //rxjs map
      .pipe(map((responseData) => {
        //normal js array map()
        return {
          posts: responseData.posts.map(post => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              creator: post.creator
            };
          }),
          maxPosts: responseData.maxPosts
        };
      }))
      .subscribe((transformedResponseData) => {
        this.posts = transformedResponseData.posts;
        this.postsUpdated.next({posts: [...this.posts], postCount: transformedResponseData.maxPosts});
      });
    //return [...this.posts];
  }

  getPostUpdateListener(): Observable<{posts: Post[], postCount: number}> {
    return this.postsUpdated.asObservable();
  }

  getPost(postId: string) {
    //return {... this.posts.find(post => post.id === postId)};
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + postId);
  }

  addPost(title: string, content: string, image: File): void {
    // FormData is a data format that allows to combine text data and blob
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    // the 3rd argument is the name of file that we want to store in BE
    postData.append('image', image, title);

    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe(() => {
       /*  const post: Post = {
          id: responseData.post.id,
          title,
          content,
          imagePath: responseData.post.imagePath,
        };
        // by having this code inside subscribe(), this is asynchronously executed and only be executed
        // if we have a successful server-side response
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]); */
        // since we navigate to postlist page after adding a post, ngOniinit on pageList component will be executed and so postlis component will be reloaded,
        // so the code above is unnecessairy
        this.router.navigate(['/']);
      });
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    // since we have a file, we have to send formData, not json
    if (typeof (image) === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      // send json
    } else {
      postData = {
        id: postId,
        title,
        content,
        imagePath: image,
        // creator: null to avoid user manipulates it
        creator: null
      };
    }

    this.http.put<{ message: string }>(BACKEND_URL + postId, postData)
      .subscribe(() => {
        /* const updatedPosts = [...this.posts];
        const post: Post = {
          id: postId,
          title,
          content,
          imagePath: ""
        };
        const oldPostsIndex = this.posts.findIndex(post => post.id = postId);
        updatedPosts[oldPostsIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]); */
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
     return this.http.delete(BACKEND_URL + postId);
      /* .subscribe(() => {
          // const deletedPost = this.posts.find(post => post.id === postId);
          // this.posts.splice(this.posts.indexOf(deletedPost), 1);

          // on the contrary of addPost() and updatePost() here we actually need to reload the list component to see the posts that still exist; subscribe now in post-list
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      }); */
  }
}
