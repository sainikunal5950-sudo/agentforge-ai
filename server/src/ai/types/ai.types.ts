export interface IMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface IAIRequest {
    agentId: string;
    messages: IMessage[];
    preferredModel?: string;
    temperature?: number;
    stream?: boolean;
}

export interface IAIUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface IAIResponse {
    content: string;
    modelUsed: string;
    usage?: IAIUsage;
}
