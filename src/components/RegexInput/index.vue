<template>
    <el-input
        v-bind="$attrs"
        :model-value="modelValue"
        :type="currentRule.type"
        :maxlength="currentRule.maxlength || 50"
        :show-password="currentRule.type === 'password'"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
    name: 'RegexInput',
    inheritAttrs: false,
})

type InputFormat = 'phone' | 'email' | 'password' | 'idCard' | 'custom'

interface InputRule {
    regex: RegExp
    maxlength?: number
    type: 'text' | 'password'
}

type CustomRule = Partial<InputRule> & Pick<InputRule, 'regex'>

const props = withDefaults(
    defineProps<{
        modelValue?: string
        format?: InputFormat
        customRule?: CustomRule
    }>(),
    {
        modelValue: '',
        format: 'phone',
        customRule: undefined,
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const rules: Record<InputFormat, InputRule> = {
    phone: {
        regex: /\D/g,
        maxlength: 11,
        type: 'text',
    },
    email: {
        regex: /[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g,
        type: 'text',
    },
    password: {
        regex: /[^\x21-\x7E]/g,
        type: 'password',
    },
    idCard: {
        regex: /[^\dXx]/g,
        maxlength: 18,
        type: 'text',
    },
    custom: {
        regex: /$^/g,
        type: 'text',
    },
}

const currentRule = computed<InputRule>(() => {
    if (props.format !== 'custom' || !props.customRule) {
        return rules[props.format]
    }

    return {
        type: 'text',
        ...props.customRule,
    }
})

const handleInput = (value: string) => {
    emit('update:modelValue', value.replace(currentRule.value.regex, ''))
}
</script>
