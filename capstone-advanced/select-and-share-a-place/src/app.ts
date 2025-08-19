import axios from 'axios';

const form = document.querySelector('form')!;
const addressInput = document.getElementById('address')! as HTMLInputElement;

// google maps api key for geocoding requests
const GOOGLE_API_KEY = 'KEY';

// type definition for google geocoding api response
type GoogleGeocodingResponse = {
  results: { geometry: { location: { lat: number; lng: number } } }[];
  status: 'OK' | 'ZERO_RESULTS';
};

// handles form submission to search for address and display map
function searchAddressHandler(event: Event) {
  event.preventDefault();
  // get the entered address from the input field
  const enteredAddress = addressInput.value;

  // make api request to google geocoding service
  axios
    .get<GoogleGeocodingResponse>(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
        enteredAddress
      )}&key=${GOOGLE_API_KEY}`
    )
    .then(response => {
      // check if geocoding was successful
      if (response.data.status !== 'OK') {
        throw new Error('Could not fetch location!');
      }

      // extract coordinates from response
      const coordinates = response.data.results[0].geometry.location;
      // create new google map centered on the coordinates
      const map = new google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          center: coordinates,
          zoom: 16,
        }
      );

      // add marker at the searched location
      new google.maps.Marker({ position: coordinates, map: map });
    })
    .catch(err => {
      // show error message to user and log error
      alert(err.message);
      console.log(err);
    });
}

// attach event listener to form for handling submissions
form.addEventListener('submit', searchAddressHandler);
