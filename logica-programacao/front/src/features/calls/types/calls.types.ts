export type CallsPageData = {
    display: CallsDisplayData;
};

export type CallHistoryItem = {
    code: string;
    room: string;
};

export type CallPanel = {
    title: string;
    currentCode: string;
    currentRoom: string;
    history: CallHistoryItem[];
    tone: "triage" | "attendance";
};

export type QueueStat = {
    label: string;
    value: string;
    tone: "emergency" | "urgent" | "stable";
};

export type CallsDisplayData = {
    alert: string;
    systemStatus: string;
    panels: CallPanel[];
    stats: QueueStat[];
};
