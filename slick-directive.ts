
import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, Output, Renderer2, SimpleChange, SimpleChanges} from '@angular/core'  
@Directive({
    selector:'[appSlickSlider]'
})
export class SlickSliderDirective implements OnChanges, AfterViewInit{
    @Input() slideNumber;
    @Output() slideNumberChange = new EventEmitter<number>();
    
    isDragging = false 
    startPos = 0 
    currentTranslate = 0 
    prevTranslate = 0 
    animationID = 0 
    currentIndex = 0
    slides = []
    slideTrack;
    slideTrackWidth;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ){
        window.oncontextmenu = function (event) {
            event.preventDefault()
            event.stopPropagation()
            return false
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const { slideNumber } = changes;
        if (slideNumber.currentValue !== this.currentIndex) {
            this.changeSlide( slideNumber.currentValue);
        }
    }
  
    ngAfterViewInit(){
        this.slideTrack = this.elementRef.nativeElement.querySelector('.slide-track');
        this.slides = Array.from(this.elementRef.nativeElement.querySelectorAll('.slide'));
           
        this.slides.forEach((slide, index) => {  
             slide.style.width  = window.getComputedStyle(this.elementRef.nativeElement).width;    
                // Touch events
                slide.addEventListener('touchstart', this.touchStart(index).bind(this))
                slide.addEventListener('touchend', this.touchEnd.bind(this))
                slide.addEventListener('touchmove', this.touchMove.bind(this))
                // Mouse events
                slide.addEventListener('mousedown', this.touchStart(index).bind(this))
                slide.addEventListener('mouseup', this.touchEnd.bind(this))
                slide.addEventListener('mouseleave', this.touchEnd.bind(this))
                slide.addEventListener('mousemove', this.touchMove.bind(this))
          })

          this.slideTrackWidth = this.slides.reduce((acc, slide) =>{
                                    return acc + (+window.getComputedStyle(slide).width.slice(0, -2))
                                }, 0);
         
          this.slideTrack.style.width =  this.slideTrackWidth;
    }


    changeSlide(slideIndex){
        this.currentIndex = slideIndex;
        this.touchEnd()
    }

    touchStart(index) {

        return (event) => {
          this.currentIndex = index;
          if(event.type === "mousedown" || event.type === "mouseup" || event.type === "mouseleave" || event.type === "mousemove"){
            this.startPos = event.pageX;
          }else{
            this.startPos = event.changedTouches[0].clientX;
          }
          this.isDragging = true;
          this.slideTrack.style.transform = `translateX(${this.currentTranslate}px)`;

         //   this.elementRef.nativeElement.classList.add('grabbing')
        }
    }

    touchEnd(){
        this.isDragging = false
        const movedBy = this.currentTranslate - this.prevTranslate
      
        if (movedBy < -100 && this.currentIndex < this.slides.length - 1) this.currentIndex += 1
      
        if (movedBy > 100 && this.currentIndex > 0) this.currentIndex -= 1
        
        this.currentTranslate = this.currentIndex * -window.getComputedStyle(this.elementRef.nativeElement).width.slice(0, -2)
        this.prevTranslate = this.currentTranslate;

        if( this.slideTrack){
            this.slideTrack.style.transform = `translateX(${this.currentTranslate}px)`;
        }
        this.slideNumber = this.currentIndex ;
        this.slideNumberChange.emit(this.slideNumber);
        // this.elementRef.nativeElement.classList.remove('grabbing');                  
      }

      touchMove(event) {
        if (this.isDragging) {
        
            let currentPosition;

            if(event.type === "mousedown" || event.type === "mouseup" || event.type === "mouseleave" || event.type === "mousemove"){
                currentPosition = event.pageX;
            }else{
                currentPosition = event.changedTouches[0].clientX;
            }

          this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
        }
      }

}
