import { CapacitorMMKV } from '@Davemorgan/mmkv';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    CapacitorMMKV.echo({ value: inputValue })
}
