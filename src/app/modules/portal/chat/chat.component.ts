import { Component, AfterViewInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CometChatUIKit, CometChatConversationsWithMessages } from '@cometchat/chat-uikit-angular';
import { ChatService } from 'app/core/chat/chat.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { Auth } from '@angular/fire/auth';

@Component({
    selector: 'portal-chat',
    templateUrl: './chat.component.html',
    styles: [':host{position:relative;display:block;height:100%}'],

    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CometChatConversationsWithMessages, MatProgressSpinnerModule, NgIf]
})
export class ChatComponent implements AfterViewInit {
    loading = true;

    constructor(private _chat: ChatService, private _auth: Auth) { }

    async ngAfterViewInit(): Promise<void> {
        console.log('ngAfterViewInit started');
        let uid: string | null = localStorage.getItem('chatUid');
        console.log('Chat UID:', uid);

        let name: string | null = null;

        // Fallback #1: Parse previous key 'currentUser' (legacy)
        if (!uid) {
            try {
                uid = JSON.parse(localStorage.getItem('currentUser') || 'null')?.id || null;
                console.log('Chat UID from currentUser:', uid);

            } catch { }
        }

        // Fallback #2: Parse user object stored by AuthService
        if (!uid) {
            try {
                const storedUser = localStorage.getItem('user');
                console.log('Chat UID from storedUser:', storedUser);
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    uid = parsed?.id || null;
                    name = parsed?.name || null;
                }
            } catch { }
        }

        // Fallback #3: Use currently-logged Firebase auth user
        if (!uid) {
            uid = this._auth.currentUser?.uid || null;
            name = this._auth.currentUser?.displayName || null;
        }

        console.log('Attempting to ensure user in CometChat');
        if (!uid) {
            console.error('CometChat UID not found. Please store uid in localStorage("chatUid") or get from auth.');
            this.loading = false;
            return;
        }

        try {
            console.log('Ensuring user with UID:', uid);
            await this._chat.ensureUser(uid, name || 'Staff');
            console.log('User ensured in CometChat');
            localStorage.setItem('chatUid', uid);
        } catch (err) {
            console.error('CometChat login error:', err);
        } finally {
            console.log('ngAfterViewInit completed');
            this.loading = false;
        }
    }
}
