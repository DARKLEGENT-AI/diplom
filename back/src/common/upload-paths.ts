import * as path from 'path'

export const uploadsRoot = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads')
export const avatarsUploadDir = path.join(uploadsRoot, 'avatars')
