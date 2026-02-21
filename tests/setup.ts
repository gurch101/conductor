import { GlobalWindow } from 'happy-dom';

const window = new GlobalWindow();

Object.assign(global, {
  window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
  Node: window.Node,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  Event: window.Event,
  CustomEvent: window.CustomEvent,
});
