import { Component, OnInit, Output, EventEmitter, OnDestroy } from "@angular/core";
import { Post } from "../post.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PostsService } from "../posts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { mimeTypeValidator } from "./mime-type.validator";
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

enum Mode {
  'CREATE',
  'EDIT'
}

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.scss"]
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  /*   @Output() */
  postCreated = new EventEmitter<Post>();
  post: Post;
  isLoading: boolean;
  postsForm: FormGroup;
  imagePreview: string;
  private mode = Mode.EDIT;
  private postId: string;
  private authStatusSubscription: Subscription;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSubscription = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )

    this.postsForm = new FormGroup({
      'title': new FormControl(null, [Validators.required, Validators.minLength(3)]),
      'content': new FormControl(null, Validators.required),
      'image': new FormControl(null, Validators.required, mimeTypeValidator)
    });

    //It would also work with params but it is old and possibly will be deprecated; Use paramMap instead
    /*  this.route.params.subscribe((params: Params) => {
      this.postId = params['postId'];
     }); */
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = Mode.EDIT;
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.postsForm.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = Mode.CREATE;
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postsForm.patchValue({
      image: file
    });
    this.postsForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = <string>reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.postsForm.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === Mode.CREATE) {
      /*  this.postCreated.emit(post); */
      this.postsService.addPost(
        this.postsForm.value.title,
        this.postsForm.value.content,
        this.postsForm.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.postsForm.value.title,
        this.postsForm.value.content,
        this.postsForm.value.image);
    }

    this.postsForm.reset ();
  }

  ngOnDestroy() {
    this.authStatusSubscription.unsubscribe();
  }
}
