import { useForm, type UseFormReturnType } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import type { FormEvent } from 'react';
import { postFormSchema, toPostDraft, type Post, type PostDraft, type PostFormValues } from '../schemas/posts';

interface PostFormResult {
    form: UseFormReturnType<PostFormValues>;
    submit: (event?: FormEvent<HTMLFormElement>) => void;
}

export function usePostForm(post: Post | null, save: (draft: PostDraft) => Promise<void>): PostFormResult {
    const form: UseFormReturnType<PostFormValues> = useForm<PostFormValues>({
        initialValues: { title: post?.title ?? '', body: post?.body ?? '', tagsText: post?.tags.join(', ') ?? '' },
        validate: zod4Resolver(postFormSchema),
    });
    const submit = form.onSubmit(async (values: PostFormValues): Promise<void> => { await save(toPostDraft(values)); });
    return { form, submit };
}
