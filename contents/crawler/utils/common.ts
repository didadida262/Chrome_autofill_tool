/*
 * @Description: 通用工具
 * @Author: didadida262
 * @Date: 2025-06-04 09:34:56
 * @LastEditors: didadida262
 * @LastEditTime: 2025-06-04 17:13:42
 */

import mockDataA from '../../../mocks/4689953007.json'

export const getTargetVal = (label: string) => {
  const targetItem = mockDataA.filter((item) => item.name === label)[0]
  return targetItem?targetItem.value:null
}

export const getFirstTextNode = (element: HTMLElement): string => {
  // 遍历元素的直接子节点
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    
    // 如果是文本节点且不为空
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      return text
    }
  }
}
export const isInMock = (label: string) => {
  const labels = mockDataA.map((item) => item.name).filter((i) => i)
  return labels.includes(label)
}

export const getLabelForElement = (element: HTMLElement) => {
  // 格式1：名称为兄弟节点且为<label></label>包裹
  let previousElement = element.previousElementSibling
  let parent = element.parentNode
  while (previousElement) {
    if (previousElement.tagName.toLowerCase() === "label") {
      const text = previousElement.textContent?.trim() || ""
      return cleanLabelText(text)
    }
    // 格式2:label包裹本身
    else if (parent instanceof HTMLElement && parent.tagName.toLowerCase() === 'label') {
      const text = getFirstTextNode(parent)
      return cleanLabelText(text)
    }
    previousElement = previousElement.previousElementSibling
  }
  return null
}
// 清洁函数
export const cleanLabelText = (text: string) => {
  return text
    .replace(/[\n\r*]/g, " ") // 替换换行符和星号为空格
    .replace(/\s+/g, " ") // 合并连续空格
    .trim() // 去除首尾空格
}