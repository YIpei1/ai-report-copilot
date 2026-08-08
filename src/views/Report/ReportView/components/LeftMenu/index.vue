<!--
/**
* Author: YiPei
* Date: 2026-05-15 14:37
* Desc: LeftMenu
*/
-->
<template>
    <div class="left-menu-panel">
        <div class="left-menu-panel__header">
            <el-icon class="left-menu-panel__header-icon">
                <Folder />
            </el-icon>
            <span>文档结构</span>
        </div>
        <div class="left-menu-panel__content">
            <el-tree
                v-if="isTemplate"
                ref="treeRef"
                style="max-width: 600px"
                :allow-drop="allowDrop"
                :allow-drag="allowDrag"
                :current-node-key="currentNodeKey"
                :data="docData"
                :expand-on-click-node="false"
                draggable
                default-expand-all
                highlight-current
                node-key="id"
                @node-click="nodeClick"
                @node-drop="nodeDrop"
            />
            <el-tree
                v-else
                ref="treeRef"
                style="max-width: 600px"
                :current-node-key="currentNodeKey"
                :data="docData"
                :expand-on-click-node="false"
                default-expand-all
                highlight-current
                node-key="id"
                @node-click="nodeClickPDF"
            />
        </div>
    </div>
</template>

<script setup lang="ts" name="LeftMenu">
import type { AllowDropType, RenderContentContext, TreeInstance } from 'element-plus'
import { nextTick, ref, watch } from 'vue'
import type { DocumentChild, DocumentSection } from '../../types'

type Node = RenderContentContext['node']
type DocumentNode = DocumentSection | DocumentChild

const props = defineProps<{
    docData: DocumentSection[]
    selectMenuModelId: string
    isTemplate: boolean
}>()

const emit = defineEmits<{
    'update:docData': [value: DocumentSection[]]
    select: [id: string]
    selectPDF: [index: number]
}>()

const treeRef = ref<TreeInstance>()
const currentNodeKey = ref<string>('')
let syncingFromParent = false

// 固定节点不允许拖拽。
const allowDrag = (draggingNode: Node) => {
    return !draggingNode.data.fixed
}

const hasFixedNodeMoved = (beforeNodes: Node[], afterNodes: Node[]) => {
    return beforeNodes.some((node, index) => {
        if (!node.data.fixed) return false

        return afterNodes[index]?.data.id !== node.data.id
    })
}

const canSortWithoutMovingFixedNode = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
    const siblingNodes = draggingNode.parent?.childNodes || []
    const draggingIndex = siblingNodes.findIndex((node) => node.data.id === draggingNode.data.id)
    const dropIndex = siblingNodes.findIndex((node) => node.data.id === dropNode.data.id)

    if (draggingIndex === -1 || dropIndex === -1) return false

    const nextNodes = siblingNodes.filter((node) => node.data.id !== draggingNode.data.id)
    const nextDropIndex = nextNodes.findIndex((node) => node.data.id === dropNode.data.id)

    nextNodes.splice(type === 'prev' ? nextDropIndex : nextDropIndex + 1, 0, draggingNode)

    return !hasFixedNodeMoved(siblingNodes, nextNodes)
}

const canRemoveWithoutMovingFixedNode = (draggingNode: Node) => {
    const siblingNodes = draggingNode.parent?.childNodes || []
    const draggingIndex = siblingNodes.findIndex((node) => node.data.id === draggingNode.data.id)

    if (draggingIndex === -1) return false

    const nextNodes = siblingNodes.filter((node) => node.data.id !== draggingNode.data.id)

    return !hasFixedNodeMoved(siblingNodes, nextNodes)
}

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
    const draggingIsParent = draggingNode.level === 1
    const dropIsParent = dropNode.level === 1

    // 父级节点不能拖进其他节点内部。
    if (draggingIsParent && type === 'inner') {
        return false
    }

    // 子节点允许拖进父级节点。
    if (!draggingIsParent && dropIsParent && type === 'inner') {
        return canRemoveWithoutMovingFixedNode(draggingNode)
    }

    // 同一父级下的节点允许前后排序。
    if (draggingNode.parent === dropNode.parent && type !== 'inner') {
        return canSortWithoutMovingFixedNode(draggingNode, dropNode, type)
    }

    return false
}

const isParentNode = (data: DocumentNode): data is DocumentSection => {
    return 'children' in data
}

const getSectionPid = (section: DocumentSection) => {
    const sectionId = Number(section.id)

    return Number.isFinite(sectionId) ? sectionId : undefined
}

