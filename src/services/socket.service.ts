import { Server, Socket } from "socket.io";
import { Server as HttpServer, IncomingMessage } from "http";
import documentsService from "./documents.service";
import { socketAuthMiddleware } from "../middleware/auth.middleware";
import { IAuthenticatedSocket } from "../types/types";
import { Duplex } from "stream";
import { AgentsManager } from "../agents/agentsManager";

interface IDocumentUpdate {
    documentId: string;
    content: string;
    userId: string;
}

interface IBaseDocumentQuery {
    documentId: string;
    userId: string;
}

interface IAgentStartUpdate extends IBaseDocumentQuery {}

interface IAgentExecuteUpdate extends IBaseDocumentQuery {}

interface IAgentLogsQuery extends IBaseDocumentQuery {}

interface IAgentExecutingStatusUpdate extends IBaseDocumentQuery {}

interface IUserPresence {
    userId: string;
    username?: string;
    cursorPosition?: { x: number; y: number };
    selection?: { start: number; end: number };
    lastActivity: Date;
}

export class SocketService {
    private io: Server | null = null;
    private userPresences: Map<string, Map<string, IUserPresence>> = new Map();

    initialize(server: HttpServer) {
        this.io = new Server(server, {
						cookie: {
							name: "refreshToken",
							path: "/",
							httpOnly: true,
							sameSite: "none"
						},
            transports: ['websocket', 'polling'],
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000,
            },
        });

        this.io.engine.on("upgrade_error", (error) => {
            console.error('❌ Socket.IO upgrade error:', error);
        });

        this.io.engine.on("connection", (socket) => {
            console.log('✅ Engine connection established:', socket.id);
        });

        this.setupMiddleware();
        this.setupEventHandlers();
        this.setupCleanupInterval();

