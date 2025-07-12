import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "@/db/client";
import { contentBlocks, contentSegments, pages } from "@/db/cms-schema";
import type { TBaseEntity, TTimestamps } from "@/db/types";

type TPageEntity = TBaseEntity & {
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
};

type TPageCreateInput = {
  slug: string;
  title: string;
  description?: string;
  isPublished?: boolean;
};

type TPageUpdateInput = Partial<Pick<TPageEntity, "title" | "description" | "isPublished">>;

type TBlockEntity = TBaseEntity & {
  pageId: string;
  blockType: string;
  order: number;
};

type TBlockCreateInput = {
  pageId: string;
  blockType: string;
  order: number;
};

type TBlockUpdateInput = Partial<Pick<TBlockEntity, "blockType" | "order">>;

type TSegmentEntity = TBaseEntity & {
  blockId: string;
  order: number;
  text: string;
  type: string;
  href: string | null;
  target: string | null;
  className: string | null;
  style: string | null;
  metadata: string | null;
};

type TSegmentCreateInput = {
  blockId: string;
  order: number;
  text: string;
  type: string;
  href?: string;
  target?: string;
  className?: string;
  style?: string;
  metadata?: string;
};

type TSegmentUpdateInput = Partial<Omit<TSegmentEntity, "id" | "createdAt" | "updatedAt">>;

export function createPagesFactory() {
  const db = getDb();

  async function create(data: TPageCreateInput): Promise<TPageEntity> {
    const pageId = nanoid();
    
    const newPage = await db
      .insert(pages)
      .values({
        id: pageId,
        slug: data.slug,
        title: data.title,
        description: data.description || null,
        isPublished: data.isPublished ?? true,
      })
      .returning()
      .execute();

    return newPage[0] as TPageEntity;
  }

  async function read(slug: string): Promise<TPageEntity | null> {
    const page = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1)
      .execute();

    return page[0] as TPageEntity || null;
  }

  async function update(id: string, data: TPageUpdateInput): Promise<TPageEntity> {
    const updatedPage = await db
      .update(pages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning()
      .execute();

    return updatedPage[0] as TPageEntity;
  }

  async function destroy(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id)).execute();
  }

  return {
    create,
    read,
    update,
    destroy,
  };
}

export function createBlocksFactory() {
  const db = getDb();

  async function create(data: TBlockCreateInput): Promise<TBlockEntity> {
    const blockId = nanoid();
    
    const newBlock = await db
      .insert(contentBlocks)
      .values({
        id: blockId,
        pageId: data.pageId,
        blockType: data.blockType,
        order: data.order,
      })
      .returning()
      .execute();

    return newBlock[0] as TBlockEntity;
  }

  async function read(id: string): Promise<TBlockEntity | null> {
    const block = await db
      .select()
      .from(contentBlocks)
      .where(eq(contentBlocks.id, id))
      .limit(1)
      .execute();

    return block[0] as TBlockEntity || null;
  }

  async function update(id: string, data: TBlockUpdateInput): Promise<TBlockEntity> {
    const updatedBlock = await db
      .update(contentBlocks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contentBlocks.id, id))
      .returning()
      .execute();

    return updatedBlock[0] as TBlockEntity;
  }

  async function destroy(id: string): Promise<void> {
    await db.delete(contentBlocks).where(eq(contentBlocks.id, id)).execute();
  }

  return {
    create,
    read,
    update,
    destroy,
  };
}

export function createSegmentsFactory() {
  const db = getDb();

  async function create(data: TSegmentCreateInput): Promise<TSegmentEntity> {
    const segmentId = nanoid();
    
    const newSegment = await db
      .insert(contentSegments)
      .values({
        id: segmentId,
        blockId: data.blockId,
        order: data.order,
        text: data.text,
        type: data.type,
        href: data.href || null,
        target: data.target || null,
        className: data.className || null,
        style: data.style || null,
        metadata: data.metadata || null,
      })
      .returning()
      .execute();

    return newSegment[0] as TSegmentEntity;
  }

  async function read(id: string): Promise<TSegmentEntity | null> {
    const segment = await db
      .select()
      .from(contentSegments)
      .where(eq(contentSegments.id, id))
      .limit(1)
      .execute();

    return segment[0] as TSegmentEntity || null;
  }

  async function update(id: string, data: TSegmentUpdateInput): Promise<TSegmentEntity> {
    const updatedSegment = await db
      .update(contentSegments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(contentSegments.id, id))
      .returning()
      .execute();

    return updatedSegment[0] as TSegmentEntity;
  }

  async function destroy(id: string): Promise<void> {
    await db.delete(contentSegments).where(eq(contentSegments.id, id)).execute();
  }

  return {
    create,
    read,
    update,
    destroy,
  };
}
