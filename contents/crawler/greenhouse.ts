import dayjs from "dayjs"
import type { PlasmoCSConfig } from "plasmo"

import type { Education, WorkExperienceItem } from "~core/types"

import { executeSequentially, type ExecutableFunction } from "./utils/executor"
import mockData from '../../mocks/mock.json'

// 要求
/**
 * 1. 能够爬取到页面上所有的表单项
 *  - 整理表单项的label 和 表单的类型 type,如果是select 类型，获取到所有选项
 *  - 基础表单的类型包括文本框、下拉框
 *  - form list（education 信息（））包含基础的表单类型
 *  - 将所有的信息打印在console里
 *
 * 2. 能够将提供的 mock 的数据填入到表单中
 *
 * 3. 填充完成后统计完成情况。
 */

// 辅助方法：获取元素对应的标签文本并清理格式
const getLabelForElement = (element: HTMLElement) => {
  // 方法1：通过for属性关联的label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) {
      const text = label.textContent?.trim() || ""
      return cleanLabelText(text)
    }
  }

  // 方法2：直接包裹在label内的元素
  let parent = element.parentElement
  while (parent) {
    if (parent.tagName.toLowerCase() === "label") {
      const text = parent.textContent?.trim() || ""
      return cleanLabelText(text)
    }
    parent = parent.parentElement
  }

  // 方法3：查找前面的label元素
  let previousElement = element.previousElementSibling
  while (previousElement) {
    if (previousElement.tagName.toLowerCase() === "label") {
      const text = previousElement.textContent?.trim() || ""
      return cleanLabelText(text)
    }
    previousElement = previousElement.previousElementSibling
  }

  return null
}

const cleanLabelText = (text: string) => {
  return text
    .replace(/[\n\r*]/g, " ")      // 替换换行符和星号为空格
    .replace(/[^\w\s]/g, "")       // 移除所有非字母数字和空格的字符
    .replace(/\s+/g, " ")          // 合并连续空格
    .trim();                       // 去除首尾空格
}

type TRule = { label: string; type: string; options?: string[] }
export class GreenhouseAutoFill {
  formRules: TRule[]
  extractFields(): TRule[] {
    console.log("extractFields>>>>>")
    // TODO: 1. 实现提取字段的包含要求1里面的信息
    const result: TRule[] = []

    // 定义不同类型表单元素的选择器
    const formElementSelectors = [
      'input:not([type="hidden"])',
      "select",
      "textarea",
      'input[type="radio"]',
      'input[type="checkbox"]'
    ].join(", ")

    // 获取所有表单元素
    const formElements = document.querySelectorAll(formElementSelectors)

    // 用于存储已处理的单选按钮组，避免重复处理
    const processedRadioGroups = new Set<string>()

    formElements.forEach((element: any) => {
      // 获取元素的标签文本
      const label = getLabelForElement(element)
      if (!label) return

      // 处理不同类型的表单元素
      if (element instanceof HTMLInputElement) {
        if (element.type === "radio") {
          // 处理单选按钮组
          const radioGroupName = element.name
          if (radioGroupName && !processedRadioGroups.has(radioGroupName)) {
            processedRadioGroups.add(radioGroupName)
            const radioGroupOptions = Array.from(
              document.querySelectorAll(
                `input[type="radio"][name="${radioGroupName}"]`
              )
            ).map((radio: any) => {
              const radioLabel = getLabelForElement(radio) || radio.value
              return radioLabel
            })

            result.push({
              label,
              type: "radio",
              options: radioGroupOptions
            })
          }
        } else if (element.type === "checkbox") {
          // 处理复选框
          result.push({
            label,
            type: "checkbox"
          })
        } else {
          // 处理其他类型的输入框
          result.push({
            label,
            type: element.type || "text"
          })
        }
      } else if (element instanceof HTMLSelectElement) {
        // 处理下拉框
        const options = Array.from(element.options).map((option) => option.text)
        result.push({
          label,
          type: "select",
          options
        })
      } else if (element instanceof HTMLTextAreaElement) {
        // 处理文本区域
        result.push({
          label,
          type: "textarea"
        })
      }
    })
    this.formRules = result
    return result
  }

  async fillForm() {
    this.extractFields()
    console.log("this.formRules", this.formRules)
    console.log('mockData>>>', mockData)

    // TODO: 2. 结合extractFields 将 mock 数据填入到页面中
    // 实现 getFormElementExecutor 方法 生成每条执行的action
    const sequenceFuncCollector = []
    for (let rule of this.formRules) {
      const action = this.getFormElementExecutor(rule)
      const actions = Array.isArray(action) ? action : [action]
      sequenceFuncCollector.push(...actions)
    }

    await executeSequentially(...sequenceFuncCollector)
  }

  getFormElementExecutor(rule: TRule): ExecutableFunction[] {
    return []
  }

  handleFilledInfo() {
    // TODO: 3. 统计完成情况
  }

  // 填充时需要的一些基础方法
  fillInputTextField = async (
    element: HTMLInputElement | HTMLTextAreaElement
  ) => {
    // TODO: 实现填充输入文本字段的函数
  }

  fillSelectField = async (element: HTMLSelectElement) => {
    // TODO: 实现填充输入文本字段的函数
  }

  async fillEducation() {
    // TODO: 实现填充教育信息的函数
  }
}