        console.log('socket initialized')
    }

    private setupMiddleware() {
        if (!this.io) return;
        this.io.use(socketAuthMiddleware);
    }

    private setupEventHandlers() {
        if (!this.io) return;

        this.io.on("connection", (socket: Socket) => {
            const authSocket = socket as IAuthenticatedSocket;

            if (!authSocket.joinedDocuments) {
                authSocket.joinedDocuments = new Set();
            }

            console.log(
                "User connected:",
                authSocket.id,
                "User ID:",
                authSocket.userId
            );

            authSocket.on("join-document", async (documentId: string) => {
                try {
                    await this.handleJoinDocument(authSocket, documentId);
                } catch (error) {
                    authSocket.emit("error", {
                        message: "Failed to join document",
                    });
                }
            });

            authSocket.on(
                "document-update",
                async (data: Omit<IDocumentUpdate, "userId">) => {
                    try {
                        await this.handleDocumentUpdate(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to update document",
                        });
                    }
                }
            );

            authSocket.on(
                "document-refresh",
                async (data: Omit<IDocumentUpdate, "userId">) => {
                    try {
                        await this.handleDocumentRefresh(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to update document",
                        });
                    }
                }
            );

            authSocket.on(
                "document-name-update",
                async (data: { documentId: string; name: string }) => {
                    try {
                        await this.handleDocumentNameUpdate(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to update document name",
                        });
                    }
                }
            );

            authSocket.on(
                "cursor-move",
                (data: { documentId: string; x: number; y: number; }) => {
                    this.handleCursorMove(authSocket, data);
                }
            );

            authSocket.on(
                "selection-change",
                (data: { documentId: string; start: number; end: number }) => {
                    this.handleSelectionChange(authSocket, data);
                }
            );

            authSocket.on(
                "shedule-switch",
                (data: IAgentStartUpdate) => {
                    try {
                        this.handleAgentSheduleUpdate(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to switch shedule",
                        });
                    }
                }
            )

            authSocket.on(
                "execute-agent",
                (data: IAgentExecuteUpdate) => {
                    try {
                        this.handleAgentExecuteUpdate(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to agent execute",
                        });
                    }
                }
            )

            authSocket.on(
                "get-agent-logs",
                (data: IAgentLogsQuery) => {
                    try {
                        this.handleGetAgentLogs(authSocket, data);
                    } catch (error) {
                        authSocket.emit("error", {
                            message: "Failed to get agent logs",
                        });
                    }
                }
            )

            authSocket.on("ping", () => {
                authSocket.emit("pong", { timestamp: Date.now() });
            });

            authSocket.on("leave-document", (documentId: string) => {
                this.handleLeaveDocument(authSocket, documentId);
            });

            authSocket.on("disconnect", (reason) => {
                this.handleDisconnect(authSocket, reason);
            });
        });
    }

    private async handleJoinDocument(
        socket: IAuthenticatedSocket,
        documentId: string
    ) {
        socket.join(documentId);
        socket.joinedDocuments.add(documentId);

        console.log(`User ${socket.userId} joined document ${documentId}`);

        this.initializeUserPresence(documentId, socket);

        try {
            const document = await documentsService.getOne(documentId);

            socket.emit("document-content", {
                documentId,
                content: document.data.content,
                name: document.data.name,
                userId: socket.userId,
            });

            socket.to(documentId).emit("user-joined", {
                userId: socket.userId,
                username: socket.username,
                documentId,
                presence: this.getUserPresence(documentId, socket.userId),
            });

            const otherUsers = this.getOtherUsersInDocument(
                documentId,
                socket.userId
            );

            socket.emit("users-in-document", {
                documentId,
                users: otherUsers,
            });

        } catch (error) {
            throw new Error("Failed to load document");
        }
    }

    private async handleAgentSheduleUpdate(
        socket: IAuthenticatedSocket,
        data: IAgentStartUpdate,
    ) {
        const { documentId } = data;

        const startData = await documentsService.switchShedule(documentId);

        this.io!.to(documentId).emit("agent-shedule-switch", {
            documentId,
            isStarted: startData.is_started,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        })

        this.updateUserActivity(documentId, socket.userId);
    }

    private async handleAgentExecuteUpdate(
        socket: IAuthenticatedSocket,
        data: IAgentExecuteUpdate,
    ) {
        const { documentId } = data;

        const agentsManager = AgentsManager.getInstance();
        const success = await agentsManager.executeAgent(documentId, true);

        this.io!.to(documentId).emit("executed-agent", {
            documentId,
            success,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        })

        this.updateUserActivity(documentId, socket.userId);
    }

    private async handleGetAgentLogs(
        socket: IAuthenticatedSocket,
        data: IAgentLogsQuery,
    ) {
        const { documentId } = data;

        const logs = await documentsService.getAgentLogs(documentId);

        socket.emit("give-agent-logs", {
            documentId,
            agentLogs: logs,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        })
    }

    private async handleDocumentUpdate(
        socket: IAuthenticatedSocket,
        data: Omit<IDocumentUpdate, "userId">
    ) {
        const { documentId, content } = data;

        await documentsService.updateContent(documentId, content);

        socket.to(documentId).emit("document-update", {
            documentId,
            content,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        });

        this.updateUserActivity(documentId, socket.userId);
    }

		
    private async handleDocumentRefresh(
        socket: IAuthenticatedSocket,
        data: Omit<IDocumentUpdate, "userId">
    ) {
        const { documentId, content } = data;

        socket.to(documentId).emit("document-refresh", {
            documentId,
            content,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        });

        this.updateUserActivity(documentId, socket.userId);
    }

    private async handleDocumentNameUpdate(
        socket: IAuthenticatedSocket,
        data: { documentId: string; name: string }
    ) {
        const { documentId, name } = data;

        await documentsService.updateName(documentId, name, socket.userId);

        const payload = {
            documentId,
            name,
            userId: socket.userId,
            timestamp: new Date().toISOString(),
        }

        socket.to(documentId).emit("document-name-updated", payload);
    }

    private handleCursorMove(
        socket: IAuthenticatedSocket,
        data: { documentId: string; x: number; y: number }
    ) {
        const { documentId, x, y } = data;

        this.updateCursorPosition(documentId, socket.userId, x, y);

        socket.to(documentId).emit("user-cursor-move", {
            userId: socket.userId,
            documentId,
            username: socket.username,
            x,
            y,
            timestamp: new Date().toISOString(),
        });
    }

    private handleSelectionChange(
        socket: IAuthenticatedSocket,
        data: { documentId: string; start: number; end: number }
    ) {
        const { documentId, start, end } = data;

        this.updateSelection(documentId, socket.userId, start, end);

        socket.to(documentId).emit("user-selection-change", {
            userId: socket.userId,
            documentId,
            start,
            end,
            timestamp: new Date().toISOString(),
        });
    }

    private handleLeaveDocument(
        socket: IAuthenticatedSocket,
        documentId: string
    ) {
        socket.leave(documentId);
        socket.joinedDocuments.delete(documentId);

        console.log(`User ${socket.userId} left document ${documentId}`);

        this.removeUserPresence(documentId, socket.userId);

        socket.to(documentId).emit("user-left", {
            userId: socket.userId,
            username: socket.username,
            documentId,
        });
    }

    private handleDisconnect(socket: IAuthenticatedSocket, reason: string) {
        console.log(
            "User disconnected:",
            socket.id,
            "User ID:",
            socket.userId,
            "Reason:",
            reason
        );

        socket.joinedDocuments.forEach((documentId) => {
            this.removeUserPresence(documentId, socket.userId);
            socket.to(documentId).emit("user-left", {
                userId: socket.userId,
                username: socket.username,
                documentId,
                reason: "disconnected",
            });
        });
    }

    private initializeUserPresence(documentId: string, socket: IAuthenticatedSocket) {
        if (!this.userPresences.has(documentId)) {
            this.userPresences.set(documentId, new Map());
        }

        const documentPresences = this.userPresences.get(documentId)!;
        documentPresences.set(socket.userId, {
            userId: socket.userId,
            username: socket.username,
            lastActivity: new Date(),
            cursorPosition: { x: 0, y: 0 },
        });
    }

    private updateUserActivity(documentId: string, userId: string) {
        const presence = this.getUserPresence(documentId, userId);
        if (presence) {
            presence.lastActivity = new Date();
        }
    }

    private updateCursorPosition(
        documentId: string,
        userId: string,
        x: number,
        y: number
    ) {
        const presence = this.getUserPresence(documentId, userId);
        if (presence) {
            presence.cursorPosition = { x, y };
            presence.lastActivity = new Date();
        }
    }

    private updateSelection(
        documentId: string,
        userId: string,
        start: number,
        end: number
    ) {
        const presence = this.getUserPresence(documentId, userId);
        if (presence) {
            presence.selection = { start, end };
            presence.lastActivity = new Date();
        }
    }

    private removeUserPresence(documentId: string, userId: string) {
        const documentPresences = this.userPresences.get(documentId);
        if (documentPresences) {
            documentPresences.delete(userId);
            if (documentPresences.size === 0) {
                this.userPresences.delete(documentId);
            }
        }
    }

    private getUserPresence(
        documentId: string,
        userId: string
    ): IUserPresence | undefined {
        return this.userPresences.get(documentId)?.get(userId);
    }

    private getOtherUsersInDocument(
        documentId: string,
        excludeUserId: string
    ): IUserPresence[] {
        const documentPresences = this.userPresences.get(documentId);
        if (!documentPresences) return [];

        return Array.from(documentPresences.entries())
            .filter(([userId]) => userId !== excludeUserId)
            .map(([_, presence]) => presence);
    }

    private setupCleanupInterval() {
        setInterval(() => {
            const now = new Date();
            const inactiveTime = 10 * 60 * 1000;

            this.userPresences.forEach((documentPresences, documentId) => {
                documentPresences.forEach((presence, userId) => {
                    if (
                        now.getTime() - presence.lastActivity.getTime() >
                        inactiveTime
                    ) {
                        documentPresences.delete(userId);
                        this.io!.to(documentId).emit("user-left", {
                            userId,
														username: presence.username,
                            documentId,
                            reason: "inactive",
                        });
                    }
                });
            });
        }, 5 * 60 * 1000);
    }

    getIO(): Server {
        if (!this.io) {
            throw new Error("Socket.IO not initialized");
        }
        return this.io;
    }

    getDocumentUsers(documentId: string): IUserPresence[] {
        const documentPresences = this.userPresences.get(documentId);
        return documentPresences ? Array.from(documentPresences.values()) : [];
    }
}

export default new SocketService();
