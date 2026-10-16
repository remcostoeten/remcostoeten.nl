import type { ComponentType, ReactNode } from 'react'
import type { AnimatedIconProps } from '@/components/animated-icons/icon-frame'
import { AnimatedAlertIcon } from '@/components/animated-icons/icons/alert'
import { AnimatedAlertCircleIcon } from '@/components/animated-icons/icons/alert-circle'
import { AnimatedArchiveIcon } from '@/components/animated-icons/icons/archive'
import { AnimatedArrowRightIcon } from '@/components/animated-icons/icons/arrow-right'
import { AnimatedAttachmentIcon } from '@/components/animated-icons/icons/attachment'
import { AnimatedBellIcon } from '@/components/animated-icons/icons/bell'
import { AnimatedBoardIcon } from '@/components/animated-icons/icons/board'
import { AnimatedCalendarIcon } from '@/components/animated-icons/icons/calendar'
import { AnimatedCheckIcon } from '@/components/animated-icons/icons/check'
import { AnimatedCheckCircleIcon } from '@/components/animated-icons/icons/check-circle'
import { AnimatedClockIcon } from '@/components/animated-icons/icons/clock'
import { AnimatedCloseIcon } from '@/components/animated-icons/icons/close'
import { AnimatedCommentIcon } from '@/components/animated-icons/icons/comment'
import { AnimatedContrastIcon } from '@/components/animated-icons/icons/contrast'
import { AnimatedCopyIcon } from '@/components/animated-icons/icons/copy'
import { AnimatedDashboardIcon } from '@/components/animated-icons/icons/dashboard'
import { AnimatedDetailPanelIcon } from '@/components/animated-icons/icons/detail-panel'
import { AnimatedDownloadIcon } from '@/components/animated-icons/icons/download'
import { AnimatedEditIcon } from '@/components/animated-icons/icons/edit'
import { AnimatedFilterIcon } from '@/components/animated-icons/icons/filter'
import { AnimatedFlagIcon } from '@/components/animated-icons/icons/flag'
import { AnimatedHeartIcon } from '@/components/animated-icons/icons/heart'
import { AnimatedInboxIcon } from '@/components/animated-icons/icons/inbox'
import { AnimatedInfoIcon } from '@/components/animated-icons/icons/info'
import { AnimatedKeyIcon } from '@/components/animated-icons/icons/key'
import { AnimatedLayersIcon } from '@/components/animated-icons/icons/layers'
import { AnimatedLinkIcon } from '@/components/animated-icons/icons/link'
import { AnimatedListIcon } from '@/components/animated-icons/icons/list'
import { AnimatedLoadingIcon } from '@/components/animated-icons/icons/loading'
import { AnimatedLockIcon } from '@/components/animated-icons/icons/lock'
import { AnimatedMailIcon } from '@/components/animated-icons/icons/mail'
import { AnimatedMonitorIcon } from '@/components/animated-icons/icons/monitor'
import { AnimatedMoreIcon } from '@/components/animated-icons/icons/more'
import { AnimatedPlusIcon } from '@/components/animated-icons/icons/plus'
import { AnimatedProjectIcon } from '@/components/animated-icons/icons/project'
import { AnimatedRefreshIcon } from '@/components/animated-icons/icons/refresh'
import { AnimatedRoadmapIcon } from '@/components/animated-icons/icons/roadmap'
import { AnimatedSearchIcon } from '@/components/animated-icons/icons/search'
import { AnimatedSettingsIcon } from '@/components/animated-icons/icons/settings'
import { AnimatedShieldIcon } from '@/components/animated-icons/icons/shield'
import { AnimatedSidebarIcon } from '@/components/animated-icons/icons/sidebar'
import { AnimatedStarIcon } from '@/components/animated-icons/icons/star'
import { AnimatedTagIcon } from '@/components/animated-icons/icons/tag'
import { AnimatedTrashIcon } from '@/components/animated-icons/icons/trash'
import { AnimatedUserIcon } from '@/components/animated-icons/icons/user'

export type IconEntry = {
	id: string
	name: string
	summary: string
	hugeicon: string
	component: string
	Icon: ComponentType<AnimatedIconProps>
	state?: {
		label: string
		prop: string
		render: (on: boolean, props: AnimatedIconProps) => ReactNode
	}
}

