import { NextResponse } from 'next/server';
import { requireSession } from '@/app/lib/admin/session';
import { uploadToR2, deleteFromR2ByUrl } from '@/app/lib/r2';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function extFromMime(mime: string): string | null {
  const m = mime.toLowerCase();
  if (m.includes('png')) return 'png';
  if (m.includes('webp')) return 'webp';
  if (m.includes('gif')) return 'gif';
  if (m.includes('svg')) return 'svg';
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
  return null;
}

async function saveImage(key: string, buffer: Buffer, mime: string): Promise<string> {
  // If R2 credentials are configured, attempt upload to Cloudflare R2
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    try {
      return await uploadToR2(key, buffer, mime);
    } catch (e) {
      console.warn('[upload] R2 upload failed, falling back to local storage:', e);
    }
  }

  // Fallback: save to public/uploads/products/
  const fileName = key.replace('products/', '');
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
  mkdirSync(uploadDir, { recursive: true });
  const filePath = join(uploadDir, fileName);
  writeFileSync(filePath, buffer);
  return `/uploads/products/${fileName}`;
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart/form-data file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'Image file must be less than 5MB.' }, { status: 400 });
      }
      const ext = extFromMime(file.type);
      if (!ext) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload JPG, PNG, WebP, or SVG.' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `products/prod_${Date.now()}_${randomBytes(4).toString('hex')}.${ext}`;
      const url = await saveImage(key, buffer, file.type);
      return NextResponse.json({ url, success: true }, { status: 201 });
    }

    // Handle JSON (Base64 data URL)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl } = body;

      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Valid Base64 image data URL required.' }, { status: 400 });
      }
      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Malformed image data URL.' }, { status: 400 });
      }

      let ext = matches[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('svg')) ext = 'svg';
      if (!['png', 'webp', 'gif', 'svg', 'jpg'].includes(ext)) {
        return NextResponse.json(
          { error: 'Invalid file format. Please upload JPG, PNG, WebP, or SVG.' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > MAX_SIZE) {
        return NextResponse.json({ error: 'Image file must be less than 5MB.' }, { status: 400 });
      }

      const key = `products/prod_${Date.now()}_${randomBytes(4).toString('hex')}.${ext}`;
      const url = await saveImage(key, buffer, `image/${ext === 'jpg' ? 'jpeg' : ext}`);
      return NextResponse.json({ url, success: true }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type. Use multipart/form-data or application/json.' }, { status: 400 });
  } catch (err: any) {
    console.error('[upload] Failed to process product image upload:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload image.' }, { status: 500 });
  }
}

// DELETE /api/admin/upload?url=<object url> — removes an image
export async function DELETE(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin' && session.role !== 'manager') {
    return NextResponse.json({ error: 'Permission denied.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url parameter required.' }, { status: 400 });

  try {
    if (url.startsWith('/uploads/products/')) {
      const fileName = url.replace('/uploads/products/', '');
      const filePath = join(process.cwd(), 'public', 'uploads', 'products', fileName);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } else if (process.env.R2_ACCOUNT_ID) {
      await deleteFromR2ByUrl(url);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[upload] Delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
