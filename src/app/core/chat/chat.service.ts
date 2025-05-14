import { Injectable } from '@angular/core';
// Using UI Kit 4
// @ts-ignore
import { UIKitSettingsBuilder } from '@cometchat/uikit-shared';
// @ts-ignore
import { CometChatUIKit } from '@cometchat/chat-uikit-angular';
// For user creation we still need base SDK types
// @ts-ignore
import { CometChat, User } from '@cometchat/chat-sdk-javascript';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
    private readonly appId   = environment.cometChat?.appId;
    private readonly region  = environment.cometChat?.region;
    private readonly apiKey = environment.cometChat?.apiKey; // for dev/PoC

    private _initialised = false;

    /** Initialise UI Kit once */
    private async initUIKit(): Promise<void> {
        if (this._initialised) { return; }
        const settings = new UIKitSettingsBuilder()
            .setAppId(this.appId)
            .setRegion(this.region?.toLowerCase())
            .setAuthKey(this.apiKey)
            .subscribePresenceForAllUsers()
            .build();
        try {
            await CometChatUIKit.init(settings);
            console.log('CometChat UIKit initialised');
        } catch (err) {
            console.error('CometChat init error', err);
            throw err;
        }
        this._initialised = true;
    }

    /** Log-in current portal user */
    async login(uid: string): Promise<void> {
        await this.initUIKit();
        const already = await CometChatUIKit.getLoggedinUser();
        if (!already) {
            await CometChatUIKit.login({ uid });
        }
    }

    /** Create a CometChat user with STAFF role (silently ignores if already exists) */
    async createStaff(uid: string, name: string, avatar?: string): Promise<void> {
        await this.initUIKit();
        const user = new CometChat.User({ uid, name, avatar, role: 'staff' });
        try {
            await CometChat.createUser(user, this.apiKey);
        } catch (err: any) {
            // Ignore if the user is already present
            if (err?.code !== 'ERR_UID_ALREADY_EXISTS') {
                throw err;
            }
        }
    }

    /** Ensure user exists in CometChat then log them in */
    async ensureUser(uid: string, name: string, avatar?: string): Promise<void> {
        await this.initUIKit();

        // If a user is already logged in and it's the same one, nothing to do
        const current = await CometChatUIKit.getLoggedinUser() as any;
        if (current?.uid === uid) { return; }

        // If a different user is logged-in, logout first
        if (current && current.uid !== uid) {
            await CometChatUIKit.logout();
        }

        // Attempt login; if user not found create then login
        const tryLogin = async (): Promise<void> => {
            try {
                await CometChatUIKit.login({ uid });
            } catch (e: any) {
                // Handle user-not-found
                if (e?.code === 'ERR_UID_NOT_FOUND') {
                    const user = new CometChat.User({ uid, name, avatar, role: 'staff' });
                    await CometChat.createUser(user, this.apiKey);
                    await CometChatUIKit.login({ uid });
                } else if (e?.name === 'LOGIN_IN_PROGRESS' || e?.code === -1) {
                    // Wait a bit and retry once
                    await new Promise(r => setTimeout(r, 1000));
                    await CometChatUIKit.login({ uid });
                } else {
                    throw e;
                }
            }
        };

        await tryLogin();
    }
}
