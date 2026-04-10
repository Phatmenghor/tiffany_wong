/**
 * Google Maps API Type Declarations
 * Extends Window interface to include google.maps
 */

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement | null, options?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng | undefined;
      setZoom(zoom: number): void;
      getZoom(): number;
      panTo(latlng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      fitBounds(bounds: LatLngBounds): void;
      setOptions(options: MapOptions): void;
      getProjection(): Projection | undefined;
      [key: string]: any;
    }

    class Marker {
      constructor(options?: MarkerOptions);
      setPosition(latlng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng | undefined;
      setTitle(title: string): void;
      setMap(map: Map | null): void;
      [key: string]: any;
    }

    class InfoWindow {
      constructor(options?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string | Node): void;
      [key: string]: any;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      [key: string]: any;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): void;
      contains(latLng: LatLng): boolean;
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
      [key: string]: any;
    }

    class Geocoder {
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
      [key: string]: any;
    }

    namespace places {
      class Autocomplete {
        constructor(inputElement: HTMLInputElement, options?: AutocompleteOptions);
        getPlace(): PlaceResult;
        setBounds(bounds: LatLngBounds): void;
        setComponentRestrictions(restrictions: ComponentRestrictions): void;
        setFields(fields: string[]): void;
        setOptions(options: AutocompleteOptions): void;
        [key: string]: any;
      }

      class AutocompleteService {
        getPlacePredictions(request: AutocompletionRequest, callback: (predictions: AutocompletePrediction[], status: PlacesServiceStatus) => void): void;
        [key: string]: any;
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult, status: PlacesServiceStatus) => void): void;
        nearbySearch(request: NearbySearchRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void;
        textSearch(request: TextSearchRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void;
        [key: string]: any;
      }
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    }

    enum PlacesServiceStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR',
      NOT_FOUND = 'NOT_FOUND',
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      maxZoom?: number;
      minZoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      scrollwheel?: boolean;
      draggable?: boolean;
      [key: string]: any;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string;
      label?: string;
      [key: string]: any;
    }

    interface InfoWindowOptions {
      content?: string | Node;
      position?: LatLng | LatLngLiteral;
      [key: string]: any;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      [key: string]: any;
    }

    interface GeocoderResult {
      address_components?: any[];
      formatted_address?: string;
      geometry?: {
        bounds?: LatLngBounds;
        location?: LatLng;
        location_type?: string;
        viewport?: LatLngBounds;
      };
      place_id?: string;
      types?: string[];
      [key: string]: any;
    }

    interface AutocompleteOptions {
      bounds?: LatLngBounds;
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      types?: string[];
      [key: string]: any;
    }

    interface ComponentRestrictions {
      country?: string | string[];
      [key: string]: any;
    }

    interface AutocompletionRequest {
      bounds?: LatLngBounds;
      componentRestrictions?: ComponentRestrictions;
      input: string;
      language?: string;
      offset?: number;
      origin?: LatLng | LatLngLiteral;
      radius?: number;
      sessionToken?: any;
      types?: string[];
      [key: string]: any;
    }

    interface AutocompletePrediction {
      description: string;
      main_text: string;
      matched_substrings: any[];
      place_id: string;
      secondary_text?: string;
      types: string[];
      [key: string]: any;
    }

    interface PlaceDetailsRequest {
      placeId?: string;
      fields?: string[];
      [key: string]: any;
    }

    interface NearbySearchRequest {
      bounds?: LatLngBounds;
      keyword?: string;
      language?: string;
      location?: LatLng | LatLngLiteral;
      name?: string | string[];
      openNow?: boolean;
      pagetoken?: string;
      radius?: number;
      type?: string;
      [key: string]: any;
    }

    interface TextSearchRequest {
      bounds?: LatLngBounds;
      language?: string;
      location?: LatLng | LatLngLiteral;
      openNow?: boolean;
      pagetoken?: string;
      query: string;
      radius?: number;
      region?: string;
      [key: string]: any;
    }

    interface PlaceResult {
      address_component?: any[];
      adr_address?: string;
      business_status?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      geometry?: {
        bounds?: LatLngBounds;
        location?: LatLng;
        location_type?: string;
        viewport?: LatLngBounds;
      };
      icon?: string;
      international_phone_number?: string;
      name?: string;
      opening_hours?: {
        open_now?: boolean;
        periods?: any[];
        weekday_text?: string[];
      };
      photos?: any[];
      place_id?: string;
      plus_code?: {
        compound_code?: string;
        global_code?: string;
      };
      types?: string[];
      url?: string;
      utc_offset?: number;
      vicinity?: string;
      website?: string;
      [key: string]: any;
    }

    interface Projection {
      fromLatLngToPoint(latLng: LatLng): { x: number; y: number };
      fromPointToLatLng(point: { x: number; y: number }): LatLng;
    }

    namespace event {
      function addListener(instance: any, eventName: string, handler: Function): any;
      function addListenerOnce(instance: any, eventName: string, handler: Function): any;
      function removeListener(listener: any): void;
      function removeListeners(instance: any, eventName: string): void;
      function clearListeners(instance: any): void;
    }
  }
}

declare global {
  interface Window {
    google?: typeof google;
  }
}

export {};
