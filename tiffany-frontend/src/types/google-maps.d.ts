/**
 * Google Maps API Type Declarations
 * Extends Window interface to include google.maps
 */

declare global {
  interface Window {
    google?: {
      maps?: {
        Map?: any;
        Marker?: any;
        InfoWindow?: any;
        LatLng?: any;
        LatLngBounds?: any;
        Polyline?: any;
        Polygon?: any;
        Circle?: any;
        Rectangle?: any;
        Autocomplete?: any;
        AutocompleteService?: any;
        PlacesService?: any;
        PlaceService?: any;
        GeocoderService?: any;
        DirectionsService?: any;
        DistanceMatrixService?: any;
        OverlayView?: any;
        StreetViewPanorama?: any;
        event?: any;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

export {};
