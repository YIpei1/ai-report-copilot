export const REPORT_BUSINESS_RULES = {
    inspectionResult: {
        standardValues: ['符合', '不符合'],
        passedValues: ['符合'],
        failedValues: ['不符合'],
        aiInstruction: '检测结果只能整理为“符合”或“不符合”',
    },
    instrumentStatus: {
        standardValues: ['可用', '不可用'],
        passedValues: ['可用'],
        failedValues: ['不可用'],
        aiInstruction: '仪器状态只能整理为“可用”或“不可用”',
    },
} as const

export type ReportBusinessRuleKey = keyof typeof REPORT_BUSINESS_RULES
export type ReportBusinessValueStatus = 'empty' | 'failed' | 'invalid' | 'passed'

// 根据统一业务用语判断填写值，供保存校验和后续 AI 输入标准共同使用。
export const validateReportBusinessValue = (
    ruleKey: ReportBusinessRuleKey,
    value: unknown,
): ReportBusinessValueStatus => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return 'empty'
    }

    const normalizedValue = value.trim()
    const rule = REPORT_BUSINESS_RULES[ruleKey]
    const standardValues = rule.standardValues as readonly string[]
    const failedValues = rule.failedValues as readonly string[]

    if (!standardValues.includes(normalizedValue)) {
        return 'invalid'
    }

    return failedValues.includes(normalizedValue) ? 'failed' : 'passed'
}
