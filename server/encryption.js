// made by J4mik (Jan Lukasiak)

var encrypted;
var key = 71;
var counter;


function encode(message) {
    encrypted = 0
    counter = 1;

    for (let i = 0; i < message.length; i++) {
        if (message.charCodeAt(i) == " ") {
            encrypted += 32 * key % 256 * counter;
        }
        else {
            encrypted += message.charCodeAt(i) * key % 256 * counter;
        }
        counter *= 256;
    } 

    message = encrypted;
    encrypted = "";
    while (message != 0) {
        encrypted += String.fromCharCode(254 - message % 220)
        message = Math.floor(message / 220);
    }
    while (encrypted.length < 6) {
        encrypted += "!"
    }
    
    return(encrypted);
}

function decrypt(tempMSG) {
    counter = 1;
    encrypted = 0;

    for (let i = 0; i < tempMSG.length; i++) {
        if (tempMSG.charAt(i) != "!") {
            encrypted += (254 - tempMSG.charCodeAt(i)) * counter;
            counter *= 220;
        }
    }

    tempMSG = encrypted;
    encrypted = "";


    while (tempMSG != 0) {
        counter = 0
        temp = tempMSG % 256; 
        while (counter * key % 256 != temp) {
            counter++;
        }
        encrypted = encrypted + String.fromCharCode(counter)
        tempMSG = Math.floor(tempMSG / 256)
    }
    return(encrypted);
}


var message1 = "hello how are you today bro did you know the quick brown fox jumped over the lazy dog 1234567890 !&{}[]@'~#:;?/>.<,|`¬£%^&*()";
var message2 = ""
for (let i = 0; i < Math.ceil(message1.length / 5); i++) {
    message2 += encode(message1.substring(i * 5, i * 5 + 5));
}
console.log(message2)

message1 = ""
for (let i = 0; i < Math.ceil(message2.length / 6); i++) {
    message1 += decrypt(message2.substring(i * 6, i * 6 + 6));
}
console.log(message1)
