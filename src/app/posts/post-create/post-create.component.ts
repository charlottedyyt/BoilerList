import { Component, OnInit } from '@angular/core';

import {FormControl, NgForm, Validators} from '@angular/forms';

import { PostsService } from '../posts.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Post} from '../post.model';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import { NgxImageCompressService} from 'ngx-image-compress';
import { LoginComponent } from 'src/app/login/login.component';

interface Category {
  value: string;
  viewValue: string;
}
interface Tag {
  name: string;
}
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']

})
export class PostCreateComponent implements OnInit {
  // Post configuration
  enteredTitle = '' ;
  enteredContent = '';
  private mode = 'create';
  private postId: string;
  public post: Post = {
    id: '',
    title: '',
    content: '',
    price: '',
    owner: '',
    category: '',
    condition: '',
    status: '',
    tags: [],
    viewCount: 0,
  };
  private price: FormControl;

  // Tag Configuration
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: Tag[] = [];

  //image
  imageFile: File;
  imgAfterCompressed: string;
  compressedFile: File;
  isCompressed: boolean = false;
  imageUrls = [];
  imageFiles: File[] = [];

  // Category Configuration
  categories: Category[] = [
    {value: 'Antiques', viewValue: 'Antiques'},
    {value: 'Art', viewValue: 'Art'},
    {value: 'Baby', viewValue: 'Baby'},
    {value: 'Books', viewValue: 'Books'},
    {value: 'Business & Industrial', viewValue: 'Business & Industrial'},
    {value: 'Cameras & Photo', viewValue: 'Cameras & Photo'},
    {value: 'Cell Phones & Accessories', viewValue: 'Cell Phones & Accessories'},
    {value: 'Clothing, Shoes & Accessories', viewValue: 'Clothing, Shoes & Accessories'},
    {value: 'Coins & Paper Money', viewValue: 'Coins & Paper Money'},
    {value: 'Collectibles', viewValue: 'Collectibles'},
    {value: 'Computers/Tablets & Networking', viewValue: 'Computers/Tablets & Networking'},
    {value: 'Consumer Electronics', viewValue: 'Consumer Electronics'},
    {value: 'Crafts', viewValue: 'Crafts'},
    {value: 'Dolls & Bears', viewValue: 'Dolls & Bears'},
    {value: 'DVDs & Movies', viewValue: 'DVDs & Movies'},
    {value: 'Entertainment Memorabilia', viewValue: 'Entertainment Memorabilia'},
    {value: 'Gift Cards & Coupons', viewValue: 'Gift Cards & Coupons'},
    {value: 'Health & Beauty', viewValue: 'Health & Beauty'},
    {value: 'Home & Garden', viewValue: 'Home & Garden'},
    {value: 'Jewelry & Watches', viewValue: 'Jewelry & Watches'},
    {value: 'Music', viewValue: 'Music'},
    {value: 'Musical Instruments & Gear', viewValue: 'Musical Instruments & Gear'},
    {value: 'Pet Supplies', viewValue: 'Pet Supplies'},
    {value: 'Pottery & Glass', viewValue: 'Pottery & Glass'},
    {value: 'Real Estate', viewValue: 'Real Estate'},
    {value: 'Specialty Services', viewValue: 'Specialty Services'},
    {value: 'Sporting Goods', viewValue: 'Sporting Goods '},
    {value: 'Sports Mem, Cards & Fan Shop', viewValue: 'Sports Mem, Cards & Fan Shop'},
    {value: 'Stamps', viewValue: 'Stamps'},
    {value: 'Tickets & Experiences', viewValue: 'Tickets & Experiences'},
    {value: 'Toys & Hobbies', viewValue: 'Toys & Hobbies'},
    {value: 'Travel', viewValue: 'Travel'},
    {value: 'Video Games & Consoles', viewValue: 'Video Games & Consoles'}
  ];

  // thumb Label functions
  formatLabel(value: number) {
    switch (value) {
      case 0:
        return 'Broken';
        break;
      case 1:
        return 'Refurbished';
        break;
      case 2:
        return 'Used';
        break;
      case 3:
        return 'OpenBox';
        break;
      case 4:
        return 'New';
        break;
      default:
        return 'New';
        break;
    }
  }

  // ChipInput functions
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Only push more tags if not exceeding 3
    if (this.tags.length !== 3 && (value || '').trim()) {
      this.tags.push({name: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  // Post functions
  constructor(public imageCompress: NgxImageCompressService,public postsService: PostsService, public route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {

    this.price = new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]);

    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.post = this.postsService.getPost(this.postId);
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event){
    if((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files[0]){
      console.log("Create-post: %s has been chosen", (event.target as HTMLInputElement).files[0].name);
      var imageCount = (event.target as HTMLInputElement).files.length;
      for( let i = 0; i < imageCount; i ++){
        this.imageFile = (event.target as HTMLInputElement).files[i];
        const imageName = this.imageFile.name;
        const reader = new FileReader();
        reader.onload = () => {
          var imagePreview = reader.result as string;
          if(this.imageFile.size/(1024*1024) > 1)
          {
            this.isCompressed = true;
            this.imageCompress.compressFile(imagePreview, -1, 40, 40)
            .then(
              result =>{
                this.imgAfterCompressed = result;
                imagePreview = result;
                const imageBlob = this.dataURItoBlob(this.imgAfterCompressed.split(',')[1]);
                this.compressedFile = new File([imageBlob], imageName, {type: 'image/jpeg'});
              }
            )
          }
           this.imageUrls.push(imagePreview);
        };
        reader.readAsDataURL(this.imageFile);

      }
    }
    console.log(this.imageUrls);
  }

  onSavePost(form: NgForm) {
    console.log('FORM VALUE!!!');
    console.log(form.value);
    const postTags: string[] = [];
    // tslint:disable-next-line:only-arrow-functions
    this.tags.forEach(function(tag){
      postTags.push(tag.name);
    });
    console.log('TAG LIST!!!');
    console.log(postTags);
    if (form.invalid) {
        return;
      }
    if (this.mode === 'create') {
      // tslint:disable-next-line:max-line-length
        this.postsService.addPost(form.value.title, form.value.content, form.value.price, localStorage.getItem('username'),
          form.value.category, this.formatLabel(form.value.condition), postTags, 'available', 0);
      } else {
        this.postsService.updatePost(this.postId, form.value.title,
          form.value.content, form.value.price, localStorage.getItem('username'),
          form.value.category, this.formatLabel(form.value.condition), postTags, 'available', this.post.viewCount);
      }
    form.resetForm();
    this.router.navigate(['/']);
    }

    dataURItoBlob(dataURI){
      const byteString = window.atob(dataURI);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const int8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([int8Array], { type: 'image/jpeg' });
      return blob;
    }
  }


