import { z } from 'zod';

/**
 * 创建短链接的输入验证 Schema
 */
export const createLinkSchema = z.object({
  value: z.string()
    .trim()
    .min(1, 'URL 不能为空')
    .url('必须是有效的 URL')
    .max(2048, 'URL 长度不能超过 2048 字符'),
});

/**
 * 删除短链接的输入验证 Schema
 */
export const deleteLinkSchema = z.object({
  key: z.string()
    .trim()
    .min(1, 'key 不能为空')
    .max(20, 'key 长度不能超过 20 字符')
    .regex(/^[\da-z]+$/i, 'key 只能包含字母和数字'),
});

/**
 * 查询短链接的输入验证 Schema
 */
export const getLinkSchema = z.object({
  key: z.string()
    .trim()
    .min(1, 'key 不能为空')
    .max(20, 'key 长度不能超过 20 字符')
    .regex(/^[\da-z]+$/i, 'key 只能包含字母和数字'),
});

// 导出类型
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type DeleteLinkInput = z.infer<typeof deleteLinkSchema>;
export type GetLinkInput = z.infer<typeof getLinkSchema>;
