export function normalizeVNode(vNode) {
  console.log("normalizeVNode called with:", vNode);
  if (vNode === null) return "";

  switch (typeof vNode) {
    // 빈 문자열을 반환하는 케이스
    case "undefined":
      return "";
    case "boolean":
      return "";

    // 문자열로 변환하여 반환하는 케이스
    case "string":
      return vNode.toString();
    case "number":
      return vNode.toString();
  }

  if (vNode && typeof vNode === "object" && vNode.type) {
    if (typeof vNode.type === "function") {
      const result = vNode.type({ children: vNode.children, ...vNode.props });
      return normalizeVNode(result);
    }
  }

  const normalizedChildren = vNode.children
    .map((child) => normalizeVNode(child))
    .filter((child) => child);

  return {
    type: vNode.type,
    props: vNode.props,
    children: normalizedChildren,
  };
}