const normalizeSortByTreeOrder = (sections: DocumentSection[]) => {
    return sections.map((section, sectionIndex) => {
        const sectionPid = getSectionPid(section)

        return {
            ...section,
            sort: sectionIndex + 1,
            children: section.children.map((child, childIndex) => ({
                ...child,
                pid: sectionPid ?? child.pid,
                sort: childIndex + 1,
            })),
        }
    })
}

const nodeDrop = async () => {
    await nextTick()

    emit('update:docData', normalizeSortByTreeOrder(props.docData))
}

const nodeClick = (data: DocumentNode, node: Node) => {
    if (isParentNode(data)) {
        if (node.expanded) {
            node.collapse()
        } else {
            node.expand()
        }

        treeRef.value?.setCurrentKey(currentNodeKey.value)
        return
    }

    currentNodeKey.value = data.id
    treeRef.value?.setCurrentKey(data.id)
}
const nodeClickPDF = (data: DocumentNode) => {
    emit('selectPDF', Number(data.sort))
}
// 用户点击菜单时通知父组件发起滚动。
watch(currentNodeKey, (id) => {
    if (syncingFromParent || !id) return

    emit('select', id)
})

// 父组件同步高亮时不再 emit，避免滚动监听和菜单跳转互相触发。
watch(
    () => props.selectMenuModelId,
    async (id) => {
        syncingFromParent = true
        currentNodeKey.value = id

        await nextTick()

        treeRef.value?.setCurrentKey(id)
        syncingFromParent = false
    },
    {
        immediate: true,
    },
)
</script>

<style lang="scss" scoped>
.left-menu-panel {
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--header-border);

    &__header {
        display: flex;
        align-items: center;
        gap: $space-sm;
        height: $report-panel-header-height;
        padding: 0 14px;
        color: var(--text-primary);
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        background: var(--card-bg);
        border-bottom: 1px solid var(--header-border);
    }

    &__content {
        :deep(.el-tree) {
            height: 100%;
        }

        :deep(.el-tree-node__content) {
            height: 28px;
        }

        // 只保留真正选中的节点高亮，避免 hover/focus 看起来像第二个选中项。
        :deep(.el-tree-node__content:hover),
        :deep(.el-tree-node:focus > .el-tree-node__content) {
            background: transparent;
        }

        :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content),
        :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content:hover) {
            color: var(--status-info);
            background: var(--status-info-soft);
        }

        :deep(.el-text) {
            padding-left: 20px !important;
        }
    }

    &__header-icon {
        color: var(--icon-muted);
        font-size: $font-size-md;
    }

    &__sections {
        height: calc(100% - $report-panel-header-height);
        overflow-y: auto;
        padding: 6px 0 12px;
    }

    &__section {
        min-width: 0;
    }

    &__section-head,
    &__child {
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
        border: 0;
        background: transparent;
        color: var(--text-primary);
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    &__section-head {
        gap: 6px;
        height: 34px;
        padding: 0 10px 0 4px;
        font-size: 14px;
    }

    &__section-head:hover,
    &__child:hover {
        background: var(--surface-hover-bg);
    }

    &__arrow {
        flex: 0 0 auto;
        font-size: 12px;
        color: var(--text-primary);
        transition: transform 0.18s ease;

        &.is-expanded {
            transform: rotate(90deg);
        }
    }

    &__section-drag,
    &__child-drag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: grab;

        &:active {
            cursor: grabbing;
        }
    }

    &__section-drag.is-disabled {
        cursor: default;
    }

    &__folder {
        color: var(--status-info);
        font-size: $font-size-md;
    }

    &__section-title,
    &__child-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__children {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 0 8px 4px 48px;
    }

    &__child {
        gap: 6px;
        height: 28px;
        padding: 0 8px;
        border-radius: 6px;
        font-size: 13px;

        &.is-active {
            color: var(--status-info);
            background: var(--status-info-soft);
        }
    }

    &__child-icon {
        font-size: 14px;

        &.is-success {
            color: var(--status-success);
        }

        &.is-warning {
            color: var(--status-warning);
        }
    }
}

.left-menu-panel-collapse-enter-active,
.left-menu-panel-collapse-leave-active {
    overflow: hidden;
    transition:
        opacity 0.16s ease,
        transform 0.16s ease;
}

.left-menu-panel-collapse-enter-from,
.left-menu-panel-collapse-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
