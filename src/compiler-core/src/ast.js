import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export const NodeTypes = {
  INTERPOLATION: 0,
  SIMPLE_EXPRESSION: 1,
  ELEMENT: 2,
  TEXT: 3,
  ROOT: 4,
  COMPOUND_EXPRESSION: 5,
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
