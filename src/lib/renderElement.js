import { setupEventListeners, addEvent, removeEvent } from "./eventManager";
import { createElement, getElementEventHandlers } from "./createElement";
import { normalizeVNode } from "./normalizeVNode";
import { updateElement } from "./updateElement";

const previousVNodes = new WeakMap();

export function renderElement(vNode, container) {
  const normalizedVNode = normalizeVNode(vNode);

  const previousVNode = previousVNodes.get(container);

  if (previousVNode) {
    updateElement(container, normalizedVNode, previousVNode, 0);
  } else {
    container.innerHTML = "";
    const element = createElement(normalizedVNode);
    if (element) {
      if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        while (element.firstChild) {
          container.appendChild(element.firstChild);
        }
      } else {
        container.appendChild(element);
      }
    }
  }

  registerEventHandlers(container);

  setupEventListeners(container);

  previousVNodes.set(container, normalizedVNode);
}

function registerEventHandlers(container) {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT,
    null,
    false,
  );

  const allNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    allNodes.push(node);
  }

  allNodes.forEach((node) => {
    const eventHandlers = getElementEventHandlers(node);
    eventHandlers.forEach(({ eventType, handler }) => {
      removeEvent(node, eventType, handler);
    });
  });

  allNodes.forEach((node) => {
    const eventHandlers = getElementEventHandlers(node);
    eventHandlers.forEach(({ eventType, handler }) => {
      addEvent(node, eventType, handler);
    });
  });
}
