/**
 * Helper tạo JSON API response chuẩn — tương đương ApiResponse<T> trong Spring Boot
 */
export function apiSuccess<T>(data: T, message?: string): Response {
  return Response.json({ success: true, message: message ?? 'Thành công', data });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, message, data: null }, { status });
}
