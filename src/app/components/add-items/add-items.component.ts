import { Iitems } from './../../Interfaces/Iitems';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemsServiceService } from '../../Services/items-service.service';
import { IFormdata } from '../../Interfaces/Iformdata';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-items',
  standalone: true,
  imports: [ CommonModule , ReactiveFormsModule ,RouterLink ],
  templateUrl: './add-items.component.html',
  styleUrl: './add-items.component.css'
})
export class AddItemsComponent implements OnInit {
   Message:string =''
  isLoading:boolean=false;
  formdata!: IFormdata; 
  itemms:Iitems[] = [];
  companyList: { id: number; name: string }[] = []; 
  typeList: { id: number; name: string }[] = []; 
  unitsList: { id: number; name: string }[] = []; 

  constructor( private service:ItemsServiceService ,private HttpClien:HttpClient){}
  AddItemsForm:FormGroup = new FormGroup({
    companyId: new FormControl("" , [Validators.required]),
    typeId:new FormControl('' , [Validators.required,]),
    name: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: [this.uniqueItemNameValidator()],
      updateOn: 'blur' 
    }),
    sellingPrice:new FormControl(null , [ Validators.required , Validators.min(0)]),
    buyingPrice:new FormControl(null , [ Validators.required , Validators.min(0)] ),
    availableAmount:new FormControl(null , [ Validators.required , Validators.min(0)] ),
    unitId:new FormControl('',[Validators.required]),
    notes:new FormControl('')
  },{validators:this.PriceValidation()} );

  ngOnInit(): void {
    this.service.getFormData().subscribe({
      next: (response) => {
        this.formdata = response;
        this.companyList = this.formdata.companies;
        this.typeList = this.formdata.types;
        this.unitsList = this.formdata.units;
      },
      error: (error) => {
        console.error('Error fetching form data:', error);
      }
    });
  }

 


   //price custom  validators
    PriceValidation():ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const sellingPrice = control.get('sellingPrice')?.value;
      const buyingPrice = control.get('buyingPrice')?.value; 
      if(sellingPrice != null && buyingPrice != null) 
      {
        if (buyingPrice >= sellingPrice) {
          return { buyingPriceGreaterOrEqual: true };
        }
      }
    
      return null
   }

  }
   //unique VValidator
  uniqueItemNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null); 
      }

      return this.service.getAllItems().pipe(
        map(items => {
          this.itemms = items; 
          const itemNameExists = this.itemms.some(item => item.name === control.value);
          return itemNameExists ? { uniqueItemName: true } : null;
        }),
        catchError(() => of(null)) 
      );
    };
  }


  handelAdditem(AddItemsForm:FormGroup)
  {
   this.isLoading=true; 
   if (AddItemsForm.valid)
  {
    console.log(AddItemsForm.value);
    this.service.AddItem(AddItemsForm.value).subscribe({
      next:(res)=>
      {
         console.log(res)
        this.showMessage("Item Added Successfully ")
      } , error: (error) => {
        console.error('Error fetching form data:', error);
        this.showMessage("Error Adding Item !!!");
      }
    })
    this.isLoading=false; 
    this.AddItemsForm.reset({
      companyId: '',
      name:'',
      typeId: '',
      sellingPrice: null,
      buyingPrice: null,
      unitId:'',
      availableAmount:null,
      notes: ''
    });

  }

 }

 showMessage(message: string) {
  this.Message = message;
  setTimeout(() => {
    this.Message =''; 
  }, 2000); 
}


}
