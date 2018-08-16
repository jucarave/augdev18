import { createUUID } from "./Utils";

export interface Callback {
    id      : string;
    type    : 'onKeyDown' | 'onKeyUp';
    func    : Function;
}

class Input {
    private _onKeyDownCallbacks         : Array<Callback>;
    private _onKeyUpCallbacks           : Array<Callback>;

    constructor() {
        this._onKeyDownCallbacks = [];
        this._onKeyUpCallbacks = [];

        document.onkeydown = (ev: KeyboardEvent) => {
            this._callCallbacks(this._onKeyDownCallbacks, ev);
        };

        document.onkeyup = (ev: KeyboardEvent) => {
            this._callCallbacks(this._onKeyUpCallbacks, ev);
        };
    }

    private _callCallbacks(list: Array<Callback>, ...args: Array<any>): void {
        for (let i=0,call:Callback;call=list[i];i++) {
            call.func(...args);
        }
    }

    public onKeyDown(callback: Function): Callback {
        const call: Callback = {
            id: createUUID(),
            type: 'onKeyDown',
            func: callback
        }

        this._onKeyDownCallbacks.push(call);

        return call;
    }

    public onKeyUp(callback: Function): Callback {
        const call: Callback = {
            id: createUUID(),
            type: 'onKeyUp',
            func: callback
        }

        this._onKeyUpCallbacks.push(call);

        return call;
    }

    public removeCallback(callback: Callback): void {
        let list: Array<Callback>;

        switch (callback.type) {
            case 'onKeyDown':
                list = this._onKeyDownCallbacks;
                break;

            case 'onKeyUp':
                list = this._onKeyUpCallbacks;
                break;
        }

        for (let i=0,call:Callback;call=list[i];i++) {
            if (call.id === callback.id) {
                list.splice(i, 1);
                return;
            }
        }
    }
}

export default new Input();