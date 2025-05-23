require('@testing-library/jest-dom');

// Add TextDecoder and TextEncoder to the global scope for tests
const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Only set up DOM mocks if we're in a DOM environment
const isDOMEnvironment = typeof window !== 'undefined';

if (isDOMEnvironment) {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock window.URL.createObjectURL
  Object.defineProperty(global.URL, 'createObjectURL', {
    writable: true,
    value: jest.fn(),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  global.IntersectionObserver = MockIntersectionObserver;
}

// Universal mocks (work in both environments)
// Mock mapbox-gl
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    remove: jest.fn(),
    addControl: jest.fn(),
    getCanvas: jest.fn(() => ({
      style: {},
    })),
    getBounds: jest.fn(() => ({
      getCenter: jest.fn(() => ({ lat: 0, lng: 0 })),
      getNorthEast: jest.fn(() => ({ lat: 1, lng: 1 })),
      getSouthWest: jest.fn(() => ({ lat: -1, lng: -1 })),
    })),
    flyTo: jest.fn(),
    getZoom: jest.fn(() => 10),
    setCenter: jest.fn(),
    setZoom: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  Marker: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    setPopup: jest.fn().mockReturnThis(),
    togglePopup: jest.fn(),
  })),
  Popup: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setHTML: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
}));

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    asPath: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(param => null),
    has: jest.fn(() => false),
    getAll: jest.fn(() => []),
    forEach: jest.fn(),
    entries: jest.fn(() => []),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    toString: jest.fn(() => ''),
  })),
  useParams: jest.fn(() => ({})),
}));