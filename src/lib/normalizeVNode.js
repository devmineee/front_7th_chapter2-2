export function normalizeVNode(vNode) {
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

  // vNode 객체인 경우
  if (vNode && typeof vNode === "object" && vNode.type) {
    // type이 함수(컴포넌트)인 경우
    if (typeof vNode.type === "function") {
      // props를 전달하여 컴포넌트 실행
      const result = vNode.type(vNode.props || {});
      // 실행 결과를 재귀적으로 정규화
      return normalizeVNode(result);
    }

    // type이 문자열(HTML 태그)인 경우
    // children을 재귀적으로 정규화하고 falsy 값 필터링
    const normalizedChildren = (vNode.children || [])
      .map((child) => normalizeVNode(child))
      .filter((child) => {
        // falsy 값 필터링 (빈 문자열, null, undefined, false, true 제거)
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
}
