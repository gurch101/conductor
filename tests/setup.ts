import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow();
(global as any).window = window;
(global as any).document = window.document;
(global as any).navigator = window.navigator;
(global as any).location = window.location;
(global as any).Node = window.Node;
(global as any).Element = window.Element;
(global as any).HTMLElement = window.HTMLElement;
(global as any).Event = window.Event;
(global as any).CustomEvent = window.CustomEvent;
