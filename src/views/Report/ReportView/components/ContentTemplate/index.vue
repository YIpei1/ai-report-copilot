<template>
    <div ref="containerRef" class="template-page">
        <div
            v-for="item in renderTemplates"
            :key="item.id"
            class="template-page-item"
            :data-template-id="item.id"
        >
            <component
                :is="templateMap[getTemplateId(item)]"
                v-model="item.data"
                @move-instruments-to-add-page="
                    (rows: InspectionInstrumentRow[]) => moveInstrumentsToAddPage(item.id, rows)
                "
                @delete-template-page="deleteTemplatePage(item.id)"
            />
        </div>
    </div>
</template>

<script setup lang="ts" name="ContentTemplate">
import type { Component } from 'vue'
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { DocumentChild, DocumentSection } from '../../types'

const props = defineProps<{
    activeId: string
    scrollTargetId: string
    scrollRequestKey: number
    modelValue: DocumentSection[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: DocumentSection[]]
    'active-change': [id: string]
}>()

const containerRef = ref<HTMLElement | null>(null)

type InspectionInstrumentRow = {
    rowKey: number
    sequence: string
    name: string
    code: string
    status: string
}

type InspectionConditionData = {
    instruments: InspectionInstrumentRow[]
}

const modules = import.meta.glob('./components/*/index.vue')
const templateMap = Object.fromEntries(
    Object.entries(modules).map(([path, loader]) => {
        const name = path.split('/').at(-2) || ''

        return [name, defineAsyncComponent(loader as () => Promise<{ default: Component }>)]
    }),
) as Record<string, Component>

const templateList = computed(() => {
    return props.modelValue.flatMap((section) => section.children)
})

const renderTemplates = computed(() => {
    const currentIndex = templateList.value.findIndex((item) => item.id === props.activeId)

    if (currentIndex === -1) {
        return templateList.value.slice(0, 5)
    }

    const start = Math.max(0, currentIndex - 2)
    const end = Math.min(templateList.value.length, currentIndex + 3)

    return templateList.value.slice(start, end)
})

const getTemplateId = (item: DocumentChild) => {
    return item.templateId || item.id
}

const isInspectionConditionPage = (item: DocumentChild) => {
    return (
        item.id === 'InspectionConditionModel' || item.templateId === 'InspectionConditionAddModel'
    )
}

const createAddPageId = (children: DocumentChild[]) => {
    let index = 1

    while (children.some((child) => child.id === `InspectionConditionAddModel_${index}`)) {
        index += 1
    }

    return `InspectionConditionAddModel_${index}`
}

const getNextSort = (children: DocumentChild[]) => {
    const maxSort = children.reduce((max, child) => {
        return Math.max(max, Number.isFinite(child.sort) ? child.sort : 0)
    }, 0)

    return maxSort + 1
}

const createInspectionConditionAddChild = (
    children: DocumentChild[],
    pid: number,
): DocumentChild => {
    const addPageCount = children.filter(
        (child) => child.templateId === 'InspectionConditionAddModel',
    ).length

    return {
        label: `检测仪器设备续页${addPageCount + 1}`,
        fixed: false,
        id: createAddPageId(children),
        templateId: 'InspectionConditionAddModel',
        pid,
        sort: getNextSort(children),
        data: {
            instruments: [],
        },
    } as DocumentChild
}

const isEmptyInstrumentRow = (row: InspectionInstrumentRow) => {
    return !row.sequence && !row.name && !row.code && !row.status
}

const appendRowsBeforeEmptyRows = (
    sourceRows: InspectionInstrumentRow[],
    rows: InspectionInstrumentRow[],
) => {
    const filledRows = sourceRows.filter((row) => !isEmptyInstrumentRow(row))
    const existingKeys = new Set(filledRows.map((row) => row.rowKey))
    const appendRows = rows.filter((row) => !existingKeys.has(row.rowKey))

    return [...filledRows, ...appendRows]
}

