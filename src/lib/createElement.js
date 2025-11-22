export const elementEventHandlers = new WeakMap();

export function getElementEventHandlers(element) {
  return elementEventHandlers.get(element) || [];
}

export function createElement(vNode) {
  if (
    vNode === null ||
    vNode === undefined ||
    vNode === false ||
    vNode === true
  ) {
    return document.createTextNode("");
  }

  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(String(vNode));
  }

  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      const element = createElement(child);
      if (element) {
        fragment.appendChild(element);
      }
    });
    return fragment;
  }

  if (vNode && typeof vNode === "object" && vNode.type) {
    if (typeof vNode.type === "function") {
      throw new Error("컴포넌트는 정규화 후 createElement로 생성해야 합니다.");
    }

    const element = document.createElement(vNode.type);

    const eventHandlers = [];
    if (vNode.props) {
      Object.keys(vNode.props).forEach((key) => {
        if (key.startsWith("on") && typeof vNode.props[key] === "function") {
          const eventType = key.slice(2).toLowerCase();
          eventHandlers.push({ eventType, handler: vNode.props[key] });
        }
      });
    }
    if (eventHandlers.length > 0) {
      elementEventHandlers.set(element, eventHandlers);
    }

    updateAttributes(element, vNode.props);

    const children = vNode.children || [];
    children.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) {
        element.appendChild(childElement);
      }
    });

    return element;
  }

  return document.createTextNode("");
}

function updateAttributes($el, props) {
  if (!props) return;

  Object.keys(props).forEach((key) => {
    if (key.startsWith("on")) {
      return;
    }

    if (key === "className") {
      $el.setAttribute("class", props[key]);
      return;
    }

    if (key.startsWith("data-")) {
      $el.setAttribute(key, props[key]);
      return;
    }

    if (typeof props[key] === "boolean") {
      if (key === "checked" || key === "selected") {
        $el[key] = props[key];
      } else {
        if (props[key]) {
          $el.setAttribute(key, "");
          $el[key] = true;
        } else {
          $el.removeAttribute(key);
          $el[key] = false;
        }
      }
      return;
    }

    $el.setAttribute(key, props[key]);
    if (key in $el) {
      $el[key] = props[key];
    }
  });
}
