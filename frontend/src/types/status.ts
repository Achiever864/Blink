export type StatusType = "success" | "error";

export interface StatusNotification {
    message: string,
    type: StatusType;
    id: number;
}

export interface StatusBarContextType {
    showStatus: (message: string, type?: StatusType) => void;
}