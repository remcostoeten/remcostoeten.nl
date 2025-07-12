"use server";

import { createPagesFactory, createBlocksFactory, createSegmentsFactory } from "./factories";

export async function createPageAction(data: { slug: string; title: string; description?: string }) {
  const pagesFactory = createPagesFactory();
  
  try {
    const newPage = await pagesFactory.create(data);
    return { success: true, data: newPage };
  } catch (error) {
    console.error("Failed to create page:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function readPageAction(slug: string) {
  const pagesFactory = createPagesFactory();
  
  try {
    const page = await pagesFactory.read(slug);
    return { success: true, data: page };
  } catch (error) {
    console.error("Failed to read page:", error);
    return { success: false, error: "Failed to read page" };
  }
}

export async function updatePageAction(id: string, data: { title?: string; description?: string; isPublished?: boolean }) {
  const pagesFactory = createPagesFactory();
  
  try {
    const updatedPage = await pagesFactory.update(id, data);
    return { success: true, data: updatedPage };
  } catch (error) {
    console.error("Failed to update page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

export async function deletePageAction(id: string) {
  const pagesFactory = createPagesFactory();
  
  try {
    await pagesFactory.destroy(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete page:", error);
    return { success: false, error: "Failed to delete page" };
  }
}

export async function createBlockAction(data: { pageId: string; blockType: string; order: number }) {
  const blocksFactory = createBlocksFactory();
  
  try {
    const newBlock = await blocksFactory.create(data);
    return { success: true, data: newBlock };
  } catch (error) {
    console.error("Failed to create block:", error);
    return { success: false, error: "Failed to create block" };
  }
}

export async function readBlockAction(id: string) {
  const blocksFactory = createBlocksFactory();
  
  try {
    const block = await blocksFactory.read(id);
    return { success: true, data: block };
  } catch (error) {
    console.error("Failed to read block:", error);
    return { success: false, error: "Failed to read block" };
  }
}

export async function updateBlockAction(id: string, data: { blockType?: string; order?: number }) {
  const blocksFactory = createBlocksFactory();
  
  try {
    const updatedBlock = await blocksFactory.update(id, data);
    return { success: true, data: updatedBlock };
  } catch (error) {
    console.error("Failed to update block:", error);
    return { success: false, error: "Failed to update block" };
  }
}

export async function deleteBlockAction(id: string) {
  const blocksFactory = createBlocksFactory();
  
  try {
    await blocksFactory.destroy(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete block:", error);
    return { success: false, error: "Failed to delete block" };
  }
}

export async function createSegmentAction(data: {
  blockId: string;
  order: number;
  text: string;
  type: string;
  href?: string;
  target?: string;
  className?: string;
  style?: string;
  metadata?: string;
}) {
  const segmentsFactory = createSegmentsFactory();
  
  try {
    const newSegment = await segmentsFactory.create(data);
    return { success: true, data: newSegment };
  } catch (error) {
    console.error("Failed to create segment:", error);
    return { success: false, error: "Failed to create segment" };
  }
}

export async function readSegmentAction(id: string) {
  const segmentsFactory = createSegmentsFactory();
  
  try {
    const segment = await segmentsFactory.read(id);
    return { success: true, data: segment };
  } catch (error) {
    console.error("Failed to read segment:", error);
    return { success: false, error: "Failed to read segment" };
  }
}

export async function updateSegmentAction(id: string, data: {
  blockId?: string;
  order?: number;
  text?: string;
  type?: string;
  href?: string;
  target?: string;
  className?: string;
  style?: string;
  metadata?: string;
}) {
  const segmentsFactory = createSegmentsFactory();
  
  try {
    const updatedSegment = await segmentsFactory.update(id, data);
    return { success: true, data: updatedSegment };
  } catch (error) {
    console.error("Failed to update segment:", error);
    return { success: false, error: "Failed to update segment" };
  }
}

export async function deleteSegmentAction(id: string) {
  const segmentsFactory = createSegmentsFactory();
  
  try {
    await segmentsFactory.destroy(id);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete segment:", error);
    return { success: false, error: "Failed to delete segment" };
  }
}
