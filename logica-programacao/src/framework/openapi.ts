const openApiDocument = {
    openapi: "3.0.3",
    info: {
        title: "Hospital Queue API",
        version: "1.0.0",
        description:
            "API para cadastro de pacientes, triagem e gerenciamento das filas de atendimento.",
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Ambiente local",
        },
    ],
    tags: [
        {
            name: "Patients",
            description: "Operações relacionadas aos pacientes e seus atendimentos",
        },
    ],
    paths: {
        "/api/patients/new": {
            post: {
                tags: ["Patients"],
                summary: "Cadastra um paciente e o coloca na fila correta",
                description:
                    "Pacientes comuns entram na fila de triagem. Pacientes emergenciais entram diretamente na fila de tratamento.",
                operationId: "registerPatient",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/RegisterPatientRequest",
                            },
                            example: {
                                name: "Maria da Silva",
                                cpf: "52998224725",
                                birthday: "1990-05-20",
                                symptoms: "Dor intensa no peito",
                                isEmergency: false,
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Paciente cadastrado e colocado na fila",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/RegisterPatientResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Dados inválidos ou regra de negócio violada",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                                examples: {
                                    validation: {
                                        value: {
                                            success: false,
                                            message: "Patient name must have at least 4 characters",
                                        },
                                    },
                                    businessRule: {
                                        value: {
                                            success: false,
                                            message: "Patient already exists for cpf: 52998224725",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/patients/{id}": {
            patch: {
                tags: ["Patients"],
                summary: "Atualiza os dados de um paciente",
                description:
                    "Atualiza parcialmente o nome, CPF e/ou data de nascimento de um paciente.",
                operationId: "updatePatient",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        description: "Identificador do paciente",
                        schema: {
                            type: "integer",
                            format: "int64",
                            minimum: 1,
                        },
                        example: 1,
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdatePatientRequest",
                            },
                            example: {
                                name: "Maria da Silva Atualizada",
                                birthday: "1991-06-15",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Dados do paciente atualizados",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/UpdatePatientResponse",
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Dados inválidos ou regra de negócio violada",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Paciente não encontrado",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ErrorResponse",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            RegisterPatientRequest: {
                type: "object",
                required: ["name", "cpf", "birthday", "symptoms", "isEmergency"],
                properties: {
                    name: {
                        type: "string",
                        minLength: 4,
                        maxLength: 100,
                        description: "Nome completo do paciente",
                        example: "Maria da Silva",
                    },
                    cpf: {
                        type: "string",
                        description: "CPF do paciente, com ou sem pontuação",
                        example: "529.982.247-25",
                    },
                    birthday: {
                        type: "string",
                        format: "date",
                        description: "Data de nascimento no formato YYYY-MM-DD",
                        example: "1990-05-20",
                    },
                    symptoms: {
                        type: "string",
                        minLength: 1,
                        description: "Descrição dos sintomas informados",
                        example: "Dor intensa no peito",
                    },
                    isEmergency: {
                        type: "boolean",
                        description:
                            "Indica se o paciente deve pular a triagem e entrar diretamente na fila de tratamento",
                        example: false,
                    },
                },
            },
            RegisterPatientResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {
                        type: "boolean",
                        example: true,
                    },
                    result: {
                        type: "object",
                        required: ["patient", "attendance", "queue"],
                        properties: {
                            patient: {
                                $ref: "#/components/schemas/PatientSummary",
                            },
                            attendance: {
                                $ref: "#/components/schemas/AttendanceSummary",
                            },
                            queue: {
                                $ref: "#/components/schemas/QueueLocation",
                            },
                        },
                    },
                },
                example: {
                    success: true,
                    result: {
                        patient: {
                            id: 1,
                            name: "MARIA DA SILVA",
                            cpf: "52998224725",
                        },
                        attendance: {
                            id: 1,
                            status: "QUEUE",
                            priority: null,
                        },
                        queue: {
                            type: "TRIAGE",
                            callNumber: 1,
                            enteredAt: "2026-07-27T15:30:00.000Z",
                        },
                    },
                },
            },
            UpdatePatientRequest: {
                type: "object",
                minProperties: 1,
                properties: {
                    name: {
                        type: "string",
                        minLength: 4,
                        maxLength: 100,
                        description: "Nome completo do paciente",
                        example: "Maria da Silva Atualizada",
                    },
                    cpf: {
                        type: "string",
                        description: "CPF do paciente, com ou sem pontuação",
                        example: "529.982.247-25",
                    },
                    birthday: {
                        type: "string",
                        format: "date",
                        description: "Data de nascimento no formato YYYY-MM-DD",
                        example: "1991-06-15",
                    },
                },
            },
            UpdatePatientResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {
                        type: "boolean",
                        example: true,
                    },
                    result: {
                        $ref: "#/components/schemas/PatientDetails",
                    },
                },
            },
            PatientDetails: {
                type: "object",
                required: ["id", "name", "cpf", "birthday"],
                properties: {
                    id: {type: "integer", format: "int64", example: 1},
                    name: {type: "string", example: "MARIA DA SILVA ATUALIZADA"},
                    cpf: {type: "string", example: "52998224725"},
                    birthday: {
                        type: "string",
                        format: "date",
                        example: "1991-06-15",
                    },
                },
            },
            PatientSummary: {
                type: "object",
                required: ["id", "name", "cpf"],
                properties: {
                    id: {type: "integer", format: "int64", example: 1},
                    name: {type: "string", example: "MARIA DA SILVA"},
                    cpf: {type: "string", example: "52998224725"},
                },
            },
            AttendanceSummary: {
                type: "object",
                required: ["id", "status"],
                properties: {
                    id: {type: "integer", format: "int64", example: 1},
                    status: {
                        type: "string",
                        enum: ["QUEUE", "TRIAGE", "TREATMENT", "COMPLETED"],
                        example: "QUEUE",
                    },
                    priority: {
                        type: "string",
                        nullable: true,
                        enum: [
                            "EMERGENCY",
                            "VERY_URGENT",
                            "URGENT",
                            "LESS_URGENT",
                            "NOT_URGENT",
                        ],
                        example: null,
                    },
                },
            },
            QueueLocation: {
                type: "object",
                required: ["type", "callNumber", "enteredAt"],
                properties: {
                    type: {
                        type: "string",
                        enum: ["TRIAGE", "TREATMENT"],
                        example: "TRIAGE",
                    },
                    callNumber: {
                        type: "integer",
                        minimum: 1,
                        example: 1,
                    },
                    enteredAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-07-27T15:30:00.000Z",
                    },
                },
            },
            ErrorResponse: {
                type: "object",
                required: ["success", "message"],
                properties: {
                    success: {
                        type: "boolean",
                        example: false,
                    },
                    message: {
                        type: "string",
                        example: "Invalid request",
                    },
                },
            },
        },
    },
};

export {openApiDocument};
