export function createUUID(): string {
    let date = (new Date()).getTime(),
        ret = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, (c: string): string => {
            let ran = (date + Math.random() * 16) % 16 | 0;
            date = Math.floor(date / 16);

            return (c == 'x' ? ran : (ran&0x3|0x8)).toString(16);
        });

    return ret;
}

export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function httpRequest(url: string, callback: Function): void {
    let http = new XMLHttpRequest();

    http.open('GET', url, true);
    http.onreadystatechange = function() {
          if (http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    };

    http.send();
}

export function loadJSON(url: string, callback: Function): void {
    httpRequest(url, (responseText: string) => {
        callback(JSON.parse(responseText));
    });
}