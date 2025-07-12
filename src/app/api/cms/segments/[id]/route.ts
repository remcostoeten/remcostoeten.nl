import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { updateSegmentText, getContentSegmentById } from '@/lib/cms/repository';
import { 
  UpdateSegmentRequestSchema, 
  type TUpdateSegmentResponse 
} from '@/lib/cms/types';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  validateRequestBody 
} from '@/lib/api/utils';

type TRouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: TRouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return createErrorResponse('Segment ID is required', 400);
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = validateRequestBody(body, UpdateSegmentRequestSchema);
    if (!validationResult.success) {
      return createErrorResponse(`Invalid request: ${validationResult.error}`, 400);
    }

    const { content } = validationResult.data;

    // Check if segment exists
    const existingSegment = await getContentSegmentById(db, id);
    if (!existingSegment) {
      return createErrorResponse('Segment not found', 404);
    }

    // Update segment
    await updateSegmentText(db, id, content);

    // Get updated segment
    const updatedSegment = await getContentSegmentById(db, id);

    const response: TUpdateSegmentResponse = {
      success: true,
      segment: updatedSegment || undefined,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating segment:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
