import { NextRequest, NextResponse } from 'next/server';
import { getPopularCategories } from '@/lib/categories/generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    const categories = await getPopularCategories(limit);

    return NextResponse.json(
      { categories },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
