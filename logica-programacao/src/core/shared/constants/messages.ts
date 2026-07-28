export const controllerMessages = {
    error: {
        unknownError: "An unexpected error occurred",
        invalidAuthentication: "Invalid authentication",
    },
} as const;

export const VOMessages = {
    info: {
        valueObjectType: "value object",
    },
    error: {
        domainValueInvalid: (value: unknown, name: string) => `${String(value)} is not a valid ${name}.`,
        cpfInvalidLength: "CPF must contain 14 characters.",
        cpfIdenticalDigits: "CPF cannot contain identical digits.",
        cpfInvalidValue: "Invalid CPF value.",
    }
} as const;

export const commonMessages = {
    success: {
    },
    error: {
        unknown: "Unknown error.",
        unexpectedRequest: "Unexpected error.",
        notFound: "Resource not found.",
        inactiveEntity: "Entity is inactive.",
        storeNotInitialized: "PersistenceContext store not initialized (missing .run()).",
        serverError: "Server start error.",
    },
    info: {
        serverRunning: (port: number) => `Server running on http://localhost:${port}.`,
    }
} as const;

export const infrastructureMessages = {
    success: {
        logDirectoryReady: "Log directory is ready.",
    },
    error: {
        logDirectoryCreationFailed: "Failed to create the log directory.",
        logWriteFailed: "Failed to save the log file.",
        executionStarted: "Execution started.",
        executionCompleted: (duration: number) => `Execution completed in ${duration}ms.`,
        unexpectedErrorWithMessage: (message: string) => `Unexpected error: ${message}`,
        corsBlockedOrigin: (origin: string) => `CORS blocked for origin: ${origin}.`,
        dataProtectionKeysNotConfigured: "DATA_ENCRYPTION_KEY and DATA_LOOKUP_KEY must be configured.",
        invalidDataEncryptionKey: "DATA_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
        invalidEncryptedValue: "Invalid encrypted value.",
    },
    info: {localEmailVerification: (recipient: string, code: string, expiresAt: string) => `[local-email] verification for ${recipient}: ${code}; expires at ${expiresAt}`}
} as const;

