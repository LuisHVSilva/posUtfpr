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
    /* rooms tag is declared below with the other top-level tags */
    tags: [
        {
            name: "Patients",
            description: "Operações relacionadas aos pacientes e seus atendimentos",
        },
        {
            name: "Queue",
            description: "Operações automáticas das filas e salas",
        },
        {
            name: "Rooms",
            description: "Room operations",
        },
    ],
    /*
    tagsRooms: [
        {
            name: "Rooms",
            description: "Operações relacionadas às salas de atendimento",
        },
    ],
    */
    paths: {
        "/api/patients": {
            get: {
                tags: ["Patients"],
                summary: "Lista pacientes",
                description: "Lista pacientes com filtros opcionais. Cada página retorna no máximo 20 pacientes.",
                operationId: "listPatients",
                parameters: [
                    {name: "id", in: "query", required: false, description: "Identificador do paciente", schema: {type: "integer", format: "int64", minimum: 1}, example: 1},
                    {name: "name", in: "query", required: false, description: "Parte do nome do paciente", schema: {type: "string", minLength: 1}, example: "Maria"},
                    {name: "cpf", in: "query", required: false, description: "CPF do paciente", schema: {type: "string", minLength: 1}, example: "52998224725"},
                    {name: "birthday", in: "query", required: false, description: "Data de nascimento no formato YYYY-MM-DD", schema: {type: "string", format: "date"}, example: "1990-05-20"},
                    {name: "page", in: "query", required: false, description: "Número da página", schema: {type: "integer", minimum: 1, default: 1}, example: 1},
                ],
                responses: {
                    "200": {
                        description: "Lista de pacientes retornada com paginação",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ListPatientsResponse"}}},
                    },
                    "400": {
                        description: "Filtros inválidos",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                },
            },
            post: {
                tags: ["Patients"],
                summary: "Cadastra um paciente",
                description: "Cria apenas o cadastro do paciente, sem criar atendimento ou entrada em fila.",
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
        "/api/patients/summary": {
            get: {
                tags: ["Patients"],
                summary: "Consulta o resumo de pacientes",
                description: "Retorna total de cadastros, atendimentos do dia, casos criticos em aberto e pacientes aguardando triagem.",
                operationId: "getPatientsSummary",
                responses: {
                    "200": {
                        description: "Resumo de pacientes retornado com sucesso",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/PatientsSummaryResponse"}}},
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
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
        "/api/queue/attendance": {
            post: {
                tags: ["Queue"],
                summary: "Registra a chegada de um paciente",
                description:
                    "Localiza ou cadastra o paciente, cria um atendimento, coloca-o na fila correta e tenta chamar automaticamente uma sala de triagem disponível.",
                operationId: "registerAttendance",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {$ref: "#/components/schemas/RegisterAttendanceRequest"},
                            example: {
                                name: "Maria da Silva",
                                cpf: "529.982.247-25",
                                birthday: "1990-05-20",
                                symptoms: "Dor intensa no peito",
                                isEmergency: false,
                            },
                        },
                    },
                },
                responses: {
                    "201": {
                        description: "Atendimento registrado e colocado na fila",
                        content: {
                            "application/json": {
                                schema: {$ref: "#/components/schemas/RegisterAttendanceResponse"},
                            },
                        },
                    },
                    "400": {
                        description: "Dados inválidos ou paciente já possui atendimento em andamento",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                },
            },
        },
        "/api/queue/triage/{roomId}/finish": {
            patch: {
                tags: ["Queue"],
                summary: "Finaliza a triagem pela sala e chama o próximo paciente",
                description:
                    "Finaliza a triagem ativa na sala informada, libera a sala e chama automaticamente o próximo paciente da fila de triagem.",
                operationId: "finishTriage",
                parameters: [
                    {
                        name: "roomId",
                        in: "path",
                        required: true,
                        description: "Identificador da sala de triagem",
                        schema: {type: "integer", format: "int64", minimum: 1},
                        example: 1,
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {$ref: "#/components/schemas/FinishTriageRequest"},
                            example: {priority: "URGENT"},
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Triagem finalizada e sala redistribuída",
                        content: {
                            "application/json": {
                                schema: {$ref: "#/components/schemas/FinishTriageResponse"},
                            },
                        },
                    },
                    "400": {
                        description: "Sala inválida, sem atendimento ativo em triagem ou atendimento não finalizável",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                    "404": {
                        description: "Sala, atendimento ou médico não encontrados",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                },
            },
        },
        "/api/rooms/infos": {
            get: {
                tags: ["Rooms"],
                summary: "Consulta o resumo operacional das salas",
                description: "Retorna salas ativas, pacientes aguardando, tempo médio do atendimento completo e emergências em atendimento.",
                operationId: "getRoomsSummary",
                responses: {
                    "200": {
                        description: "Resumo operacional retornado com sucesso",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/RoomsSummaryResponse"}}},
                    },
                    "500": {
                        description: "Erro interno do servidor",
                        content: {"application/json": {schema: {$ref: "#/components/schemas/ErrorResponse"}}},
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            RegisterPatientRequest: {
                type: "object",
                required: ["name", "cpf", "birthday"],
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
                        required: ["id", "name", "cpf", "birthday"],
                        properties: {
                            id: {type: "integer", format: "int64", example: 1},
                            name: {type: "string", example: "MARIA DA SILVA"},
                            cpf: {type: "string", example: "52998224725"},
                            birthday: {
                                type: "string",
                                format: "date-time",
                                example: "1990-05-20T03:00:00.000Z",
                            },
                        },
                    },
                },
                example: {
                    success: true,
                    result: {
                        id: 1,
                        name: "MARIA DA SILVA",
                        cpf: "52998224725",
                        birthday: "1990-05-20T03:00:00.000Z",
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
            ListPatientsResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {type: "boolean", example: true},
                    result: {
                        type: "object",
                        required: ["patients", "pagination"],
                        properties: {
                            patients: {
                                type: "array",
                                items: {$ref: "#/components/schemas/PatientListDetails"},
                            },
                            pagination: {$ref: "#/components/schemas/Pagination"},
                        },
                    },
                },
            },
            PatientsSummaryResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {type: "boolean", example: true},
                    result: {
                        type: "object",
                        required: ["totalRecords", "attendancesToday", "criticalCases", "waitingTriage"],
                        properties: {
                            totalRecords: {type: "integer", minimum: 0, example: 1284},
                            attendancesToday: {type: "integer", minimum: 0, example: 42},
                            criticalCases: {type: "integer", minimum: 0, example: 5},
                            waitingTriage: {type: "integer", minimum: 0, example: 12},
                        },
                    },
                },
            },
            RoomsSummaryResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {type: "boolean", example: true},
                    result: {
                        type: "object",
                        required: ["activeRooms", "waitingPatients", "averageWait", "emergencies", "rooms"],
                        properties: {
                            activeRooms: {type: "integer", minimum: 0, example: 5},
                            waitingPatients: {type: "integer", minimum: 0, example: 2},
                            averageWait: {type: "string", example: "35.5 min"},
                            emergencies: {type: "integer", minimum: 0, example: 1},
                            rooms: {
                                type: "array",
                                items: {$ref: "#/components/schemas/DashboardRoom"},
                            },
                        },
                    },
                },
            },
            DashboardRoom: {
                type: "object",
                required: ["id", "name", "specialty", "status"],
                properties: {
                    id: {type: "integer", minimum: 1, example: 1},
                    name: {type: "string", example: "ConsultÃ³rio 01"},
                    specialty: {type: "string", example: "Triagem"},
                    status: {type: "string", enum: ["active", "emergency", "closed"], example: "active"},
                    ticket: {type: "string", example: "T-001"},
                    patient: {type: "string", example: "Maria da Silva"},
                },
            },
            Pagination: {
                type: "object",
                required: ["currentPage", "itemsPerPage", "totalItems", "totalPages"],
                properties: {
                    currentPage: {type: "integer", minimum: 1, example: 1},
                    itemsPerPage: {type: "integer", minimum: 1, maximum: 20, example: 20},
                    totalItems: {type: "integer", minimum: 0, example: 42},
                    totalPages: {type: "integer", minimum: 0, example: 3},
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
            PatientListDetails: {
                type: "object",
                required: ["id", "name", "cpf", "birthday", "status"],
                properties: {
                    id: {type: "integer", format: "int64", example: 1},
                    name: {type: "string", example: "MARIA DA SILVA"},
                    cpf: {type: "string", example: "52998224725"},
                    birthday: {
                        type: "string",
                        format: "date-time",
                        example: "1991-06-15T03:00:00.000Z",
                    },
                    status: {
                        type: "string",
                        enum: ["emergency", "urgent", "stable"],
                        example: "urgent",
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
            FinishTriageRequest: {
                type: "object",
                required: ["priority"],
                properties: {
                    priority: {
                        type: "string",
                        enum: [
                            "EMERGENCY",
                            "VERY_URGENT",
                            "URGENT",
                            "LESS_URGENT",
                            "NOT_URGENT",
                        ],
                        example: "URGENT",
                    },
                },
            },
            RegisterAttendanceRequest: {
                type: "object",
                required: ["name", "cpf", "birthday", "symptoms", "isEmergency"],
                properties: {
                    name: {type: "string", minLength: 4, maxLength: 100, example: "Maria da Silva"},
                    cpf: {type: "string", example: "529.982.247-25"},
                    birthday: {type: "string", format: "date", example: "1990-05-20"},
                    symptoms: {type: "string", minLength: 1, example: "Dor intensa no peito"},
                    isEmergency: {
                        type: "boolean",
                        description: "Define se o paciente deve ir diretamente para a fila de tratamento",
                        example: false,
                    },
                },
            },
            RegisterAttendanceResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {type: "boolean", example: true},
                    result: {
                        type: "object",
                        required: ["patient", "attendance", "queue"],
                        properties: {
                            patient: {$ref: "#/components/schemas/PatientSummary"},
                            attendance: {$ref: "#/components/schemas/AttendanceSummary"},
                            queue: {$ref: "#/components/schemas/QueueLocation"},
                        },
                    },
                },
            },
            FinishTriageResponse: {
                type: "object",
                required: ["success", "result"],
                properties: {
                    success: {type: "boolean", example: true},
                    result: {
                        type: "object",
                        required: ["attendance", "nextPatient"],
                        properties: {
                            attendance: {$ref: "#/components/schemas/AttendanceSummary"},
                            nextPatient: {
                                nullable: true,
                                type: "object",
                                properties: {
                                    attendanceId: {type: "integer", example: 2},
                                    patientId: {type: "integer", example: 5},
                                    callNumber: {type: "integer", example: 2},
                                    doctorId: {type: "integer", example: 1},
                                    queueType: {type: "string", example: "TRIAGE"},
                                    startedAt: {type: "string", format: "date-time"},
                                },
                            },
                        },
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
