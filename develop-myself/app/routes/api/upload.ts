/**
 * POST /api/upload — Upload file lên Cloudinary
 * Content-Type: multipart/form-data
 * Field: file
 */
import { v2 as cloudinary } from 'cloudinary';
import { requireUser } from '~/lib/auth.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function action({ request }: { request: Request }) {
  await requireUser(request);
  if (request.method !== 'POST') return apiError('Method not allowed', 405);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return apiError('File upload không được để trống');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve(result as { secure_url: string });
        })
        .end(buffer);
    });

    return apiSuccess({ url: result.secure_url }, 'Upload thành công');
  } catch (error: any) {
    console.error('[upload]', error);
    return apiError('Lỗi upload: ' + error.message, 500);
  }
}
