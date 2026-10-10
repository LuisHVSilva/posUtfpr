import { useForm, type UseFormReturnType } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginSchema, type LoginInput } from '../schemas/auth';
import { errorMessage } from '../services/api';
import { useAuth } from './useAuth';

const destinationSchema = z.object({ from: z.string().regex(/^\/admin(?:[?#].*)?$/) });

interface UseLoginResult {
    form: UseFormReturnType<LoginInput>;
    pending: boolean;
    error: string | null;
    submit: (event?: FormEvent<HTMLFormElement>) => void;
}

export function useLogin(): UseLoginResult {
    const { signIn, sessionError, status } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const state: unknown = location.state;
    const destination = destinationSchema.safeParse(state);
    const target: string = destination.success ? destination.data.from : '/admin';
    const [pending, setPending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const request = useRef<AbortController | null>(null);
    const form: UseFormReturnType<LoginInput> = useForm<LoginInput>({
        initialValues: { username: '', password: '' },
        validate: zod4Resolver(loginSchema),
    });

    useEffect((): (() => void) => (): void => { request.current?.abort(); }, []);
    useEffect((): void => {
        if (status === 'authenticated') {
            void navigate(target, { replace: true });
        }
    }, [status, navigate, target]);

    const submit = form.onSubmit(async (values: LoginInput): Promise<void> => {
        if (request.current !== null && !request.current.signal.aborted) {
            return;
        }
        const controller: AbortController = new AbortController();
        request.current = controller;
        setPending(true);
        setError(null);
        try {
            await signIn(values, controller.signal);
            if (!controller.signal.aborted) {
                form.setFieldValue('password', '');
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

    return { form, pending: pending || status === 'restoring', error: error ?? sessionError, submit };
}
