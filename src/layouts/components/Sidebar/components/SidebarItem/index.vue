<template>
    <div class="sidebar-tree-item" :class="{ 'sidebar-tree-item--collapsed': collapsed }">
        <button
            class="sidebar-tree-item__button"
            :class="{
                'sidebar-tree-item__button--active': isExactActive,
                'sidebar-tree-item__button--open': hasChildren && isOpen,
                'sidebar-tree-item__button--parent-active': hasChildren && isActiveBranch,
            }"
            :style="buttonStyle"
            :title="collapsed ? item.title : undefined"
            type="button"
            :aria-expanded="hasChildren ? isOpen : undefined"
            @click="handleClick"
        >
            <el-icon v-if="item.icon" class="sidebar-tree-item__icon">
                <component :is="item.icon" />
            </el-icon>
            <span v-else class="sidebar-tree-item__badge">{{ item.badge }}</span>

            <span v-show="!collapsed" class="sidebar-tree-item__title">{{ item.title }}</span>
            <span v-if="hasChildren && !collapsed" class="sidebar-tree-item__arrow" />
        </button>

        <Transition name="sidebar-tree-item-children">
            <div v-if="hasChildren && isOpen" class="sidebar-tree-item__children">
                <SidebarItem
                    v-for="child in item.children"
                    :key="child.path"
                    :active-path="activePath"
                    :collapsed="collapsed"
                    :depth="depth + 1"
                    :item="child"
                    :opened-paths="openedPaths"
                    @navigate="$emit('navigate', $event)"
                    @toggle="$emit('toggle', $event)"
                />
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts" name="SidebarItem">
import { computed } from 'vue'

import type { LayoutMenuItem } from '@/hooks/useLayoutMenus'

const props = defineProps<{
    activePath: string
    collapsed: boolean
    depth: number
    item: LayoutMenuItem
    openedPaths: string[]
}>()

const emit = defineEmits<{
    navigate: [path: string]
    toggle: [path: string]
}>()

const hasChildren = computed(() => props.item.children.length > 0)
const isOpen = computed(() => props.openedPaths.includes(props.item.path))
const isExactActive = computed(() => props.item.path === props.activePath)
const buttonStyle = computed(() => ({
    '--sidebar-depth': props.depth,
}))

const hasActiveChild = (item: LayoutMenuItem): boolean => {
    return item.children.some((child) => child.path === props.activePath || hasActiveChild(child))
}

const isActiveBranch = computed(() => {
    return isExactActive.value || hasActiveChild(props.item)
})

const handleClick = (): void => {
    if (hasChildren.value) {
        emit('toggle', props.item.path)
        return
    }

    emit('navigate', props.item.path)
}
</script>

<style scoped lang="scss">
.sidebar-tree-item {
    display: grid;
    gap: $space-xs;
    min-width: 0;
}

.sidebar-tree-item__button {
    display: grid;
    grid-template-columns: $sidebar-menu-icon-size minmax(0, 1fr) $font-size-sm;
    gap: $space-sm;
    align-items: center;
    width: 100%;
    height: $sidebar-menu-item-height;
    padding: 0 $space-sm 0 calc($space-sm + var(--sidebar-depth) * $space-md);
    color: var(--sidebar-text-muted);
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: $radius-md;
    transition:
        color $transition-fast ease,
        background-color $transition-fast ease,
        transform $transition-fast ease;
}

.sidebar-tree-item__button:hover {
    color: var(--sidebar-text);
    background: var(--sidebar-hover-bg);
}

.sidebar-tree-item__button--active {
    color: var(--sidebar-text);
    background: var(--sidebar-active-bg);
}

.sidebar-tree-item__button--open {
    color: var(--sidebar-text);
}

.sidebar-tree-item__icon {
    width: $sidebar-menu-icon-size;
    height: $sidebar-menu-icon-size;
    font-size: $font-size-md;
}

.sidebar-tree-item__badge {
    display: inline-grid;
    width: $sidebar-menu-icon-size;
    height: $sidebar-menu-icon-size;
    font-size: $font-size-xs;
    line-height: 1;
    color: var(--sidebar-text);
    background: var(--sidebar-hover-bg);
    border-radius: $radius-md;
    place-items: center;
}

.sidebar-tree-item__title {
    min-width: 0;
    overflow: hidden;
    font-size: $font-size-sm;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sidebar-tree-item__arrow {
    justify-self: center;
    width: 7px;
    height: 7px;
    border-right: 1.5px solid currentcolor;
    border-bottom: 1.5px solid currentcolor;
    transform: rotate(45deg);
    transition: transform $transition-fast ease;
}

.sidebar-tree-item__button--open .sidebar-tree-item__arrow {
    transform: rotate(225deg);
}

.sidebar-tree-item__children {
    display: grid;
    gap: $space-xs;
    overflow: hidden;
}

.sidebar-tree-item--collapsed .sidebar-tree-item__button {
    grid-template-columns: 1fr;
    justify-items: center;
    padding: 0;
}

.sidebar-tree-item-children-enter-active,
.sidebar-tree-item-children-leave-active {
    transition:
        opacity $transition-fast ease,
        transform $transition-fast ease,
        max-height $transition-normal ease;
}

.sidebar-tree-item-children-enter-from,
.sidebar-tree-item-children-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-4px);
}

.sidebar-tree-item-children-enter-to,
.sidebar-tree-item-children-leave-from {
    max-height: $sidebar-submenu-max-height;
    opacity: 1;
    transform: translateY(0);
}
</style>
