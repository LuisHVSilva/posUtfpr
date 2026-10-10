import { PasswordInput, type PasswordInputProps } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState, type KeyboardEvent, type ReactElement } from 'react';

export function PasswordField(props: PasswordInputProps): ReactElement {
    const [visible, setVisible] = useState<boolean>(false);
    return (
        <PasswordInput {...props}
            visible={visible} onVisibilityChange={setVisible}
            visibilityToggleButtonProps={{
                'aria-label': props.label === 'Confirmar senha'
                    ? 'Mostrar ou ocultar confirmação da senha' : 'Mostrar ou ocultar senha',
                tabIndex: 0,
                onKeyDown: (event: KeyboardEvent<HTMLButtonElement>): void => {
                    // Mantine trata Espaço; completamos a ativação por Enter do botão.
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        setVisible((current: boolean): boolean => !current);
                    }
                },
            }}
            visibilityToggleIcon={({ reveal }: { reveal: boolean }): ReactElement => (
                <FontAwesomeIcon icon={reveal ? faEyeSlash : faEye} />
            )}
        />
    );
}
