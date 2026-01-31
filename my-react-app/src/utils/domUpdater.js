/**
 * 智能 DOM 更新工具 - 避免闪烁
 * 只更新变化的部分，而不是重新渲染整个 DOM
 */

/**
 * 比较并更新 DOM 节点
 * @param {HTMLElement} oldNode - 旧节点
 * @param {HTMLElement} newNode - 新节点
 */
function morphNode(oldNode, newNode) {
  // 如果节点类型不同，直接替换
  if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
    oldNode.parentNode?.replaceChild(newNode.cloneNode(true), oldNode);
    return;
  }

  // 文本节点：比较并更新内容
  if (oldNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.nodeValue !== newNode.nodeValue) {
      oldNode.nodeValue = newNode.nodeValue;
    }
    return;
  }

  // 元素节点：更新属性
  if (oldNode.nodeType === Node.ELEMENT_NODE) {
    // 更新属性
    const oldAttrs = oldNode.attributes;
    const newAttrs = newNode.attributes;

    // 添加或更新新属性
    for (let i = 0; i < newAttrs.length; i++) {
      const attr = newAttrs[i];
      if (oldNode.getAttribute(attr.name) !== attr.value) {
        oldNode.setAttribute(attr.name, attr.value);
      }
    }

    // 删除旧属性
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const attr = oldAttrs[i];
      if (!newNode.hasAttribute(attr.name)) {
        oldNode.removeAttribute(attr.name);
      }
    }

    // 递归更新子节点
    morphChildren(oldNode, newNode);
  }
}

/**
 * 更新子节点
 * @param {HTMLElement} oldParent - 旧父节点
 * @param {HTMLElement} newParent - 新父节点
 */
function morphChildren(oldParent, newParent) {
  const oldChildren = Array.from(oldParent.childNodes);
  const newChildren = Array.from(newParent.childNodes);

  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!oldChild && newChild) {
      // 新增节点
      oldParent.appendChild(newChild.cloneNode(true));
    } else if (oldChild && !newChild) {
      // 删除节点
      oldParent.removeChild(oldChild);
    } else if (oldChild && newChild) {
      // 更新节点
      morphNode(oldChild, newChild);
    }
  }
}

/**
 * 智能更新 HTML 内容
 * @param {HTMLElement} container - 容器元素
 * @param {string} newHtml - 新的 HTML 字符串
 */
export function updateHtmlContent(container, newHtml) {
  if (!container) return;

  // 如果内容相同，不做任何操作
  if (container.innerHTML === newHtml) return;

  // 创建临时容器解析新 HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = newHtml;

  // 使用 morphdom 算法更新
  morphChildren(container, tempContainer);
}

/**
 * 平滑更新 HTML（带过渡效果）
 * @param {HTMLElement} container - 容器元素
 * @param {string} newHtml - 新的 HTML 字符串
 */
export function smoothUpdateHtml(container, newHtml) {
  if (!container) return;

  // 使用 requestAnimationFrame 确保在下一帧更新
  requestAnimationFrame(() => {
    updateHtmlContent(container, newHtml);
  });
}