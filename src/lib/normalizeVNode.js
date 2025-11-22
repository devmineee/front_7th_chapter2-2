export function normalizeVNode(vNode) {
  if (vNode === null) return "";

  switch (typeof vNode) {
    case "undefined":
      return "";
    case "boolean":
      return "";
    case "string":
      return vNode.toString();
    case "number":
      return vNode.toString();
  }

  if (vNode && typeof vNode === "object" && vNode.type) {
    if (typeof vNode.type === "function") {
      const props = vNode.props || {};
      const result = vNode.type({ children: vNode.children, ...props });
      return normalizeVNode(result);
    }

    const children = vNode.children || [];
    const normalizedChildren = children
      .map((child) => normalizeVNode(child))
      .filter((child) => {
        if (
          child === "" ||
          child === null ||
          child === undefined ||
          child === false ||
          child === true
        ) {
          return false;
        }
        return true;
      });

    return {
      type: vNode.type,
      props: vNode.props,
      children: normalizedChildren,
    };
  }

  return "";
}