const moveInstrumentsToAddPage = (sourceId: string, rows: InspectionInstrumentRow[]) => {
    if (!rows.length) return

    const nextValue = props.modelValue.map((section) => {
        const sourceIndex = section.children.findIndex((child) => child.id === sourceId)
        if (sourceIndex === -1 || !isInspectionConditionPage(section.children[sourceIndex]!))
            return section

        const children = [...section.children]
        const nextChild = children[sourceIndex + 1]
        const targetIndex =
            nextChild?.templateId === 'InspectionConditionAddModel'
                ? sourceIndex + 1
                : children.splice(
                      sourceIndex + 1,
                      0,
                      createInspectionConditionAddChild(children, Number(section.id)),
                  ) && sourceIndex + 1

        const targetChild = children[targetIndex]!
        const targetData = (targetChild.data || {
            instruments: [],
        }) as InspectionConditionData

        children[targetIndex] = {
            ...targetChild,
            data: {
                ...targetData,
                instruments: appendRowsBeforeEmptyRows(targetData.instruments || [], rows),
            },
        } as DocumentChild

        return {
            ...section,
            children,
        }
    })

    emit('update:modelValue', nextValue)
}

const renameInspectionAddPages = (children: DocumentChild[]) => {
    let addPageIndex = 1

    return children.map((child) => {
        if (child.templateId !== 'InspectionConditionAddModel') return child

        const renamedChild = {
            ...child,
            label: `检测仪器设备续页${addPageIndex}`,
        }

        addPageIndex += 1

        return renamedChild as DocumentChild
    })
}

const deleteTemplatePage = (id: string) => {
    const nextValue = props.modelValue.map((section) => {
        const target = section.children.find((child) => child.id === id)

        if (target?.templateId !== 'InspectionConditionAddModel') {
            return section
        }

        return {
            ...section,
            children: renameInspectionAddPages(section.children.filter((child) => child.id !== id)),
        }
    })

    emit('update:modelValue', nextValue)
}

let observer: IntersectionObserver | null = null
let scrollTimer: ReturnType<typeof window.setTimeout> | null = null
let isProgrammaticScroll = false

const createObserver = async () => {
    await nextTick()

    observer?.disconnect()

    if (!containerRef.value) return

    observer = new IntersectionObserver(
        (entries) => {
            if (isProgrammaticScroll) return

            const visibleEntries = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

            const current = visibleEntries[0]
            if (!current) return

            const id = (current.target as HTMLElement).dataset.templateId
            if (id && id !== props.activeId) {
                emit('active-change', id)
            }
        },
        {
            root: containerRef.value,
            threshold: [0.6],
        },
    )

    const pageEls = containerRef.value.querySelectorAll<HTMLElement>('.template-page-item')

    pageEls.forEach((el) => {
        observer?.observe(el)
    })
}

watch(
    renderTemplates,
    () => {
        createObserver()
    },
    {
        immediate: true,
        flush: 'post',
    },
)

watch(
    () => [props.scrollTargetId, props.scrollRequestKey] as const,
    async ([id]) => {
        if (!id) return

        await nextTick()

        const el = containerRef.value?.querySelector<HTMLElement>(`[data-template-id="${id}"]`)
        if (!el) return

        isProgrammaticScroll = true

        if (scrollTimer) {
            window.clearTimeout(scrollTimer)
        }

        el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })

        scrollTimer = window.setTimeout(() => {
            isProgrammaticScroll = false
        }, 500)
    },
)

onBeforeUnmount(() => {
    observer?.disconnect()

    if (scrollTimer) {
        window.clearTimeout(scrollTimer)
    }
})
</script>

<style lang="scss" scoped>
.template-page {
    height: calc(100vh - $report-panel-header-height);
    padding: 40px 0;
    overflow-y: scroll;
    background: var(--report-workspace-bg);
}
</style>
