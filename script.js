'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout{

      date = new Date();
      id = (Date.now() + '').slice(-10); 

    constructor(coords,distance,duration){
        this.coords = coords;
        this.distance = distance;  // in km
        this.duration = duration;   // in min
    }

    _setDescription() {

        // prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  this.description =  `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}
  ${this.date.getDate()}`;

    }

 
}

class Running extends Workout{
       
    type = 'running';
    constructor(coords,distance,duration,cadence){
        
        super(coords,distance,duration);
        this.cadence = cadence;

        this.calcPace();
        this._setDescription();  /*through the scope chain this method get access of the all the method
        of the parent class and another reason of this method declaring here is that the type is not declered in the
        parent class and we are using it there so get the acess of the type we
        are calling it from here. */
    }
     
        /* we can call any method of the object in the constructor
        this keyword point to the current object */  
      
  
      calcPace() {
  
          // min/km
  
          this.pace = this.duration / this.distance;
          return this.pace;
         
}
}

class Cycling extends Workout{
       type = 'cycling';
     constructor(coords,distance,duration,elevationGain){

        super(coords,distance,duration);
        this.elevationGain = elevationGain;
       this.calcSpeed();
       this._setDescription();
    }



   calcSpeed() {

    this.speed = this.distance/(this.duration/60);
    return this.speed;
}
}



////////////////////////////////////////////////////////
// Application architecture
class App{

    //they are the data memeber of this class or property of class
      #map;
      #mapEvent;  // '#' means that we are making these arrays private
      #workouts = [];
   
      constructor(){
    
    //get user posiyion
     this._getPosition();

    //get data from the local storage
    this._getLocalStorage();
/*  when we press the enter key at at the form
this piece of code display the marker at 
the clicked location of the map.
*/ 
 form.addEventListener('submit', this._newWorkout.bind(this));
  inputType.addEventListener('change',this._toggleElevationField);
   
}

    _getPosition(){

/* 1. this function try to access the location of the user
if he donot get the location then 'could not get the location msg apper'
other wise the function do following task
*/
if(navigator.geolocation)
 navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function () {
        alert('Could not get your position');
    }
 );

}

       _loadMap(position){
            const { latitude } = position.coords;
            const { longitude} = position.coords;
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    
    
            const coords = [latitude, longitude]
    
            this.#map = L.map('map').setView(coords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
      
    
         /*2.  when we click on the map mapEvent become equal to mapE
            when we click on the map we perform a DOM operation here and
            remove the hidden from the form which means that when we click on the
            map a form is going to apper.
            */
    
        this.#map.on('click', this._showForm.bind(this));
        
        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
          });
    
     }


     _hideForm() {
        // Empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
          '';
    
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
      }

    _showForm(mapE) {

        this.#mapEvent = mapE;  
        form.classList.remove('hidden');
        inputDistance.focus();

    }

    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

       /*  here we create our own event listener when the user click
    on the map a marker is going to appear at the click location
    L is a class that has marker method that popup the marker
    at the clicked location.
    L.marker creater the marker and .addTo(map) add it to the map
    
    */

    _newWorkout(e) {

          const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
          const allPositive = (...inputs) => inputs.every(inp => inp > 0);
          /*  this function can take any number of inputs and return true if
           every input inserted is true. */

         e.preventDefault(); 

        //get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
 

     

       // if workout running creat running class
         if(type === 'running'){
              const cadence = +inputCadence.value;

        // check if enterd data in form is valid
         if(//!Number.isFinite(distance) ||
            // !Number.isFinite(duration)|| 
            //!Number.isFinite(cadence)) * below written function do all the work that therse three or statement do
            !validInputs(distance,duration,cadence) || !allPositive(distance,duration,cadence)) return alert('Inputs have to be positive number!');

           workout = new Running({lat,lng},distance,duration,cadence);
          
         }
       
         // if workout cycling, create cycling class
         if(type === 'cycling'){
             const elevation = +inputElevation.value;


         // check if enterd data in form is valid
         if(//!Number.isFinite(distance) ||
            // !Number.isFinite(duration)|| 
            //!Number.isFinite(cadence)) * below written function do all the work that therse three or statement do
            !validInputs(distance,duration,elevation) || !allPositive(distance,duration)) return alert('Inputs have to be positive number!');
          workout = new Cycling({lat,lng},distance,duration,elevation);
          
        }


       
        // add new object to workout array
       this.#workouts.push(workout);
       console.log(workout);
       
       // render workout on map as marker
       this._renderWorkoutMarker(workout);
      
      // render workout on the list
      this._renderWorkout(workout);
       
      // hide form and clear tge input feilds
       this._hideForm();

      //set local storage to all workout
      this._setLocalStorage();

       
          

    }

    _renderWorkoutMarker(workout) {          
    
             L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();


    }

    _renderWorkout(workout){

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        `;

        if(workout.type === 'running'){
            html += `
              <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
             </div>
            <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
             </div>
            </li>
            `;
    }
            
            if(workout.type == 'cycling'){

                html += `
                <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
                `;



            }

        form.insertAdjacentHTML('afterend',html);
    }

    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
      }

      _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
    
        if (!data) return;
    
        this.#workouts = data;
    
        this.#workouts.forEach(work => {
          this._renderWorkout(work);
        });
      }

      reset(){

        localStorage.removeItem('workouts');
        location.reload();

      }
}

const app = new App();