export const iconEntries: readonly IconEntry[] = [
	{
		id: 'check',
		name: 'Check',
		summary: 'Tick nods',
		hugeicon: 'tick-02',
		component: 'AnimatedCheckIcon',
		Icon: AnimatedCheckIcon
	},
	{
		id: 'plus',
		name: 'Plus',
		summary: 'Cross turns into place',
		hugeicon: 'add-01',
		component: 'AnimatedPlusIcon',
		Icon: AnimatedPlusIcon
	},
	{
		id: 'search',
		name: 'Search',
		summary: 'Lens scans, handle redraws',
		hugeicon: 'search-01',
		component: 'AnimatedSearchIcon',
		Icon: AnimatedSearchIcon
	},
	{
		id: 'trash',
		name: 'Trash',
		summary: 'Lid lifts, slots redraw',
		hugeicon: 'delete-02',
		component: 'AnimatedTrashIcon',
		Icon: AnimatedTrashIcon
	},
	{
		id: 'bell',
		name: 'Bell',
		summary: 'Body rings, clapper lags',
		hugeicon: 'notification-01',
		component: 'AnimatedBellIcon',
		Icon: AnimatedBellIcon,
		state: {
			label: 'Notification',
			prop: 'hasNotification',
			render: (on, props) => (
				<AnimatedBellIcon hasNotification={on} {...props} />
			)
		}
	},
	{
		id: 'settings',
		name: 'Settings',
		summary: 'Knobs slide past each other',
		hugeicon: 'settings-04',
		component: 'AnimatedSettingsIcon',
		Icon: AnimatedSettingsIcon
	},
	{
		id: 'calendar',
		name: 'Calendar',
		summary: 'Rings hop, days pop in',
		hugeicon: 'calendar-03',
		component: 'AnimatedCalendarIcon',
		Icon: AnimatedCalendarIcon
	},
	{
		id: 'roadmap',
		name: 'Roadmap',
		summary: 'Bars slide along the axis',
		hugeicon: 'gantt-chart',
		component: 'AnimatedRoadmapIcon',
		Icon: AnimatedRoadmapIcon
	},
	{
		id: 'star',
		name: 'Star',
		summary: 'Rocks and swells, fill springs in',
		hugeicon: 'star',
		component: 'AnimatedStarIcon',
		Icon: AnimatedStarIcon,
		state: {
			label: 'Filled',
			prop: 'filled',
			render: (on, props) => <AnimatedStarIcon filled={on} {...props} />
		}
	},
	{
		id: 'inbox',
		name: 'Inbox',
		summary: 'Tray dips, box gives',
		hugeicon: 'inbox',
		component: 'AnimatedInboxIcon',
		Icon: AnimatedInboxIcon
	},
	{
		id: 'arrow-right',
		name: 'Arrow right',
		summary: 'Head pushes, shaft stretches',
		hugeicon: 'arrow-right-02',
		component: 'AnimatedArrowRightIcon',
		Icon: AnimatedArrowRightIcon
	},
	{
		id: 'copy',
		name: 'Copy',
		summary: 'Sheets fan apart',
		hugeicon: 'copy-01',
		component: 'AnimatedCopyIcon',
		Icon: AnimatedCopyIcon
	},
	{
		id: 'filter',
		name: 'Filter',
		summary: 'Knobs slide along tracks',
		hugeicon: 'filter-horizontal',
		component: 'AnimatedFilterIcon',
		Icon: AnimatedFilterIcon
	},
	{
		id: 'close',
		name: 'Close',
		summary: 'Cross turns a quarter',
		hugeicon: 'cancel-01',
		component: 'AnimatedCloseIcon',
		Icon: AnimatedCloseIcon
	},
	{
		id: 'more',
		name: 'More',
		summary: 'Dots wave',
		hugeicon: 'more-horizontal',
		component: 'AnimatedMoreIcon',
		Icon: AnimatedMoreIcon
	},
	{
		id: 'edit',
		name: 'Edit',
		summary: 'Pencil scribbles',
		hugeicon: 'pencil-edit-02',
		component: 'AnimatedEditIcon',
		Icon: AnimatedEditIcon
	},
	{
		id: 'user',
		name: 'User',
		summary: 'Leans over to look',
		hugeicon: 'user',
		component: 'AnimatedUserIcon',
		Icon: AnimatedUserIcon
	},
	{
		id: 'archive',
		name: 'Archive',
		summary: 'Trays settle into the box',
		hugeicon: 'archive-02',
		component: 'AnimatedArchiveIcon',
		Icon: AnimatedArchiveIcon
	},
	{
		id: 'tag',
		name: 'Tag',
		summary: 'Swings on its hole',
		hugeicon: 'tag-01',
		component: 'AnimatedTagIcon',
		Icon: AnimatedTagIcon
	},
	{
		id: 'link',
		name: 'Link',
		summary: 'Links pull apart and snap back',
		hugeicon: 'link-01',
		component: 'AnimatedLinkIcon',
		Icon: AnimatedLinkIcon
	},
	{
		id: 'clock',
		name: 'Clock',
		summary: 'Hands sweep',
		hugeicon: 'clock-01',
		component: 'AnimatedClockIcon',
		Icon: AnimatedClockIcon
	},
	{
		id: 'flag',
		name: 'Flag',
		summary: 'Cloth waves from the pole',
		hugeicon: 'flag-02',
		component: 'AnimatedFlagIcon',
		Icon: AnimatedFlagIcon
	},
	{
		id: 'comment',
		name: 'Comment',
		summary: 'Bubble pops, dots type',
		hugeicon: 'bubble-chat',
		component: 'AnimatedCommentIcon',
		Icon: AnimatedCommentIcon
	},
	{
		id: 'attachment',
		name: 'Attachment',
		summary: 'Clip dangles from its top bend',
		hugeicon: 'attachment-01',
		component: 'AnimatedAttachmentIcon',
		Icon: AnimatedAttachmentIcon
	},
	{
		id: 'refresh',
		name: 'Refresh',
		summary: 'Loop half-turns',
		hugeicon: 'reload',
		component: 'AnimatedRefreshIcon',
		Icon: AnimatedRefreshIcon
	},
	{
		id: 'check-circle',
		name: 'Check circle',
		summary: 'Mark redraws from 60%',
		hugeicon: 'checkmark-circle-02',
		component: 'AnimatedCheckCircleIcon',
		Icon: AnimatedCheckCircleIcon
	},
	{
		id: 'info',
		name: 'Info',
		summary: 'Bar stretches, dot hops after',
		hugeicon: 'information-circle',
		component: 'AnimatedInfoIcon',
		Icon: AnimatedInfoIcon
	},
	{
		id: 'warning',
		name: 'Warning',
		summary: 'Triangle wobbles',
		hugeicon: 'alert-02',
		component: 'AnimatedAlertIcon',
		Icon: AnimatedAlertIcon
	},
	{
		id: 'error',
		name: 'Error',
		summary: 'Ring presses, bar slams, dot pops',
		hugeicon: 'alert-circle',
		component: 'AnimatedAlertCircleIcon',
		Icon: AnimatedAlertCircleIcon
	},
	{
		id: 'loading',
		name: 'Loading',
		summary: 'Always ticks round',
		hugeicon: 'loading-03',
		component: 'AnimatedLoadingIcon',
		Icon: AnimatedLoadingIcon
	},
	{
		id: 'list',
		name: 'List',
		summary: 'Rows step right in turn',
		hugeicon: 'left-to-right-list-bullet',
		component: 'AnimatedListIcon',
		Icon: AnimatedListIcon
	},
	{
		id: 'board',
		name: 'Board',
		summary: 'Columns lift in turn',
		hugeicon: 'kanban',
		component: 'AnimatedBoardIcon',
		Icon: AnimatedBoardIcon
	},
	{
		id: 'dashboard',
		name: 'Dashboard',
		summary: 'Tiles lift in turn',
		hugeicon: 'dashboard-square-01',
		component: 'AnimatedDashboardIcon',
		Icon: AnimatedDashboardIcon
	},
	{
		id: 'project',
		name: 'Project',
		summary: 'Flap swings open',
		hugeicon: 'folder-02',
		component: 'AnimatedProjectIcon',
		Icon: AnimatedProjectIcon
	},
	{
		id: 'layers',
		name: 'Layers',
		summary: 'Layers lift in turn',
		hugeicon: 'layers-01',
		component: 'AnimatedLayersIcon',
		Icon: AnimatedLayersIcon
	},
	{
		id: 'sidebar',
		name: 'Sidebar',
		summary: 'Rail slides out and back',
		hugeicon: 'sidebar-left',
		component: 'AnimatedSidebarIcon',
		Icon: AnimatedSidebarIcon
	},
	{
		id: 'detail-panel',
		name: 'Detail panel',
		summary: 'Rail slides out and back',
		hugeicon: 'sidebar-right',
		component: 'AnimatedDetailPanelIcon',
		Icon: AnimatedDetailPanelIcon
	},
	{
		id: 'lock',
		name: 'Lock',
		summary: 'Shackle lifts, keyhole blinks',
		hugeicon: 'square-lock-02',
		component: 'AnimatedLockIcon',
		Icon: AnimatedLockIcon
	},
	{
		id: 'mail',
		name: 'Mail',
		summary: 'Flap flips open, then shuts',
		hugeicon: 'mail-01',
		component: 'AnimatedMailIcon',
		Icon: AnimatedMailIcon
	},
	{
		id: 'key',
		name: 'Key',
		summary: 'Turns in the lock',
		hugeicon: 'key-01',
		component: 'AnimatedKeyIcon',
		Icon: AnimatedKeyIcon
	},
	{
		id: 'monitor',
		name: 'Monitor',
		summary: 'Screen breathes, stand dips',
		hugeicon: 'computer',
		component: 'AnimatedMonitorIcon',
		Icon: AnimatedMonitorIcon
	},
	{
		id: 'shield',
		name: 'Shield',
		summary: 'Shield gives, mark redraws',
		hugeicon: 'shield-01',
		component: 'AnimatedShieldIcon',
		Icon: AnimatedShieldIcon
	},
	{
		id: 'contrast',
		name: 'Contrast',
		summary: 'Dark half turns over',
		hugeicon: 'contrast',
		component: 'AnimatedContrastIcon',
		Icon: AnimatedContrastIcon
	},
	{
		id: 'download',
		name: 'Download',
		summary: 'Arrow drops into the tray',
		hugeicon: 'download-04',
		component: 'AnimatedDownloadIcon',
		Icon: AnimatedDownloadIcon
	},
	{
		id: 'heart',
		name: 'Heart',
		summary: 'Tilts and beats, fill springs in',
		hugeicon: 'favourite',
		component: 'AnimatedHeartIcon',
		Icon: AnimatedHeartIcon,
		state: {
			label: 'Filled',
			prop: 'filled',
			render: (on, props) => <AnimatedHeartIcon filled={on} {...props} />
		}
	}
]
