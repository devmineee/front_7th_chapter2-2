import { removeEvent } from "./eventManager";
import {
  createElement,
  getElementEventHandlers,
  elementEventHandlers,
} from "./createElement.js";

function updateAttributes(target, newProps, oldProps) {
  const allProps = new Set([
    ...(newProps ? Object.keys(newProps) : []),
    ...(oldProps ? Object.keys(oldProps) : []),
  ]);

  allProps.forEach((key) => {
    if (key.startsWith("on")) {
      return;
    }

    const newValue = newProps ? newProps[key] : undefined;
    const oldValue = oldProps ? oldProps[key] : undefined;

    if (newValue === oldValue) {
      return;
    }

    if (newValue === undefined || newValue === null) {
      if (key === "className") {
        target.removeAttribute("class");
      } else {
        target.removeAttribute(key);
      }
      if (key in target) {
        target[key] = "";
      }
    } else {
      if (key === "className") {
        target.setAttribute("class", newValue);
      } else if (key.startsWith("data-")) {
        target.setAttribute(key, newValue);
      } else if (typeof newValue === "boolean") {
        if (newValue) {
          target.setAttribute(key, "");
          target[key] = true;
        } else {
          target.removeAttribute(key);
          target[key] = false;
        }
      } else {
        target.setAttribute(key, newValue);
        if (key in target) {
          target[key] = newValue;
        }
      }
    }
  });
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && !oldNode) {
    return;
  }

  if (!oldNode && newNode) {
    const element = createElement(newNode);
    if (element) {
      if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        while (element.firstChild) {
          if (index < parentElement.childNodes.length) {
            parentElement.insertBefore(
              element.firstChild,
              parentElement.childNodes[index],
            );
          } else {
            parentElement.appendChild(element.firstChild);
          }
          index++;
        }
      } else {
        if (index < parentElement.childNodes.length) {
          parentElement.insertBefore(element, parentElement.childNodes[index]);
        } else {
          parentElement.appendChild(element);
        }
      }
    }
    return;
  }

  if (oldNode && !newNode) {
    if (index < parentElement.childNodes.length) {
      parentElement.removeChild(parentElement.childNodes[index]);
    }
    return;
  }

  if (newNode && oldNode) {
    if (newNode.type !== oldNode.type) {
      const newElement = createElement(newNode);
      if (newElement && index < parentElement.childNodes.length) {
        parentElement.replaceChild(newElement, parentElement.childNodes[index]);
      }
      return;
    }

    if (index < parentElement.childNodes.length) {
      const currentElement = parentElement.childNodes[index];

      if (currentElement.nodeType === Node.TEXT_NODE) {
        if (typeof newNode === "string" || typeof newNode === "number") {
          currentElement.textContent = String(newNode);
        }
        return;
      }

      if (currentElement.nodeType === Node.ELEMENT_NODE) {
        const oldEventHandlers = getElementEventHandlers(currentElement);
        oldEventHandlers.forEach(({ eventType, handler }) => {
          removeEvent(currentElement, eventType, handler);
        });

        const newEventHandlers = [];
        if (newNode.props) {
          Object.keys(newNode.props).forEach((key) => {
            if (
              key.startsWith("on") &&
              typeof newNode.props[key] === "function"
            ) {
              const eventType = key.slice(2).toLowerCase();
              newEventHandlers.push({ eventType, handler: newNode.props[key] });
            }
          });
        }
        if (newEventHandlers.length > 0) {
          elementEventHandlers.set(currentElement, newEventHandlers);
        } else {
          elementEventHandlers.delete(currentElement);
        }

        updateAttributes(currentElement, newNode.props, oldNode.props);

        const newChildren = newNode.children || [];
        const oldChildren = oldNode.children || [];
        const maxLength = Math.max(newChildren.length, oldChildren.length);

        for (let i = 0; i < maxLength; i++) {
          updateElement(currentElement, newChildren[i], oldChildren[i], i);
        }
      }
    }
  }
}
