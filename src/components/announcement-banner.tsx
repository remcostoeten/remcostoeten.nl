"use client"

import * as React from "react"
import { ArrowUpRightIcon } from "lucide-react"
import {
  AnnouncementBanner,
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
  AnnouncementClose
} from "@/shared/primitives"
import { usePersistence } from "@/shared/primitives"

export function SiteAnnouncementBanner() {
  const announcement = usePersistence({
    id: "site-blog-announcement",
    storageType: "localStorage",
    autoShow: true,
    showDelay: 1000, // Show after 2 seconds
    maxDismissals: 5,
  })

  function handleClose() {
  announcement.dismiss()
  }

  return (
    <AnnouncementBanner
      isVisible={announcement.isVisible}
      position="top-center"
      draggable={true}
      hideOnScroll={true}
      scrollThreshold={500}
      hideAfterPixels={500}
      showAgain={100}
      onClose={handleClose}
    >
      <Announcement>
        <AnnouncementTag>Blog</AnnouncementTag>
        <AnnouncementTitle showIcon icon={<ArrowUpRightIcon size={16} />}>
          <span>Read about the over-engineering of my new site!</span>
        </AnnouncementTitle>
      </Announcement>
      <AnnouncementClose onClose={handleClose} />
    </AnnouncementBanner>
  )
}