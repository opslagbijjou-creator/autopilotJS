// Collaboration.js - Real-time collaboration
class CollaborationModule {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.userId = null;
        this.users = new Map();
        this.cursors = new Map();
        this.isConnected = false;
        this.init();
    }
    
    init() {
        this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('✅ Collaboration module initialized');
    }
    
    async connect(roomId = null) {
        if (this.isConnected) return true;
        
        try {
            // Generate or use provided room ID
            this.roomId = roomId || this.generateRoomId();
            
            // In a real implementation, connect to WebSocket server
            // For now, simulate connection
            this.socket = {
                send: (data) => console.log('WebSocket send:', data),
                close: () => this.disconnect()
            };
            
            this.isConnected = true;
            this.startHeartbeat();
            
            // Join room
            this.sendMessage('join', {
                userId: this.userId,
                roomId: this.roomId,
                project: window.StateManager.getState().project
            });
            
            console.log(`✅ Connected to collaboration room: ${this.roomId}`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to connect:', error);
            return false;
        }
    }
    
    generateRoomId() {
        return 'room_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    disconnect() {
        if (this.socket) {
            this.sendMessage('leave', { userId: this.userId });
            this.socket.close();
        }
        
        this.isConnected = false;
        this.users.clear();
        this.cursors.clear();
        this.stopHeartbeat();
        
        console.log('✅ Disconnected from collaboration');
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.sendMessage('heartbeat', { userId: this.userId });
        }, 30000);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    sendMessage(type, data) {
        if (!this.isConnected || !this.socket) return;
        
        const message = {
            type,
            data,
            userId: this.userId,
            roomId: this.roomId,
            timestamp: Date.now()
        };
        
        this.socket.send(JSON.stringify(message));
    }
    
    handleMessage(message) {
        try {
            const { type, data, userId, timestamp } = message;
            
            switch (type) {
                case 'join':
                    this.handleUserJoin(userId, data);
                    break;
                    
                case 'leave':
                    this.handleUserLeave(userId);
                    break;
                    
                case 'cursor':
                    this.handleCursorUpdate(userId, data);
                    break;
                    
                case 'selection':
                    this.handleSelectionUpdate(userId, data);
                    break;
                    
                case 'state':
                    this.handleStateUpdate(userId, data);
                    break;
                    
                case 'chat':
                    this.handleChatMessage(userId, data);
                    break;
                    
                case 'heartbeat':
                    this.handleHeartbeat(userId);
                    break;
            }
            
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    
    handleUserJoin(userId, userData) {
        if (userId === this.userId) return;
        
        this.users.set(userId, {
            id: userId,
            name: userData.name || `User ${userId.slice(0, 8)}`,
            color: this.generateUserColor(userId),
            joinedAt: Date.now(),
            ...userData
        });
        
        console.log(`👋 User joined: ${userId}`);
        this.emitEvent('userJoined', { userId, userData: this.users.get(userId) });
        
        // Send current state to new user
        this.sendMessage('state', {
            project: window.StateManager.getState().project,
            selection: window.StateManager.getState().selection
        });
    }
    
    handleUserLeave(userId) {
        if (userId === this.userId) return;
        
        const user = this.users.get(userId);
        this.users.delete(userId);
        this.cursors.delete(userId);
        
        console.log(`👋 User left: ${userId}`);
        this.emitEvent('userLeft', { userId, user });
        
        // Remove user's cursor from UI
        this.removeUserCursor(userId);
    }
    
    handleCursorUpdate(userId, cursorData) {
        if (userId === this.userId) return;
        
        this.cursors.set(userId, {
            ...cursorData,
            updatedAt: Date.now()
        });
        
        this.updateUserCursor(userId, cursorData);
    }
    
    handleSelectionUpdate(userId, selectionData) {
        if (userId === this.userId) return;
        
        // Update user's selection visualization
        this.updateUserSelection(userId, selectionData);
    }
    
    handleStateUpdate(userId, stateData) {
        if (userId === this.userId) return;
        
        // Merge remote state changes
        // In a real implementation, you would use CRDT or operational transforms
        console.log(`🔄 State update from ${userId}:`, stateData);
        
        // For now, just log it
        this.emitEvent('remoteState', { userId, stateData });
    }
    
    handleChatMessage(userId, messageData) {
        const user = this.users.get(userId);
        if (!user) return;
        
        this.emitEvent('chat', {
            userId,
            userName: user.name,
            message: messageData.message,
            timestamp: Date.now()
        });
    }
    
    handleHeartbeat(userId) {
        // Update user's last seen timestamp
        const user = this.users.get(userId);
        if (user) {
            user.lastSeen = Date.now();
        }
    }
    
    generateUserColor(userId) {
        // Generate consistent color from user ID
        const colors = [
            '#6366f1', // indigo
            '#10b981', // emerald
            '#f59e0b', // amber
            '#ef4444', // red
            '#8b5cf6', // violet
            '#3b82f6', // blue
            '#ec4899', // pink
            '#14b8a6'  // teal
        ];
        
        const hash = Array.from(userId).reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    updateUserCursor(userId, cursorData) {
        // Create or update cursor element in UI
        let cursorEl = document.getElementById(`cursor-${userId}`);
        
        if (!cursorEl) {
            cursorEl = document.createElement('div');
            cursorEl.id = `cursor-${userId}`;
            cursorEl.className = 'remote-cursor';
            cursorEl.innerHTML = `
                <div class="cursor-pointer" style="background: ${this.users.get(userId)?.color || '#6366f1'}"></div>
                <div class="cursor-label">${this.users.get(userId)?.name || userId.slice(0, 8)}</div>
            `;
            document.getElementById('phoneScreen')?.appendChild(cursorEl);
        }
        
        // Update position
        const screenRect = document.getElementById('phoneScreen')?.getBoundingClientRect();
        if (screenRect) {
            cursorEl.style.left = `${cursorData.x}px`;
            cursorEl.style.top = `${cursorData.y}px`;
        }
        
        // Remove cursor if not updated for a while
        clearTimeout(cursorEl.timeout);
        cursorEl.timeout = setTimeout(() => {
            this.removeUserCursor(userId);
        }, 5000);
    }
    
    removeUserCursor(userId) {
        const cursorEl = document.getElementById(`cursor-${userId}`);
        if (cursorEl) {
            cursorEl.remove();
        }
    }
    
    updateUserSelection(userId, selectionData) {
        // Update selection visualization for remote user
        // Implementation depends on your UI requirements
        console.log(`🎯 Selection update from ${userId}:`, selectionData);
    }
    
    emitEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(`collaboration:${eventName}`, { detail: data }));
    }
    
    updateLocalCursor(x, y) {
        if (!this.isConnected) return;
        
        this.sendMessage('cursor', {
            x, y,
            screenId: window.StateManager.getState().project.activeScreen
        });
    }
    
    updateLocalSelection(selection) {
        if (!this.isConnected) return;
        
        this.sendMessage('selection', {
            elements: selection.elements,
            screenId: window.StateManager.getState().project.activeScreen
        });
    }
    
    updateLocalState(change) {
        if (!this.isConnected) return;
        
        this.sendMessage('state', {
            change,
            project: window.StateManager.getState().project
        });
    }
    
    sendChatMessage(message) {
        if (!this.isConnected) return;
        
        this.sendMessage('chat', { message });
    }
    
    getConnectedUsers() {
        return Array.from(this.users.values());
    }
    
    getUserCount() {
        return this.users.size;
    }
    
    isUserOnline(userId) {
        const user = this.users.get(userId);
        if (!user) return false;
        
        // Consider user online if seen in last 30 seconds
        return user.lastSeen && (Date.now() - user.lastSeen) < 30000;
    }
    
    createInviteLink() {
        if (!this.roomId) return null;
        
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?room=${this.roomId}`;
    }
    
    copyInviteLink() {
        const link = this.createInviteLink();
        if (!link) return false;
        
        navigator.clipboard.writeText(link).then(() => {
            console.log('✅ Invite link copied to clipboard');
            return true;
        }).catch(err => {
            console.error('❌ Failed to copy link:', err);
            return false;
        });
        
        return false;
    }
    
    exportCollaborationData() {
        return {
            roomId: this.roomId,
            userId: this.userId,
            users: this.getConnectedUsers(),
            timestamp: Date.now()
        };
    }
    
    // Real-time collaboration features
    enableLiveCursors() {
        // Track local cursor movement
        document.addEventListener('mousemove', this.handleLocalMouseMove.bind(this));
        document.addEventListener('touchmove', this.handleLocalTouchMove.bind(this));
    }
    
    disableLiveCursors() {
        document.removeEventListener('mousemove', this.handleLocalMouseMove.bind(this));
        document.removeEventListener('touchmove', this.handleLocalTouchMove.bind(this));
    }
    
    handleLocalMouseMove(event) {
        const screen = document.getElementById('phoneScreen');
        if (!screen) return;
        
        const rect = screen.getBoundingClientRect();
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
            
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            this.updateLocalCursor(x, y);
        }
    }
    
    handleLocalTouchMove(event) {
        if (event.touches.length === 1) {
            this.handleLocalMouseMove(event.touches[0]);
        }
    }
    
    // Conflict resolution
    resolveConflict(localChange, remoteChange) {
        // Simple conflict resolution - prefer local changes for now
        // In production, use operational transforms or CRDTs
        console.log('⚡ Conflict detected:', { localChange, remoteChange });
        
        // Merge strategies based on change type
        if (remoteChange.type === 'element_add' && localChange.type === 'element_add') {
            // Both added elements - keep both
            return { action: 'merge', changes: [localChange, remoteChange] };
        }
        
        if (remoteChange.type === 'element_update' && localChange.type === 'element_update') {
            // Both updated same element - use timestamp
            if (remoteChange.timestamp > localChange.timestamp) {
                return { action: 'use_remote', change: remoteChange };
            } else {
                return { action: 'use_local', change: localChange };
            }
        }
        
        // Default: use local
        return { action: 'use_local', change: localChange };
    }
    
    // Presence awareness
    updateUserPresence(status = 'active') {
        if (!this.isConnected) return;
        
        this.sendMessage('presence', {
            userId: this.userId,
            status,
            timestamp: Date.now()
        });
    }
    
    // Session recording (for replay/debugging)
    startSessionRecording() {
        this.sessionLog = [];
        this.isRecording = true;
        
        // Subscribe to all state changes
        this.recordingUnsubscribe = window.StateManager.subscribe((oldState, newState) => {
            if (this.isRecording) {
                this.sessionLog.push({
                    timestamp: Date.now(),
                    oldState,
                    newState,
                    userId: this.userId
                });
            }
        });
    }
    
    stopSessionRecording() {
        this.isRecording = false;
        if (this.recordingUnsubscribe) {
            this.recordingUnsubscribe();
        }
        
        return this.sessionLog;
    }
    
    replaySession(log, speed = 1) {
        // Replay recorded session
        console.log('🎬 Replaying session...');
        
        let index = 0;
        const startTime = log[0]?.timestamp || Date.now();
        
        const playNext = () => {
            if (index >= log.length) {
                console.log('✅ Session replay complete');
                return;
            }
            
            const entry = log[index];
            const delay = (entry.timestamp - startTime) / speed;
            
            setTimeout(() => {
                // Apply state change
                window.StateManager.setState(entry.newState, false);
                index++;
                playNext();
            }, delay);
        };
        
        playNext();
    }
}

// Export module
window.CollaborationModule = CollaborationModule;