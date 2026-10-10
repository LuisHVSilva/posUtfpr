import { useForm, type UseFormReturnType } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { registerSchema, type RegisterInput } from '../schemas/auth';
import { register } from '../services/auth';
import { errorMessage } from '../services/api';

interface UseRegisterResult {
    form: UseFormReturnType<RegisterInput>;
    pending: boolean;
    error: string | null;
    success: boolean;
    submit: (event?: FormEvent<HTMLFormElement>) => void;
}

export function useRegister(): UseRegisterResult {
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const request = useRef<AbortController | null>(null);
    const form: UseFormReturnType<RegisterInput> = useForm<RegisterInput>({
        initialValues: { name: '', username: '', email: '', password: '', confirmPassword: '' },
        validate: zod4Resolver(registerSchema),
    });
    useEffect((): (() => void) => (): void => { request.current?.abort(); }, []);

    const submit = form.onSubmit(async (values: RegisterInput): Promise<void> => {
        if (request.current !== null && !request.current.signal.aborted) {
            return;
        }
        const controller: AbortController = new AbortController();
        request.current = controller;
        setPending(true);
        setError(null);
        setSuccess(false);
        try {
            await register(values, controller.signal);
            if (!controller.signal.aborted) {
                form.reset();
                setSuccess(true);
            }
        } catch (failure: unknown) {
            if (!controller.signal.aborted) {
                setError(errorMessage(failure));
            }
        } finally {
            if (!controller.signal.aborted) {
                setPending(false);
                request.current = null;
            }
        }
    });
    return { form, pending, error, success, submit };
}
