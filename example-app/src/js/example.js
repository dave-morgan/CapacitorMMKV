import { CapacitorMMKV } from '@davecorp/mmkv';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    CapacitorMMKV.echo({ value: inputValue })
}
