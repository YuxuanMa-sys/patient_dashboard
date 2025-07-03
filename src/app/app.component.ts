import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CometChatIncomingCall } from '@cometchat/chat-uikit-angular';
import { ChatService } from './core/chat/chat.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, CometChatIncomingCall],
})
export class AppComponent {
    incomingCall: any = null;

    constructor(private _chat: ChatService, private _cdr: ChangeDetectorRef) {
        this._chat.incomingCall$.subscribe(call => {
            this.incomingCall = call;
            this._cdr.markForCheck();
        });
    }

    /**
     * Constructor
     */
    // constructor left empty previously
}
