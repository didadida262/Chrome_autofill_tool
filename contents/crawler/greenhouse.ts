
import dayjs from "dayjs"
import type { PlasmoCSConfig } from "plasmo"

import { getLabelForElement, getTargetVal, isInMock } from "./utils/common"
import { executeSequentially, type ExecutableFunction } from "./utils/executor"
import type { Education, WorkExperienceItem } from "~core/types"

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
const originData = []

type TRule = { label: string; type: string; options?: string[] }
export class GreenhouseAutoFill {
  formRules: TRule[]
  extractFields(): TRule[] {
    // TODO: 1. 实现提取字段的包含要求1里面的信息
    const result: TRule[] = []
    const formElementSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="number"]',
      'input[type="password"]',
      "select",
      "textarea"
    ].join(", ")

    // 获取所有表单元素
    const formElements = document.querySelectorAll(formElementSelectors)
    // 用于存储已处理的单选按钮组，避免重复处理
    const processedRadioGroups = new Set<string>()
    formElements.forEach((element: any) => {
      // 获取元素的标签文本
      const label = getLabelForElement(element)
      if (!label) return
      // 针对field的所有输入框、选择框，需要单独处理
      if (!isInMock(label)) return
      if (element.parentElement.parentElement.tagName.toLowerCase() === 'fieldset') {
        // 教育信息
        console.log('educations>>>>')
      }else if (element instanceof HTMLInputElement) {
        if (element.className.includes("select")) return
        result.push({
          label,
          type: element.type || "text"
        })
        originData.push({
          label,
          type: element.type || "text",
          dom: element
        })
        
      } else if (element instanceof HTMLSelectElement) {
        // 处理下拉框
        const options = Array.from(element.options).filter((item) => item.value).map((option) => option.value &&option.text)
        result.push({
          label,
          type: "select",
          options
        })
        originData.push({
          label,
          type: "select",
          options,
          dom: element
        })
      } else if (element instanceof HTMLTextAreaElement) {
        // 处理文本区域
        result.push({
          label,
          type: "textarea"
        })
        originData.push({
          label,
          type: "textarea",
          dom: element
        })
      }
    })
    this.formRules = [...result]
    console.log('this.formRules>>>>', this.formRules)
    return result
  }

   fillText (item)  {
      item.dom.value = getTargetVal(item.label)
   }
   fillSelect(item)  {
    const value = getTargetVal(item.label)[0]
     const parentNode = item.dom.parentNode
     if (!parentNode) return
     const valueContainer = parentNode.querySelector('.select2-container');
     if (!valueContainer) return
     const aTag = valueContainer.querySelectorAll('a')[0]; // 返回 NodeList
     if (!aTag) return
     const tar = aTag.querySelector('.select2-chosen');
     tar.textContent = value
  }

  async fillForm() {
    // TODO: 2. 结合extractFields 将 mock 数据填入到页面中
    // 实现 getFormElementExecutor 方法 生成每条执行的action
    this.extractFields() 
    originData.forEach((item) => {
      if (item.type === 'text') {
        this.fillText(item)
      } else if (item.type === 'select') {
        this.fillSelect(item)
      }
   })
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
    // 获取dom值，跟真实值匹配
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
