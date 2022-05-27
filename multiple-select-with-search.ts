import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  HostListener,
  ViewChild,
  ChangeDetectionStrategy,
  SimpleChanges
} from '@angular/core';
import { NgForm, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { debounceTime, distinctUntilChanged, pluck } from 'rxjs/operators';

@Component({
  selector: 'app-multi-select-with-search',
  templateUrl: './multi-select-with-search.component.html',
  styleUrls: ['./multi-select-with-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MultiSelectWithSearchComponent,
      multi: true
    }
  ]
})
export class MultiSelectWithSearchComponent implements  AfterViewInit, ControlValueAccessor {

  private wasInside = false;
  private originalOptions: any[] = [];
  isOpen = false;
  isDisable = false;
  selectedItem = '';
  selectedOptions = [];

  @Input() placeHolder: string;
  @Input() options: string[];
  @Input() customWidth = '';
  @ViewChild('searchForm')searchForm: NgForm;
  @Input() filterValue = "";

  @HostListener('click')
  clickInside(): void {
    this.wasInside = true;
  }

  @HostListener('document:click', ['$event'])
  close(event: MouseEvent): void {
    if (!this.wasInside) {
      this.isOpen = false;
    }
    this.wasInside = false;
  }

  onChanged: any = () => {};
  onTouched: any = () => {};

  constructor( ) { }

  writeValue(obj: any): void {

   if (obj === null){
     this.unSelectAll();
   }

   if (obj !== null && obj !== ''){
      obj?.forEach((item) => {
        this.updateSelection(item, this.originalOptions.indexOf(item));
      });
   }
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.selectedOptions.length > 0){
      this.selectedOptions.forEach((item)=>{
        if(this.options?.length > 0){
          this.options.splice(this.options.indexOf(item), 1);  
        } 
      });
    }
  }

  // ngOnInit(): void {
  //   console.log('', );
  // }

  ngAfterViewInit(): void {
    this.selectedItem = this.placeHolder;
    //this.selectedItem = this.filterValue == "" ? this.placeHolder : this.filterValue;
    this.options = this.options ? this.options : [];
    this.originalOptions = [...this.options];
    //console.log("filterValue: "+this.filterValue);
    const formValue = this.searchForm.valueChanges;
    formValue.pipe(
      pluck('search'),
      debounceTime(100),
      distinctUntilChanged()
     ).subscribe(term => this.search(term));
  }

  search(value: string): void {
    this.options = this.originalOptions.filter(
      option => {
        if(typeof option === 'string'){
          return option.toLowerCase().includes(value?.toLowerCase())
        }
      }
    );
  }

  toggle(): void {
    //this.ngZone.runOutsideAngular(() => {
      this.isOpen = !this.isOpen;
    //});
  }

  updateSelection(item, i): void{
   const notDuplicate = this.selectedOptions.includes(item);
   if(!notDuplicate){
      this.selectedOptions.push(item);
      const updatedOptions = this.options.filter(arrayItem => arrayItem !== item);
      this.options = updatedOptions;
      this.originalOptions.splice(this.originalOptions.indexOf(item), 1);
    }
   this.selectedItem = this.selectedOptions.length > 1 ? `${this.selectedOptions.length} Selected` : item;
   //this.selectedItem = this.filterValue == "" ? this.selectedItem : this.filterValue;
   this.onChanged(this.selectedOptions);
   this.onTouched();
  }

  removeSelection(item, i): void{
    const removedOptions = [ ...this.options, item];
    this.options = removedOptions.sort((a, b) => {
      return a.localeCompare(b, 'en', { sensitivity: 'base' });
    });
    this.originalOptions.push(item);
    this.selectedOptions.splice(i, 1);
    if (this.selectedOptions.length === 0){
      this.selectedItem = this.placeHolder;
    } else {
      this.selectedItem = this.selectedOptions.length > 1 ? `${this.selectedOptions.length} Selected` : this.selectedOptions[0];
    }
    //this.selectedItem = this.filterValue == "" ? this.selectedItem : this.filterValue;
    this.onChanged(this.selectedOptions);
    this.onTouched();
  }

  selectAll(): void{
    if (this.options.length === 0) { return; }
    this.options.forEach((item) => {
      this.selectedOptions.push(item);
      this.originalOptions.splice(this.originalOptions.indexOf(item), 1);
    });
    this.options = [];
    this.selectedItem = `${this.selectedOptions.length} Selected`;
    this.onChanged(this.selectedOptions);
    this.onTouched();
  }

  unSelectAll(): void{
    if (this.selectedOptions.length === 0) { return; }
    let updateOptionWithUnselected = [...this.originalOptions];
    this.selectedOptions.forEach((item, i) => {
      updateOptionWithUnselected.push(item);
      this.originalOptions.push(item);
    });
    this.options = updateOptionWithUnselected.sort((a, b) => {
      return a.localeCompare(b, 'en', { sensitivity: 'base' });
    });
    this.selectedOptions = [];
    this.selectedItem = this.placeHolder;
    this.onChanged(this.selectedOptions);
    this.onTouched();
  }

  identifySelected(index, item) {
    return item;
  }

  identifyList(index, item) {
    return item;
  }

}
