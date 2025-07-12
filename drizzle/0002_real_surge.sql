CREATE INDEX `idx_blocks_page_order` ON `content_blocks` (`page_id`,`order`);--> statement-breakpoint
CREATE INDEX `idx_segments_block_order` ON `content_segments` (`block_id`,`order`);