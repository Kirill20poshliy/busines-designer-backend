import { IDocument } from "../models/document.model";
import agentsDBService from "../services/agentsDB.service";
import documentsService from "../services/documents.service";
import socketService from "../services/socket.service";
import { formatDate } from "../utils/date";
import { Agent } from "./agent";

export class AgentsManager {
    private static instance: AgentsManager;
    private agents: Map<string, Agent> = new Map();
    private pollingInterval?: NodeJS.Timeout;
    private checkInterval?: NodeJS.Timeout;

    public static getInstance(): AgentsManager {
        if (!AgentsManager.instance) {
            AgentsManager.instance = new AgentsManager();
        }

        return AgentsManager.instance;
    }

    public async initialize(): Promise<void> {        
        await this.loadAgents();
        
        this.startScheduler();
        
        this.startPolling();
    }

    private async loadAgents(): Promise<void> {
        try {
            const records = await agentsDBService.getAllAgents();
      
            for (const record of records) {
                await this.createAgentFromRecord(record);
            }
      
            console.log(`Loaded ${this.agents.size} agents`);
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    }

    private async createAgentFromRecord(record: IDocument): Promise<void> {
        if (this.agents.has(record.id)) {
            const agent = this.agents.get(record.id)!;
            agent.updateRecord(record);

            return;
        }

        const agent = new Agent(record);

        this.agents.set(record.id, agent);
        
        console.log(`- Created agent: ${record.name} (ID: ${record.id})`);
    }

    private startScheduler(): void {
        this.checkInterval = setInterval(async () => {
            try {
                await this.checkAndExecuteAgents();
            } catch (error) {
                console.error('Error in scheduler:', error);
            }
        }, 1000 * 60);
    }

    private async checkAndExecuteAgents(): Promise<void> {
        const now = new Date();
    
        for (const agent of this.agents.values()) {
            const status = agent.status;
      
            if (!status.isStarted || status.isRunning) {
                continue;
            }
            const shouldExecute = !status.nextExecution || 
                new Date(status.nextExecution) <= now;
      
            if (shouldExecute) {
                console.log(
                    `[${formatDate(Date())}] ⏰ Scheduler: executing agent ${agent.name}`
                );
                await this.executeAgentImmediately(agent.id);
            }
        }
    }

    private async executeAgentImmediately(agentId: string, oneTime?: boolean): Promise<void> {
        const agent = this.agents.get(agentId);
        if (!agent || agent.status.isRunning) {
            return;
        }

        const record = await documentsService.getOne(agentId);
        if (!record) {
            return;
        }

        try {
            await agentsDBService.run(agentId);
            const startLog = `[${formatDate(Date())}] --------⚙️  Executing agent ${agent.name} --------`;
            const dbStartLog = await documentsService.createAgentLog(agentId, startLog);

            if (dbStartLog) {
                socketService.getIO().to(agentId).emit("new-agent-log", {
                    documentId: agentId,
                    log: { id: dbStartLog.id, log_text: dbStartLog.log_text },
                    timestamp: new Date().toISOString(),
                });
            }
      
            const result = await agent.processContent();
      
            if (result.success) {
                const successLog = `[${formatDate(Date())}] --------✅ Agent ${agent.name} executed successfully --------`;
                const dbSuccessLog = await documentsService.createAgentLog(agentId, successLog);

                if (dbSuccessLog) {
                    socketService.getIO().to(agentId).emit("new-agent-log", {
                        documentId: agentId,
                        log: { id: dbSuccessLog.id, log_text: dbSuccessLog.log_text },
                        timestamp: new Date().toISOString(),
                    });
                }
            } else {
                const errorLog = `[${formatDate(Date())}] --------⛔ Agent ${agent.name} failed. --------\n${result.error}`;
                const dbErrorLog = await documentsService.createAgentLog(agentId, errorLog);

                if (dbErrorLog) {
                    socketService.getIO().to(agentId).emit("new-agent-log", {
                        documentId: agentId,
                        log: { id: dbErrorLog.id, log_text: dbErrorLog.log_text },
                        timestamp: new Date().toISOString(),
                    });
                }
            }

            if (!oneTime) {
                await agentsDBService.updateLastRunDate(agentId);
                await agentsDBService.updateNextRunDate(agentId);
            }

            const updatedRecord = await agentsDBService.getAgent(agentId);
            if (updatedRecord) {
                agent.updateRecord(updatedRecord);
            }

        } catch (error) {
            console.error(`Unexpected error in agent ${agent.name}:`, error);
        } finally {
            await agentsDBService.stop(agentId);
        }
    }

    private startPolling(): void {
        this.pollingInterval = setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('Error checking for agent updates:', error);
            }
        }, 30000);
    }

    private async checkForUpdates(): Promise<void> {
        const allRecords = await agentsDBService.getAllAgents();
    
        for (const record of allRecords) {
            await this.createAgentFromRecord(record);
        }
    
        const currentIds = new Set(allRecords.map(r => r.id));
        for (const [id, agent] of this.agents.entries()) {
            if (!currentIds.has(id)) {
                this.agents.delete(id);
                console.log(`Removed agent: ${agent.name}`);
            }
        }
    }

    public async startAgent(id: string): Promise<boolean> {
        const agent = this.agents.get(id);
        if (!agent) {
            console.log(`Agent with ID ${id} not found`);
            return false;
        }
    
        await agentsDBService.run(id);
    
        const updatedRecord = await agentsDBService.getAgent(id);
        if (updatedRecord) {
            agent.updateRecord(updatedRecord);
        }
    
        return true;
    }

    public async stopAgent(id: string): Promise<boolean> {
        const agent = this.agents.get(id);
        if (!agent) {
            console.log(`Agent with ID ${id} not found`);
            return false;
        }
    
        await agentsDBService.stop(id);
    
        const updatedRecord = await agentsDBService.getAgent(id);
        if (updatedRecord) {
            agent.updateRecord(updatedRecord);
        }
    
        return true;
    }

    public async executeAgent(id: string, oneTime?: boolean): Promise<boolean> {
        const agent = this.agents.get(id);
        if (!agent || agent.status.isRunning) {
            return false;
        }
    
        await this.executeAgentImmediately(id, oneTime);

        return true;
    }

    public getAgentsStatus() {
        return Array.from(this.agents.values()).map(agent => agent.status);
    }

    public isAgentExecuting(id: string) {
        return !!this.agents.get(id)?.status.isRunning
    }

    public getAgent(id: string) {
        return this.agents.get(id);
    }

    public async shutdown(): Promise<void> {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    
        this.agents.clear();
        console.log('Agent Manager shutdown');
    }
}